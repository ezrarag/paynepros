import "server-only"
import { adminDb, Timestamp } from "@/lib/firebase/admin"
import { IntakeResponse } from "@/lib/types/client-workspace"

const WORKSPACES_COLLECTION = "clientWorkspaces"
const INTAKE_RESPONSES_COLLECTION = "intakeResponses"

const toIsoString = (value?: FirebaseFirestore.Timestamp | Date | null) => {
  if (!value) {
    return new Date().toISOString()
  }
  if (value instanceof Date) {
    return value.toISOString()
  }
  return value.toDate().toISOString()
}

export class IntakeResponseRepository {
  async create(
    response: Omit<IntakeResponse, "id" | "submittedAt">
  ): Promise<IntakeResponse> {
    if (!adminDb) {
      console.warn("Firebase Admin not initialized. Returning mock intake response.")
      return {
        ...response,
        id: "mock-intake-response-id",
        submittedAt: new Date().toISOString(),
      }
    }
    try {
      const docRef = adminDb
        .collection(WORKSPACES_COLLECTION)
        .doc(response.clientWorkspaceId)
        .collection(INTAKE_RESPONSES_COLLECTION)
        .doc()
      const now = Timestamp.now()
      await docRef.set({
        ...response,
        submittedAt: now,
      })
      return {
        ...response,
        id: docRef.id,
        submittedAt: now.toDate().toISOString(),
      }
    } catch (error) {
      console.error("Failed to create intake response:", error)
      throw new Error("Failed to save intake response")
    }
  }

  async findLatest(
    workspaceId: string
  ): Promise<IntakeResponse | null> {
    if (!adminDb) {
      console.warn("Firebase Admin not initialized. Returning null intake response.")
      return null
    }
    try {
      const snapshot = await adminDb
        .collection(WORKSPACES_COLLECTION)
        .doc(workspaceId)
        .collection(INTAKE_RESPONSES_COLLECTION)
        .orderBy("submittedAt", "desc")
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
        submittedAt: toIsoString(data?.submittedAt),
      } as IntakeResponse
    } catch (error) {
      console.error("Failed to find intake response:", error)
      throw new Error("Failed to fetch intake response")
    }
  }
}

export const intakeResponseRepository = new IntakeResponseRepository()
