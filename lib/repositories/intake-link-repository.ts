import "server-only"
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
    const docRef = adminDb.collection(INTAKE_LINKS_COLLECTION).doc()
    const now = Timestamp.now()
    await docRef.set({
      ...link,
      createdAt: now,
      expiresAt: Timestamp.fromDate(new Date(link.expiresAt)),
    })
    return {
      ...link,
      id: docRef.id,
      createdAt: now.toDate().toISOString(),
    }
  }

  async findByTokenHash(tokenHash: string): Promise<IntakeLink | null> {
    if (!adminDb) {
      console.warn("Firebase Admin not initialized. Returning null intake link.")
      return null
    }
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
      createdAt: toIsoString(data?.createdAt),
      expiresAt: toIsoString(data?.expiresAt),
    } as IntakeLink
  }

  async markUsed(linkId: string): Promise<void> {
    if (!adminDb) {
      console.warn("Firebase Admin not initialized. Cannot update intake link.")
      return
    }
    await adminDb.collection(INTAKE_LINKS_COLLECTION).doc(linkId).update({
      status: "used",
    })
  }
}

export const intakeLinkRepository = new IntakeLinkRepository()
