import { redirect } from "next/navigation"
import { requireClientAuth } from "@/lib/auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { BeamRequestsPanel } from "@/components/client/BeamRequestsPanel"
import {
  checklistItems,
  checklistStatusLabels,
  normalizeChecklist,
  getLifecycleBadgeLabel,
} from "@/lib/tax-return-checklist"
import { updateClientChecklistStatus, clientSignOut } from "./actions"

const statusStyles = {
  not_started: "bg-muted text-muted-foreground",
  in_progress: "bg-amber-100 text-amber-800",
  complete: "bg-emerald-100 text-emerald-800",
} as const

export default async function ClientPortalPage() {
  const clientUser = await requireClientAuth()

  const { clientWorkspaceRepository } = await import(
    "@/lib/repositories/client-workspace-repository"
  )
  const { intakeResponseRepository } = await import(
    "@/lib/repositories/intake-response-repository"
  )

  const workspace = await clientWorkspaceRepository.findById(clientUser.clientWorkspaceId)
  if (!workspace) {
    redirect("/client/login")
  }

  const checklist = normalizeChecklist(workspace.taxReturnChecklist)
  const timeline = await clientWorkspaceRepository.getTimeline(workspace.id, 8)
  const latestIntake = await intakeResponseRepository.findLatest(workspace.id)

  return (
    <div className="mx-auto max-w-5xl p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold">{workspace.displayName}</h1>
          <p className="text-sm text-muted-foreground">Signed in as {clientUser.email ?? "client"}</p>
        </div>
        <form action={clientSignOut}>
          <Button type="submit" variant="outline">Sign out</Button>
        </form>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Tax Return Status</CardTitle>
            <CardDescription>Live status shared with your PaynePros team</CardDescription>
          </CardHeader>
          <CardContent>
            <Badge>{getLifecycleBadgeLabel(checklist)}</Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Latest Intake</CardTitle>
            <CardDescription>Your most recent intake submission</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            {latestIntake
              ? new Date(latestIntake.submittedAt).toLocaleString(undefined, {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                })
              : "No intake submitted yet."}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Contact</CardTitle>
            <CardDescription>Primary email on file</CardDescription>
          </CardHeader>
          <CardContent className="text-sm">
            {workspace.primaryContact?.email ?? "Not available"}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Checklist</CardTitle>
          <CardDescription>
            Update each item as you complete it. Admin dashboard reflects these updates in real time.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {checklistItems.map((item) => {
            const status = checklist[item.key]
            return (
              <form key={item.key} action={updateClientChecklistStatus} className="grid gap-3 rounded-lg border p-3 md:grid-cols-[1fr_auto_auto] md:items-center">
                <input type="hidden" name="workspaceId" value={workspace.id} />
                <input type="hidden" name="itemKey" value={item.key} />
                <div className="flex items-center gap-2">
                  <span className="font-medium">{item.label}</span>
                  <span className={`inline-flex rounded-full px-2 py-0.5 text-xs ${statusStyles[status]}`}>
                    {checklistStatusLabels[status]}
                  </span>
                </div>
                <select
                  name="status"
                  defaultValue={status}
                  className="h-9 rounded-md border bg-background px-3 text-sm"
                >
                  <option value="not_started">Not started</option>
                  <option value="in_progress">In progress</option>
                  <option value="complete">Complete</option>
                </select>
                <Button type="submit" variant="outline" className="h-9">Save</Button>
              </form>
            )
          })}
        </CardContent>
      </Card>

      <BeamRequestsPanel />

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Most recent updates in your workspace</CardDescription>
        </CardHeader>
        <CardContent>
          {timeline.length === 0 ? (
            <p className="text-sm text-muted-foreground">No activity yet.</p>
          ) : (
            <ul className="space-y-3">
              {timeline.map((event) => (
                <li key={event.id} className="rounded-lg border p-3">
                  <div className="text-sm font-medium">{event.title}</div>
                  {event.description && (
                    <div className="text-sm text-muted-foreground mt-1">{event.description}</div>
                  )}
                  <div className="text-xs text-muted-foreground mt-2">
                    {new Date(event.createdAt).toLocaleString()}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
