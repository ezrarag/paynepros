import { FormsIntakeWorkspace } from "@/components/admin/FormsIntakeWorkspace"
import { saveClientRequestEmailTemplate, saveLeadAutoResponseTemplates } from "./actions"

export default async function AdminFormsPage() {
  const { clientRequestTemplateRepository } = await import(
    "@/lib/repositories/client-request-template-repository"
  )
  const { leadAutoResponseTemplateRepository } = await import(
    "@/lib/repositories/lead-auto-response-template-repository"
  )
  const template = await clientRequestTemplateRepository.get()
  const leadAutoResponseDoc = await leadAutoResponseTemplateRepository.get()

  return (
    <FormsIntakeWorkspace
      requestTemplate={template}
      saveRequestTemplate={saveClientRequestEmailTemplate}
      leadAutoResponseTemplates={leadAutoResponseDoc.templates}
      saveLeadAutoResponseTemplates={saveLeadAutoResponseTemplates}
    />
  )
}
