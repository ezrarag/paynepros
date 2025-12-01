/**
 * Pulse Integration
 * 
 * Pulse is an AI assistant that provides daily summaries and handles
 * lead classification and content requests.
 */

export interface PulseSummary {
  urgentItems: string[]
  followUps: string[]
  completed: string[]
  recommendations: string[]
  timestamp: string
}

export interface PulseClassification {
  probableService: string
  urgency: "low" | "medium" | "high"
  suggestedNextAction: string
}

/**
 * Send a message to Pulse webhook
 */
export async function sendToPulse(data: {
  type: "lead" | "content_request" | "daily_summary_request"
  business?: string
  source?: string
  message?: string
  [key: string]: any
}): Promise<void> {
  const pulseWebhookUrl = process.env.PULSE_WEBHOOK_URL

  if (!pulseWebhookUrl) {
    console.warn("PULSE_WEBHOOK_URL not configured")
    return
  }

  try {
    await fetch(pulseWebhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...data,
        timestamp: new Date().toISOString(),
      }),
    })
  } catch (error) {
    console.error("Error sending to Pulse webhook:", error)
    throw error
  }
}

/**
 * Request a daily summary from Pulse
 */
export async function requestDailySummary(business: string): Promise<PulseSummary> {
  // This would typically call Pulse API or webhook
  // For now, return a placeholder structure
  
  const pulseWebhookUrl = process.env.PULSE_WEBHOOK_URL
  if (pulseWebhookUrl) {
    await sendToPulse({
      type: "daily_summary_request",
      business,
    })
  }

  // Return placeholder - in production, this would fetch from Pulse API
  return {
    urgentItems: [
      "3 clients need immediate follow-up",
      "2 invoices overdue",
    ],
    followUps: [
      "5 new leads require response",
      "2 bookkeeping documents pending",
    ],
    completed: [
      "3 tax returns filed",
      "1 consultation scheduled",
    ],
    recommendations: [
      "Consider following up with high-value leads",
      "Review bookkeeping allocations",
    ],
    timestamp: new Date().toISOString(),
  }
}

/**
 * Classify a lead using Pulse
 */
export async function classifyLeadWithPulse(
  message: string,
  serviceInterest?: string
): Promise<PulseClassification> {
  // This would typically call Pulse API
  // For now, return a basic classification
  
  const pulseWebhookUrl = process.env.PULSE_WEBHOOK_URL
  if (pulseWebhookUrl) {
    await sendToPulse({
      type: "lead",
      message,
      serviceInterest,
    })
  }

  // Basic classification logic - replace with actual Pulse API call
  let urgency: "low" | "medium" | "high" = "medium"
  let probableService = serviceInterest || "General inquiry"

  if (message.toLowerCase().includes("urgent") || message.toLowerCase().includes("asap")) {
    urgency = "high"
  }

  if (message.toLowerCase().includes("past due") || message.toLowerCase().includes("overdue")) {
    urgency = "high"
    probableService = "Past-Due / Cleanup"
  }

  return {
    probableService,
    urgency,
    suggestedNextAction: urgency === "high" 
      ? "Contact within 2 hours"
      : urgency === "medium"
      ? "Contact within 12 hours"
      : "Contact within 24 hours",
  }
}

