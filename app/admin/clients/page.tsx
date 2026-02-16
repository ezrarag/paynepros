import { ClientWorkspaceList } from "@/components/admin/ClientWorkspaceList"
import {
  bulkGenerateIntakeLinks,
  bulkUpdate,
  completeClientWorkspace,
  createClient,
  restoreClientWorkspace,
  updateClientChecklistStatus,
} from "./actions"

export default async function ClientsPage({
  searchParams,
}: {
  searchParams?: Promise<{ list?: string }>
}) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined
  const listMode = resolvedSearchParams?.list === "completed" ? "completed" : "active"
  const { clientWorkspaceRepository } = await import("@/lib/repositories/client-workspace-repository")
  const workspaces = await clientWorkspaceRepository.findAll(200).then((items) =>
    items.filter((workspace) => (listMode === "completed" ? workspace.status === "inactive" : workspace.status === "active"))
  )

  return (
    <ClientWorkspaceList
      workspaces={workspaces}
      listMode={listMode}
      createClient={createClient}
      bulkUpdate={bulkUpdate}
      bulkGenerateIntakeLinks={bulkGenerateIntakeLinks}
      completeClientWorkspace={completeClientWorkspace}
      restoreClientWorkspace={restoreClientWorkspace}
      updateClientChecklistStatus={updateClientChecklistStatus}
    />
  )
}
