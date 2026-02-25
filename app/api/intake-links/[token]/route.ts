import { NextRequest, NextResponse } from "next/server"
import { createHash } from "crypto"
import { revalidatePath } from "next/cache"
import { intakeResponseRepository } from "@/lib/repositories/intake-response-repository"
import { intakeLinkRepository } from "@/lib/repositories/intake-link-repository"
import { intakeSteps } from "@/lib/intake/steps"
import { verifyIntakeLinkToken } from "@/lib/intake/link-token"
import { clientWorkspaceRepository } from "@/lib/repositories/client-workspace-repository"
import {
  checklistDefaults,
  checklistItems,
  isChecklistStatus,
  normalizeChecklist,
  type ChecklistKey,
} from "@/lib/tax-return-checklist"
import type { TaxReturnChecklistStatus } from "@/lib/types/client-workspace"

function parseTaxYears(value: unknown): number[] {
  if (Array.isArray(value)) {
    return value.map((v) => (typeof v === "string" ? parseInt(v, 10) : Number(v))).filter((n) => !Number.isNaN(n))
  }
  if (typeof value === "string") {
    const n = parseInt(value, 10)
    return Number.isNaN(n) ? [] : [n]
  }
  return []
}

function sanitizeChecklistUpdates(input: unknown) {
  const source = input && typeof input === "object" ? (input as Record<string, unknown>) : {}
  return checklistItems.reduce<Partial<Record<ChecklistKey, TaxReturnChecklistStatus>>>((acc, item) => {
    const rawStatus = source[item.key]
    if (typeof rawStatus === "string" && isChecklistStatus(rawStatus)) {
      acc[item.key] = rawStatus
    }
    return acc
  }, {})
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params
  const verification = verifyIntakeLinkToken(token)
  if (verification.status === "expired") {
    return NextResponse.json({ error: "Link has expired" }, { status: 410 })
  }
  if (verification.status !== "valid") {
    return NextResponse.json({ error: "Link not found" }, { status: 404 })
  }

  const workspaceId = verification.payload.workspaceId ?? null
  let prefill: Record<string, string> = {}
  let checklistStatuses: Partial<Record<ChecklistKey, TaxReturnChecklistStatus>> = {}
  if (verification.payload.kind === "existing_workspace" && workspaceId) {
    const workspace = await clientWorkspaceRepository.findById(workspaceId)
    const fullName = workspace?.primaryContact?.name || workspace?.displayName
    if (fullName) {
      prefill = { fullName }
    }
    checklistStatuses = normalizeChecklist(workspace?.taxReturnChecklist)
  }

  return NextResponse.json({
    valid: true,
    kind: verification.payload.kind,
    clientWorkspaceId: workspaceId,
    prefill,
    checklistStatuses,
    steps: intakeSteps,
  })
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params
  const verification = verifyIntakeLinkToken(token)
  if (verification.status === "expired") {
    return NextResponse.json({ error: "Link has expired" }, { status: 410 })
  }
  if (verification.status !== "valid") {
    return NextResponse.json({ error: "Link not found" }, { status: 404 })
  }

  const body = await request.json()
  const { responses = {}, checklistUpdates = {}, clientWorkspaceId } = body
  const payload = verification.payload
  const intakeNotes =
    typeof responses.notes === "string" ? responses.notes.trim() : ""
  const hasIntakeNotes = intakeNotes.length > 0

  if (payload.kind === "existing_workspace") {
    if (clientWorkspaceId && clientWorkspaceId !== payload.workspaceId) {
      return NextResponse.json({ error: "Workspace mismatch" }, { status: 400 })
    }
    const workspaceId = payload.workspaceId!
    const tokenHash = createHash("sha256").update(token).digest("hex")
    // Intake activity should bring an archived client back into active work.
    const existingWorkspace = await clientWorkspaceRepository.findById(workspaceId)
    const existingChecklist = normalizeChecklist(existingWorkspace?.taxReturnChecklist)
    const validatedChecklistUpdates = sanitizeChecklistUpdates(checklistUpdates)
    const hasExplicitOtherCompletedUpdate =
      typeof validatedChecklistUpdates.otherCompleted === "string"
    const nextChecklist = {
      ...existingChecklist,
      ...validatedChecklistUpdates,
      ...(!hasExplicitOtherCompletedUpdate &&
      hasIntakeNotes &&
      existingChecklist.otherCompleted !== "complete"
        ? { otherCompleted: "in_progress" as const }
        : {}),
    }

    const taxYears = parseTaxYears(responses.taxYears)
    const fullName = typeof responses.fullName === "string" ? responses.fullName.trim() : ""
    const email = typeof responses.email === "string" ? responses.email.trim() : ""
    const phone = typeof responses.phone === "string" ? responses.phone.trim() : ""
    const nextPrimaryContact = {
      ...(existingWorkspace?.primaryContact ?? {}),
      ...(fullName ? { name: fullName } : {}),
      ...(email ? { email } : {}),
      ...(phone ? { phone } : {}),
    }
    const updatedFromIntake: string[] = []
    if (fullName) updatedFromIntake.push("name")
    if (email) updatedFromIntake.push("email")
    if (phone) updatedFromIntake.push("phone")
    if (taxYears.length > 0) updatedFromIntake.push("taxYears")
    if (hasIntakeNotes) updatedFromIntake.push("anythingElse")
    if (Object.keys(validatedChecklistUpdates).length > 0) {
      updatedFromIntake.push("checklist")
    }

    await clientWorkspaceRepository.update(workspaceId, {
      status: "active",
      ...(fullName ? { displayName: fullName } : {}),
      ...(Object.keys(nextPrimaryContact).length > 0 ? { primaryContact: nextPrimaryContact } : {}),
      ...(taxYears.length > 0 ? { taxYears } : {}),
      taxReturnChecklist: nextChecklist,
      lastActivityAt: new Date().toISOString(),
    })
    const intakeResponse = await intakeResponseRepository.create({
      clientWorkspaceId: workspaceId,
      intakeLinkId: tokenHash,
      responses: {
        ...responses,
        checklistUpdates: validatedChecklistUpdates,
      },
    })
    await clientWorkspaceRepository.addTimelineEvent(workspaceId, {
      type: "intake",
      title: "Intake submitted",
      description: "Client submitted the intake form.",
      metadata: {
        event: "intake_submitted",
        intakeResponseId: intakeResponse.id,
        updatedFromIntake,
      },
    })
    revalidatePath("/admin/clients")
    revalidatePath("/admin/checklists")
    revalidatePath("/admin")
    revalidatePath(`/admin/clients/${workspaceId}`)
    return NextResponse.json({ intakeResponse })
  }

  // new_client: validate required fields, create workspace, then response and timeline
  const fullName = typeof responses.fullName === "string" ? responses.fullName.trim() : ""
  const email = typeof responses.email === "string" ? responses.email.trim() : ""
  const phone = typeof responses.phone === "string" ? responses.phone.trim() : ""
  if (!fullName) {
    return NextResponse.json({ error: "Full name is required" }, { status: 400 })
  }

  const taxYears = parseTaxYears(responses.taxYears)
  const now = new Date().toISOString()
  const initialChecklist =
    hasIntakeNotes
      ? { ...checklistDefaults, otherCompleted: "in_progress" as const }
      : checklistDefaults

  const workspace = await clientWorkspaceRepository.create({
    displayName: fullName,
    status: "active",
    primaryContact: {
      name: fullName,
      ...(email ? { email } : {}),
      ...(phone ? { phone } : {}),
    },
    taxYears: taxYears.length > 0 ? taxYears : [new Date().getFullYear()],
    tags: [],
    taxReturnChecklist: initialChecklist,
    lastActivityAt: now,
  })

  const tokenHash = createHash("sha256").update(token).digest("hex")
  const intakeResponse = await intakeResponseRepository.create({
    clientWorkspaceId: workspace.id,
    intakeLinkId: tokenHash,
    responses,
  })

  await clientWorkspaceRepository.addTimelineEvent(workspace.id, {
    type: "intake",
    title: "Intake submitted",
    description: "New client submitted the intake form.",
    metadata: {
      event: "intake_submitted",
      intakeResponseId: intakeResponse.id,
    },
  })
  revalidatePath("/admin/clients")
  revalidatePath("/admin/checklists")
  revalidatePath("/admin")
  revalidatePath(`/admin/clients/${workspace.id}`)

  const intakeLink = await intakeLinkRepository.findByTokenHash(tokenHash)
  if (intakeLink) {
    await intakeLinkRepository.updateAfterUse(intakeLink.id, {
      clientWorkspaceId: workspace.id,
      usedAt: now,
    })
  }

  return NextResponse.json({ intakeResponse, workspaceId: workspace.id })
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params
  const verification = verifyIntakeLinkToken(token)
  if (verification.status === "expired") {
    return NextResponse.json({ error: "Link has expired" }, { status: 410 })
  }
  if (verification.status !== "valid") {
    return NextResponse.json({ error: "Link not found" }, { status: 404 })
  }
  if (verification.payload.kind !== "existing_workspace" || !verification.payload.workspaceId) {
    return NextResponse.json({ error: "Checklist updates require an existing client link" }, { status: 400 })
  }

  const body = await request.json()
  const updates = sanitizeChecklistUpdates(body?.checklistUpdates)
  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "No checklist updates provided" }, { status: 400 })
  }

  const workspaceId = verification.payload.workspaceId
  const workspace = await clientWorkspaceRepository.findById(workspaceId)
  if (!workspace) {
    return NextResponse.json({ error: "Workspace not found" }, { status: 404 })
  }

  const nextChecklist = {
    ...normalizeChecklist(workspace.taxReturnChecklist),
    ...updates,
  }

  await clientWorkspaceRepository.update(workspaceId, {
    status: "active",
    taxReturnChecklist: nextChecklist,
    lastActivityAt: new Date().toISOString(),
  })

  revalidatePath("/admin/clients")
  revalidatePath("/admin/checklists")
  revalidatePath("/admin")
  revalidatePath(`/admin/clients/${workspaceId}`)

  return NextResponse.json({ success: true })
}
