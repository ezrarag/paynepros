import { randomBytes, createHash } from "crypto"
import { adminDb, Timestamp } from "@/lib/firebase/admin"

const COLLECTION = "clientPortalMagicLinks"

type MagicLinkRecord = {
  workspaceId: string
  email: string
  tokenHash: string
  status: "active" | "used" | "expired"
  createdAt: string
  expiresAt: string
  usedAt?: string
}

let mockLinks: Array<MagicLinkRecord & { id: string }> = []

const hashToken = (token: string) => createHash("sha256").update(token).digest("hex")

const toIsoString = (value?: FirebaseFirestore.Timestamp | Date | string | null) => {
  if (!value) return new Date().toISOString()
  if (typeof value === "string") return value
  if (value instanceof Date) return value.toISOString()
  if (typeof value.toDate === "function") return value.toDate().toISOString()
  return new Date().toISOString()
}

export class ClientPortalAuthRepository {
  async createMagicLink(input: {
    workspaceId: string
    email: string
    expiresAt: Date
  }): Promise<{ token: string; expiresAt: string }> {
    const token = randomBytes(32).toString("hex")
    const tokenHash = hashToken(token)

    if (!adminDb) {
      const now = new Date().toISOString()
      mockLinks.unshift({
        id: `mock-link-${Date.now()}`,
        workspaceId: input.workspaceId,
        email: input.email,
        tokenHash,
        status: "active",
        createdAt: now,
        expiresAt: input.expiresAt.toISOString(),
      })
      return { token, expiresAt: input.expiresAt.toISOString() }
    }

    const now = Timestamp.now()
    const docRef = adminDb.collection(COLLECTION).doc()
    await docRef.set({
      workspaceId: input.workspaceId,
      email: input.email,
      tokenHash,
      status: "active",
      createdAt: now,
      expiresAt: Timestamp.fromDate(input.expiresAt),
    })

    return { token, expiresAt: input.expiresAt.toISOString() }
  }

  async consumeMagicLink(token: string): Promise<{ workspaceId: string; email: string } | null> {
    const tokenHash = hashToken(token)
    const now = new Date()

    if (!adminDb) {
      const index = mockLinks.findIndex((link) => link.tokenHash === tokenHash)
      if (index === -1) return null
      const link = mockLinks[index]
      if (link.status !== "active") return null
      if (new Date(link.expiresAt).getTime() <= now.getTime()) {
        mockLinks[index] = { ...link, status: "expired" }
        return null
      }
      mockLinks[index] = { ...link, status: "used", usedAt: new Date().toISOString() }
      return { workspaceId: link.workspaceId, email: link.email }
    }

    const snapshot = await adminDb
      .collection(COLLECTION)
      .where("tokenHash", "==", tokenHash)
      .limit(1)
      .get()

    if (snapshot.empty) return null

    const doc = snapshot.docs[0]
    const data = doc.data() as {
      workspaceId?: string
      email?: string
      status?: "active" | "used" | "expired"
      expiresAt?: FirebaseFirestore.Timestamp | Date | string
    }

    if (!data.workspaceId || !data.email || data.status !== "active") {
      return null
    }

    const expiresAtIso = toIsoString(data.expiresAt)
    if (new Date(expiresAtIso).getTime() <= now.getTime()) {
      await doc.ref.update({
        status: "expired",
      })
      return null
    }

    await doc.ref.update({
      status: "used",
      usedAt: Timestamp.now(),
    })

    return {
      workspaceId: data.workspaceId,
      email: data.email,
    }
  }
}

export const clientPortalAuthRepository = new ClientPortalAuthRepository()
