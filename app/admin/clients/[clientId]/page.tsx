import Link from "next/link"
import { ClientWorkspaceDetails } from "@/components/admin/ClientWorkspaceDetails"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { updateChecklistStatus, updateClient, uploadClientForm } from "./actions"

export default async function ClientWorkspacePage({
  params,
}: {
  params: { clientId: string }
}) {
  const { clientWorkspaceRepository } = await import(
    "@/lib/repositories/client-workspace-repository"
  )
  const workspace = await clientWorkspaceRepository.findById(params.clientId)
  const timeline = workspace
    ? await clientWorkspaceRepository.getTimeline(params.clientId)
    : []

  if (!workspace) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Workspace not found</CardTitle>
          <CardDescription>We couldn't locate this client workspace.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild variant="outline">
            <Link href="/admin/clients">Back to clients</Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <ClientWorkspaceDetails
      workspace={workspace}
      timeline={timeline}
      updateClient={updateClient}
      updateChecklistStatus={updateChecklistStatus}
      uploadClientForm={uploadClientForm}
    />
  )
}
