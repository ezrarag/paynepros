import { redirect } from "next/navigation"
import { Suspense } from "react"
import Link from "next/link"
import { TodayFocusCard } from "@/components/admin/command-center/TodayFocusCard"
import { ClientQueue } from "@/components/admin/command-center/ClientQueue"
import { InboxSummary } from "@/components/admin/command-center/InboxSummary"
import { getCurrentUser } from "@/lib/auth"
import { listMessageMeta } from "@/lib/messages"
import { getMessageMetaMetrics } from "@/lib/mock/admin"
import { clientWorkspaceRepository } from "@/lib/repositories/client-workspace-repository"
import { integrationRepository } from "@/lib/repositories/integration-repository"
import type { ClientWorkspace } from "@/lib/types/client-workspace"
import type { MessageSummary, ClientQueueItem, TodayFocusMetrics } from "@/lib/types/command-center"
import { normalizeChecklist } from "@/lib/tax-return-checklist"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { UserPlus, Link2, MessageSquare, ClipboardList } from "lucide-react"

function calculateMetrics(workspaces: ClientWorkspace[], unreadMessagesTotal: number): TodayFocusMetrics {
  const now = new Date()
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  
  const activeClients = workspaces.filter((w) => w.status === "active")
  const newClientsLast7Days = workspaces.filter(
    (w) => new Date(w.createdAt) >= sevenDaysAgo
  ).length

  // Count workspaces with incomplete checklist items
  const clientsWithIncompleteDocs = workspaces.filter((w) => {
    const checklist = normalizeChecklist(w.taxReturnChecklist)
    return checklist.documentsComplete !== "complete"
  }).length

  return {
    highPriorityTasks: 0, // Not wired yet - tasks collection doesn't exist
    clientsWaitingOnDeTania: 0, // Not wired yet - task system not implemented
    clientsWaitingOnCustomer: clientsWithIncompleteDocs,
    unreadMessagesTotal,
  }
}

function transformWorkspaceToQueueItem(workspace: ClientWorkspace): ClientQueueItem {
  const checklist = normalizeChecklist(workspace.taxReturnChecklist)
  
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
  
  // Fetch timeline events from all workspaces (last 10)
  const allTimelineEvents = await Promise.all(
    workspaces.slice(0, 10).map(async (w) => {
      const timeline = await clientWorkspaceRepository.getTimeline(w.id, 1)
      return timeline.map((e) => ({
        ...e,
        workspaceName: w.displayName,
        workspaceId: w.id,
      }))
    })
  )
  const recentTimelineEvents = allTimelineEvents
    .flat()
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 10)
  
  // Check if integrations are connected
  const hasConnectedInbox = await integrationRepository.hasConnectedInbox(user.tenantId)

  // Fetch real message metadata only if integrations are connected
  let metaList = null
  let totalUnread = 0
  if (hasConnectedInbox) {
    const result = await listMessageMeta()
    metaList = result.data
    const messageMetaMetrics = getMessageMetaMetrics(user.tenantId)
    totalUnread = messageMetaMetrics.unreadMessagesTotal
  }

  // Transform workspaces to queue items
  const clientQueue: ClientQueueItem[] = activeWorkspaces
    .map(transformWorkspaceToQueueItem)
    .sort((a, b) => {
      // Sort by last activity (most recent first)
      const aTime = a.lastActivityAt ? new Date(a.lastActivityAt).getTime() : 0
      const bTime = b.lastActivityAt ? new Date(b.lastActivityAt).getTime() : 0
      return bTime - aTime
    })

  // Transform real messages to MessageSummary format (only if integrations connected and messages exist)
  const recentMessages: Array<MessageSummary & { clientName: string }> = hasConnectedInbox && metaList
    ? metaList
        .sort((a, b) => new Date(b.receivedAt).getTime() - new Date(a.receivedAt).getTime())
        .slice(0, 5)
        .map((m) => {
          const workspace = workspaces.find((w) => w.id === m.workspaceId)
          return {
            workspaceId: m.workspaceId,
            channel: (m.channel === "facebook" ? "ig" : m.channel) as MessageSummary["channel"],
            unreadCount: m.unread ? 1 : 0,
            lastSnippet: m.snippetMasked ?? "",
            lastAt: m.receivedAt,
            clientName: workspace?.displayName ?? "Unknown",
          }
        })
    : []

  // Calculate real metrics
  const metrics = calculateMetrics(workspaces, totalUnread)

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

      <Suspense fallback={<div className="h-28 sm:h-32 rounded-lg border bg-muted animate-pulse" />}>
        <TodayFocusCard metrics={metrics} />
      </Suspense>

      {recentTimelineEvents.length > 0 && (
        <Card>
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-base sm:text-lg">Activity Feed</CardTitle>
            <CardDescription className="text-xs sm:text-sm">Last 10 timeline events across all clients</CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
            <div className="space-y-3">
              {recentTimelineEvents.map((event) => (
                <div
                  key={event.id}
                  className="flex items-start justify-between gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">{event.workspaceName}</span>
                      <span className="text-xs px-2 py-0.5 bg-muted rounded text-muted-foreground">
                        {event.type}
                      </span>
                    </div>
                    <p className="text-sm font-medium">{event.title}</p>
                    {event.description && (
                      <p className="text-xs text-muted-foreground mt-1">{event.description}</p>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {new Date(event.createdAt).toLocaleString()}
                    </span>
                    <Button variant="ghost" size="sm" asChild className="h-7 text-xs">
                      <Link href={`/admin/clients/${event.workspaceId}`}>Open</Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="text-base sm:text-lg">Quick Actions</CardTitle>
          <CardDescription className="text-xs sm:text-sm">Common tasks and workflows</CardDescription>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            <Button variant="outline" asChild className="h-auto py-3 sm:py-4 flex flex-col gap-2">
              <Link href="/admin/clients">
                <UserPlus className="h-5 w-5" />
                <span className="text-xs sm:text-sm">New Client</span>
              </Link>
            </Button>
            <Button variant="outline" asChild className="h-auto py-3 sm:py-4 flex flex-col gap-2" disabled title="Coming soon">
              <Link href="#">
                <Link2 className="h-5 w-5" />
                <span className="text-xs sm:text-sm">Generate Intake Link</span>
              </Link>
            </Button>
            <Button variant="outline" asChild className="h-auto py-3 sm:py-4 flex flex-col gap-2">
              <Link href="/admin/messaging">
                <MessageSquare className="h-5 w-5" />
                <span className="text-xs sm:text-sm">Open Messaging</span>
              </Link>
            </Button>
            <Button variant="outline" asChild className="h-auto py-3 sm:py-4 flex flex-col gap-2">
              <Link href="/admin/forms">
                <ClipboardList className="h-5 w-5" />
                <span className="text-xs sm:text-sm">Open Forms</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="lg:col-span-2 min-w-0">
          <Suspense fallback={<div className="h-64 sm:h-96 rounded-lg border bg-muted animate-pulse" />}>
            <ClientQueue items={clientQueue} />
          </Suspense>
        </div>
        <div className="lg:col-span-1 min-w-0">
          <Suspense fallback={<div className="h-64 sm:h-96 rounded-lg border bg-muted animate-pulse" />}>
            <InboxSummary recentMessages={recentMessages} totalUnread={totalUnread} hasConnectedInbox={hasConnectedInbox} />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
