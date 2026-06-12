import { NextRequest, NextResponse } from "next/server"
import { sendRequestReminder } from "@/lib/notifications/dispatcher"
import { getBaseUrl } from "@/lib/utils/url"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}))
    const workspaceId = typeof body.workspaceId === "string" ? body.workspaceId : ""
    const requestId = typeof body.requestId === "string" ? body.requestId : ""
    if (!workspaceId || !requestId) {
      return NextResponse.json({ error: "workspaceId and requestId are required" }, { status: 400 })
    }

    const results = await sendRequestReminder(workspaceId, requestId, {
      isFirstSend: true,
      baseUrl: getBaseUrl(request),
    })

    const failed = results.filter((result) => !result.ok)
    if (failed.length === results.length) {
      // Every channel failed — preserve the old route's error semantics
      const firstError = failed[0]?.error ?? "Failed to send client request"
      const status =
        firstError === "Workspace not found" || firstError === "Request not found" ? 404 : 502
      return NextResponse.json({ error: firstError }, { status })
    }

    const mode = results.find((result) => result.ok)?.mode ?? "sent"
    return NextResponse.json({ ok: true, mode, results })
  } catch (error) {
    console.error("POST /api/client-requests/send failed:", error)
    return NextResponse.json({ error: "Failed to send client request email" }, { status: 500 })
  }
}
