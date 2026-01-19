import { NextRequest, NextResponse } from "next/server"
import { createHash } from "crypto"
import { intakeResponseRepository } from "@/lib/repositories/intake-response-repository"
import { intakeSteps } from "@/lib/intake/steps"
import { verifyIntakeLinkToken } from "@/lib/intake/link-token"
import { clientWorkspaceRepository } from "@/lib/repositories/client-workspace-repository"

export async function GET(
  _request: NextRequest,
  { params }: { params: { token: string } }
) {
  const verification = verifyIntakeLinkToken(params.token)
  if (verification.status === "expired") {
    return NextResponse.json({ error: "Link has expired" }, { status: 410 })
  }
  if (verification.status !== "valid") {
    return NextResponse.json({ error: "Link not found" }, { status: 404 })
  }
  return NextResponse.json({
    valid: true,
    clientWorkspaceId: verification.payload.workspaceId,
    steps: intakeSteps,
  })
}

export async function POST(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  const verification = verifyIntakeLinkToken(params.token)
  if (verification.status === "expired") {
    return NextResponse.json({ error: "Link has expired" }, { status: 410 })
  }
  if (verification.status !== "valid") {
    return NextResponse.json({ error: "Link not found" }, { status: 404 })
  }

  const body = await request.json()
  const { responses = {}, clientWorkspaceId } = body
  if (clientWorkspaceId && clientWorkspaceId !== verification.payload.workspaceId) {
    return NextResponse.json({ error: "Workspace mismatch" }, { status: 400 })
  }

  const tokenHash = createHash("sha256").update(params.token).digest("hex")
  const intakeResponse = await intakeResponseRepository.create({
    clientWorkspaceId: verification.payload.workspaceId,
    intakeLinkId: tokenHash,
    responses,
  })

  await clientWorkspaceRepository.addTimelineEvent(verification.payload.workspaceId, {
    type: "intake",
    title: "Intake submitted",
    description: "Client submitted the intake form.",
    metadata: {
      event: "intake_submitted",
      intakeResponseId: intakeResponse.id,
    },
  })

  return NextResponse.json({ intakeResponse })
}
