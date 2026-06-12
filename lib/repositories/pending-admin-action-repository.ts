import { adminDb, Timestamp } from "@/lib/firebase/admin"
import type { ClientRequestType } from "@/lib/types/client-workspace"

const PENDING_ACTIONS_COLLECTION = "pendingAdminActions"
const TTL_MINUTES = 15

export interface PendingAdminAction {
  id: string
  /** Admin phone in E.164 — doc keyed by this so one pending action per admin */
  adminPhone: string
  documentRequested: string
  templateType: ClientRequestType
  customTitle?: string
  /** Ordered candidate workspaces the admin picks from by replying 1..N */
  candidates: { workspaceId: string; displayName: string }[]
  createdAt: string
  expiresAt: string
}

const toIsoString = (value?: FirebaseFirestore.Timestamp | Date | string | null) => {
  if (!value) {
    return new Date().toISOString()
  }
  if (typeof value === "string") {
    return value
  }
  if (value instanceof Date) {
    return value.toISOString()
  }
  if (typeof value.toDate === "function") {
    return value.toDate().toISOString()
  }
  return new Date().toISOString()
}

let mockPendingActions: PendingAdminAction[] = []

export class PendingAdminActionRepository {
  async set(input: Omit<PendingAdminAction, "id" | "createdAt" | "expiresAt">): Promise<PendingAdminAction> {
    const now = new Date()
    const expiresAt = new Date(now.getTime() + TTL_MINUTES * 60 * 1000)

    if (!adminDb) {
      const action: PendingAdminAction = {
        ...input,
        id: input.adminPhone,
        createdAt: now.toISOString(),
        expiresAt: expiresAt.toISOString(),
      }
      mockPendingActions = [
        ...mockPendingActions.filter((a) => a.adminPhone !== input.adminPhone),
        action,
      ]
      return action
    }

    const docRef = adminDb.collection(PENDING_ACTIONS_COLLECTION).doc(input.adminPhone)
    await docRef.set({
      ...input,
      createdAt: Timestamp.fromDate(now),
      expiresAt: Timestamp.fromDate(expiresAt),
    })
    return {
      ...input,
      id: input.adminPhone,
      createdAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
    }
  }

  async findActive(adminPhone: string): Promise<PendingAdminAction | null> {
    if (!adminDb) {
      const action = mockPendingActions.find((a) => a.adminPhone === adminPhone) ?? null
      if (!action || new Date(action.expiresAt).getTime() < Date.now()) {
        return null
      }
      return action
    }

    const snapshot = await adminDb.collection(PENDING_ACTIONS_COLLECTION).doc(adminPhone).get()
    if (!snapshot.exists) {
      return null
    }
    const data = snapshot.data()
    const action: PendingAdminAction = {
      ...(data as Omit<PendingAdminAction, "id" | "createdAt" | "expiresAt">),
      id: snapshot.id,
      createdAt: toIsoString(data?.createdAt),
      expiresAt: toIsoString(data?.expiresAt),
    }
    if (new Date(action.expiresAt).getTime() < Date.now()) {
      await snapshot.ref.delete().catch(() => {})
      return null
    }
    return action
  }

  async clear(adminPhone: string): Promise<void> {
    if (!adminDb) {
      mockPendingActions = mockPendingActions.filter((a) => a.adminPhone !== adminPhone)
      return
    }
    await adminDb.collection(PENDING_ACTIONS_COLLECTION).doc(adminPhone).delete().catch(() => {})
  }
}

export const pendingAdminActionRepository = new PendingAdminActionRepository()
