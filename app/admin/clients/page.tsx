import { ClientWorkspaceList } from "@/components/admin/ClientWorkspaceList"
import { bulkGenerateIntakeLinks, bulkUpdate, createClient } from "./actions"

export default async function ClientsPage() {
  const { clientWorkspaceRepository } = await import("@/lib/repositories/client-workspace-repository")
  const workspaces = await clientWorkspaceRepository.findAll()

  return (
    <ClientWorkspaceList
      workspaces={workspaces}
      createClient={createClient}
      bulkUpdate={bulkUpdate}
      bulkGenerateIntakeLinks={bulkGenerateIntakeLinks}
    />
  )
}
