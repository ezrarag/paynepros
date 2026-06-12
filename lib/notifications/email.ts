import { clientRequestTemplateRepository } from "@/lib/repositories/client-request-template-repository"
import { getBaseUrl } from "@/lib/utils/url"
import type { ClientRequest, ClientWorkspace } from "@/lib/types/client-workspace"

const escapeHtml = (value: string) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;")

const applyTokens = (input: string, tokens: Record<string, string>) =>
  input.replace(/\{\{(.*?)\}\}/g, (_match, keyRaw) => {
    const key = String(keyRaw || "").trim()
    return tokens[key] ?? ""
  })

export interface SendRequestEmailOptions {
  isReminder?: boolean
  baseUrl?: string
}

export interface ChannelSendResult {
  channel: string
  ok: boolean
  mode?: "sent" | "dev_log"
  error?: string
}

function daysOpen(sentAt: string): number {
  const elapsed = Date.now() - new Date(sentAt).getTime()
  return Math.max(1, Math.round(elapsed / (24 * 60 * 60 * 1000)))
}

export async function sendRequestEmail(
  workspace: ClientWorkspace,
  requestRecord: ClientRequest,
  options: SendRequestEmailOptions = {}
): Promise<ChannelSendResult> {
  const email = workspace.primaryContact?.email
  if (!email) {
    return { channel: "email", ok: false, error: "Client email not available" }
  }

  const emailTemplate = await clientRequestTemplateRepository.get()
  const baseUrl = options.baseUrl ?? getBaseUrl()
  const portalLink = `${baseUrl}/client?requestId=${encodeURIComponent(requestRecord.id)}`
  const apiKey = process.env.RESEND_API_KEY
  const from = process.env.CLIENT_MAGIC_LINK_FROM
  const isProduction = process.env.NODE_ENV === "production"
  const clientName = workspace.primaryContact?.name || workspace.displayName || "Client"
  const tokens = {
    clientName,
    requestTitle: requestRecord.title,
  }

  const baseSubject =
    applyTokens(emailTemplate.subjectTemplate, tokens).trim() ||
    `PaynePros request: ${requestRecord.title}`
  const subject = options.isReminder ? `Reminder: ${baseSubject}` : baseSubject
  const greetingLine = applyTokens(emailTemplate.greetingLine, tokens).trim()
  const introLine = applyTokens(emailTemplate.introLine, tokens).trim()
  const buttonLabel =
    applyTokens(emailTemplate.buttonLabel, tokens).trim() || "Open Requested Item"
  const footerNote = applyTokens(emailTemplate.footerNote, tokens).trim()
  const closingLine = applyTokens(emailTemplate.closingLine, tokens).trim()
  const signatureName = applyTokens(emailTemplate.signatureName, tokens).trim()

  const reminderLine = options.isReminder
    ? `This request has been open for ${daysOpen(requestRecord.sentAt)} day${daysOpen(requestRecord.sentAt) === 1 ? "" : "s"}. When you're ready, it only takes a minute to complete.`
    : ""

  if (!apiKey || !from) {
    if (isProduction) {
      return { channel: "email", ok: false, error: "Email delivery not configured" }
    }
    console.log("[ClientRequest Email Link]", {
      workspaceId: workspace.id,
      requestId: requestRecord.id,
      email,
      portalLink,
      isReminder: Boolean(options.isReminder),
    })
    return { channel: "email", ok: true, mode: "dev_log" }
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [email],
      subject,
      html: `
        ${greetingLine ? `<p>${escapeHtml(greetingLine)}</p>` : ""}
        ${introLine ? `<p>${escapeHtml(introLine)}</p>` : ""}
        ${reminderLine ? `<p>${escapeHtml(reminderLine)}</p>` : ""}
        <p><strong>${escapeHtml(requestRecord.title)}</strong></p>
        <p>${escapeHtml(requestRecord.instructions)}</p>
        ${
          requestRecord.noteFromPreparer
            ? `<p><strong>Note from preparer:</strong> ${escapeHtml(requestRecord.noteFromPreparer)}</p>`
            : ""
        }
        <p>
          <a href="${portalLink}" style="display:inline-block;padding:10px 16px;border-radius:8px;background:#0f172a;color:#ffffff;text-decoration:none;font-weight:600;">
            ${escapeHtml(buttonLabel)}
          </a>
        </p>
        ${footerNote ? `<p>${escapeHtml(footerNote)}</p>` : ""}
        ${(closingLine || signatureName) ? `<p>${escapeHtml(closingLine)}<br/>${escapeHtml(signatureName)}</p>` : ""}
      `,
    }),
  })

  if (!response.ok) {
    const raw = await response.text().catch(() => "")
    return { channel: "email", ok: false, error: raw || `resend_${response.status}` }
  }

  return { channel: "email", ok: true, mode: "sent" }
}
