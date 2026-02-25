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
  private isFailedPrecondition(error: unknown): boolean {
    if (!error || typeof error !== "object") return false
    const maybeCode = (error as { code?: unknown }).code
    const maybeMessage = (error as { message?: unknown }).message
    return (
      maybeCode === 9 ||
      maybeCode === "failed-precondition" ||
      (typeof maybeMessage === "string" && maybeMessage.includes("FAILED_PRECONDITION"))
    )
  }

  private async findRecentViaWorkspaceFanout(limitCount: number): Promise<IntakeResponse[]> {
    if (!adminDb) return []

    // Fallback path when collectionGroup requires an index that is not deployed.
    const workspaces = await adminDb.collection(WORKSPACES_COLLECTION).limit(1000).get()
    const latestPerWorkspace = await Promise.all(
      workspaces.docs.map(async (workspaceDoc) => {
        const responseSnapshot = await workspaceDoc.ref
          .collection(INTAKE_RESPONSES_COLLECTION)
          .orderBy("submittedAt", "desc")
          .limit(1)
          .get()

        if (responseSnapshot.empty) {
          return null
        }

        const doc = responseSnapshot.docs[0]
        const data = doc.data()
        return {
          ...data,
          id: doc.id,
          submittedAt: toIsoString(data?.submittedAt),
        } as IntakeResponse
      })
    )

    return latestPerWorkspace
      .filter((response): response is IntakeResponse => Boolean(response))
      .sort(
        (a, b) =>
          new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
      )
      .slice(0, limitCount)
  }

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

  async findRecent(limitCount: number = 200): Promise<IntakeResponse[]> {
    if (!adminDb) {
      console.warn("Firebase Admin not initialized. Returning no intake responses.")
      return []
    }
    try {
      const snapshot = await adminDb
        .collectionGroup(INTAKE_RESPONSES_COLLECTION)
        .orderBy("submittedAt", "desc")
        .limit(limitCount)
        .get()

      return snapshot.docs.map((doc) => {
        const data = doc.data()
        return {
          ...data,
          id: doc.id,
          submittedAt: toIsoString(data?.submittedAt),
        } as IntakeResponse
      })
    } catch (error) {
      if (this.isFailedPrecondition(error)) {
        console.warn(
          "Collection group index for intakeResponses is missing. Falling back to workspace fan-out query."
        )
        return this.findRecentViaWorkspaceFanout(limitCount)
      }
      console.error("Failed to fetch recent intake responses:", error)
      throw new Error("Failed to fetch intake responses")
    }
  }
}

export const intakeResponseRepository = new IntakeResponseRepository()
