import { adminDb, Timestamp } from "@/lib/firebase/admin"
import type { ClientRequestType } from "@/lib/types/client-workspace"

const GMAIL_CHASE_SUGGESTIONS_COLLECTION = "gmailChaseSuggestions"

export type GmailChaseSuggestionStatus = "pending" | "created" | "dismissed"
export type GmailChaseSuggestionConfidence = "high" | "low"

export interface GmailChaseSuggestion {
  id: string
  tenantId: string
  workspaceId: string
  workspaceName: string
  clientEmail: string
  gmailMessageId: string
  gmailThreadId?: string
  requestType: ClientRequestType
  title: string
  instructions: string
  subject?: string
  snippet?: string
  receivedAt: string
  confidence: GmailChaseSuggestionConfidence
  status: GmailChaseSuggestionStatus
  createdRequestId?: string
  createdAt: string
  updatedAt: string
}

const toIsoString = (value?: FirebaseFirestore.Timestamp | Date | string | null) => {
  if (!value) return new Date().toISOString()
  if (typeof value === "string") return value
  if (value instanceof Date) return value.toISOString()
  if (typeof value.toDate === "function") return value.toDate().toISOString()
  return new Date().toISOString()
}

const makeSuggestionId = (input: {
  tenantId: string
  gmailMessageId: string
  workspaceId: string
  requestType: string
}) =>
  [input.tenantId, input.gmailMessageId, input.workspaceId, input.requestType]
    .join("_")
    .replace(/[^a-zA-Z0-9_-]/g, "_")

let mockSuggestions: GmailChaseSuggestion[] = []

function mapSuggestionDoc(
  id: string,
  data: FirebaseFirestore.DocumentData | undefined
): GmailChaseSuggestion {
  return {
    ...(data as Omit<GmailChaseSuggestion, "id" | "createdAt" | "updatedAt" | "receivedAt">),
    id,
    receivedAt: toIsoString(data?.receivedAt),
    createdAt: toIsoString(data?.createdAt),
    updatedAt: toIsoString(data?.updatedAt),
  } as GmailChaseSuggestion
}

export class GmailChaseRepository {
  async upsertPending(
    input: Omit<GmailChaseSuggestion, "id" | "status" | "createdAt" | "updatedAt">
  ): Promise<GmailChaseSuggestion> {
    const id = makeSuggestionId(input)
    const now = new Date().toISOString()

    if (!adminDb) {
      const existing = mockSuggestions.find((suggestion) => suggestion.id === id)
      if (existing && existing.status !== "pending") {
        return existing
      }
      const next: GmailChaseSuggestion = {
        ...(existing ?? {}),
        ...input,
        id,
        status: "pending",
        createdAt: existing?.createdAt ?? now,
        updatedAt: now,
      }
      mockSuggestions = [
        ...mockSuggestions.filter((suggestion) => suggestion.id !== id),
        next,
      ]
      return next
    }

    const docRef = adminDb.collection(GMAIL_CHASE_SUGGESTIONS_COLLECTION).doc(id)
    const snapshot = await docRef.get()
    if (snapshot.exists) {
      const existing = mapSuggestionDoc(snapshot.id, snapshot.data())
      if (existing.status !== "pending") {
        return existing
      }
    }

    const timestamp = Timestamp.fromDate(new Date(now))
    await docRef.set({
      ...input,
      receivedAt: Timestamp.fromDate(new Date(input.receivedAt)),
      status: "pending",
      createdAt: snapshot.exists ? snapshot.data()?.createdAt ?? timestamp : timestamp,
      updatedAt: timestamp,
    }, { merge: true })
    const updated = await docRef.get()
    return mapSuggestionDoc(updated.id, updated.data())
  }

  async listByTenant(
    tenantId: string,
    status: GmailChaseSuggestionStatus = "pending",
    limitCount = 25
  ): Promise<GmailChaseSuggestion[]> {
    if (!adminDb) {
      return mockSuggestions
        .filter((suggestion) => suggestion.tenantId === tenantId && suggestion.status === status)
        .sort((a, b) => new Date(b.receivedAt).getTime() - new Date(a.receivedAt).getTime())
        .slice(0, limitCount)
    }

    const snapshot = await adminDb
      .collection(GMAIL_CHASE_SUGGESTIONS_COLLECTION)
      .where("tenantId", "==", tenantId)
      .where("status", "==", status)
      .limit(limitCount)
      .get()

    return snapshot.docs
      .map((doc) => mapSuggestionDoc(doc.id, doc.data()))
      .sort((a, b) => new Date(b.receivedAt).getTime() - new Date(a.receivedAt).getTime())
  }

  async findById(id: string): Promise<GmailChaseSuggestion | null> {
    if (!adminDb) {
      return mockSuggestions.find((suggestion) => suggestion.id === id) ?? null
    }

    const snapshot = await adminDb.collection(GMAIL_CHASE_SUGGESTIONS_COLLECTION).doc(id).get()
    if (!snapshot.exists) {
      return null
    }
    return mapSuggestionDoc(snapshot.id, snapshot.data())
  }

  async markCreated(id: string, requestId: string): Promise<void> {
    const now = new Date().toISOString()
    if (!adminDb) {
      mockSuggestions = mockSuggestions.map((suggestion) =>
        suggestion.id === id
          ? { ...suggestion, status: "created", createdRequestId: requestId, updatedAt: now }
          : suggestion
      )
      return
    }

    await adminDb.collection(GMAIL_CHASE_SUGGESTIONS_COLLECTION).doc(id).update({
      status: "created",
      createdRequestId: requestId,
      updatedAt: Timestamp.fromDate(new Date(now)),
    })
  }

  async dismiss(id: string): Promise<void> {
    const now = new Date().toISOString()
    if (!adminDb) {
      mockSuggestions = mockSuggestions.map((suggestion) =>
        suggestion.id === id ? { ...suggestion, status: "dismissed", updatedAt: now } : suggestion
      )
      return
    }

    await adminDb.collection(GMAIL_CHASE_SUGGESTIONS_COLLECTION).doc(id).update({
      status: "dismissed",
      updatedAt: Timestamp.fromDate(new Date(now)),
    })
  }
}

export const gmailChaseRepository = new GmailChaseRepository()
