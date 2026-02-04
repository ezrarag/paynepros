import type { Tenant, AdminUser, MessageMeta, MessageContent } from "@/lib/types/admin"

const TENANT_ID = "paynepros"

export const mockTenant: Tenant = {
  id: TENANT_ID,
  name: "Payne Professional Services",
}

/** Test users for admin login (Credentials). */
export const mockAdminUsers: AdminUser[] = [
  {
    id: "admin-detania",
    tenantId: TENANT_ID,
    name: "DeTania",
    email: "detania@paynepros.com",
    role: "OWNER",
  },
  {
    id: "admin-nija",
    tenantId: TENANT_ID,
    name: "Nija",
    email: "nija@paynepros.com",
    role: "STAFF",
  },
  {
    id: "admin-ezra",
    tenantId: TENANT_ID,
    name: "Ezra",
    email: "ezra@paynepros.com",
    role: "STAFF",
  },
]

export function getAdminUserByEmail(email: string): AdminUser | undefined {
  return mockAdminUsers.find((u) => u.email.toLowerCase() === email.toLowerCase())
}

export function getAdminUserById(id: string): AdminUser | undefined {
  return mockAdminUsers.find((u) => u.id === id)
}

/** Mock MessageMeta (STAFF-visible). Filter by tenantId in all server code. */
export const mockMessageMeta: MessageMeta[] = [
  {
    id: "msg-001",
    tenantId: TENANT_ID,
    workspaceId: "workspace-001",
    channel: "email",
    fromMasked: "client@****.com",
    subjectMasked: "Re: Missing 1099 ****",
    snippetMasked: "We found the 1099-MISC and uploaded...",
    unread: true,
    receivedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    urgency: "high",
    classification: "missing_docs",
  },
  {
    id: "msg-002",
    tenantId: TENANT_ID,
    workspaceId: "workspace-001",
    channel: "sms",
    fromMasked: "(555) ****-4432",
    snippetMasked: "Can you confirm the IRS payment...",
    unread: true,
    receivedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    urgency: "med",
    classification: "question",
  },
  {
    id: "msg-003",
    tenantId: TENANT_ID,
    workspaceId: "workspace-002",
    channel: "email",
    fromMasked: "marcus@****.com",
    subjectMasked: "Payroll docs ****",
    snippetMasked: "Payroll reports for Q4 are attached.",
    unread: false,
    receivedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    urgency: "low",
    classification: "general",
  },
  {
    id: "msg-004",
    tenantId: TENANT_ID,
    workspaceId: "workspace-003",
    channel: "whatsapp",
    fromMasked: "+1 *** *** 8901",
    snippetMasked: "Can we schedule a call this week?",
    unread: true,
    receivedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    urgency: "high",
    classification: "appointment",
  },
]

/** Mock MessageContent (OWNER/ADMIN only). */
export const mockMessageContent: MessageContent[] = [
  {
    id: "msg-001",
    tenantId: TENANT_ID,
    rawBody: "Hi, we found the 1099-MISC and uploaded it this morning. Please let us know if you need anything else.\n\nAlicia",
    attachments: [],
  },
  {
    id: "msg-002",
    tenantId: TENANT_ID,
    rawBody: "Can you confirm the IRS payment deadline? Thanks.",
    attachments: [],
  },
  {
    id: "msg-003",
    tenantId: TENANT_ID,
    rawBody: "Payroll reports for Q4 are attached. Let me know if you have questions.\n\nMarcus",
    attachments: [
      { name: "Q4_payroll.pdf", size: 102400, contentType: "application/pdf" },
    ],
  },
  {
    id: "msg-004",
    tenantId: TENANT_ID,
    rawBody: "Hi! Can we schedule a call this week to go over the tax return? I'm free Tuesday or Wednesday afternoon.",
    attachments: [],
  },
]

export function listMessageMetaByTenant(
  tenantId: string,
  workspaceId?: string
): MessageMeta[] {
  let list = mockMessageMeta.filter((m) => m.tenantId === tenantId)
  if (workspaceId) {
    list = list.filter((m) => m.workspaceId === workspaceId)
  }
  return list.sort(
    (a, b) => new Date(b.receivedAt).getTime() - new Date(a.receivedAt).getTime()
  )
}

export function getMessageContentByTenantAndId(
  tenantId: string,
  messageId: string
): MessageContent | undefined {
  const msg = mockMessageContent.find(
    (m) => m.tenantId === tenantId && m.id === messageId
  )
  return msg
}

/** Dashboard: urgency and unread counts from MessageMeta (tenant-scoped). */
export function getMessageMetaMetrics(tenantId: string): {
  unreadMessagesTotal: number
  urgentMessageCount: number
} {
  const list = mockMessageMeta.filter((m) => m.tenantId === tenantId)
  const unreadMessagesTotal = list.filter((m) => m.unread).length
  const urgentMessageCount = list.filter((m) => m.urgency === "high").length
  return { unreadMessagesTotal, urgentMessageCount }
}

/** Integration status (mock). OWNER can connect; STAFF sees read-only. */
export interface IntegrationStatus {
  provider: "gmail" | "outlook" | "whatsapp"
  connected: boolean
  connectedAt?: string
}

export const mockIntegrationStatus: IntegrationStatus[] = [
  { provider: "gmail", connected: false },
  { provider: "outlook", connected: false },
  { provider: "whatsapp", connected: false },
]
