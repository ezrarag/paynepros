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
  | "form_uploaded"
  | "form_emailed"
  | "form_faxed"
  | "form_mailed"
  | "calculation_updated"
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
  calculations?: WorkspaceCalculations
  lastActivityAt?: string
  createdAt: string
  updatedAt: string
}

export type IntakeLinkKind = "existing_workspace" | "new_client"

export interface IntakeLink {
  id: string
  kind: IntakeLinkKind
  clientWorkspaceId: string | null
  tokenHash: string
  tokenLast4: string
  channels: IntakeChannel[]
  status: "active" | "expired" | "used"
  createdBy: string
  createdAt: string
  expiresAt: string
  usedAt?: string
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

// Form send history tracking
export type FormSendMethod = "email" | "fax" | "mail"

export interface FormSendRecord {
  id: string
  method: FormSendMethod
  recipient: string // email address, fax number, or address summary
  sentAt: string
  note?: string
}

export interface WorkspaceForm {
  id: string
  clientWorkspaceId: string
  name: string
  sensitive: boolean
  uploadedAt: string
  uploadedBy?: string
  sendHistory: FormSendRecord[]
}

// Input types for form send actions
export interface EmailFormInput {
  workspaceId: string
  formId: string
  formName: string
  recipientEmail: string
  subject: string
  note?: string
}

export interface FaxFormInput {
  workspaceId: string
  formId: string
  formName: string
  faxNumber: string
  note?: string
}

export interface MailFormInput {
  workspaceId: string
  formId: string
  formName: string
  address: {
    name: string
    street: string
    city: string
    state: string
    zip: string
  }
  note?: string
}

// Calculation types for tax-prep helper tools
export interface MileageCalculation {
  year: number
  miles: number
  rateUsed: number
  estimatedDeduction: number
  updatedAt: string
}

export interface ScheduleCRow {
  id: string
  category: string
  amount: number
  note?: string
}

export interface ScheduleCCalculation {
  rows: ScheduleCRow[]
  updatedAt: string
}

export interface WorkspaceCalculations {
  mileage?: MileageCalculation
  scheduleC?: ScheduleCCalculation
}
