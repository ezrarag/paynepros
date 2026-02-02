export type TaskStatus = "todo" | "in_progress" | "done"
export type TaskPriority = "low" | "med" | "high"
export type TaskCategory = "docs" | "tax" | "bookkeeping" | "comms"

export interface WorkspaceTask {
  id: string
  workspaceId: string
  title: string
  status: TaskStatus
  priority: TaskPriority
  dueAt?: string
  assignedTo?: string
  category: TaskCategory
  createdAt: string
  updatedAt: string
}

export interface CommandCenterWorkspace {
  id: string
  clientName: string
  status: "active" | "inactive" | "on_hold"
  tags: string[]
  lastActivityAt?: string
  nextDeadlineAt?: string
}

export interface MessageSummary {
  workspaceId: string
  channel: "sms" | "email" | "whatsapp" | "ig"
  unreadCount: number
  lastSnippet: string
  lastAt: string
}

export interface DocumentRequest {
  workspaceId: string
  missingDocs: string[]
  requestedAt: string
  lastReminderAt?: string
  status: "pending" | "partial" | "complete"
}

export interface TodayFocusMetrics {
  highPriorityTasks: number
  clientsWaitingOnDeTania: number
  clientsWaitingOnCustomer: number
  unreadMessagesTotal: number
}

export interface ClientQueueItem extends CommandCenterWorkspace {
  tasks: WorkspaceTask[]
  messageSummaries: MessageSummary[]
  documentRequest?: DocumentRequest
  statusLabel: string
}
