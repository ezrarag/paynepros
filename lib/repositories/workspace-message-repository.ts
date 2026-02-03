import { adminDb } from "@/lib/firebase/admin"
import { WorkspaceMessage } from "@/lib/types/client-workspace"

const MESSAGES_COLLECTION = "workspaceMessages"

const toIsoString = (value?: FirebaseFirestore.Timestamp | Date | null) => {
  if (!value) {
    return new Date().toISOString()
  }
  if (value instanceof Date) {
    return value.toISOString()
  }
  return value.toDate().toISOString()
}

const mockMessages: WorkspaceMessage[] = [
  {
    id: "message-001",
    clientWorkspaceId: "workspace-001",
    source: "email",
    subject: "Missing 1099 update",
    body: "We found the 1099-MISC and uploaded it this morning.",
    receivedAt: new Date().toISOString(),
    from: "alicia@example.com",
  },
  {
    id: "message-002",
    clientWorkspaceId: "workspace-001",
    source: "sms",
    body: "Can you confirm the IRS payment deadline?",
    receivedAt: new Date().toISOString(),
    from: "(555) 201-4432",
  },
  {
    id: "message-003",
    clientWorkspaceId: "workspace-002",
    source: "email",
    subject: "Payroll docs ready",
    body: "Payroll reports for Q4 are attached.",
    receivedAt: new Date().toISOString(),
    from: "marcus@legacyauto.com",
  },
]

export class WorkspaceMessageRepository {
  async findAll(limitCount: number = 50): Promise<WorkspaceMessage[]> {
    if (!adminDb) {
      console.warn("Firebase Admin not initialized. Returning mock messages.")
      return mockMessages.slice(0, limitCount)
    }
    const snapshot = await adminDb
      .collection(MESSAGES_COLLECTION)
      .orderBy("receivedAt", "desc")
      .limit(limitCount)
      .get()
    return snapshot.docs.map((doc) => {
      const data = doc.data()
      return {
        ...data,
        id: doc.id,
        receivedAt: toIsoString(data?.receivedAt),
      } as WorkspaceMessage
    })
  }

  async findByClientId(
    clientWorkspaceId: string,
    limitCount: number = 50
  ): Promise<WorkspaceMessage[]> {
    if (!adminDb) {
      console.warn("Firebase Admin not initialized. Returning mock messages.")
      return mockMessages
        .filter((message) => message.clientWorkspaceId === clientWorkspaceId)
        .slice(0, limitCount)
    }
    const snapshot = await adminDb
      .collection(MESSAGES_COLLECTION)
      .where("clientWorkspaceId", "==", clientWorkspaceId)
      .orderBy("receivedAt", "desc")
      .limit(limitCount)
      .get()
    return snapshot.docs.map((doc) => {
      const data = doc.data()
      return {
        ...data,
        id: doc.id,
        receivedAt: toIsoString(data?.receivedAt),
      } as WorkspaceMessage
    })
  }
}

export const workspaceMessageRepository = new WorkspaceMessageRepository()
