import type { ClientRequestType } from "@/lib/types/client-workspace"

export type ClientRequestTemplate = {
  type: ClientRequestType
  title: string
  instructions: string
  completionMode: "document_upload" | "confirm_info"
}

export const CLIENT_REQUEST_TEMPLATES: ClientRequestTemplate[] = [
  {
    type: "w2",
    title: "Send W-2(s)",
    instructions: "Upload all W-2 forms for the tax year.",
    completionMode: "document_upload",
  },
  {
    type: "1099",
    title: "Send 1099(s)",
    instructions: "Upload all 1099 forms received for the tax year.",
    completionMode: "document_upload",
  },
  {
    type: "id",
    title: "Upload Photo ID",
    instructions: "Upload a valid government-issued photo ID.",
    completionMode: "document_upload",
  },
  {
    type: "bank_statements",
    title: "Upload Bank Statements",
    instructions: "Upload relevant bank statements for the requested period.",
    completionMode: "document_upload",
  },
  {
    type: "mileage",
    title: "Provide Mileage Records",
    instructions: "Upload or enter business mileage logs for the tax year.",
    completionMode: "document_upload",
  },
  {
    type: "schedule_c_expenses",
    title: "Provide Schedule C Expenses",
    instructions: "Upload receipts or provide expense totals by Schedule C category.",
    completionMode: "document_upload",
  },
  {
    type: "engagement_consent",
    title: "Sign Engagement / Consent",
    instructions: "Review and confirm engagement/consent before filing work begins.",
    completionMode: "confirm_info",
  },
]

export const getClientRequestTemplate = (type: ClientRequestType): ClientRequestTemplate | null =>
  CLIENT_REQUEST_TEMPLATES.find((template) => template.type === type) ?? null

export const isDocumentRequestType = (type: ClientRequestType) =>
  getClientRequestTemplate(type)?.completionMode === "document_upload"
