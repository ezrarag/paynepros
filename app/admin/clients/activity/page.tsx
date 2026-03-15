import { redirect } from "next/navigation"
import Link from "next/link"
import { getCurrentUser } from "@/lib/auth"
import { clientWorkspaceRepository } from "@/lib/repositories/client-workspace-repository"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default async function ClientActivityPage() {
  const user = await getCurrentUser()
  if (!user) {
    redirect("/admin/login")
  }

  const workspaces = await clientWorkspaceRepository.findAll(50)
  const allTimelineEvents = await Promise.all(
    workspaces.slice(0, 20).map(async (workspace) => {
      const timeline = await clientWorkspaceRepository.getTimeline(workspace.id, 5)
      return timeline.map((event) => ({
        ...event,
        workspaceName: workspace.displayName,
        workspaceId: workspace.id,
      }))
    })
  )

  const recentTimelineEvents = allTimelineEvents
    .flat()
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 30)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Client Activity Feed</h1>
          <p className="text-muted-foreground mt-1">Recent timeline events across client workspaces.</p>
        </div>
        <Button asChild variant="outline">
          <Link href="/admin/checklists">Back to Clients</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Last {recentTimelineEvents.length} events</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {recentTimelineEvents.length === 0 ? (
            <div className="text-sm text-muted-foreground">No activity yet.</div>
          ) : (
            recentTimelineEvents.map((event) => (
              <div
                key={`${event.workspaceId}-${event.id}`}
                className="flex items-start justify-between gap-3 rounded-lg border p-3"
              >
                <div className="min-w-0">
                  <div className="mb-1 flex items-center gap-2">
                    <span className="text-sm font-medium">{event.workspaceName}</span>
                    <span className="rounded bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                      {event.type}
                    </span>
                  </div>
                  <p className="text-sm font-medium">{event.title}</p>
                  {event.description && (
                    <p className="mt-1 text-xs text-muted-foreground">{event.description}</p>
                  )}
                </div>
                <div className="flex shrink-0 flex-col items-end gap-2">
                  <span className="whitespace-nowrap text-xs text-muted-foreground">
                    {new Date(event.createdAt).toLocaleString()}
                  </span>
                  <Button variant="ghost" size="sm" asChild className="h-7 text-xs">
                    <Link href={`/admin/clients/${event.workspaceId}`}>Open</Link>
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )
}
