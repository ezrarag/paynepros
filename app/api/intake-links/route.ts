import { NextRequest, NextResponse } from "next/server"
import { createHash } from "crypto"
import { intakeLinkRepository } from "@/lib/repositories/intake-link-repository"
import { IntakeChannel } from "@/lib/types/client-workspace"
import { createIntakeLinkToken } from "@/lib/intake/link-token"

const DEFAULT_EXPIRY_HOURS = 24 * 7

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      clientWorkspaceId,
      createdBy = "mock-admin-id",
      channels = ["email"],
      expiresInHours = DEFAULT_EXPIRY_HOURS,
    } = body

    if (!clientWorkspaceId) {
      return NextResponse.json({ error: "clientWorkspaceId is required" }, { status: 400 })
    }

    const expiresAt = new Date(Date.now() + expiresInHours * 60 * 60 * 1000).toISOString()
    const token = createIntakeLinkToken({ workspaceId: clientWorkspaceId, expiresAt })
    const tokenHash = createHash("sha256").update(token).digest("hex")

    const intakeLink = await intakeLinkRepository.create({
      clientWorkspaceId,
      tokenHash,
      tokenLast4: token.slice(-4),
      channels: channels as IntakeChannel[],
      status: "active",
      createdBy,
      expiresAt,
    })

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
    const url = `${baseUrl}/intake/${token}`

    return NextResponse.json({
      ...intakeLink,
      url,
    })
  } catch (error) {
    console.error("Error creating intake link:", error)
    return NextResponse.json({ error: "Failed to create intake link" }, { status: 500 })
  }
}
