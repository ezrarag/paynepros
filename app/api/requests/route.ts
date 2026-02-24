import { NextRequest, NextResponse } from "next/server"
import { requestRepository } from "@/lib/repositories/request-repository"
import { sendSlackRequestNotification } from "@/lib/slack"

export async function GET(request: NextRequest) {
  try {
    // TEMPORARILY DISABLED AUTH CHECK for development
    // const session = await auth()
    // if (!session?.user?.id) {
    //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    // }

    // Mock user ID for development
    const mockUserId = "mock-admin-id"
    const source = request.nextUrl.searchParams.get("source")
    const status = request.nextUrl.searchParams.get("status")
    const requests = await requestRepository.findByUserId(mockUserId)
    const filteredRequests = requests.filter((item) => {
      const sourceMatch = source ? item.source === source : true
      const statusMatch = status ? item.status === status : true
      return sourceMatch && statusMatch
    })
    
    // Ensure we always return an array
    return NextResponse.json(Array.isArray(filteredRequests) ? filteredRequests : [])
  } catch (error) {
    console.error("Error fetching requests:", error)
    return NextResponse.json([], { status: 200 }) // Return empty array instead of error
  }
}

export async function POST(request: NextRequest) {
  try {
    // TEMPORARILY DISABLED AUTH CHECK for development
    // const session = await auth()
    // if (!session?.user?.id) {
    //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    // }

    // Mock user ID for development
    const mockUserId = "mock-admin-id"

    const body = await request.json()
    const {
      title,
      description,
      priority,
      category,
      sendToBeamParticipants,
      source,
      pagePath,
      screenshotUrl,
    } =
      body

    const contentRequest = await requestRepository.create({
      userId: mockUserId,
      title,
      description,
      priority: priority || "medium",
      category: category || "other",
      sendToBeamParticipants: sendToBeamParticipants || false,
      source: source || "admin_requests",
      pagePath: pagePath || "",
      screenshotUrl: screenshotUrl || "",
    })

    // Send to Slack webhook if configured
    try {
      await sendSlackRequestNotification({
        requestId: contentRequest.id,
        title: contentRequest.title,
        description: contentRequest.description,
        priority: contentRequest.priority,
        category: contentRequest.category,
        source: contentRequest.source,
        pagePath: contentRequest.pagePath,
        screenshotUrl: contentRequest.screenshotUrl,
        createdAt: contentRequest.createdAt,
      })
    } catch (slackError) {
      console.error("Error sending to Slack webhook:", slackError)
    }

    // Backward-compatible Pulse webhook support
    const pulseWebhookUrl = process.env.PULSE_WEBHOOK_URL
    if (pulseWebhookUrl) {
      try {
        await fetch(pulseWebhookUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            type: "content_request",
            userId: mockUserId,
            title,
            description,
            priority,
            category,
            sendToBeamParticipants,
            source,
            pagePath,
            screenshotUrl,
          }),
        })
      } catch (webhookError) {
        console.error("Error sending to Pulse webhook:", webhookError)
      }
    }

    return NextResponse.json(contentRequest)
  } catch (error) {
    console.error("Error creating request:", error)
    return NextResponse.json(
      { error: "Failed to create request" },
      { status: 500 }
    )
  }
}
