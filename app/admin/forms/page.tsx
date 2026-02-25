import { ClientRequestTemplateManager } from "@/components/admin/ClientRequestTemplateManager"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { saveClientRequestEmailTemplate } from "./actions"

export default async function AdminFormsPage() {
  const { clientRequestTemplateRepository } = await import(
    "@/lib/repositories/client-request-template-repository"
  )
  const template = await clientRequestTemplateRepository.get()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Templates</h1>
        <p className="text-muted-foreground mt-2">
          Manage request templates and message structure used in client outreach.
        </p>
      </div>

      <ClientRequestTemplateManager
        template={template}
        saveTemplate={saveClientRequestEmailTemplate}
      />

      <Card>
        <CardHeader>
          <CardTitle>Template workspace</CardTitle>
          <CardDescription>Additional template types can be managed here.</CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Add-on template management for SMS and document wrappers can be added next.
        </CardContent>
      </Card>
    </div>
  )
}
