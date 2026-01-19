export type IntakeChannel = "sms" | "email" | "whatsapp"
export type IntakeStepId = "contact" | "tax_year" | "income" | "expenses" | "consent"
export type DocumentCategory = "income" | "expenses" | "mileage" | "banking" | "other"
export type TimelineEventType =
  | "message"
  | "document"
  | "payment"
  | "task"
  | "intake"
  | "profile_updated"
  | "tax_return"
export type TaskStatus = "pending" | "in_review" | "completed"
export type PaymentStatus = "pending" | "succeeded" | "failed" | "refunded"
export type TaxReturnChecklistStatus = "not_started" | "in_progress" | "complete"

export interface TaxReturnChecklist {
  documentsComplete: TaxReturnChecklistStatus
  incomeReviewed: TaxReturnChecklistStatus
  expensesCategorized: TaxReturnChecklistStatus
  readyForTaxHawk: TaxReturnChecklistStatus
  filed: TaxReturnChecklistStatus
  accepted: TaxReturnChecklistStatus
}

export interface ClientWorkspace {
  id: string
  displayName: string
  status: "active" | "inactive"
  primaryContact?: {
    name?: string
    email?: string
    phone?: string
  }
  taxYears: number[]
  tags: string[]
  taxReturnChecklist?: TaxReturnChecklist
  lastActivityAt?: string
  createdAt: string
  updatedAt: string
}

export interface IntakeLink {
  id: string
  clientWorkspaceId: string
  tokenHash: string
  tokenLast4: string
  channels: IntakeChannel[]
  status: "active" | "expired" | "used"
  createdBy: string
  createdAt: string
  expiresAt: string
}

export interface IntakeResponse {
  id: string
  clientWorkspaceId: string
  intakeLinkId: string
  submittedAt: string
  responses: Record<string, any>
}

export interface WorkspaceDocument {
  id: string
  clientWorkspaceId: string
  name: string
  category: DocumentCategory
  storagePath: string
  uploadedAt: string
  uploadedBy?: string
}

export interface WorkspaceMessage {
  id: string
  clientWorkspaceId: string
  source: "gmail" | "outlook" | "sms" | "whatsapp" | "instagram" | "facebook"
  subject?: string
  body: string
  receivedAt: string
  from?: string
}

export interface WorkspaceTask {
  id: string
  clientWorkspaceId: string
  title: string
  status: TaskStatus
  assignedTo?: string
  dueAt?: string
  createdAt: string
}

export interface WorkspacePayment {
  id: string
  clientWorkspaceId: string
  amount: number
  status: PaymentStatus
  method: "card" | "apple_pay" | "google_pay" | "ach" | "cash"
  paidAt?: string
}

export interface TimelineEvent {
  id: string
  clientWorkspaceId: string
  type: TimelineEventType
  title: string
  description?: string
  createdAt: string
  metadata?: Record<string, any>
}
