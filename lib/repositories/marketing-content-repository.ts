import { adminDb, Timestamp } from "@/lib/firebase/admin"
import {
  defaultHomeContentDocument,
  type HomeContentDocument,
  type HomeSectionContent,
} from "@/lib/marketing/home-content"

const MARKETING_CONTENT_COLLECTION = "marketingContent"
const HOME_CONTENT_DOC_ID = "paynepros_home"
const FALLBACK_IMAGE_SRC =
  "https://firebasestorage.googleapis.com/v0/b/readyaimgo-clients-temp.firebasestorage.app/o/paynepros%2FContent%2F593ab9_e77bf4687f5840489d7bd47e7d62582d~mv2.avif?alt=media&token=54def002-cf77-4ce0-b455-e85a3c05a26d"

function sanitizeSections(sections: HomeSectionContent[]): HomeSectionContent[] {
  return sections.map((section, index) => ({
    id: section.id?.trim() || `section-${index + 1}`,
    variant: ["hero", "split", "services", "connect", "benefits"].includes(section.variant)
      ? section.variant
      : "split",
    title: section.title?.trim() || `Section ${index + 1}`,
    subtitle: section.subtitle?.trim() || "",
    body: Array.isArray(section.body)
      ? section.body.map((line) => line.trim()).filter(Boolean)
      : [],
    bullets: Array.isArray(section.bullets)
      ? section.bullets.map((line) => line.trim()).filter(Boolean)
      : [],
    imageSrc: section.imageSrc?.trim() || FALLBACK_IMAGE_SRC,
    imageAlt: section.imageAlt?.trim() || "Marketing image",
    ctaPrimaryLabel: section.ctaPrimaryLabel?.trim() || "",
    ctaPrimaryHref: section.ctaPrimaryHref?.trim() || "",
    ctaSecondaryLabel: section.ctaSecondaryLabel?.trim() || "",
    ctaSecondaryHref: section.ctaSecondaryHref?.trim() || "",
    serviceCards: Array.isArray(section.serviceCards)
      ? section.serviceCards
          .map((card) => ({
            title: card?.title?.trim() || "",
            description: card?.description?.trim() || "",
          }))
          .filter((card) => card.title || card.description)
      : [],
    benefitCards: Array.isArray(section.benefitCards)
      ? section.benefitCards
          .map((card) => ({
            title: card?.title?.trim() || "",
            description: card?.description?.trim() || "",
          }))
          .filter((card) => card.title || card.description)
      : [],
    formFields: Array.isArray(section.formFields)
      ? section.formFields.map((field) => field?.trim() || "").filter(Boolean)
      : [],
    enabled: section.enabled !== false,
  }))
}

function normalizeDoc(raw: Partial<HomeContentDocument>): HomeContentDocument {
  return {
    page: "home",
    sections: sanitizeSections(raw.sections ?? defaultHomeContentDocument.sections),
    updatedAt: raw.updatedAt ?? new Date().toISOString(),
    updatedBy: raw.updatedBy ?? "unknown",
  }
}

export class MarketingContentRepository {
  async getHomeContent(): Promise<HomeContentDocument> {
    if (!adminDb) {
      return defaultHomeContentDocument
    }

    try {
      const docRef = adminDb.collection(MARKETING_CONTENT_COLLECTION).doc(HOME_CONTENT_DOC_ID)
      const snap = await docRef.get()
      if (!snap.exists) {
        return defaultHomeContentDocument
      }

      const data = snap.data() as any
      return normalizeDoc({
        page: "home",
        sections: data?.sections ?? defaultHomeContentDocument.sections,
        updatedAt: data?.updatedAt?.toDate?.().toISOString?.() ?? defaultHomeContentDocument.updatedAt,
        updatedBy: data?.updatedBy ?? "unknown",
      })
    } catch (error) {
      console.error("Failed to fetch home marketing content:", error)
      return defaultHomeContentDocument
    }
  }

  async saveHomeContent(input: {
    sections: HomeSectionContent[]
    updatedBy: string
  }): Promise<HomeContentDocument> {
    const normalized = normalizeDoc({
      page: "home",
      sections: input.sections,
      updatedAt: new Date().toISOString(),
      updatedBy: input.updatedBy || "unknown",
    })

    if (!adminDb) {
      return normalized
    }

    const docRef = adminDb.collection(MARKETING_CONTENT_COLLECTION).doc(HOME_CONTENT_DOC_ID)
    await docRef.set(
      {
        page: "home",
        sections: normalized.sections,
        updatedAt: Timestamp.now(),
        updatedBy: normalized.updatedBy,
      },
      { merge: true }
    )
    return normalized
  }
}

export const marketingContentRepository = new MarketingContentRepository()
