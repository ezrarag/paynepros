import "next-auth"
import "next-auth/jwt"
import type { AdminRole } from "@/lib/types/admin"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
      role?: "admin" | "user"
      subscriptionStatus?: "active" | "inactive" | "cancelled"
      /** Admin dashboard: tenant and role. Set when signed in via admin Credentials. */
      tenantId?: string
      adminRole?: AdminRole
    }
  }

  interface User {
    id: string
    role?: "admin" | "user"
    subscriptionStatus?: "active" | "inactive" | "cancelled"
    tenantId?: string
    adminRole?: AdminRole
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string
    role?: "admin" | "user"
    subscriptionStatus?: "active" | "inactive" | "cancelled"
    tenantId?: string
    adminRole?: AdminRole
  }
}

