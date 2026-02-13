import { redirect } from "next/navigation"
import Link from "next/link"
import { getCurrentUser } from "@/lib/auth"
import { TodayFocusCard } from "@/components/admin/command-center/TodayFocusCard"
import { clientWorkspaceRepository } from "@/lib/repositories/client-workspace-repository"
import { integrationRepository } from "@/lib/repositories/integration-repository"
import { getMessageMetaMetrics } from "@/lib/mock/admin"
import type { ClientWorkspace } from "@/lib/types/client-workspace"
import type { TodayFocusMetrics } from "@/lib/types/command-center"
import { normalizeChecklist } from "@/lib/tax-return-checklist"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

function calculateMetrics(workspaces: ClientWorkspace[], unreadMessagesTotal: number): TodayFocusMetrics {
  const clientsWithIncompleteDocs = workspaces.filter((workspace) => {
    const checklist = normalizeChecklist(workspace.taxReturnChecklist)
    return checklist.documentsComplete !== "complete"
  }).length

  return {
    highPriorityTasks: 0,
    clientsWaitingOnDeTania: 0,
    clientsWaitingOnCustomer: clientsWithIncompleteDocs,
    unreadMessagesTotal,
  }
}

export default async function DashboardFocusPage() {
  const user = await getCurrentUser()
  if (!user) {
    redirect("/admin/login")
  }

  const workspaces = await clientWorkspaceRepository.findAll(50)
  const hasConnectedInbox = await integrationRepository.hasConnectedInbox(user.tenantId)
  const unreadMessagesTotal = hasConnectedInbox
    ? getMessageMetaMetrics(user.tenantId).unreadMessagesTotal
    : 0
  const metrics = calculateMetrics(workspaces, unreadMessagesTotal)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Today Focus</h1>
          <p className="text-muted-foreground mt-1">High-level priorities and outstanding work.</p>
        </div>
        <Button asChild variant="outline">
          <Link href="/admin">Back to Dashboard</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Focus Metrics</CardTitle>
          <CardDescription>Current queue pressure and customer wait state</CardDescription>
        </CardHeader>
        <CardContent>
          <TodayFocusCard metrics={metrics} />
        </CardContent>
      </Card>
    </div>
  )
}
