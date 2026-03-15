"use server"

import { revalidatePath } from "next/cache"
import { clientRequestTemplateRepository } from "@/lib/repositories/client-request-template-repository"
import { leadAutoResponseTemplateRepository } from "@/lib/repositories/lead-auto-response-template-repository"
import type { LeadAutoResponseTemplate } from "@/lib/types/lead-auto-response-template"

export async function saveClientRequestEmailTemplate(input: {
  subjectTemplate: string
  greetingLine: string
  introLine: string
  buttonLabel: string
  footerNote: string
  closingLine: string
  signatureName: string
}): Promise<{ success: true } | { success: false; error: string }> {
  try {
    const subjectTemplate = input.subjectTemplate.trim()
    const greetingLine = input.greetingLine.trim()
    const introLine = input.introLine.trim()
    const buttonLabel = input.buttonLabel.trim()
    const footerNote = input.footerNote.trim()
    const closingLine = input.closingLine.trim()
    const signatureName = input.signatureName.trim()

    if (!subjectTemplate || !greetingLine || !introLine || !buttonLabel || !closingLine || !signatureName) {
      return { success: false, error: "Fill all required fields." }
    }

    await clientRequestTemplateRepository.upsert({
      subjectTemplate,
      greetingLine,
      introLine,
      buttonLabel,
      footerNote,
      closingLine,
      signatureName,
    })

    revalidatePath("/admin/forms")
    return { success: true }
  } catch (error) {
    console.error("Failed to save client request template:", error)
    return { success: false, error: "Failed to save template. Please try again." }
  }
}

export async function saveLeadAutoResponseTemplates(
  input: LeadAutoResponseTemplate[]
): Promise<{ success: true } | { success: false; error: string }> {
  try {
    const normalized = input.map((template) => ({
      ...template,
      subjectTemplate: template.subjectTemplate.trim(),
      greetingLine: template.greetingLine.trim(),
      introLine: template.introLine.trim(),
      bodyTemplate: template.bodyTemplate.trim(),
      buttonLabel: template.buttonLabel.trim(),
      buttonHref: template.buttonHref.trim(),
      closingLine: template.closingLine.trim(),
      signatureName: template.signatureName.trim(),
    }))

    const hasInvalid = normalized.some(
      (template) =>
        !template.subjectTemplate ||
        !template.greetingLine ||
        !template.introLine ||
        !template.bodyTemplate ||
        !template.buttonLabel ||
        !template.buttonHref ||
        !template.closingLine ||
        !template.signatureName
    )

    if (hasInvalid) {
      return { success: false, error: "Fill all required fields for each template." }
    }

    await leadAutoResponseTemplateRepository.upsert(normalized)

    revalidatePath("/admin/forms")
    return { success: true }
  } catch (error) {
    console.error("Failed to save lead auto-response templates:", error)
    return { success: false, error: "Failed to save auto-response templates. Please try again." }
  }
}
