import { NextRequest, NextResponse } from "next/server"
import { createHash } from "crypto"
import { intakeLinkRepository } from "@/lib/repositories/intake-link-repository"
import { IntakeChannel } from "@/lib/types/client-workspace"
import { createIntakeLinkToken } from "@/lib/intake/link-token"

const DEFAULT_EXPIRY_HOURS = 72

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}))
    const {
      expiresInHours = DEFAULT_EXPIRY_HOURS,
      channels = ["email", "sms", "whatsapp"],
      createdBy = "mock-admin-id",
    } = body

    const expiresAt = new Date(Date.now() + expiresInHours * 60 * 60 * 1000).toISOString()
    const token = createIntakeLinkToken({
      kind: "new_client",
      expiresAt,
      createdBy: createdBy as string | undefined,
    })
    const tokenHash = createHash("sha256").update(token).digest("hex")

    await intakeLinkRepository.create({
      kind: "new_client",
      clientWorkspaceId: null,
      tokenHash,
      tokenLast4: token.slice(-4),
      channels: (channels as IntakeChannel[]) ?? ["email", "sms", "whatsapp"],
      status: "active",
      createdBy: createdBy as string,
      expiresAt,
    })

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
    const url = `${baseUrl}/intake/${token}`

    return NextResponse.json({ url })
  } catch (error) {
    console.error("Error creating new-client intake link:", error)
    return NextResponse.json(
      { error: "Failed to create new client intake link" },
      { status: 500 }
    )
  }
}
