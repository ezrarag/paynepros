"use server"

import { revalidatePath } from "next/cache"
import { clientRequestTemplateRepository } from "@/lib/repositories/client-request-template-repository"

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

