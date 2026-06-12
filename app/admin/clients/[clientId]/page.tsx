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
  createClientRequest,
  markClientRequestComplete,
  logClientRequestResent,
  toggleNotificationChannel,
  toggleReminderSchedule,
  sendReminderNow,
} from "./actions"
import { deleteClient } from "../actions"
import { Badge } from "@/components/ui/badge"
import { DEFAULT_NOTIFICATION_PREFERENCES } from "@/lib/types/client-workspace"

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
  const { clientRequestRepository } = await import(
    "@/lib/repositories/client-request-repository"
  )
  const workspace = await clientWorkspaceRepository.findById(clientId)
  const timeline = workspace
    ? await clientWorkspaceRepository.getTimeline(clientId)
    : []
  const latestIntake = workspace
    ? await intakeResponseRepository.findLatest(clientId)
    : null
  const clientRequests = workspace
    ? await clientRequestRepository.listByWorkspace(clientId)
    : []

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

  const notificationPrefs = {
    ...DEFAULT_NOTIFICATION_PREFERENCES,
    ...workspace.notificationPreferences,
  }

  const { reminderScheduleRepository } = await import(
    "@/lib/repositories/reminder-schedule-repository"
  )
  const openRequests = clientRequests.filter((req) => req.status !== "completed")
  const reminderStates = await Promise.all(
    openRequests.map(async (req) => ({
      request: req,
      schedule: await reminderScheduleRepository.findByRequestId(req.id),
    }))
  )

  return (
    <div className="space-y-6">
      <ClientWorkspaceDetails
        workspace={workspace}
        timeline={timeline}
        latestIntake={latestIntake}
        clientRequests={clientRequests}
        updateClient={updateClient}
        updateChecklistStatus={updateChecklistStatus}
        createClientRequest={createClientRequest}
        markClientRequestComplete={markClientRequestComplete}
        logClientRequestResent={logClientRequestResent}
        uploadClientForm={uploadClientForm}
        emailForm={emailForm}
        faxForm={faxForm}
        mailForm={mailForm}
        saveMileageCalculation={saveMileageCalculation}
        saveScheduleCCalculation={saveScheduleCCalculation}
        deleteClient={deleteClient}
      />

      <Card>
        <CardHeader>
          <CardTitle>Notification Preferences</CardTitle>
          <CardDescription>
            How this client receives document-request reminders. Clients manage these in
            their portal; use the toggles to override (e.g. client asked to stop texts).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-lg border p-3">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Email</p>
              <div className="mt-2 flex items-center justify-between gap-2">
                <Badge variant={notificationPrefs.email ? "default" : "secondary"}>
                  {notificationPrefs.email ? "Enabled" : "Disabled"}
                </Badge>
                <form action={toggleNotificationChannel}>
                  <input type="hidden" name="workspaceId" value={workspace.id} />
                  <input type="hidden" name="channel" value="email" />
                  <input
                    type="hidden"
                    name="enabled"
                    value={notificationPrefs.email ? "false" : "true"}
                  />
                  <Button type="submit" variant="outline" size="sm">
                    {notificationPrefs.email ? "Disable" : "Enable"}
                  </Button>
                </form>
              </div>
            </div>
            <div className="rounded-lg border p-3">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">SMS</p>
              <div className="mt-2 flex items-center justify-between gap-2">
                <Badge variant={notificationPrefs.sms ? "default" : "secondary"}>
                  {notificationPrefs.sms ? "Enabled" : "Disabled"}
                </Badge>
                <form action={toggleNotificationChannel}>
                  <input type="hidden" name="workspaceId" value={workspace.id} />
                  <input type="hidden" name="channel" value="sms" />
                  <input
                    type="hidden"
                    name="enabled"
                    value={notificationPrefs.sms ? "false" : "true"}
                  />
                  <Button type="submit" variant="outline" size="sm">
                    {notificationPrefs.sms ? "Disable" : "Enable"}
                  </Button>
                </form>
              </div>
            </div>
            <div className="rounded-lg border p-3">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Phone on file</p>
              <p className="mt-2 text-sm font-medium">
                {notificationPrefs.phone ?? "None provided"}
              </p>
              {notificationPrefs.phone ? (
                <p className="mt-1 text-xs text-muted-foreground">
                  {notificationPrefs.phoneVerifiedAt ? "Verified" : "Not verified"}
                </p>
              ) : null}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Automatic Reminders</CardTitle>
          <CardDescription>
            Reminder status for each open request. Reminders run daily and stop the moment
            the client completes the request.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {reminderStates.length === 0 ? (
            <p className="text-sm text-muted-foreground">No open requests.</p>
          ) : (
            <ul className="space-y-3">
              {reminderStates.map(({ request, schedule }) => (
                <li
                  key={request.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-3"
                >
                  <div className="min-w-0">
                    <p className="break-words text-sm font-medium leading-6">{request.title}</p>
                    {schedule ? (
                      <p className="mt-1 text-xs leading-5 text-muted-foreground">
                        {schedule.attemptCount} of {schedule.maxAttempts} reminders sent
                        {schedule.active
                          ? ` · next ${new Date(schedule.nextRunAt).toLocaleDateString(undefined, {
                              month: "short",
                              day: "numeric",
                            })}`
                          : " · paused"}
                        {schedule.channelsLastAttempted.length > 0
                          ? ` · last via ${schedule.channelsLastAttempted.join(", ")}`
                          : ""}
                      </p>
                    ) : (
                      <p className="mt-1 text-xs leading-5 text-muted-foreground">
                        No reminder schedule (request predates automatic reminders).
                      </p>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {schedule ? (
                      <>
                        <Badge variant={schedule.active ? "default" : "secondary"}>
                          {schedule.active ? "Active" : "Paused"}
                        </Badge>
                        <form action={toggleReminderSchedule}>
                          <input type="hidden" name="workspaceId" value={workspace.id} />
                          <input type="hidden" name="requestId" value={request.id} />
                          <input
                            type="hidden"
                            name="active"
                            value={schedule.active ? "false" : "true"}
                          />
                          <Button type="submit" variant="outline" size="sm">
                            {schedule.active ? "Pause reminders" : "Resume"}
                          </Button>
                        </form>
                      </>
                    ) : null}
                    <form action={sendReminderNow}>
                      <input type="hidden" name="workspaceId" value={workspace.id} />
                      <input type="hidden" name="requestId" value={request.id} />
                      <Button type="submit" variant="outline" size="sm">
                        Send reminder now
                      </Button>
                    </form>
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
