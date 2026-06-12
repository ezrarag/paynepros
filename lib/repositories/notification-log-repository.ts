import { adminDb, Timestamp } from "@/lib/firebase/admin"

const NOTIFICATION_LOGS_COLLECTION = "notificationLogs"

export type NotificationLogType = "first_send" | "reminder" | "max_attempts_reached"

export interface NotificationLogEntry {
  id: string
  workspaceId: string
  requestId: string
  type: NotificationLogType
  channel: string
  ok: boolean
  error?: string
  createdAt: string
}

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

let mockNotificationLogs: NotificationLogEntry[] = []

function mapLogDoc(
  id: string,
  data: FirebaseFirestore.DocumentData | undefined
): NotificationLogEntry {
  return {
    ...(data as Omit<NotificationLogEntry, "id" | "createdAt">),
    id,
    createdAt: toIsoString(data?.createdAt),
  } as NotificationLogEntry
}

export class NotificationLogRepository {
  async create(input: Omit<NotificationLogEntry, "id" | "createdAt">): Promise<NotificationLogEntry> {
    if (!adminDb) {
      const entry: NotificationLogEntry = {
        ...input,
        id: `mock-log-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        createdAt: new Date().toISOString(),
      }
      mockNotificationLogs = [entry, ...mockNotificationLogs]
      return entry
    }

    const docRef = adminDb.collection(NOTIFICATION_LOGS_COLLECTION).doc()
    const now = Timestamp.now()
    await docRef.set({
      ...input,
      createdAt: now,
    })
    return {
      ...input,
      id: docRef.id,
      createdAt: now.toDate().toISOString(),
    }
  }

  async listByRequest(requestId: string, limitCount = 50): Promise<NotificationLogEntry[]> {
    if (!adminDb) {
      return mockNotificationLogs
        .filter((entry) => entry.requestId === requestId)
        .slice(0, limitCount)
    }

    const snapshot = await adminDb
      .collection(NOTIFICATION_LOGS_COLLECTION)
      .where("requestId", "==", requestId)
      .limit(limitCount)
      .get()

    return snapshot.docs
      .map((doc) => mapLogDoc(doc.id, doc.data()))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }

  async listByWorkspace(workspaceId: string, limitCount = 100): Promise<NotificationLogEntry[]> {
    if (!adminDb) {
      return mockNotificationLogs
        .filter((entry) => entry.workspaceId === workspaceId)
        .slice(0, limitCount)
    }

    const snapshot = await adminDb
      .collection(NOTIFICATION_LOGS_COLLECTION)
      .where("workspaceId", "==", workspaceId)
      .limit(limitCount)
      .get()

    return snapshot.docs
      .map((doc) => mapLogDoc(doc.id, doc.data()))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }
}

export const notificationLogRepository = new NotificationLogRepository()
