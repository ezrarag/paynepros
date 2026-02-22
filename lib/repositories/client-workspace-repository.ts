import { randomUUID } from "crypto"
import { adminDb, Timestamp } from "@/lib/firebase/admin"
import { ClientWorkspace, TimelineEvent } from "@/lib/types/client-workspace"

const WORKSPACES_COLLECTION = "clientWorkspaces"
const TIMELINE_COLLECTION = "timeline"

const toIsoString = (value?: FirebaseFirestore.Timestamp | Date | string | null) => {
  if (!value) {
    return new Date().toISOString()
  }
  // Already an ISO string
  if (typeof value === "string") {
    return value
  }
  if (value instanceof Date) {
    return value.toISOString()
  }
  // Firestore Timestamp - check if toDate exists
  if (typeof value.toDate === "function") {
    return value.toDate().toISOString()
  }
  // Fallback for unknown types
  return new Date().toISOString()
}

let mockWorkspaces: ClientWorkspace[] = [
  {
    id: "workspace-001",
    displayName: "Alicia Jenkins",
    status: "active",
    primaryContact: {
      name: "Alicia Jenkins",
      email: "alicia@example.com",
      phone: "(555) 201-4432",
    },
    taxYears: [2023, 2024],
    tags: ["tax", "bookkeeping"],
    taxReturnChecklist: {
      documentsComplete: "in_progress",
      expensesCategorized: "not_started",
      readyForTaxHawk: "not_started",
      incomeReviewed: "not_started",
      bankInfoCollected: "not_started",
      otherCompleted: "not_started",
      filed: "not_started",
      accepted: "not_started",
    },
    lastActivityAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "workspace-002",
    displayName: "Legacy Auto Group",
    status: "active",
    primaryContact: {
      name: "Marcus Wells",
      email: "marcus@legacyauto.com",
      phone: "(555) 221-9031",
    },
    taxYears: [2024],
    tags: ["payroll"],
    taxReturnChecklist: {
      documentsComplete: "complete",
      expensesCategorized: "not_started",
      readyForTaxHawk: "not_started",
      incomeReviewed: "in_progress",
      bankInfoCollected: "not_started",
      otherCompleted: "not_started",
      filed: "not_started",
      accepted: "not_started",
    },
    lastActivityAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

let mockTimeline: TimelineEvent[] = [
  {
    id: "timeline-1",
    clientWorkspaceId: "workspace-001",
    type: "intake",
    title: "Intake submitted",
    description: "Client completed the 2024 intake form.",
    createdAt: new Date().toISOString(),
  },
  {
    id: "timeline-2",
    clientWorkspaceId: "workspace-001",
    type: "document",
    title: "W-2 uploaded",
    description: "Employer W-2 added to workspace.",
    createdAt: new Date().toISOString(),
  },
  {
    id: "timeline-3",
    clientWorkspaceId: "workspace-001",
    type: "task",
    title: "Missing 1099",
    description: "Auto-generated task to request 1099 forms.",
    createdAt: new Date().toISOString(),
  },
]

export class ClientWorkspaceRepository {
  async findByPrimaryContactEmail(email: string): Promise<ClientWorkspace | null> {
    const normalizedEmail = email.trim().toLowerCase()
    if (!normalizedEmail) {
      return null
    }

    if (!adminDb) {
      console.warn("Firebase Admin not initialized. Returning mock workspace by email.")
      return (
        mockWorkspaces.find(
          (workspace) =>
            workspace.primaryContact?.email?.trim().toLowerCase() === normalizedEmail
        ) ?? null
      )
    }

    try {
      const directMatch = await adminDb
        .collection(WORKSPACES_COLLECTION)
        .where("primaryContact.email", "==", normalizedEmail)
        .limit(1)
        .get()

      if (!directMatch.empty) {
        const doc = directMatch.docs[0]
        const data = doc.data()
        return {
          ...data,
          id: doc.id,
          createdAt: toIsoString(data?.createdAt),
          updatedAt: toIsoString(data?.updatedAt),
          lastActivityAt: data?.lastActivityAt ? toIsoString(data.lastActivityAt) : undefined,
        } as ClientWorkspace
      }

      // Fallback for legacy records with mixed-case email values.
      const fallbackSnapshot = await adminDb
        .collection(WORKSPACES_COLLECTION)
        .orderBy("updatedAt", "desc")
        .limit(200)
        .get()

      const fallbackDoc = fallbackSnapshot.docs.find((doc) => {
        const data = doc.data()
        const docEmail = data?.primaryContact?.email
        return typeof docEmail === "string" && docEmail.trim().toLowerCase() === normalizedEmail
      })

      if (!fallbackDoc) {
        return null
      }

      const data = fallbackDoc.data()
      return {
        ...data,
        id: fallbackDoc.id,
        createdAt: toIsoString(data?.createdAt),
        updatedAt: toIsoString(data?.updatedAt),
        lastActivityAt: data?.lastActivityAt ? toIsoString(data.lastActivityAt) : undefined,
      } as ClientWorkspace
    } catch (error) {
      console.error("Failed to fetch workspace by primary contact email:", error)
      throw new Error("Failed to fetch client workspace")
    }
  }

  async findAll(limitCount: number = 25): Promise<ClientWorkspace[]> {
    if (!adminDb) {
      console.warn("Firebase Admin not initialized. Returning mock workspaces.")
      return mockWorkspaces.slice(0, limitCount)
    }
    try {
      const snapshot = await adminDb
        .collection(WORKSPACES_COLLECTION)
        .orderBy("updatedAt", "desc")
        .limit(limitCount)
        .get()

      return snapshot.docs.map((doc) => {
        const data = doc.data()
        return {
          ...data,
          id: doc.id,
          createdAt: toIsoString(data?.createdAt),
          updatedAt: toIsoString(data?.updatedAt),
          lastActivityAt: data?.lastActivityAt ? toIsoString(data.lastActivityAt) : undefined,
        } as ClientWorkspace
      })
    } catch (error) {
      console.error("Failed to fetch workspaces:", error)
      throw new Error("Failed to fetch client workspaces")
    }
  }

  async findById(workspaceId: string): Promise<ClientWorkspace | null> {
    if (!adminDb) {
      console.warn("Firebase Admin not initialized. Returning mock workspace.")
      return mockWorkspaces.find((workspace) => workspace.id === workspaceId) ?? null
    }
    try {
      const docRef = adminDb.collection(WORKSPACES_COLLECTION).doc(workspaceId)
      const snapshot = await docRef.get()
      if (!snapshot.exists) {
        return null
      }
      const data = snapshot.data()
      return {
        ...data,
        id: snapshot.id,
        createdAt: toIsoString(data?.createdAt),
        updatedAt: toIsoString(data?.updatedAt),
        lastActivityAt: data?.lastActivityAt ? toIsoString(data.lastActivityAt) : undefined,
      } as ClientWorkspace
    } catch (error) {
      console.error("Failed to fetch workspace:", error)
      throw new Error("Failed to fetch client workspace")
    }
  }

  async create(
    workspace: Omit<ClientWorkspace, "id" | "createdAt" | "updatedAt">
  ): Promise<ClientWorkspace> {
    if (!adminDb) {
      console.warn("Firebase Admin not initialized. Creating mock workspace (in-memory).")
      const now = new Date().toISOString()
      const id = `mock-workspace-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
      const newWorkspace: ClientWorkspace = {
        ...workspace,
        id,
        createdAt: now,
        updatedAt: now,
      }
      mockWorkspaces = [newWorkspace, ...mockWorkspaces]
      return newWorkspace
    }
    try {
      const docRef = adminDb.collection(WORKSPACES_COLLECTION).doc()
      const now = Timestamp.now()
      await docRef.set({
        ...workspace,
        createdAt: now,
        updatedAt: now,
      })
      return {
        ...workspace,
        id: docRef.id,
        createdAt: now.toDate().toISOString(),
        updatedAt: now.toDate().toISOString(),
      }
    } catch (error) {
      console.error("Failed to create workspace:", error)
      throw new Error("Failed to create client workspace")
    }
  }

  async delete(workspaceId: string): Promise<boolean> {
    if (!adminDb) {
      console.warn("Firebase Admin not initialized. Deleting mock workspace.")
      const index = mockWorkspaces.findIndex((w) => w.id === workspaceId)
      if (index === -1) return false
      mockWorkspaces = mockWorkspaces.filter((w) => w.id !== workspaceId)
      mockTimeline = mockTimeline.filter((e) => e.clientWorkspaceId !== workspaceId)
      return true
    }
    try {
      const docRef = adminDb.collection(WORKSPACES_COLLECTION).doc(workspaceId)
      const snapshot = await docRef.get()
      if (!snapshot.exists) return false
      await docRef.delete()
      return true
    } catch (error) {
      console.error("Failed to delete workspace:", error)
      throw new Error("Failed to delete client workspace")
    }
  }

  async update(
    workspaceId: string,
    updates: Partial<Omit<ClientWorkspace, "id" | "createdAt" | "updatedAt">>
  ): Promise<ClientWorkspace | null> {
    if (!adminDb) {
      console.warn("Firebase Admin not initialized. Updating mock workspace.")
      const index = mockWorkspaces.findIndex((workspace) => workspace.id === workspaceId)
      if (index === -1) {
        return null
      }
      const now = new Date().toISOString()
      const nextWorkspace = {
        ...mockWorkspaces[index],
        ...updates,
        updatedAt: now,
      }
      mockWorkspaces = [
        ...mockWorkspaces.slice(0, index),
        nextWorkspace,
        ...mockWorkspaces.slice(index + 1),
      ]
      return nextWorkspace
    }

    try {
      const docRef = adminDb.collection(WORKSPACES_COLLECTION).doc(workspaceId)
      const snapshot = await docRef.get()
      if (!snapshot.exists) {
        return null
      }
      const now = Timestamp.now()
      await docRef.update({
        ...updates,
        updatedAt: now,
      })
      // Re-fetch to get the latest data after update
      const updatedSnapshot = await docRef.get()
      const data = updatedSnapshot.data()
      return {
        ...data,
        id: updatedSnapshot.id,
        createdAt: toIsoString(data?.createdAt),
        updatedAt: toIsoString(data?.updatedAt),
        lastActivityAt: data?.lastActivityAt ? toIsoString(data.lastActivityAt) : undefined,
      } as ClientWorkspace
    } catch (error) {
      console.error("Failed to update workspace:", error)
      throw new Error("Failed to update client workspace")
    }
  }

  async appendTimelineEvent(
    workspaceId: string,
    event: Omit<TimelineEvent, "id" | "createdAt" | "clientWorkspaceId">
  ): Promise<TimelineEvent> {
    if (!adminDb) {
      console.warn("Firebase Admin not initialized. Appending mock timeline event.")
      const now = new Date().toISOString()
      const newEvent: TimelineEvent = {
        ...event,
        id: `mock-timeline-${Date.now()}`,
        clientWorkspaceId: workspaceId,
        createdAt: now,
      }
      mockTimeline = [newEvent, ...mockTimeline]
      return newEvent
    }

    try {
      const now = Timestamp.now()
      const docRef = adminDb
        .collection(WORKSPACES_COLLECTION)
        .doc(workspaceId)
        .collection(TIMELINE_COLLECTION)
        .doc()
      await docRef.set({
        ...event,
        clientWorkspaceId: workspaceId,
        createdAt: now,
      })
      return {
        ...event,
        id: docRef.id,
        clientWorkspaceId: workspaceId,
        createdAt: now.toDate().toISOString(),
      }
    } catch (error) {
      console.error("Failed to append timeline event:", error)
      throw new Error("Failed to add timeline event")
    }
  }

  async getTimeline(workspaceId: string, limitCount: number = 50): Promise<TimelineEvent[]> {
    if (!adminDb) {
      console.warn("Firebase Admin not initialized. Returning mock timeline.")
      return mockTimeline.filter((event) => event.clientWorkspaceId === workspaceId).slice(0, limitCount)
    }
    try {
      const snapshot = await adminDb
        .collection(WORKSPACES_COLLECTION)
        .doc(workspaceId)
        .collection(TIMELINE_COLLECTION)
        .orderBy("createdAt", "desc")
        .limit(limitCount)
        .get()
      return snapshot.docs.map((doc) => {
        const data = doc.data()
        return {
          ...data,
          id: doc.id,
          createdAt: toIsoString(data?.createdAt),
        } as TimelineEvent
      })
    } catch (error) {
      console.error("Failed to fetch timeline:", error)
      throw new Error("Failed to fetch timeline events")
    }
  }

  async addTimelineEvent(
    workspaceId: string,
    event: Omit<TimelineEvent, "id" | "clientWorkspaceId" | "createdAt">
  ): Promise<TimelineEvent> {
    if (!adminDb) {
      console.warn("Firebase Admin not initialized. Returning mock timeline event.")
      const createdAt = new Date().toISOString()
      const newEvent: TimelineEvent = {
        ...event,
        id: `mock-${randomUUID()}`,
        clientWorkspaceId: workspaceId,
        createdAt,
      }
      mockTimeline.unshift(newEvent)
      return newEvent
    }
    try {
      const docRef = adminDb
        .collection(WORKSPACES_COLLECTION)
        .doc(workspaceId)
        .collection(TIMELINE_COLLECTION)
        .doc()
      const now = Timestamp.now()
      await docRef.set({
        ...event,
        clientWorkspaceId: workspaceId,
        createdAt: now,
      })
      return {
        ...event,
        id: docRef.id,
        clientWorkspaceId: workspaceId,
        createdAt: now.toDate().toISOString(),
      }
    } catch (error) {
      console.error("Failed to add timeline event:", error)
      throw new Error("Failed to add timeline event")
    }
  }
}

export const clientWorkspaceRepository = new ClientWorkspaceRepository()
