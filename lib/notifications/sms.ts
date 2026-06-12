import { getBaseUrl } from "@/lib/utils/url"
import type { ClientRequest, ClientWorkspace } from "@/lib/types/client-workspace"
import type { ChannelSendResult } from "@/lib/notifications/email"

const SMS_MAX_LENGTH = 320

export function maskPhone(phone: string): string {
  if (phone.length < 4) return "***"
  return `${"*".repeat(Math.max(0, phone.length - 4))}${phone.slice(-4)}`
}

function buildSmsText(
  workspace: ClientWorkspace,
  requestRecord: ClientRequest,
  portalLink: string,
  isReminder: boolean
): string {
  const clientName = workspace.primaryContact?.name?.split(" ")[0] || "there"
  const prefix = isReminder ? "Reminder from PaynePros" : "PaynePros"
  let text = `${prefix}: Hi ${clientName}, we need "${requestRecord.title}". Complete it here: ${portalLink}`
  if (text.length > SMS_MAX_LENGTH) {
    text = `${prefix}: "${requestRecord.title}" needed. ${portalLink}`
  }
  return text.slice(0, SMS_MAX_LENGTH)
}

export interface SendRequestSmsOptions {
  isReminder?: boolean
  baseUrl?: string
}

/** Low-level Telnyx send with the dev_log fallback when credentials are absent. */
export async function sendSms(to: string, text: string): Promise<ChannelSendResult> {
  const apiKey = process.env.TELNYX_API_KEY
  const fromNumber = process.env.TELNYX_FROM_NUMBER

  if (!apiKey || !fromNumber) {
    console.log("[SMS dev_log]", { to: maskPhone(to), text })
    return { channel: "sms", ok: true, mode: "dev_log" }
  }

  const response = await fetch("https://api.telnyx.com/v2/messages", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: fromNumber,
      to,
      text,
    }),
  })

  if (!response.ok) {
    const raw = await response.text().catch(() => "")
    console.error("[SMS] Telnyx send failed", {
      to: maskPhone(to),
      status: response.status,
    })
    return { channel: "sms", ok: false, error: raw || `telnyx_${response.status}` }
  }

  return { channel: "sms", ok: true, mode: "sent" }
}

export async function sendRequestSms(
  workspace: ClientWorkspace,
  requestRecord: ClientRequest,
  options: SendRequestSmsOptions = {}
): Promise<ChannelSendResult> {
  const phone = workspace.notificationPreferences?.phone
  if (!phone) {
    return { channel: "sms", ok: false, error: "No phone number on file" }
  }

  const baseUrl = options.baseUrl ?? getBaseUrl()
  const portalLink = `${baseUrl}/client?requestId=${encodeURIComponent(requestRecord.id)}`
  const text = buildSmsText(workspace, requestRecord, portalLink, Boolean(options.isReminder))

  return sendSms(phone, text)
}
