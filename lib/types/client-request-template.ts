export interface ClientRequestEmailTemplate {
  subjectTemplate: string
  greetingLine: string
  introLine: string
  buttonLabel: string
  footerNote: string
  closingLine: string
  signatureName: string
  updatedAt: string
}

export const DEFAULT_CLIENT_REQUEST_EMAIL_TEMPLATE: ClientRequestEmailTemplate = {
  subjectTemplate: "PaynePros request: {{requestTitle}}",
  greetingLine: "Hello {{clientName}},",
  introLine: "Please complete the following requested item for your return preparation:",
  buttonLabel: "Open Requested Item",
  footerNote: "If you have questions, reply to this email and our team will help.",
  closingLine: "Thank you,",
  signatureName: "PaynePros Tax Team",
  updatedAt: new Date(0).toISOString(),
}

