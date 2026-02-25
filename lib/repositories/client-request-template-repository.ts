import { adminDb, Timestamp } from "@/lib/firebase/admin"
import {
  DEFAULT_CLIENT_REQUEST_EMAIL_TEMPLATE,
  type ClientRequestEmailTemplate,
} from "@/lib/types/client-request-template"

const SETTINGS_COLLECTION = "adminSettings"
const SETTINGS_DOC_ID = "clientRequestEmailTemplate"

const toIsoString = (value?: FirebaseFirestore.Timestamp | Date | string | null) => {
  if (!value) return new Date().toISOString()
  if (typeof value === "string") return value
  if (value instanceof Date) return value.toISOString()
  if (typeof value.toDate === "function") return value.toDate().toISOString()
  return new Date().toISOString()
}

let mockTemplate: ClientRequestEmailTemplate = {
  ...DEFAULT_CLIENT_REQUEST_EMAIL_TEMPLATE,
}

function normalizeTemplate(
  raw?: Partial<ClientRequestEmailTemplate> | null
): ClientRequestEmailTemplate {
  return {
    subjectTemplate: raw?.subjectTemplate || DEFAULT_CLIENT_REQUEST_EMAIL_TEMPLATE.subjectTemplate,
    greetingLine: raw?.greetingLine || DEFAULT_CLIENT_REQUEST_EMAIL_TEMPLATE.greetingLine,
    introLine: raw?.introLine || DEFAULT_CLIENT_REQUEST_EMAIL_TEMPLATE.introLine,
    buttonLabel: raw?.buttonLabel || DEFAULT_CLIENT_REQUEST_EMAIL_TEMPLATE.buttonLabel,
    footerNote: raw?.footerNote || DEFAULT_CLIENT_REQUEST_EMAIL_TEMPLATE.footerNote,
    closingLine: raw?.closingLine || DEFAULT_CLIENT_REQUEST_EMAIL_TEMPLATE.closingLine,
    signatureName: raw?.signatureName || DEFAULT_CLIENT_REQUEST_EMAIL_TEMPLATE.signatureName,
    updatedAt: toIsoString(raw?.updatedAt),
  }
}

export class ClientRequestTemplateRepository {
  async get(): Promise<ClientRequestEmailTemplate> {
    if (!adminDb) {
      return normalizeTemplate(mockTemplate)
    }

    const snapshot = await adminDb
      .collection(SETTINGS_COLLECTION)
      .doc(SETTINGS_DOC_ID)
      .get()

    if (!snapshot.exists) {
      return normalizeTemplate(DEFAULT_CLIENT_REQUEST_EMAIL_TEMPLATE)
    }

    const data = snapshot.data() as Partial<ClientRequestEmailTemplate> | undefined
    return normalizeTemplate(data)
  }

  async upsert(
    input: Omit<ClientRequestEmailTemplate, "updatedAt">
  ): Promise<ClientRequestEmailTemplate> {
    const next: ClientRequestEmailTemplate = {
      ...normalizeTemplate(input),
      updatedAt: new Date().toISOString(),
    }

    if (!adminDb) {
      mockTemplate = next
      return next
    }

    await adminDb
      .collection(SETTINGS_COLLECTION)
      .doc(SETTINGS_DOC_ID)
      .set({
        ...next,
        updatedAt: Timestamp.fromDate(new Date(next.updatedAt)),
      })

    return next
  }
}

export const clientRequestTemplateRepository = new ClientRequestTemplateRepository()

