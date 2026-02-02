import type {
  CommandCenterWorkspace,
  WorkspaceTask,
  MessageSummary,
  DocumentRequest,
  TodayFocusMetrics,
  ClientQueueItem,
} from "@/lib/types/command-center"

// Mock workspaces
export const mockWorkspaces: CommandCenterWorkspace[] = [
  {
    id: "workspace-001",
    clientName: "Alicia Jenkins",
    status: "active",
    tags: ["tax", "bookkeeping"],
    lastActivityAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    nextDeadlineAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "workspace-002",
    clientName: "Legacy Auto Group",
    status: "active",
    tags: ["payroll"],
    lastActivityAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    nextDeadlineAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "workspace-003",
    clientName: "Smith & Associates",
    status: "active",
    tags: ["tax"],
    lastActivityAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "workspace-004",
    clientName: "TechStart Inc",
    status: "active",
    tags: ["bookkeeping", "tax"],
    lastActivityAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    nextDeadlineAt: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(),
  },
]

// Mock tasks
export const mockTasks: WorkspaceTask[] = [
  {
    id: "task-001",
    workspaceId: "workspace-001",
    title: "Review W-2 forms",
    status: "todo",
    priority: "high",
    dueAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    category: "docs",
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "task-002",
    workspaceId: "workspace-001",
    title: "Request missing 1099 forms",
    status: "in_progress",
    priority: "high",
    assignedTo: "Nija",
    category: "comms",
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "task-003",
    workspaceId: "workspace-001",
    title: "Categorize expenses",
    status: "todo",
    priority: "med",
    category: "bookkeeping",
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "task-004",
    workspaceId: "workspace-002",
    title: "Review income statements",
    status: "todo",
    priority: "high",
    dueAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    category: "tax",
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "task-005",
    workspaceId: "workspace-002",
    title: "Follow up on payroll questions",
    status: "todo",
    priority: "med",
    category: "comms",
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "task-006",
    workspaceId: "workspace-003",
    title: "Prepare tax return",
    status: "in_progress",
    priority: "high",
    assignedTo: "Nija",
    category: "tax",
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "task-007",
    workspaceId: "workspace-004",
    title: "Request bank statements",
    status: "todo",
    priority: "med",
    category: "docs",
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
]

// Mock message summaries
export const mockMessageSummaries: MessageSummary[] = [
  {
    workspaceId: "workspace-001",
    channel: "email",
    unreadCount: 2,
    lastSnippet: "Hi, I have a question about my tax return...",
    lastAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    workspaceId: "workspace-001",
    channel: "sms",
    unreadCount: 1,
    lastSnippet: "When will you need those documents?",
    lastAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
  },
  {
    workspaceId: "workspace-002",
    channel: "email",
    unreadCount: 0,
    lastSnippet: "Thanks for the update!",
    lastAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    workspaceId: "workspace-003",
    channel: "whatsapp",
    unreadCount: 3,
    lastSnippet: "Can we schedule a call this week?",
    lastAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
  },
  {
    workspaceId: "workspace-004",
    channel: "email",
    unreadCount: 1,
    lastSnippet: "I've uploaded the documents you requested",
    lastAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
  },
]

// Mock document requests
export const mockDocumentRequests: DocumentRequest[] = [
  {
    workspaceId: "workspace-001",
    missingDocs: ["W-2", "1099-INT", "1099-DIV"],
    requestedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    lastReminderAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    status: "partial",
  },
  {
    workspaceId: "workspace-004",
    missingDocs: ["Bank statements (Q4)", "Receipts"],
    requestedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    status: "pending",
  },
]

// Helper functions to get data
export function getTodayFocusMetrics(): TodayFocusMetrics {
  const highPriorityTasks = mockTasks.filter(
    (t) => t.priority === "high" && t.status !== "done"
  ).length

  const clientsWaitingOnDeTania = mockWorkspaces.filter((w) => {
    const workspaceTasks = mockTasks.filter(
      (t) => t.workspaceId === w.id && t.status !== "done"
    )
    return workspaceTasks.length > 0
  }).length

  const clientsWaitingOnCustomer = mockDocumentRequests.filter(
    (dr) => dr.status === "pending" || dr.status === "partial"
  ).length

  const unreadMessagesTotal = mockMessageSummaries.reduce(
    (sum, msg) => sum + msg.unreadCount,
    0
  )

  return {
    highPriorityTasks,
    clientsWaitingOnDeTania,
    clientsWaitingOnCustomer,
    unreadMessagesTotal,
  }
}

function getStatusLabel(
  workspace: CommandCenterWorkspace,
  tasks: WorkspaceTask[],
  documentRequest?: DocumentRequest
): string {
  const workspaceTasks = tasks.filter((t) => t.workspaceId === workspace.id && t.status !== "done")
  const hasMissingDocs = documentRequest && (documentRequest.status === "pending" || documentRequest.status === "partial")

  if (hasMissingDocs) {
    return "Missing documents"
  }
  if (workspaceTasks.some((t) => t.category === "tax" && t.status === "in_progress")) {
    return "Ready to file"
  }
  if (workspaceTasks.some((t) => t.priority === "high" && t.status === "todo")) {
    return "Needs review"
  }
  if (workspaceTasks.some((t) => t.category === "comms" && t.status === "in_progress")) {
    return "Waiting on client"
  }
  return "In progress"
}

export function getClientQueue(): ClientQueueItem[] {
  return mockWorkspaces
    .filter((w) => w.status === "active")
    .map((workspace) => {
      const workspaceTasks = mockTasks.filter((t) => t.workspaceId === workspace.id)
      const workspaceMessages = mockMessageSummaries.filter(
        (m) => m.workspaceId === workspace.id
      )
      const documentRequest = mockDocumentRequests.find(
        (dr) => dr.workspaceId === workspace.id
      )

      return {
        ...workspace,
        tasks: workspaceTasks,
        messageSummaries: workspaceMessages,
        documentRequest,
        statusLabel: getStatusLabel(workspace, workspaceTasks, documentRequest),
      }
    })
    .sort((a, b) => {
      // Sort by: high priority tasks first, then missing docs, then deadlines, then unread messages
      const aHighPriority = a.tasks.filter((t) => t.priority === "high" && t.status !== "done").length
      const bHighPriority = b.tasks.filter((t) => t.priority === "high" && t.status !== "done").length
      if (aHighPriority !== bHighPriority) return bHighPriority - aHighPriority

      const aHasMissingDocs = a.documentRequest && (a.documentRequest.status === "pending" || a.documentRequest.status === "partial")
      const bHasMissingDocs = b.documentRequest && (b.documentRequest.status === "pending" || b.documentRequest.status === "partial")
      if (aHasMissingDocs !== bHasMissingDocs) return aHasMissingDocs ? -1 : 1

      if (a.nextDeadlineAt && b.nextDeadlineAt) {
        return new Date(a.nextDeadlineAt).getTime() - new Date(b.nextDeadlineAt).getTime()
      }
      if (a.nextDeadlineAt) return -1
      if (b.nextDeadlineAt) return 1

      const aUnread = a.messageSummaries.reduce((sum, m) => sum + m.unreadCount, 0)
      const bUnread = b.messageSummaries.reduce((sum, m) => sum + m.unreadCount, 0)
      return bUnread - aUnread
    })
}

export function getRecentMessages(limit: number = 3): Array<MessageSummary & { clientName: string }> {
  return mockMessageSummaries
    .map((msg) => {
      const workspace = mockWorkspaces.find((w) => w.id === msg.workspaceId)
      return {
        ...msg,
        clientName: workspace?.clientName || "Unknown",
      }
    })
    .sort((a, b) => new Date(b.lastAt).getTime() - new Date(a.lastAt).getTime())
    .slice(0, limit)
}
