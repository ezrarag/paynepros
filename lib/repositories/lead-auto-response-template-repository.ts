import { adminDb, Timestamp } from "@/lib/firebase/admin"
import {
  DEFAULT_LEAD_AUTO_RESPONSE_TEMPLATE_DOCUMENT,
  type LeadAutoResponseTemplate,
  type LeadAutoResponseTemplateDocument,
} from "@/lib/types/lead-auto-response-template"

const SETTINGS_COLLECTION = "adminSettings"
const SETTINGS_DOC_ID = "leadAutoResponseTemplates"

const toIsoString = (value?: FirebaseFirestore.Timestamp | Date | string | null) => {
  if (!value) return new Date().toISOString()
  if (typeof value === "string") return value
  if (value instanceof Date) return value.toISOString()
  if (typeof value.toDate === "function") return value.toDate().toISOString()
  return new Date().toISOString()
}

let mockDocument: LeadAutoResponseTemplateDocument = {
  ...DEFAULT_LEAD_AUTO_RESPONSE_TEMPLATE_DOCUMENT,
}

function normalizeTemplate(
  raw: Partial<LeadAutoResponseTemplate> | undefined,
  fallback: LeadAutoResponseTemplate
): LeadAutoResponseTemplate {
  return {
    key: fallback.key,
    label: fallback.label,
    enabled: raw?.enabled ?? fallback.enabled,
    subjectTemplate: raw?.subjectTemplate?.trim() || fallback.subjectTemplate,
    greetingLine: raw?.greetingLine?.trim() || fallback.greetingLine,
    introLine: raw?.introLine?.trim() || fallback.introLine,
    bodyTemplate: raw?.bodyTemplate?.trim() || fallback.bodyTemplate,
    buttonLabel: raw?.buttonLabel?.trim() || fallback.buttonLabel,
    buttonHref: raw?.buttonHref?.trim() || fallback.buttonHref,
    closingLine: raw?.closingLine?.trim() || fallback.closingLine,
    signatureName: raw?.signatureName?.trim() || fallback.signatureName,
  }
}

function normalizeDocument(
  raw?: Partial<LeadAutoResponseTemplateDocument> | null
): LeadAutoResponseTemplateDocument {
  const templateMap = new Map(
    (raw?.templates ?? []).map((template) => [template.key, template] as const)
  )

  return {
    templates: DEFAULT_LEAD_AUTO_RESPONSE_TEMPLATE_DOCUMENT.templates.map((fallback) =>
      normalizeTemplate(templateMap.get(fallback.key), fallback)
    ),
    updatedAt: toIsoString(raw?.updatedAt),
  }
}

export class LeadAutoResponseTemplateRepository {
  async get(): Promise<LeadAutoResponseTemplateDocument> {
    if (!adminDb) {
      return normalizeDocument(mockDocument)
    }

    const snapshot = await adminDb.collection(SETTINGS_COLLECTION).doc(SETTINGS_DOC_ID).get()
    if (!snapshot.exists) {
      return normalizeDocument(DEFAULT_LEAD_AUTO_RESPONSE_TEMPLATE_DOCUMENT)
    }

    return normalizeDocument(snapshot.data() as Partial<LeadAutoResponseTemplateDocument> | undefined)
  }

  async upsert(templates: LeadAutoResponseTemplate[]): Promise<LeadAutoResponseTemplateDocument> {
    const normalized = normalizeDocument({
      templates,
      updatedAt: new Date().toISOString(),
    })

    if (!adminDb) {
      mockDocument = normalized
      return normalized
    }

    await adminDb.collection(SETTINGS_COLLECTION).doc(SETTINGS_DOC_ID).set({
      templates: normalized.templates,
      updatedAt: Timestamp.fromDate(new Date(normalized.updatedAt)),
    })

    return normalized
  }

  async findTemplate(key?: string | null): Promise<LeadAutoResponseTemplate | null> {
    const doc = await this.get()
    const exact = doc.templates.find((template) => template.key === key && template.enabled)
    if (exact) return exact
    return doc.templates.find((template) => template.key === "default" && template.enabled) ?? null
  }
}

export const leadAutoResponseTemplateRepository = new LeadAutoResponseTemplateRepository()
