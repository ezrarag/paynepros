import { NextRequest, NextResponse } from "next/server"
import { createHash } from "crypto"
import { intakeLinkRepository } from "@/lib/repositories/intake-link-repository"
import { intakeResponseRepository } from "@/lib/repositories/intake-response-repository"
import { intakeSteps } from "@/lib/intake/steps"

const hashToken = (token: string) =>
  createHash("sha256").update(token).digest("hex")

const isExpired = (expiresAt: string) => new Date(expiresAt).getTime() <= Date.now()

export async function GET(
  _request: NextRequest,
  { params }: { params: { token: string } }
) {
  const tokenHash = hashToken(params.token)
  const link = await intakeLinkRepository.findByTokenHash(tokenHash)
  if (!link) {
    return NextResponse.json({ error: "Link not found" }, { status: 404 })
  }
  if (link.status !== "active") {
    return NextResponse.json({ error: "Link is no longer active" }, { status: 410 })
  }
  if (isExpired(link.expiresAt)) {
    return NextResponse.json({ error: "Link has expired" }, { status: 410 })
  }
  return NextResponse.json({
    valid: true,
    clientWorkspaceId: link.clientWorkspaceId,
    steps: intakeSteps,
  })
}

export async function POST(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  const tokenHash = hashToken(params.token)
  const link = await intakeLinkRepository.findByTokenHash(tokenHash)
  if (!link) {
    return NextResponse.json({ error: "Link not found" }, { status: 404 })
  }
  if (link.status !== "active") {
    return NextResponse.json({ error: "Link is no longer active" }, { status: 410 })
  }
  if (isExpired(link.expiresAt)) {
    return NextResponse.json({ error: "Link has expired" }, { status: 410 })
  }

  const body = await request.json()
  const { responses = {} } = body

  const intakeResponse = await intakeResponseRepository.create({
    clientWorkspaceId: link.clientWorkspaceId,
    intakeLinkId: link.id,
    responses,
  })

  await intakeLinkRepository.markUsed(link.id)

  return NextResponse.json({ intakeResponse })
}
