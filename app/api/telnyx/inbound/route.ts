import { NextRequest, NextResponse } from "next/server"
import { createPublicKey, verify as cryptoVerify } from "crypto"
import { clientWorkspaceRepository } from "@/lib/repositories/client-workspace-repository"
import {
  pendingAdminActionRepository,
  type PendingAdminAction,
} from "@/lib/repositories/pending-admin-action-repository"
import { parseSmsIntent, type ParsedSmsIntent } from "@/lib/notifications/sms-intent"
import { sendSms, maskPhone } from "@/lib/notifications/sms"
import { sendRequestReminder } from "@/lib/notifications/dispatcher"
import { createClientRequest } from "@/app/admin/clients/[clientId]/actions"
import type { ClientWorkspace, ClientRequestDelivery } from "@/lib/types/client-workspace"

// Telnyx signs `${timestamp}|${rawBody}` with Ed25519. The portal exposes the
// public key as base64 raw bytes; Node needs it wrapped in a DER SPKI header.
const ED25519_SPKI_PREFIX = Buffer.from("302a300506032b6570032100", "hex")

function verifyTelnyxSignature(rawBody: string, request: NextRequest): boolean {
  const publicKeyB64 = process.env.TELNYX_PUBLIC_KEY
  if (!publicKeyB64) {
    if (process.env.NODE_ENV === "production") {
      return false
    }
    console.warn("[Telnyx inbound] TELNYX_PUBLIC_KEY unset — skipping signature check (dev only)")
    return true
  }

  const signatureB64 = request.headers.get("telnyx-signature-ed25519")
  const timestamp = request.headers.get("telnyx-timestamp")
  if (!signatureB64 || !timestamp) {
    return false
  }

  try {
    const publicKey = createPublicKey({
      key: Buffer.concat([ED25519_SPKI_PREFIX, Buffer.from(publicKeyB64, "base64")]),
      format: "der",
      type: "spki",
    })
    const signedPayload = Buffer.from(`${timestamp}|${rawBody}`, "utf8")
    return cryptoVerify(null, signedPayload, publicKey, Buffer.from(signatureB64, "base64"))
  } catch (error) {
    console.error("[Telnyx inbound] Signature verification error:", error)
    return false
  }
}

function getAllowlist(): string[] {
  return (process.env.ADMIN_PHONE_ALLOWLIST ?? "")
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean)
}

function fuzzyMatchWorkspaces(workspaces: ClientWorkspace[], clientName: string): ClientWorkspace[] {
  const needle = clientName.trim().toLowerCase()
  if (!needle) return []

  const tokens = needle.split(/\s+/)
  return workspaces.filter((workspace) => {
    const haystacks = [workspace.displayName, workspace.primaryContact?.name]
      .filter(Boolean)
      .map((value) => String(value).toLowerCase())
    return haystacks.some((haystack) =>
      tokens.every((token) => haystack.includes(token))
    )
  })
}

async function createAndDispatchRequest(
  workspace: ClientWorkspace,
  intent: Pick<ParsedSmsIntent, "templateType" | "customTitle" | "documentRequested">
): Promise<string | null> {
  const delivery: ClientRequestDelivery[] = ["email"]
  if (workspace.notificationPreferences?.sms && workspace.notificationPreferences.phone) {
    delivery.push("sms")
  }

  // Same creation path as the admin UI — the repository hook auto-creates the
  // reminder schedule, and the timeline event is logged by the action.
  const result = await createClientRequest({
    workspaceId: workspace.id,
    templateType: intent.templateType,
    customTitle: intent.customTitle,
    delivery,
  })
  if (!result.success) {
    return null
  }

  await sendRequestReminder(workspace.id, result.data.id, { isFirstSend: true })
  return result.data.id
}

function confirmationText(
  workspace: ClientWorkspace,
  documentRequested: string
): string {
  return `✓ Sent ${documentRequested} request to ${workspace.displayName}. Reminders every 3 days until provided.`
}

async function handleNumericReply(
  adminPhone: string,
  text: string,
  pending: PendingAdminAction
): Promise<string> {
  const choice = Number.parseInt(text.trim(), 10)
  if (!Number.isInteger(choice) || choice < 1 || choice > pending.candidates.length) {
    return `Reply with a number 1-${pending.candidates.length} to pick a client, or send a new request.`
  }

  const candidate = pending.candidates[choice - 1]
  const workspace = await clientWorkspaceRepository.findById(candidate.workspaceId)
  if (!workspace) {
    await pendingAdminActionRepository.clear(adminPhone)
    return `Couldn't load ${candidate.displayName} — please try again.`
  }

  const requestId = await createAndDispatchRequest(workspace, {
    templateType: pending.templateType,
    customTitle: pending.customTitle,
    documentRequested: pending.documentRequested,
  })
  await pendingAdminActionRepository.clear(adminPhone)

  if (!requestId) {
    return `Something went wrong creating the request for ${workspace.displayName}. Please try again.`
  }
  return confirmationText(workspace, pending.documentRequested)
}

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text()

    if (!verifyTelnyxSignature(rawBody, request)) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
    }

    let body: any
    try {
      body = JSON.parse(rawBody)
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
    }

    const eventType = body?.data?.event_type
    if (eventType !== "message.received") {
      // Delivery receipts etc. — acknowledge and ignore
      return NextResponse.json({ ok: true, ignored: eventType ?? "unknown" })
    }

    const payload = body?.data?.payload ?? {}
    const fromPhone = String(payload?.from?.phone_number ?? "")
    const text = String(payload?.text ?? "").trim()

    const allowlist = getAllowlist()
    if (!fromPhone || !allowlist.includes(fromPhone)) {
      console.log("[Telnyx inbound] Ignoring message from non-admin:", maskPhone(fromPhone || "unknown"))
      return NextResponse.json({ ok: true })
    }

    if (!text) {
      return NextResponse.json({ ok: true })
    }

    // A bare number resolves a pending "which client did you mean?" question
    const pending = await pendingAdminActionRepository.findActive(fromPhone)
    if (pending && /^\d{1,2}$/.test(text)) {
      const reply = await handleNumericReply(fromPhone, text, pending)
      await sendSms(fromPhone, reply)
      return NextResponse.json({ ok: true })
    }

    const intent = await parseSmsIntent(text)
    if (!intent) {
      await sendSms(
        fromPhone,
        'Sorry, I couldn\'t understand that. Try e.g. "ask Johnson for their W2".'
      )
      return NextResponse.json({ ok: true })
    }

    const workspaces = await clientWorkspaceRepository.findAll(200)
    const matches = fuzzyMatchWorkspaces(workspaces, intent.clientName)

    if (matches.length === 1 && intent.confidence === "high") {
      const workspace = matches[0]
      const requestId = await createAndDispatchRequest(workspace, intent)
      const reply = requestId
        ? confirmationText(workspace, intent.documentRequested)
        : `Something went wrong creating the request for ${workspace.displayName}. Please try again.`
      await sendSms(fromPhone, reply)
      return NextResponse.json({ ok: true })
    }

    if (matches.length === 0) {
      await sendSms(
        fromPhone,
        `No client matching "${intent.clientName}" found. Check the name and try again.`
      )
      return NextResponse.json({ ok: true })
    }

    // Multiple matches (or low confidence with at least one) — ask to disambiguate
    const candidates = matches.slice(0, 5).map((workspace) => ({
      workspaceId: workspace.id,
      displayName: workspace.displayName,
    }))
    await pendingAdminActionRepository.set({
      adminPhone: fromPhone,
      documentRequested: intent.documentRequested,
      templateType: intent.templateType,
      customTitle: intent.customTitle,
      candidates,
    })
    const list = candidates
      .map((candidate, index) => `${index + 1}. ${candidate.displayName}`)
      .join(", ")
    await sendSms(
      fromPhone,
      `Found ${candidates.length} matches: ${list}. Reply with the number.`
    )
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("POST /api/telnyx/inbound failed:", error)
    // Return 200 so Telnyx doesn't retry-storm us; the error is logged
    return NextResponse.json({ ok: false })
  }
}
