import { auth } from "@/auth"
import type { AdminRole } from "@/lib/types/admin"

/** Session user as returned by getCurrentUser (admin context: has tenantId + adminRole). */
export interface CurrentUser {
  id: string
  name: string | null
  email: string | null
  image?: string | null
  tenantId: string
  role: AdminRole
}

/** Session user as returned by getCurrentClientUser (client context: has workspaceId). */
export interface CurrentClientUser {
  id: string
  name: string | null
  email: string | null
  image?: string | null
  clientWorkspaceId: string
}

/**
 * Get the current admin user from session. Use in server components/actions.
 * Returns null if not signed in or not an admin session (no tenantId/adminRole).
 */
export async function getCurrentUser(): Promise<CurrentUser | null> {
  const session = await auth()
  const user = session?.user
  if (!user?.id || !user.tenantId || !user.adminRole) return null
  return {
    id: user.id,
    name: user.name ?? null,
    email: user.email ?? null,
    image: user.image ?? null,
    tenantId: user.tenantId,
    role: user.adminRole,
  }
}

/**
 * Require an authenticated admin user. Throws/redirects if not signed in or not admin session.
 * Use in server components that require admin auth.
 */
export async function requireAuth(): Promise<CurrentUser> {
  const user = await getCurrentUser()
  if (!user) {
    const { redirect } = await import("next/navigation")
    redirect("/admin/login")
    throw new Error("Unreachable after redirect")
  }
  return user
}

/**
 * Get the current client user from session. Use in client dashboard routes/actions.
 * Returns null if not signed in or not a client-scoped session.
 */
export async function getCurrentClientUser(): Promise<CurrentClientUser | null> {
  const session = await auth()
  const user = session?.user
  if (!user?.id || !user.clientWorkspaceId || user.clientRole !== "client") return null
  return {
    id: user.id,
    name: user.name ?? null,
    email: user.email ?? null,
    image: user.image ?? null,
    clientWorkspaceId: user.clientWorkspaceId,
  }
}

/**
 * Require an authenticated client session. Redirects to /client/login if missing.
 */
export async function requireClientAuth(): Promise<CurrentClientUser> {
  const user = await getCurrentClientUser()
  if (!user) {
    const { redirect } = await import("next/navigation")
    redirect("/client/login")
    throw new Error("Unreachable after redirect")
  }
  return user
}

/**
 * Require current user to have one of the given roles. Use after requireAuth().
 * Throws if role not allowed (caller should redirect or return 403).
 */
export function requireRole(user: CurrentUser, roles: AdminRole[]): void {
  if (!roles.includes(user.role)) {
    const err = new Error("Forbidden: insufficient role")
    ;(err as any).status = 403
    throw err
  }
}

/**
 * Require current user to have access to the given tenant (same tenantId).
 * Use for tenant-scoped data access.
 */
export function requireTenantAccess(user: CurrentUser, tenantId: string): void {
  if (user.tenantId !== tenantId) {
    const err = new Error("Forbidden: tenant access denied")
    ;(err as any).status = 403
    throw err
  }
}
