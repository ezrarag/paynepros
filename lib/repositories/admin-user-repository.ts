import { adminDb, Timestamp } from "@/lib/firebase/admin"
import type { AdminUser } from "@/lib/types/admin"

const ADMIN_USERS_COLLECTION = "admin_users"

export interface AdminUserDoc {
  email: string
  name?: string
  tenantId: string
  role: "OWNER" | "ADMIN" | "STAFF"
  active: boolean | string // Support both boolean and string "true"/"false"
  passwordHash?: string
  tempPasswordSetAt?: Date | string
  createdAt?: Date | string
}

export class AdminUserRepository {
  /**
   * List active admin users for a tenant, sorted by role (OWNER first) then name.
   */
  async listByTenant(tenantId: string): Promise<AdminUser[]> {
    if (!adminDb) {
      // Mock mode: return mock admin users
      console.warn("Firebase Admin not initialized. Returning mock admin users.")
      const { mockAdminUsers } = await import("@/lib/mock/admin")
      return mockAdminUsers.filter((u) => u.tenantId === tenantId)
    }

    try {
      const snapshot = await adminDb
        .collection(ADMIN_USERS_COLLECTION)
        .where("tenantId", "==", tenantId)
        .get()

      const users = snapshot.docs
        .map((doc) => {
          const data = doc.data()
          // Coerce active to boolean
          const active =
            data.active === true ||
            data.active === "true" ||
            (typeof data.active === "string" && data.active.toLowerCase() === "true")

          if (!active) return null

          return {
            id: doc.id,
            email: data.email || doc.id, // Use doc.id as fallback if email missing
            name: data.name || data.email || doc.id,
            tenantId: data.tenantId || tenantId,
            role: data.role || "STAFF",
          } as AdminUser
        })
        .filter((u): u is AdminUser => u !== null)

      // Sort: OWNER first, then ADMIN, then STAFF, then alphabetically by name
      return users.sort((a, b) => {
        const roleOrder = { OWNER: 0, ADMIN: 1, STAFF: 2 }
        const roleDiff = roleOrder[a.role] - roleOrder[b.role]
        if (roleDiff !== 0) return roleDiff
        return (a.name || a.email).localeCompare(b.name || b.email)
      })
    } catch (error) {
      console.error("Failed to list admin users:", error)
      return []
    }
  }

  /**
   * Find admin user by email. Supports both docId=email and querying by email field.
   */
  async findByEmail(email: string): Promise<(AdminUserDoc & { id: string }) | null> {
    if (!adminDb) {
      // Mock mode: return mock admin user
      console.warn("Firebase Admin not initialized. Returning mock admin user.")
      const { getAdminUserByEmail } = await import("@/lib/mock/admin")
      const mockUser = getAdminUserByEmail(email)
      if (!mockUser) {
        return null
      }
      return {
        id: mockUser.id,
        email: mockUser.email,
        name: mockUser.name,
        tenantId: mockUser.tenantId,
        role: mockUser.role,
        active: true,
        // No passwordHash in mock mode - password verification handles it
      }
    }

    try {
      // First try: doc ID = email
      const docRef = adminDb.collection(ADMIN_USERS_COLLECTION).doc(email)
      const docSnap = await docRef.get()

      if (docSnap.exists) {
        const data = docSnap.data()
        return {
          id: docSnap.id,
          email: data?.email || docSnap.id,
          name: data?.name,
          tenantId: data?.tenantId || "",
          role: data?.role || "STAFF",
          active: data?.active ?? true,
          passwordHash: data?.passwordHash,
          tempPasswordSetAt: data?.tempPasswordSetAt
            ? data.tempPasswordSetAt.toDate?.() || data.tempPasswordSetAt
            : undefined,
          createdAt: data?.createdAt
            ? data.createdAt.toDate?.() || data.createdAt
            : undefined,
        }
      }

      // Second try: query by email field
      const querySnapshot = await adminDb
        .collection(ADMIN_USERS_COLLECTION)
        .where("email", "==", email)
        .limit(1)
        .get()

      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0]
        const data = doc.data()
        return {
          id: doc.id,
          email: data?.email || doc.id,
          name: data?.name,
          tenantId: data?.tenantId || "",
          role: data?.role || "STAFF",
          active: data?.active ?? true,
          passwordHash: data?.passwordHash,
          tempPasswordSetAt: data?.tempPasswordSetAt
            ? data.tempPasswordSetAt.toDate?.() || data.tempPasswordSetAt
            : undefined,
          createdAt: data?.createdAt
            ? data.createdAt.toDate?.() || data.createdAt
            : undefined,
        }
      }

      return null
    } catch (error) {
      console.error("Failed to find admin user by email:", error)
      return null
    }
  }

  /**
   * Verify password using bcrypt.compare
   * In mock mode (Firebase Admin disabled), accepts temp123 for any mock user
   */
  async verifyPassword(email: string, password: string): Promise<boolean> {
    if (!adminDb) {
      // Mock mode: check against mock admin users and accept temp123
      console.warn("Firebase Admin not initialized. Using mock password verification.")
      const { getAdminUserByEmail } = await import("@/lib/mock/admin")
      const mockUser = getAdminUserByEmail(email)
      if (!mockUser) {
        return false
      }
      // In mock mode, accept "temp123" for any user
      return password === "temp123"
    }

    const user = await this.findByEmail(email)
    if (!user || !user.passwordHash) {
      return false
    }

    // Coerce active to boolean
    const isActive =
      user.active === true ||
      user.active === "true" ||
      (typeof user.active === "string" && user.active.toLowerCase() === "true")

    if (!isActive) {
      return false
    }

    try {
      const bcrypt = await import("bcryptjs")
      return await bcrypt.compare(password, user.passwordHash)
    } catch (error) {
      console.error("Password verification error:", error)
      return false
    }
  }

  /**
   * Set password hash for an admin user
   */
  async setPasswordHash(email: string, passwordHash: string): Promise<void> {
    if (!adminDb) {
      console.warn("Firebase Admin not initialized. Cannot set password hash.")
      return
    }

    try {
      const docRef = adminDb.collection(ADMIN_USERS_COLLECTION).doc(email)
      const docSnap = await docRef.get()

      if (docSnap.exists) {
        // Update existing doc
        await docRef.update({
          passwordHash,
          tempPasswordSetAt: Timestamp.now(),
        })
      } else {
        // Try to find by email field first
        const querySnapshot = await adminDb
          .collection(ADMIN_USERS_COLLECTION)
          .where("email", "==", email)
          .limit(1)
          .get()

        if (!querySnapshot.empty) {
          const doc = querySnapshot.docs[0]
          await doc.ref.update({
            passwordHash,
            tempPasswordSetAt: Timestamp.now(),
          })
        } else {
          throw new Error(`Admin user not found: ${email}`)
        }
      }
    } catch (error) {
      console.error("Failed to set password hash:", error)
      throw error
    }
  }
}

export const adminUserRepository = new AdminUserRepository()
