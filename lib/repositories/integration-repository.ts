import "server-only"
import { adminDb, Timestamp } from "@/lib/firebase/admin"
import { DEFAULT_GOOGLE_WORKSPACE_INTEGRATION } from "@/lib/google-workspace-integration"
import { mockIntegrationStatus } from "@/lib/mock/admin"
import { decryptSecret, encryptSecret, type EncryptedSecret } from "@/lib/secret-vault"
import type { GoogleWorkspaceIntegration } from "@/lib/types/google-workspace-integration"

const INTEGRATIONS_COLLECTION = "integrations"

export interface Integration {
  id: string
  tenantId: string
  provider: "gmail" | "outlook" | "whatsapp" | "google_voice" | "twilio" | "google_workspace"
  status: "connected" | "disconnected"
  connectedAt?: string
  createdAt: string
  updatedAt: string
}

let mockGoogleWorkspaceIntegrations: Record<string, GoogleWorkspaceIntegration> = {}
let mockGoogleTokenVault: Record<
  string,
  {
    accessToken?: string
    refreshToken?: string
  }
> = {}

const toIsoString = (value?: FirebaseFirestore.Timestamp | Date | string | null) => {
  if (!value) return new Date().toISOString()
  if (typeof value === "string") return value
  if (value instanceof Date) return value.toISOString()
  if (typeof value.toDate === "function") return value.toDate().toISOString()
  return new Date().toISOString()
}

export class IntegrationRepository {
  /**
   * Check if tenant has any connected inbox integrations.
   * Returns true if at least one integration with status "connected" exists.
   */
  async hasConnectedInbox(tenantId: string): Promise<boolean> {
    if (!adminDb) {
      // Mock mode: check mockIntegrationStatus
      console.warn("Firebase Admin not initialized. Checking mock integration status.")
      return mockIntegrationStatus.some((integration) => integration.connected)
    }

    try {
      const snapshot = await adminDb
        .collection(INTEGRATIONS_COLLECTION)
        .where("tenantId", "==", tenantId)
        .where("status", "==", "connected")
        .limit(1)
        .get()

      return !snapshot.empty
    } catch (error) {
      console.error("Failed to check connected integrations:", error)
      // Fail safe: return false if there's an error
      return false
    }
  }

  /**
   * List all integrations for a tenant.
   */
  async findByTenant(tenantId: string): Promise<Integration[]> {
    if (!adminDb) {
      console.warn("Firebase Admin not initialized. Returning mock integrations.")
      const inboxIntegrations: Integration[] = mockIntegrationStatus.map((integration, index) => ({
        id: `mock-integration-${index}`,
        tenantId,
        provider: integration.provider,
        status: integration.connected ? "connected" as const : "disconnected" as const,
        connectedAt: integration.connectedAt,
        createdAt: integration.connectedAt || new Date().toISOString(),
        updatedAt: integration.connectedAt || new Date().toISOString(),
      }))
      const googleIntegration = await this.getGoogleWorkspaceIntegration(tenantId)
      return [
        ...inboxIntegrations,
        {
          id: googleIntegration.id,
          tenantId,
          provider: "google_workspace",
          status: googleIntegration.connected ? "connected" : "disconnected",
          connectedAt: googleIntegration.connectedAt || undefined,
          createdAt: googleIntegration.connectedAt || googleIntegration.updatedAt,
          updatedAt: googleIntegration.updatedAt,
        },
      ]
    }

    try {
      const snapshot = await adminDb
        .collection(INTEGRATIONS_COLLECTION)
        .where("tenantId", "==", tenantId)
        .get()

      return snapshot.docs.map((doc) => {
        const data = doc.data()
        return {
          ...data,
          id: doc.id,
          createdAt: data?.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
          updatedAt: data?.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
          connectedAt: data?.connectedAt?.toDate?.()?.toISOString(),
        } as Integration
      })
    } catch (error) {
      console.error("Failed to fetch integrations:", error)
      return []
    }
  }

  async getGoogleWorkspaceIntegration(tenantId: string): Promise<GoogleWorkspaceIntegration> {
    if (!adminDb) {
      return mockGoogleWorkspaceIntegrations[tenantId] ?? DEFAULT_GOOGLE_WORKSPACE_INTEGRATION(tenantId)
    }

    const docId = `${tenantId}_google_workspace`
    const snapshot = await adminDb.collection(INTEGRATIONS_COLLECTION).doc(docId).get()
    if (!snapshot.exists) {
      return DEFAULT_GOOGLE_WORKSPACE_INTEGRATION(tenantId)
    }

    const data = snapshot.data()
    const fallback = DEFAULT_GOOGLE_WORKSPACE_INTEGRATION(tenantId)
    return {
      id: snapshot.id,
      tenantId,
      provider: "google_workspace",
      connected: Boolean(data?.connected),
      googleEmail: data?.googleEmail ?? null,
      googleUserId: data?.googleUserId ?? null,
      scopes: Array.isArray(data?.scopes) ? data.scopes.filter((scope: unknown) => typeof scope === "string") : [],
      tokenMetadata: {
        accessTokenExpiresAt: data?.tokenMetadata?.accessTokenExpiresAt
          ? toIsoString(data.tokenMetadata.accessTokenExpiresAt)
          : null,
        tokenType: data?.tokenMetadata?.tokenType ?? null,
        hasRefreshToken: Boolean(data?.tokenMetadata?.hasRefreshToken),
        refreshTokenStored: Boolean(data?.tokenMetadata?.refreshTokenStored),
      },
      connectedByUserId: data?.connectedByUserId ?? null,
      connectedAt: data?.connectedAt ? toIsoString(data.connectedAt) : null,
      updatedAt: data?.updatedAt ? toIsoString(data.updatedAt) : fallback.updatedAt,
    }
  }

  async upsertGoogleWorkspaceIntegration(input: {
    tenantId: string
    googleEmail: string
    googleUserId: string
    scopes: string[]
    tokenMetadata: GoogleWorkspaceIntegration["tokenMetadata"]
    connectedByUserId: string
    accessToken?: string
    refreshToken?: string
  }): Promise<GoogleWorkspaceIntegration> {
    const now = new Date().toISOString()
    const next: GoogleWorkspaceIntegration = {
      id: `${input.tenantId}_google_workspace`,
      tenantId: input.tenantId,
      provider: "google_workspace",
      connected: true,
      googleEmail: input.googleEmail,
      googleUserId: input.googleUserId,
      scopes: input.scopes,
      tokenMetadata: input.tokenMetadata,
      connectedByUserId: input.connectedByUserId,
      connectedAt: now,
      updatedAt: now,
    }

    if (!adminDb) {
      mockGoogleWorkspaceIntegrations[input.tenantId] = next
      mockGoogleTokenVault[input.tenantId] = {
        ...mockGoogleTokenVault[input.tenantId],
        ...(input.accessToken ? { accessToken: input.accessToken } : {}),
        ...(input.refreshToken ? { refreshToken: input.refreshToken } : {}),
      }
      return next
    }

    const tokenVault: {
      accessToken?: EncryptedSecret
      refreshToken?: EncryptedSecret
    } = {}
    if (input.accessToken) {
      tokenVault.accessToken = encryptSecret(input.accessToken)
    }
    if (input.refreshToken) {
      tokenVault.refreshToken = encryptSecret(input.refreshToken)
    }

    const connectedAt = next.connectedAt ?? now

    await adminDb.collection(INTEGRATIONS_COLLECTION).doc(next.id).set({
      tenantId: next.tenantId,
      provider: next.provider,
      connected: next.connected,
      status: "connected",
      googleEmail: next.googleEmail,
      googleUserId: next.googleUserId,
      scopes: next.scopes,
      tokenMetadata: {
        ...next.tokenMetadata,
        ...(next.tokenMetadata.accessTokenExpiresAt
          ? {
              accessTokenExpiresAt: Timestamp.fromDate(
                new Date(next.tokenMetadata.accessTokenExpiresAt)
              ),
            }
          : {}),
      },
      connectedByUserId: next.connectedByUserId,
      connectedAt: Timestamp.fromDate(new Date(connectedAt)),
      updatedAt: Timestamp.fromDate(new Date(next.updatedAt)),
      createdAt: Timestamp.fromDate(new Date(connectedAt)),
      ...(Object.keys(tokenVault).length > 0 ? { tokenVault } : {}),
    }, { merge: true })

    return next
  }

  async getGoogleWorkspaceTokens(tenantId: string): Promise<{
    accessToken: string | null
    refreshToken: string | null
  }> {
    if (!adminDb) {
      const vault = mockGoogleTokenVault[tenantId]
      return {
        accessToken: vault?.accessToken ?? null,
        refreshToken: vault?.refreshToken ?? null,
      }
    }

    const docId = `${tenantId}_google_workspace`
    const snapshot = await adminDb.collection(INTEGRATIONS_COLLECTION).doc(docId).get()
    if (!snapshot.exists) {
      return { accessToken: null, refreshToken: null }
    }

    const tokenVault = snapshot.data()?.tokenVault as
      | {
          accessToken?: EncryptedSecret
          refreshToken?: EncryptedSecret
        }
      | undefined
    return {
      accessToken: decryptSecret(tokenVault?.accessToken),
      refreshToken: decryptSecret(tokenVault?.refreshToken),
    }
  }

  async updateGoogleWorkspaceTokens(input: {
    tenantId: string
    accessToken?: string
    refreshToken?: string
    accessTokenExpiresAt?: string | null
    tokenType?: string | null
    scopes?: string[]
  }): Promise<void> {
    const current = await this.getGoogleWorkspaceIntegration(input.tenantId)

    if (!adminDb) {
      mockGoogleTokenVault[input.tenantId] = {
        ...mockGoogleTokenVault[input.tenantId],
        ...(input.accessToken ? { accessToken: input.accessToken } : {}),
        ...(input.refreshToken ? { refreshToken: input.refreshToken } : {}),
      }
      mockGoogleWorkspaceIntegrations[input.tenantId] = {
        ...current,
        scopes: input.scopes ?? current.scopes,
        tokenMetadata: {
          accessTokenExpiresAt:
            input.accessTokenExpiresAt === undefined
              ? current.tokenMetadata.accessTokenExpiresAt
              : input.accessTokenExpiresAt,
          tokenType:
            input.tokenType === undefined ? current.tokenMetadata.tokenType : input.tokenType,
          hasRefreshToken: Boolean(input.refreshToken || current.tokenMetadata.hasRefreshToken),
          refreshTokenStored: Boolean(input.refreshToken || current.tokenMetadata.refreshTokenStored),
        },
        updatedAt: new Date().toISOString(),
      }
      return
    }

    const tokenVault: {
      accessToken?: EncryptedSecret
      refreshToken?: EncryptedSecret
    } = {}
    if (input.accessToken) {
      tokenVault.accessToken = encryptSecret(input.accessToken)
    }
    if (input.refreshToken) {
      tokenVault.refreshToken = encryptSecret(input.refreshToken)
    }

    const now = Timestamp.now()
    await adminDb.collection(INTEGRATIONS_COLLECTION).doc(`${input.tenantId}_google_workspace`).set({
      ...(input.scopes ? { scopes: input.scopes } : {}),
      tokenMetadata: {
        accessTokenExpiresAt:
          input.accessTokenExpiresAt === undefined
            ? current.tokenMetadata.accessTokenExpiresAt
              ? Timestamp.fromDate(new Date(current.tokenMetadata.accessTokenExpiresAt))
              : null
            : input.accessTokenExpiresAt
              ? Timestamp.fromDate(new Date(input.accessTokenExpiresAt))
              : null,
        tokenType: input.tokenType === undefined ? current.tokenMetadata.tokenType : input.tokenType,
        hasRefreshToken: Boolean(input.refreshToken || current.tokenMetadata.hasRefreshToken),
        refreshTokenStored: Boolean(input.refreshToken || current.tokenMetadata.refreshTokenStored),
      },
      ...(Object.keys(tokenVault).length > 0 ? { tokenVault } : {}),
      updatedAt: now,
    }, { merge: true })
  }

  async disconnectGoogleWorkspaceIntegration(
    tenantId: string,
    disconnectedByUserId: string
  ): Promise<GoogleWorkspaceIntegration> {
    const now = new Date().toISOString()
    const current = await this.getGoogleWorkspaceIntegration(tenantId)
    const next: GoogleWorkspaceIntegration = {
      ...current,
      connected: false,
      scopes: [],
      tokenMetadata: {
        accessTokenExpiresAt: null,
        tokenType: current.tokenMetadata.tokenType,
        hasRefreshToken: false,
        refreshTokenStored: false,
      },
      connectedByUserId: disconnectedByUserId,
      connectedAt: null,
      updatedAt: now,
    }

    if (!adminDb) {
      mockGoogleWorkspaceIntegrations[tenantId] = next
      delete mockGoogleTokenVault[tenantId]
      return next
    }

    await adminDb.collection(INTEGRATIONS_COLLECTION).doc(next.id).set({
      tenantId,
      provider: "google_workspace",
      connected: false,
      status: "disconnected",
      googleEmail: null,
      googleUserId: null,
      scopes: [],
      tokenMetadata: {
        accessTokenExpiresAt: null,
        tokenType: next.tokenMetadata.tokenType ?? null,
        hasRefreshToken: false,
        refreshTokenStored: false,
      },
      tokenVault: {},
      connectedByUserId: disconnectedByUserId,
      connectedAt: null,
      updatedAt: Timestamp.fromDate(new Date(now)),
    }, { merge: true })

    return next
  }
}

export const integrationRepository = new IntegrationRepository()
