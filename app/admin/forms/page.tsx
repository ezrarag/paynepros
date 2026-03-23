import { requireAuth } from "@/lib/auth"
import { getGoogleIntegrationStatusNotice } from "@/lib/google-workspace-integration"
import { FormsIntakeWorkspace } from "@/components/admin/FormsIntakeWorkspace"
import { saveClientRequestEmailTemplate, saveLeadAutoResponseTemplates } from "./actions"

export default async function AdminFormsPage({
  searchParams,
}: {
  searchParams?: Promise<{ google?: string }>
}) {
  const currentUser = await requireAuth()
  const { clientRequestTemplateRepository } = await import(
    "@/lib/repositories/client-request-template-repository"
  )
  const { leadAutoResponseTemplateRepository } = await import(
    "@/lib/repositories/lead-auto-response-template-repository"
  )
  const { integrationRepository } = await import(
    "@/lib/repositories/integration-repository"
  )
  const resolvedSearchParams = searchParams ? await searchParams : undefined
  const template = await clientRequestTemplateRepository.get()
  const leadAutoResponseDoc = await leadAutoResponseTemplateRepository.get()
  const googleIntegration = await integrationRepository.getGoogleWorkspaceIntegration(
    currentUser.tenantId
  )
  const initialGoogleNotice = getGoogleIntegrationStatusNotice(
    resolvedSearchParams?.google
  )

  return (
    <FormsIntakeWorkspace
      requestTemplate={template}
      saveRequestTemplate={saveClientRequestEmailTemplate}
      leadAutoResponseTemplates={leadAutoResponseDoc.templates}
      saveLeadAutoResponseTemplates={saveLeadAutoResponseTemplates}
      googleIntegration={googleIntegration}
      initialGoogleNotice={initialGoogleNotice}
    />
  )
}
