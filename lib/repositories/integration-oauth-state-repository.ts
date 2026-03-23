import "server-only"
import { adminDb, Timestamp } from "@/lib/firebase/admin"

const OAUTH_STATE_COLLECTION = "integrationOAuthStates"

export interface IntegrationOAuthState {
  id: string
  provider: "google_workspace"
  tenantId: string
  userId: string
  returnTo: string
  createdAt: string
  expiresAt: string
}

const toIsoString = (value?: FirebaseFirestore.Timestamp | Date | string | null) => {
  if (!value) return new Date().toISOString()
  if (typeof value === "string") return value
  if (value instanceof Date) return value.toISOString()
  if (typeof value.toDate === "function") return value.toDate().toISOString()
  return new Date().toISOString()
}

let mockOAuthStates: Record<string, IntegrationOAuthState> = {}

export class IntegrationOAuthStateRepository {
  async create(input: {
    id: string
    provider: IntegrationOAuthState["provider"]
    tenantId: string
    userId: string
    returnTo: string
    expiresAt: string
  }): Promise<IntegrationOAuthState> {
    const state: IntegrationOAuthState = {
      id: input.id,
      provider: input.provider,
      tenantId: input.tenantId,
      userId: input.userId,
      returnTo: input.returnTo,
      createdAt: new Date().toISOString(),
      expiresAt: input.expiresAt,
    }

    if (!adminDb) {
      mockOAuthStates[state.id] = state
      return state
    }

    await adminDb.collection(OAUTH_STATE_COLLECTION).doc(state.id).set({
      provider: state.provider,
      tenantId: state.tenantId,
      userId: state.userId,
      returnTo: state.returnTo,
      createdAt: Timestamp.fromDate(new Date(state.createdAt)),
      expiresAt: Timestamp.fromDate(new Date(state.expiresAt)),
    })

    return state
  }

  async consume(id: string): Promise<IntegrationOAuthState | null> {
    if (!adminDb) {
      const state = mockOAuthStates[id] ?? null
      if (state) {
        delete mockOAuthStates[id]
      }
      return state
    }

    const docRef = adminDb.collection(OAUTH_STATE_COLLECTION).doc(id)
    const snapshot = await docRef.get()
    if (!snapshot.exists) {
      return null
    }

    const data = snapshot.data()
    await docRef.delete()
    return {
      id: snapshot.id,
      provider: data?.provider ?? "google_workspace",
      tenantId: data?.tenantId ?? "",
      userId: data?.userId ?? "",
      returnTo: data?.returnTo ?? "/admin/integrations",
      createdAt: toIsoString(data?.createdAt),
      expiresAt: toIsoString(data?.expiresAt),
    }
  }
}

export const integrationOAuthStateRepository = new IntegrationOAuthStateRepository()

