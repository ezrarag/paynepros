import "server-only"
import { adminDb } from "@/lib/firebase/admin"
import { mockIntegrationStatus } from "@/lib/mock/admin"

const INTEGRATIONS_COLLECTION = "integrations"

export interface Integration {
  id: string
  tenantId: string
  provider: "gmail" | "outlook" | "whatsapp" | "google_voice" | "twilio"
  status: "connected" | "disconnected"
  connectedAt?: string
  createdAt: string
  updatedAt: string
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
      return mockIntegrationStatus.map((integration, index) => ({
        id: `mock-integration-${index}`,
        tenantId,
        provider: integration.provider,
        status: integration.connected ? "connected" : "disconnected",
        connectedAt: integration.connectedAt,
        createdAt: integration.connectedAt || new Date().toISOString(),
        updatedAt: integration.connectedAt || new Date().toISOString(),
      }))
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
}

export const integrationRepository = new IntegrationRepository()
