/**
 * Admin auth and RBAC types.
 * Tenant-scoped; all data must be filtered by tenantId from session.
 */

export type AdminRole = "OWNER" | "ADMIN" | "STAFF"

export interface Tenant {
  id: string
  name: string
}

export interface AdminUser {
  id: string
  tenantId: string
  name: string
  email: string
  role: AdminRole
}

/** Visible to STAFF: masked metadata only, no raw content. */
export type MessageChannel =
  | "email"
  | "sms"
  | "whatsapp"
  | "ig"
  | "facebook"

export type MessageUrgency = "low" | "med" | "high"

export type MessageClassification =
  | "missing_docs"
  | "appointment"
  | "general"
  | "question"
  | "other"

export interface MessageMeta {
  id: string
  tenantId: string
  workspaceId: string
  channel: MessageChannel
  fromMasked: string
  subjectMasked?: string
  snippetMasked?: string
  unread: boolean
  receivedAt: string
  urgency: MessageUrgency
  classification: MessageClassification
}

/** OWNER/ADMIN only; never exposed to STAFF. */
export interface MessageContent {
  id: string
  tenantId: string
  rawBody: string
  attachments: Array<{ name: string; size: number; contentType: string }>
}
