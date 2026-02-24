type SlackRequestPayload = {
  requestId: string
  title: string
  description: string
  priority: "low" | "medium" | "high"
  category: string
  source?: string
  pagePath?: string
  screenshotUrl?: string
  createdAt: string
}

type SlackStatusPayload = {
  requestId: string
  title: string
  status: "pending" | "in_progress" | "completed" | "needs_revision"
  updatedAt: string
}

export async function sendSlackRequestNotification(
  payload: SlackRequestPayload
): Promise<void> {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL
  if (!webhookUrl) {
    return
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  const requestLink = `${appUrl}/admin/requests`

  const textLines = [
    `New BEAM request: ${payload.title}`,
    `Request ID: ${payload.requestId}`,
    `Priority: ${payload.priority}`,
    `Category: ${payload.category}`,
    `Source: ${payload.source || "beam"}`,
    payload.pagePath ? `Page: ${payload.pagePath}` : "",
    `Description: ${payload.description}`,
    payload.screenshotUrl ? `Screenshot: ${payload.screenshotUrl}` : "",
    `Created: ${payload.createdAt}`,
    `Review: ${requestLink}`,
  ].filter(Boolean)

  await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text: textLines.join("\n") }),
  })
}

export async function sendSlackRequestStatusNotification(
  payload: SlackStatusPayload
): Promise<void> {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL
  if (!webhookUrl) {
    return
  }

  const textLines = [
    `Request status updated: ${payload.title}`,
    `Request ID: ${payload.requestId}`,
    `New status: ${payload.status}`,
    `Updated: ${payload.updatedAt}`,
  ]

  await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text: textLines.join("\n") }),
  })
}
