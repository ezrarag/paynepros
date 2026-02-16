import { NextRequest, NextResponse } from "next/server"
import { createHash } from "crypto"
import { revalidatePath } from "next/cache"
import { intakeResponseRepository } from "@/lib/repositories/intake-response-repository"
import { intakeLinkRepository } from "@/lib/repositories/intake-link-repository"
import { intakeSteps } from "@/lib/intake/steps"
import { verifyIntakeLinkToken } from "@/lib/intake/link-token"
import { clientWorkspaceRepository } from "@/lib/repositories/client-workspace-repository"
import { checklistDefaults } from "@/lib/tax-return-checklist"

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
  return NextResponse.json({
    valid: true,
    kind: verification.payload.kind,
    clientWorkspaceId: verification.payload.workspaceId ?? null,
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
  const { responses = {}, clientWorkspaceId } = body
  const payload = verification.payload

  if (payload.kind === "existing_workspace") {
    if (clientWorkspaceId && clientWorkspaceId !== payload.workspaceId) {
      return NextResponse.json({ error: "Workspace mismatch" }, { status: 400 })
    }
    const workspaceId = payload.workspaceId!
    const tokenHash = createHash("sha256").update(token).digest("hex")
    // Intake activity should bring an archived client back into active work.
    await clientWorkspaceRepository.update(workspaceId, {
      status: "active",
      lastActivityAt: new Date().toISOString(),
    })
    const intakeResponse = await intakeResponseRepository.create({
      clientWorkspaceId: workspaceId,
      intakeLinkId: tokenHash,
      responses,
    })
    await clientWorkspaceRepository.addTimelineEvent(workspaceId, {
      type: "intake",
      title: "Intake submitted",
      description: "Client submitted the intake form.",
      metadata: {
        event: "intake_submitted",
        intakeResponseId: intakeResponse.id,
      },
    })
    revalidatePath("/admin/clients")
    revalidatePath("/admin")
    revalidatePath(`/admin/clients/${workspaceId}`)
    return NextResponse.json({ intakeResponse })
  }

  // new_client: validate required fields, create workspace, then response and timeline
  const fullName = typeof responses.fullName === "string" ? responses.fullName.trim() : ""
  const email = typeof responses.email === "string" ? responses.email.trim() : ""
  const address = typeof responses.address === "string" ? responses.address.trim() : ""
  const phone = typeof responses.phone === "string" ? responses.phone.trim() : ""
  if (!fullName) {
    return NextResponse.json({ error: "Full name is required" }, { status: 400 })
  }
  if (!address) {
    return NextResponse.json({ error: "Address is required" }, { status: 400 })
  }
  if (!email) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 })
  }
  if (!phone) {
    return NextResponse.json({ error: "Phone number is required" }, { status: 400 })
  }

  const taxYears = parseTaxYears(responses.taxYears)
  const now = new Date().toISOString()

  const workspace = await clientWorkspaceRepository.create({
    displayName: fullName,
    status: "active",
    primaryContact: {
      name: fullName,
      email,
      phone,
    },
    taxYears: taxYears.length > 0 ? taxYears : [new Date().getFullYear()],
    tags: [],
    taxReturnChecklist: checklistDefaults,
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
