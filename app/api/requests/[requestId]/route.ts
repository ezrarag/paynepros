import { NextRequest, NextResponse } from "next/server"
import { requestRepository } from "@/lib/repositories/request-repository"
import { sendSlackRequestStatusNotification } from "@/lib/slack"

type RouteContext = {
  params: Promise<{
    requestId: string
  }>
}

const allowedStatuses = new Set([
  "pending",
  "in_progress",
  "completed",
  "needs_revision",
])

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { requestId } = await context.params
    if (!requestId) {
      return NextResponse.json({ error: "Missing requestId" }, { status: 400 })
    }

    const body = await request.json()
    const status = body?.status as
      | "pending"
      | "in_progress"
      | "completed"
      | "needs_revision"
      | undefined

    if (!status || !allowedStatuses.has(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 })
    }

    const existingRequest = await requestRepository.findById(requestId)
    if (!existingRequest) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 })
    }

    await requestRepository.updateStatus(requestId, status)
    const updatedRequest = await requestRepository.findById(requestId)

    try {
      await sendSlackRequestStatusNotification({
        requestId,
        title: existingRequest.title,
        status,
        updatedAt: new Date().toISOString(),
      })
    } catch (slackError) {
      console.error("Error sending status update to Slack:", slackError)
    }

    return NextResponse.json(updatedRequest)
  } catch (error) {
    console.error("Error updating request status:", error)
    return NextResponse.json(
      { error: "Failed to update request status" },
      { status: 500 }
    )
  }
}
