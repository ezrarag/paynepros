import { adminDb, Timestamp } from "@/lib/firebase/admin"
import { IntakeLink } from "@/lib/types/client-workspace"

const INTAKE_LINKS_COLLECTION = "intakeLinks"

const toIsoString = (value?: FirebaseFirestore.Timestamp | Date | null) => {
  if (!value) {
    return new Date().toISOString()
  }
  if (value instanceof Date) {
    return value.toISOString()
  }
  return value.toDate().toISOString()
}

export class IntakeLinkRepository {
  async create(link: Omit<IntakeLink, "id" | "createdAt">): Promise<IntakeLink> {
    if (!adminDb) {
      console.warn("Firebase Admin not initialized. Returning mock intake link.")
      return {
        ...link,
        id: "mock-intake-link-id",
        createdAt: new Date().toISOString(),
      }
    }
    try {
      const docRef = adminDb.collection(INTAKE_LINKS_COLLECTION).doc()
      const now = Timestamp.now()
      const expiresAtTs = Timestamp.fromDate(new Date(link.expiresAt))
      await docRef.set({
        ...link,
        clientWorkspaceId: link.clientWorkspaceId ?? null,
        createdAt: now,
        expiresAt: expiresAtTs,
      })
      return {
        ...link,
        id: docRef.id,
        createdAt: now.toDate().toISOString(),
      }
    } catch (error) {
      console.error("Failed to create intake link:", error)
      throw new Error("Failed to create intake link")
    }
  }

  async findByTokenHash(tokenHash: string): Promise<IntakeLink | null> {
    if (!adminDb) {
      console.warn("Firebase Admin not initialized. Returning null intake link.")
      return null
    }
    try {
      const snapshot = await adminDb
        .collection(INTAKE_LINKS_COLLECTION)
        .where("tokenHash", "==", tokenHash)
        .limit(1)
        .get()
      if (snapshot.empty) {
        return null
      }
      const doc = snapshot.docs[0]
      const data = doc.data()
      return {
        ...data,
        id: doc.id,
        clientWorkspaceId: data?.clientWorkspaceId ?? null,
        createdAt: toIsoString(data?.createdAt),
        expiresAt: toIsoString(data?.expiresAt),
        usedAt: data?.usedAt ? toIsoString(data.usedAt) : undefined,
      } as IntakeLink
    } catch (error) {
      console.error("Failed to find intake link:", error)
      throw new Error("Failed to find intake link")
    }
  }

  async markUsed(linkId: string): Promise<void> {
    if (!adminDb) {
      console.warn("Firebase Admin not initialized. Cannot update intake link.")
      return
    }
    try {
      await adminDb.collection(INTAKE_LINKS_COLLECTION).doc(linkId).update({
        status: "used",
      })
    } catch (error) {
      console.error("Failed to mark intake link as used:", error)
      throw new Error("Failed to update intake link")
    }
  }

  async updateAfterUse(
    linkId: string,
    data: { clientWorkspaceId: string; usedAt: string }
  ): Promise<void> {
    if (!adminDb) {
      console.warn("Firebase Admin not initialized. Cannot update intake link.")
      return
    }
    try {
      const usedAtTs = Timestamp.fromDate(new Date(data.usedAt))
      await adminDb.collection(INTAKE_LINKS_COLLECTION).doc(linkId).update({
        status: "used",
        clientWorkspaceId: data.clientWorkspaceId,
        usedAt: usedAtTs,
      })
    } catch (error) {
      console.error("Failed to update intake link after use:", error)
      throw new Error("Failed to update intake link")
    }
  }
}

export const intakeLinkRepository = new IntakeLinkRepository()
