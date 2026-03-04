import { redirect } from "next/navigation"
import { requireClientPortalSession } from "@/lib/client-portal-session"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { getClientRequestTemplate, isDocumentRequestType } from "@/lib/client-requests"
import {
  checklistItems,
  checklistStatusLabels,
  normalizeChecklist,
  getLifecycleBadgeLabel,
} from "@/lib/tax-return-checklist"
import {
  updateClientChecklistStatus,
  clientSignOut,
  completeClientRequest,
} from "./actions"

const statusStyles = {
  not_started: "bg-muted text-muted-foreground",
  in_progress: "bg-amber-100 text-amber-800",
  complete: "bg-emerald-100 text-emerald-800",
} as const

export default async function ClientPortalPage() {
  const clientUser = await requireClientPortalSession()

  const { clientWorkspaceRepository } = await import(
    "@/lib/repositories/client-workspace-repository"
  )
  const { intakeResponseRepository } = await import(
    "@/lib/repositories/intake-response-repository"
  )
  const { clientRequestRepository } = await import(
    "@/lib/repositories/client-request-repository"
  )

  const workspace = await clientWorkspaceRepository.findById(clientUser.workspaceId)
  if (!workspace) {
    redirect("/client/login")
  }

  const checklist = normalizeChecklist(workspace.taxReturnChecklist)
  const timeline = await clientWorkspaceRepository.getTimeline(workspace.id, 8)
  const latestIntake = await intakeResponseRepository.findLatest(workspace.id)
  const allClientRequests = await clientRequestRepository.listByWorkspace(workspace.id)
  const openClientRequests = allClientRequests.filter((request) => request.status !== "completed")
  const unviewedRequests = openClientRequests
    .filter((request) => !request.viewedAt)
  if (unviewedRequests.length > 0) {
    const viewedAt = new Date().toISOString()
    for (const request of unviewedRequests) {
      const updated = await clientRequestRepository.updateStatus(workspace.id, request.id, {
        status: "viewed",
        viewedAt,
      })
      if (!updated) continue
      await clientWorkspaceRepository.appendTimelineEvent(workspace.id, {
        type: "client_request_viewed",
        title: "Client request viewed",
        description: request.title,
        metadata: {
          requestId: request.id,
          type: request.type,
        },
      })
    }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-5 p-4 sm:space-y-6 sm:p-6 lg:p-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="break-words text-2xl font-semibold leading-tight sm:text-3xl">
            {workspace.displayName}
          </h1>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            Signed in as{" "}
            <span className="break-all font-medium text-foreground/85">{clientUser.email}</span>
          </p>
        </div>
        <form action={clientSignOut}>
          <Button type="submit" variant="outline">Sign out</Button>
        </form>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="leading-tight">Tax Return Status</CardTitle>
            <CardDescription className="leading-6">
              Live status shared with your PaynePros team
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Badge>{getLifecycleBadgeLabel(checklist)}</Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="leading-tight">Latest Intake</CardTitle>
            <CardDescription className="leading-6">Your most recent intake submission</CardDescription>
          </CardHeader>
          <CardContent className="break-words text-sm leading-6 text-muted-foreground">
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
            <CardTitle className="leading-tight">Contact</CardTitle>
            <CardDescription className="leading-6">Primary email on file</CardDescription>
          </CardHeader>
          <CardContent className="break-all text-sm leading-6">
            {workspace.primaryContact?.email ?? "Not available"}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Checklist</CardTitle>
          <CardDescription className="leading-6">
            Update each item as you complete it. Admin dashboard reflects these updates in real time.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {checklistItems.map((item) => {
            const status = checklist[item.key]
            return (
              <form
                key={item.key}
                action={updateClientChecklistStatus}
                className="grid gap-3 rounded-lg border p-3 md:grid-cols-[1fr_auto_auto] md:items-center"
              >
                <input type="hidden" name="workspaceId" value={workspace.id} />
                <input type="hidden" name="itemKey" value={item.key} />
                <div className="flex min-w-0 flex-col items-start gap-1 sm:flex-row sm:items-center sm:gap-2">
                  <span className="break-words text-sm font-medium leading-6 sm:text-base">{item.label}</span>
                  <span className={`inline-flex rounded-full px-2 py-0.5 text-xs ${statusStyles[status]}`}>
                    {checklistStatusLabels[status]}
                  </span>
                </div>
                <select
                  name="status"
                  defaultValue={status}
                  className="h-9 w-full rounded-md border bg-background px-3 text-sm md:w-auto"
                >
                  <option value="not_started">Not started</option>
                  <option value="in_progress">In progress</option>
                  <option value="complete">Complete</option>
                </select>
                <Button type="submit" variant="outline" className="h-9 w-full md:w-auto">
                  Save
                </Button>
              </form>
            )
          })}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Requested Items</CardTitle>
          <CardDescription className="leading-6">Action items from your preparer.</CardDescription>
        </CardHeader>
        <CardContent>
          {openClientRequests.length === 0 ? (
            <p className="text-sm text-muted-foreground">No open requests right now.</p>
          ) : (
            <ul className="space-y-3">
              {openClientRequests.map((request) => {
                const template = getClientRequestTemplate(request.type)
                const isDocRequest = isDocumentRequestType(request.type)
                return (
                  <li key={request.id} className="rounded-lg border p-3">
                    <div className="break-words text-sm font-medium leading-6">{request.title}</div>
                    <div className="mt-1 break-words text-sm leading-6 text-muted-foreground">
                      {request.instructions}
                    </div>
                    {request.noteFromPreparer ? (
                      <div className="mt-2 break-words text-sm leading-6">
                        <span className="text-muted-foreground">Note:</span>{" "}
                        {request.noteFromPreparer}
                      </div>
                    ) : null}
                    <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs leading-5 text-muted-foreground">
                      <span>Status: {request.status.replace("_", " ")}</span>
                      {request.dueAt ? (
                        <span>
                          Due{" "}
                          {new Date(request.dueAt).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                      ) : null}
                      <span>{template?.completionMode === "confirm_info" ? "Confirm info" : "Document upload"}</span>
                    </div>
                    <form action={completeClientRequest} className="mt-3">
                      <input type="hidden" name="workspaceId" value={workspace.id} />
                      <input type="hidden" name="requestId" value={request.id} />
                      <Button type="submit" variant="outline">
                        {isDocRequest ? "I uploaded this document" : "Mark info confirmed"}
                      </Button>
                    </form>
                  </li>
                )
              })}
            </ul>
          )}
        </CardContent>
      </Card>

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
                  <div className="break-words text-sm font-medium leading-6">{event.title}</div>
                  {event.description && (
                    <div className="mt-1 break-words text-sm leading-6 text-muted-foreground">
                      {event.description}
                    </div>
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
