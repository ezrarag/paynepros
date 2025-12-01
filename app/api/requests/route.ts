import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { requestRepository } from "@/lib/repositories/request-repository"

export async function GET(request: NextRequest) {
  try {
    // TEMPORARILY DISABLED AUTH CHECK for development
    // const session = await auth()
    // if (!session?.user?.id) {
    //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    // }

    // Mock user ID for development
    const mockUserId = "mock-admin-id"
    const requests = await requestRepository.findByUserId(mockUserId)
    
    // Ensure we always return an array
    return NextResponse.json(Array.isArray(requests) ? requests : [])
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
    const { title, description, priority, category, sendToBeamParticipants } =
      body

    const contentRequest = await requestRepository.create({
      userId: mockUserId,
      title,
      description,
      priority: priority || "medium",
      category: category || "other",
      sendToBeamParticipants: sendToBeamParticipants || false,
    })

    // Send to Pulse webhook if configured
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

