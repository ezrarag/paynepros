import { NextResponse } from "next/server"
import { getClientPortalSession } from "@/lib/client-portal-session"
import { clientWorkspaceRepository } from "@/lib/repositories/client-workspace-repository"
import { DEFAULT_NOTIFICATION_PREFERENCES } from "@/lib/types/client-workspace"

const E164_PATTERN = /^\+[1-9]\d{1,14}$/

export async function GET() {
  const session = await getClientPortalSession()
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const workspace = await clientWorkspaceRepository.findById(session.workspaceId)
  if (!workspace) {
    return NextResponse.json({ error: "Workspace not found" }, { status: 404 })
  }

  return NextResponse.json({
    preferences: {
      ...DEFAULT_NOTIFICATION_PREFERENCES,
      ...workspace.notificationPreferences,
    },
  })
}

export async function POST(request: Request) {
  const session = await getClientPortalSession()
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  const { email, sms, phone } = (body ?? {}) as {
    email?: unknown
    sms?: unknown
    phone?: unknown
  }

  const updates: {
    email?: boolean
    sms?: boolean
    phone?: string
    phoneVerifiedAt?: null
  } = {}

  if (typeof email === "boolean") {
    updates.email = email
  }
  if (typeof sms === "boolean") {
    updates.sms = sms
  }
  if (typeof phone === "string" && phone.trim()) {
    const normalized = phone.trim()
    if (!E164_PATTERN.test(normalized)) {
      return NextResponse.json(
        { error: "Phone must be in E.164 format, e.g. +15551234567" },
        { status: 400 }
      )
    }
    const workspace = await clientWorkspaceRepository.findById(session.workspaceId)
    if (workspace?.notificationPreferences?.phone !== normalized) {
      updates.phone = normalized
      // New phone number requires re-verification (Prompt 04 adds the OTP flow)
      updates.phoneVerifiedAt = null
    }
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "No valid fields to update" }, { status: 400 })
  }

  const updated = await clientWorkspaceRepository.updateNotificationPreferences(
    session.workspaceId,
    updates
  )
  if (!updated) {
    return NextResponse.json({ error: "Workspace not found" }, { status: 404 })
  }

  return NextResponse.json({
    preferences: {
      ...DEFAULT_NOTIFICATION_PREFERENCES,
      ...updated.notificationPreferences,
    },
  })
}
