import { adminDb, Timestamp } from "@/lib/firebase/admin"
import type { ClientRequest } from "@/lib/types/client-workspace"

const WORKSPACES_COLLECTION = "clientWorkspaces"
const REQUESTS_COLLECTION = "clientRequests"

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

let mockClientRequests: ClientRequest[] = []

function mapRequestDoc(
  workspaceId: string,
  id: string,
  data: FirebaseFirestore.DocumentData | undefined
): ClientRequest {
  return {
    ...(data as Omit<ClientRequest, "id" | "workspaceId" | "sentAt">),
    id,
    workspaceId,
    sentAt: toIsoString(data?.sentAt),
    viewedAt: data?.viewedAt ? toIsoString(data.viewedAt) : undefined,
    completedAt: data?.completedAt ? toIsoString(data.completedAt) : undefined,
    dueAt: data?.dueAt ? toIsoString(data.dueAt) : undefined,
  } as ClientRequest
}

export class ClientRequestRepository {
  async listByWorkspace(workspaceId: string): Promise<ClientRequest[]> {
    if (!adminDb) {
      return mockClientRequests
        .filter((request) => request.workspaceId === workspaceId)
        .sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime())
    }

    const snapshot = await adminDb
      .collection(WORKSPACES_COLLECTION)
      .doc(workspaceId)
      .collection(REQUESTS_COLLECTION)
      .orderBy("sentAt", "desc")
      .get()

    return snapshot.docs.map((doc) => mapRequestDoc(workspaceId, doc.id, doc.data()))
  }

  async findById(workspaceId: string, requestId: string): Promise<ClientRequest | null> {
    if (!adminDb) {
      return (
        mockClientRequests.find(
          (request) => request.workspaceId === workspaceId && request.id === requestId
        ) ?? null
      )
    }

    const snapshot = await adminDb
      .collection(WORKSPACES_COLLECTION)
      .doc(workspaceId)
      .collection(REQUESTS_COLLECTION)
      .doc(requestId)
      .get()

    if (!snapshot.exists) {
      return null
    }
    return mapRequestDoc(workspaceId, snapshot.id, snapshot.data())
  }

  async create(
    workspaceId: string,
    input: Omit<ClientRequest, "id" | "workspaceId" | "sentAt">
  ): Promise<ClientRequest> {
    if (!adminDb) {
      const request: ClientRequest = {
        ...input,
        id: `mock-request-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        workspaceId,
        sentAt: new Date().toISOString(),
      }
      mockClientRequests = [request, ...mockClientRequests]
      return request
    }

    const now = Timestamp.now()
    const dueAtTs = input.dueAt ? Timestamp.fromDate(new Date(input.dueAt)) : undefined
    const viewedAtTs = input.viewedAt ? Timestamp.fromDate(new Date(input.viewedAt)) : undefined
    const completedAtTs = input.completedAt
      ? Timestamp.fromDate(new Date(input.completedAt))
      : undefined
    const docRef = adminDb
      .collection(WORKSPACES_COLLECTION)
      .doc(workspaceId)
      .collection(REQUESTS_COLLECTION)
      .doc()

    await docRef.set({
      ...input,
      workspaceId,
      sentAt: now,
      ...(dueAtTs ? { dueAt: dueAtTs } : {}),
      ...(viewedAtTs ? { viewedAt: viewedAtTs } : {}),
      ...(completedAtTs ? { completedAt: completedAtTs } : {}),
    })

    return {
      ...input,
      id: docRef.id,
      workspaceId,
      sentAt: now.toDate().toISOString(),
    }
  }

  async updateStatus(
    workspaceId: string,
    requestId: string,
    input: {
      status: ClientRequest["status"]
      viewedAt?: string
      completedAt?: string
    }
  ): Promise<ClientRequest | null> {
    if (!adminDb) {
      const index = mockClientRequests.findIndex(
        (request) => request.workspaceId === workspaceId && request.id === requestId
      )
      if (index === -1) return null
      const next = {
        ...mockClientRequests[index],
        status: input.status,
        ...(input.viewedAt ? { viewedAt: input.viewedAt } : {}),
        ...(input.completedAt ? { completedAt: input.completedAt } : {}),
      }
      mockClientRequests = [
        ...mockClientRequests.slice(0, index),
        next,
        ...mockClientRequests.slice(index + 1),
      ]
      return next
    }

    const docRef = adminDb
      .collection(WORKSPACES_COLLECTION)
      .doc(workspaceId)
      .collection(REQUESTS_COLLECTION)
      .doc(requestId)

    const snapshot = await docRef.get()
    if (!snapshot.exists) {
      return null
    }

    await docRef.update({
      status: input.status,
      ...(input.viewedAt ? { viewedAt: Timestamp.fromDate(new Date(input.viewedAt)) } : {}),
      ...(input.completedAt
        ? { completedAt: Timestamp.fromDate(new Date(input.completedAt)) }
        : {}),
    })

    const updated = await docRef.get()
    return mapRequestDoc(workspaceId, requestId, updated.data())
  }
}

export const clientRequestRepository = new ClientRequestRepository()
