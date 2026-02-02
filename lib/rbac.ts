import type { CurrentUser } from "@/lib/auth"
import type { AdminRole } from "@/lib/types/admin"

/** Roles allowed to view full message content (raw body, attachments). */
const MESSAGE_CONTENT_ROLES: AdminRole[] = ["OWNER", "ADMIN"]

/** Roles allowed to manage integrations (connect Gmail/Outlook/WhatsApp). */
const INTEGRATION_MANAGER_ROLES: AdminRole[] = ["OWNER"]

/**
 * Whether the user can view MessageContent (raw body, attachments).
 * STAFF can only see MessageMeta (masked fields, urgency).
 */
export function canViewMessageContent(user: CurrentUser): boolean {
  return MESSAGE_CONTENT_ROLES.includes(user.role)
}

/**
 * Whether the user can manage integrations (connect/disconnect providers).
 * Only OWNER by default; configurable via INTEGRATION_MANAGER_ROLES.
 */
export function canManageIntegrations(user: CurrentUser): boolean {
  return INTEGRATION_MANAGER_ROLES.includes(user.role)
}

/**
 * Check if user has one of the given roles. Use for generic role gating.
 */
export function hasRole(user: CurrentUser, roles: AdminRole[]): boolean {
  return roles.includes(user.role)
}
