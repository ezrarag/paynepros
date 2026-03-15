import {
  LEAD_AUTO_RESPONSE_KEYS,
  LEAD_SERVICE_TYPE_OPTIONS,
  type LeadAutoResponseKey,
} from "@/lib/lead-service-types"

export interface LeadAutoResponseTemplate {
  key: LeadAutoResponseKey
  label: string
  enabled: boolean
  subjectTemplate: string
  greetingLine: string
  introLine: string
  bodyTemplate: string
  buttonLabel: string
  buttonHref: string
  closingLine: string
  signatureName: string
}

export interface LeadAutoResponseTemplateDocument {
  templates: LeadAutoResponseTemplate[]
  updatedAt: string
}

const BASE_TEMPLATE = {
  enabled: true,
  subjectTemplate: "Payne Professional Services received your {{serviceTypeLabel}} inquiry",
  greetingLine: "Hello {{clientName}},",
  introLine: "Thank you for reaching out to Payne Professional Services.",
  bodyTemplate:
    "We received your inquiry about {{serviceTypeLabel}}. Our team will review the details you shared and follow up using your preferred contact method: {{preferredContactMethod}}.",
  buttonLabel: "Open Client Portal",
  buttonHref: "{{clientPortalUrl}}",
  closingLine: "Best,",
  signatureName: "Detania Payne",
} satisfies Omit<LeadAutoResponseTemplate, "key" | "label">

const TEMPLATE_LABELS: Record<LeadAutoResponseKey, string> = {
  default: "Default",
  ...Object.fromEntries(LEAD_SERVICE_TYPE_OPTIONS.map((option) => [option.value, option.label])),
} as Record<LeadAutoResponseKey, string>

export const DEFAULT_LEAD_AUTO_RESPONSE_TEMPLATE_DOCUMENT: LeadAutoResponseTemplateDocument = {
  templates: LEAD_AUTO_RESPONSE_KEYS.map((key) => {
    const label = TEMPLATE_LABELS[key]
    if (key === "bookkeeping") {
      return {
        key,
        label,
        ...BASE_TEMPLATE,
        subjectTemplate: "Payne Professional Services bookkeeping inquiry received",
        bodyTemplate:
          "We received your bookkeeping inquiry and the notes you submitted. We will review your needs and follow up with next steps using your preferred contact method: {{preferredContactMethod}}.",
      }
    }

    if (key === "past-due") {
      return {
        key,
        label,
        ...BASE_TEMPLATE,
        subjectTemplate: "Payne Professional Services cleanup inquiry received",
        bodyTemplate:
          "We received your past-due or cleanup inquiry. Our team will review the details you submitted and contact you with the best next step using your preferred contact method: {{preferredContactMethod}}.",
      }
    }

    return {
      key,
      label,
      ...BASE_TEMPLATE,
    }
  }),
  updatedAt: new Date(0).toISOString(),
}
