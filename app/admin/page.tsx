import { redirect } from "next/navigation"
import Link from "next/link"
import { ClientQueue } from "@/components/admin/command-center/ClientQueue"
import { getCurrentUser } from "@/lib/auth"
import { clientWorkspaceRepository } from "@/lib/repositories/client-workspace-repository"
import type { ClientWorkspace } from "@/lib/types/client-workspace"
import type { ClientQueueItem } from "@/lib/types/command-center"
import { checklistItems, normalizeChecklist } from "@/lib/tax-return-checklist"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { QuickActions } from "@/components/admin/QuickActions"

function transformWorkspaceToQueueItem(workspace: ClientWorkspace): ClientQueueItem {
  const checklist = normalizeChecklist(workspace.taxReturnChecklist)
  const totalChecklistItems = checklistItems.length
  const completeChecklistItems = checklistItems.filter((item) => checklist[item.key] === "complete").length
  const checklistPercentComplete = Math.round((completeChecklistItems / totalChecklistItems) * 100)
  const checklistRemainingCount = totalChecklistItems - completeChecklistItems
  const checklistMissingLabels = checklistItems
    .filter((item) => checklist[item.key] !== "complete")
    .map((item) => item.label)
  
  // Determine status label based on checklist
  let statusLabel = "In progress"
  if (checklist.documentsComplete === "complete" && checklist.incomeReviewed === "complete") {
    statusLabel = "Ready to file"
  } else if (checklist.documentsComplete !== "complete") {
    statusLabel = "Missing documents"
  } else if (checklist.documentsComplete === "complete" && checklist.incomeReviewed === "not_started") {
    statusLabel = "Needs review"
  }

  return {
    id: workspace.id,
    clientName: workspace.displayName,
    status: workspace.status,
    tags: workspace.tags,
    lastActivityAt: workspace.lastActivityAt || workspace.updatedAt,
    tasks: [], // Tasks not wired yet
    messageSummaries: [], // Messages handled separately
    statusLabel,
    checklistPercentComplete,
    checklistRemainingCount,
    checklistMissingLabels,
  }
}

export default async function AdminDashboard() {
  const user = await getCurrentUser()
  if (!user) {
    redirect("/admin/login")
  }

  // Fetch real workspaces from Firestore
  const workspaces = await clientWorkspaceRepository.findAll(50)
  const activeWorkspaces = workspaces.filter((w) => w.status === "active")

  // Transform workspaces to queue items
  const clientQueue: ClientQueueItem[] = activeWorkspaces
    .map(transformWorkspaceToQueueItem)
    .sort((a, b) => {
      if (a.checklistRemainingCount !== b.checklistRemainingCount) {
        return b.checklistRemainingCount - a.checklistRemainingCount
      }
      if (a.checklistPercentComplete !== b.checklistPercentComplete) {
        return a.checklistPercentComplete - b.checklistPercentComplete
      }
      // Then by last activity (most recent first)
      const aTime = a.lastActivityAt ? new Date(a.lastActivityAt).getTime() : 0
      const bTime = b.lastActivityAt ? new Date(b.lastActivityAt).getTime() : 0
      return bTime - aTime
    })

  const totalChecklistItems = activeWorkspaces.length * checklistItems.length
  const completeChecklistItems = activeWorkspaces.reduce((sum, workspace) => {
    const checklist = normalizeChecklist(workspace.taxReturnChecklist)
    return sum + checklistItems.filter((item) => checklist[item.key] === "complete").length
  }, 0)
  const overallPercentComplete =
    totalChecklistItems > 0 ? Math.round((completeChecklistItems / totalChecklistItems) * 100) : 0
  const clientsRemaining = clientQueue.filter((item) => item.checklistRemainingCount > 0).length

  const today = new Date()
  const formattedDate = today.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight">
          DeTania Daily Command Center
        </h1>
        <p className="text-muted-foreground mt-1 sm:mt-2 text-sm sm:text-base">{formattedDate}</p>
      </div>

      <Card>
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="text-base sm:text-lg">Client Queue Overview</CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Overall checklist progress across active clients.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0 space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-lg border p-4">
              <div className="text-xs uppercase tracking-wide text-muted-foreground">Overall completion</div>
              <div className="mt-2 flex items-end gap-1">
                <span className="text-6xl font-black leading-none">{overallPercentComplete}</span>
                <span className="text-4xl font-black leading-none text-muted-foreground">%</span>
              </div>
            </div>
            <div className="rounded-lg border p-4">
              <div className="text-xs uppercase tracking-wide text-muted-foreground">Clients remaining</div>
              <div className="mt-2 text-4xl font-black leading-none">{clientsRemaining}</div>
            </div>
            <div className="rounded-lg border p-4">
              <div className="text-xs uppercase tracking-wide text-muted-foreground">Checklist items done</div>
              <div className="mt-2 text-4xl font-black leading-none">
                {completeChecklistItems}/{totalChecklistItems}
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild>
              <Link href="/admin/clients">Open Client Checklists</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/admin/dashboard/activity">Open Activity Feed</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/admin/dashboard/inbox">Open Inbox</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/admin/dashboard/focus">Open Today Focus</Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      <ClientQueue items={clientQueue} />

      <Card>
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="text-base sm:text-lg">Quick Actions</CardTitle>
          <CardDescription className="text-xs sm:text-sm">Common tasks and workflows</CardDescription>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0">
          <QuickActions workspaces={workspaces} />
        </CardContent>
      </Card>
    </div>
  )
}
