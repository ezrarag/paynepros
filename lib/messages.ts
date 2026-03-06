import { getCurrentUser } from "@/lib/auth"
import { canViewMessageContent } from "@/lib/rbac"
import {
  listMessageMetaByTenant,
  getMessageContentByTenantAndId,
} from "@/lib/mock/admin"
import { leadRepository } from "@/lib/repositories/lead-repository"
import type { MessageMeta, MessageContent } from "@/lib/types/admin"
import type { Lead } from "@/packages/core"

const LEAD_MESSAGE_ID_PREFIX = "lead:"
const WEBSITE_SUBMISSIONS_WORKSPACE_ID = "website-submissions"
const PAYNEPROS_TENANT_ID = "paynepros"

const SOURCE_CLASSIFICATION_MAP: Record<string, MessageMeta["classification"]> = {
  website: "general",
  email: "question",
  sms: "question",
  whatsapp: "appointment",
  instagram: "general",
  facebook: "general",
}

function maskEmail(email?: string): string | null {
  if (!email) return null
  const [localPart, domainPart] = email.split("@")
  if (!localPart || !domainPart) return null
  const safeLocal = localPart.length <= 2 ? `${localPart[0] ?? "*"}*` : `${localPart.slice(0, 2)}***`
  const domainFragments = domainPart.split(".")
  const safeDomain = domainFragments.length > 1 ? `${domainFragments[0]?.slice(0, 2) ?? "**"}****.${domainFragments.slice(1).join(".")}` : `${domainPart.slice(0, 2)}****`
  return `${safeLocal}@${safeDomain}`
}

function maskPhone(phone?: string): string | null {
  if (!phone) return null
  const digits = phone.replace(/\D/g, "")
  if (digits.length < 4) return "****"
  return `${"*".repeat(Math.max(0, digits.length - 4))}${digits.slice(-4)}`
}

function inferUrgency(lead: Lead): MessageMeta["urgency"] {
  const text = `${lead.message} ${lead.serviceInterest ?? ""}`.toLowerCase()
  if (/\b(urgent|asap|immediately|today|deadline)\b/.test(text)) {
    return "high"
  }
  if (lead.source === "sms" || lead.source === "whatsapp") {
    return "med"
  }
  return "low"
}

function inferClassification(lead: Lead): MessageMeta["classification"] {
  const text = `${lead.message} ${lead.serviceInterest ?? ""}`.toLowerCase()
  if (/\b(1099|w-2|w2|documents?|docs?|receipt|upload)\b/.test(text)) {
    return "missing_docs"
  }
  if (/\b(call|meeting|consult|book|appointment|schedule)\b/.test(text)) {
    return "appointment"
  }
  if (/\b(question|help|can you|how do i|what)\b/.test(text)) {
    return "question"
  }
  return SOURCE_CLASSIFICATION_MAP[lead.source] ?? "other"
}

function toLeadMessageMeta(tenantId: string, lead: Lead): MessageMeta | null {
  if (tenantId !== PAYNEPROS_TENANT_ID || lead.business !== "paynepros") {
    return null
  }

  const fromMasked = maskEmail(lead.email) ?? maskPhone(lead.phone) ?? `${lead.name.slice(0, 2)}***`
  const snippetMasked = lead.message ? lead.message.slice(0, 180) : undefined
  const workspaceId =
    typeof lead.meta?.workspaceId === "string" && lead.meta.workspaceId.trim().length > 0
      ? lead.meta.workspaceId
      : WEBSITE_SUBMISSIONS_WORKSPACE_ID

  return {
    id: `${LEAD_MESSAGE_ID_PREFIX}${lead.id}`,
    tenantId,
    workspaceId,
    channel: "email",
    fromMasked,
    subjectMasked: lead.serviceInterest ? `Website submission: ${lead.serviceInterest}` : "Website submission",
    snippetMasked,
    unread: true,
    receivedAt: lead.createdAt,
    urgency: inferUrgency(lead),
    classification: inferClassification(lead),
  }
}

async function listLeadMessageMeta(tenantId: string): Promise<MessageMeta[]> {
  try {
    const leads = await leadRepository.findByBusiness("paynepros")
    return leads
      .map((lead) => toLeadMessageMeta(tenantId, lead))
      .filter((lead): lead is MessageMeta => Boolean(lead))
  } catch (error) {
    console.error("Failed to build lead-backed message metadata:", error)
    return []
  }
}

export async function listMessageMetaForTenant(
  tenantId: string,
  workspaceId?: string
): Promise<MessageMeta[]> {
  const integrationMeta = listMessageMetaByTenant(tenantId, workspaceId)
  const leadMeta = await listLeadMessageMeta(tenantId)
  const combined = [...integrationMeta, ...leadMeta]
  const filtered = workspaceId ? combined.filter((item) => item.workspaceId === workspaceId) : combined
  return filtered.sort(
    (a, b) => new Date(b.receivedAt).getTime() - new Date(a.receivedAt).getTime()
  )
}

async function getLeadMessageContent(
  tenantId: string,
  messageId: string
): Promise<MessageContent | null> {
  if (!messageId.startsWith(LEAD_MESSAGE_ID_PREFIX)) {
    return null
  }
  if (tenantId !== PAYNEPROS_TENANT_ID) {
    return null
  }

  const leadId = messageId.slice(LEAD_MESSAGE_ID_PREFIX.length)
  if (!leadId) return null

  try {
    const lead = await leadRepository.findById(leadId)
    if (!lead || lead.business !== "paynepros") {
      return null
    }

    const rawBody = [
      `Name: ${lead.name}`,
      `Email: ${lead.email || "Not provided"}`,
      `Phone: ${lead.phone || "Not provided"}`,
      `Source: ${lead.source}`,
      `Service interest: ${lead.serviceInterest || "General inquiry"}`,
      "",
      lead.message,
    ].join("\n")

    return {
      id: messageId,
      tenantId,
      rawBody,
      attachments: [],
    }
  } catch (error) {
    console.error("Failed to fetch lead message content:", error)
    return null
  }
}

export async function getMessageContentForTenant(
  tenantId: string,
  messageId: string
): Promise<MessageContent | null> {
  const integrationContent = getMessageContentByTenantAndId(tenantId, messageId)
  if (integrationContent) {
    return integrationContent
  }
  return getLeadMessageContent(tenantId, messageId)
}

/**
 * List message metadata for the current tenant (STAFF can call).
 * All queries filter by tenantId from session.
 */
export async function listMessageMeta(workspaceId?: string): Promise<{
  data: MessageMeta[] | null
  error: string | null
}> {
  const user = await getCurrentUser()
  if (!user) {
    return { data: null, error: "Unauthorized" }
  }
  const list = await listMessageMetaForTenant(user.tenantId, workspaceId)
  return { data: list, error: null }
}

/**
 * Get full message content. Throws 403 for STAFF (OWNER/ADMIN only).
 * Enforce tenant + role in server; do not rely on UI hiding.
 */
export async function getMessageContent(messageId: string): Promise<{
  data: MessageContent | null
  error: string | null
  status: number
}> {
  const user = await getCurrentUser()
  if (!user) {
    return { data: null, error: "Unauthorized", status: 401 }
  }
  if (!canViewMessageContent(user)) {
    return { data: null, error: "Forbidden: message content is owner-only", status: 403 }
  }
  const content = await getMessageContentForTenant(user.tenantId, messageId)
  if (!content) {
    return { data: null, error: "Not found", status: 404 }
  }
  return { data: content, error: null, status: 200 }
}
