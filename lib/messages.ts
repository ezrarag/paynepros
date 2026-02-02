"use server"

import { getCurrentUser } from "@/lib/auth"
import { canViewMessageContent } from "@/lib/rbac"
import {
  listMessageMetaByTenant,
  getMessageContentByTenantAndId,
} from "@/lib/mock/admin"
import type { MessageMeta, MessageContent } from "@/lib/types/admin"

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
  const list = listMessageMetaByTenant(user.tenantId, workspaceId)
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
  const content = getMessageContentByTenantAndId(user.tenantId, messageId)
  if (!content) {
    return { data: null, error: "Not found", status: 404 }
  }
  return { data: content, error: null, status: 200 }
}
