import { OpenClientChecklistList } from "@/components/admin/OpenClientChecklistList"
import {
  bulkGenerateIntakeLinks,
  updateClientChecklistStatus,
} from "@/app/admin/clients/actions"
import { checklistItems, normalizeChecklist } from "@/lib/tax-return-checklist"
import type { ClientWorkspace } from "@/lib/types/client-workspace"

export default async function AdminChecklistsPage() {
  const { clientWorkspaceRepository } = await import("@/lib/repositories/client-workspace-repository")
  const { intakeResponseRepository } = await import("@/lib/repositories/intake-response-repository")

  const responses = await intakeResponseRepository.findRecent(200)
  const workspaceById = new Map<string, ClientWorkspace | null>()
  await Promise.all(
    Array.from(new Set(responses.map((response) => response.clientWorkspaceId))).map(async (workspaceId) => {
      const workspace = await clientWorkspaceRepository.findById(workspaceId)
      workspaceById.set(workspaceId, workspace)
    })
  )

  const entries = responses
    .map((response) => {
      const workspace = workspaceById.get(response.clientWorkspaceId)
      if (!workspace) {
        return null
      }
      return {
        workspace,
        intakeSubmittedAt: response.submittedAt,
      }
    })
    .filter((entry): entry is { workspace: ClientWorkspace; intakeSubmittedAt: string } => Boolean(entry))
    .reduce<{ workspace: ClientWorkspace; intakeSubmittedAt: string }[]>((deduped, entry) => {
      if (deduped.some((existing) => existing.workspace.id === entry.workspace.id)) {
        return deduped
      }
      deduped.push(entry)
      return deduped
    }, [])
    .filter(({ workspace }) => {
      const checklist = normalizeChecklist(workspace.taxReturnChecklist)
      return checklistItems.some((item) => checklist[item.key] !== "complete")
    })

  return (
    <OpenClientChecklistList
      entries={entries}
      bulkGenerateIntakeLinks={bulkGenerateIntakeLinks}
      updateClientChecklistStatus={updateClientChecklistStatus}
    />
  )
}
