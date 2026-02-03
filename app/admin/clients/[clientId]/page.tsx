import Link from "next/link"
import { ClientWorkspaceDetails } from "@/components/admin/ClientWorkspaceDetails"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  updateChecklistStatus,
  updateClient,
  uploadClientForm,
  emailForm,
  faxForm,
  mailForm,
  saveMileageCalculation,
  saveScheduleCCalculation,
} from "./actions"
import { deleteClient } from "../actions"

export default async function ClientWorkspacePage({
  params,
}: {
  params: Promise<{ clientId: string }>
}) {
  const { clientId } = await params
  const { clientWorkspaceRepository } = await import(
    "@/lib/repositories/client-workspace-repository"
  )
  const { intakeResponseRepository } = await import(
    "@/lib/repositories/intake-response-repository"
  )
  const workspace = await clientWorkspaceRepository.findById(clientId)
  const timeline = workspace
    ? await clientWorkspaceRepository.getTimeline(clientId)
    : []
  const latestIntake = workspace
    ? await intakeResponseRepository.findLatest(clientId)
    : null

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
      latestIntake={latestIntake}
      updateClient={updateClient}
      updateChecklistStatus={updateChecklistStatus}
      uploadClientForm={uploadClientForm}
      emailForm={emailForm}
      faxForm={faxForm}
      mailForm={mailForm}
      saveMileageCalculation={saveMileageCalculation}
      saveScheduleCCalculation={saveScheduleCCalculation}
      deleteClient={deleteClient}
    />
  )
}
