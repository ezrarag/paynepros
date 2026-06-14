import { getCurrentUser } from "@/lib/auth"
import {
  GOOGLE_GMAIL_READONLY_SCOPE,
  getGoogleIntegrationStatusNotice,
} from "@/lib/google-workspace-integration"
import { canManageIntegrations } from "@/lib/rbac"
import { mockIntegrationStatus } from "@/lib/mock/admin"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Mail, MessageCircle, Check, X, FileSpreadsheet, FolderSync, Link2, Search, Send, Trash2, Unplug } from "lucide-react"
import Link from "next/link"
import {
  createRequestFromGmailSuggestion,
  dismissGmailSuggestion,
  scanGmailChases,
} from "./actions"

const PROVIDER_LABELS: Record<string, string> = {
  gmail: "Gmail",
  outlook: "Outlook",
  whatsapp: "WhatsApp",
}

export default async function IntegrationsPage({
  searchParams,
}: {
  searchParams?: Promise<{ google?: string }>
}) {
  const user = await getCurrentUser()
  if (!user) return null

  const canManage = canManageIntegrations(user)
  const { integrationRepository } = await import("@/lib/repositories/integration-repository")
  const googleIntegration = await integrationRepository.getGoogleWorkspaceIntegration(user.tenantId)
  const { gmailChaseRepository } = await import("@/lib/repositories/gmail-chase-repository")
  const gmailSuggestions = await gmailChaseRepository.listByTenant(user.tenantId)
  const resolvedSearchParams = searchParams ? await searchParams : undefined
  const googleNotice = getGoogleIntegrationStatusNotice(resolvedSearchParams?.google)
  const gmailScopeGranted = googleIntegration.scopes.includes(GOOGLE_GMAIL_READONLY_SCOPE)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Integrations</h1>
        <p className="text-muted-foreground mt-2">
          {canManage
            ? "Connect email and messaging providers to sync messages."
            : "View connection status. Only OWNER or ADMIN can connect or disconnect providers."}
        </p>
      </div>

      {googleNotice && (
        <div className="rounded-lg border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-800 dark:border-sky-900 dark:bg-sky-950/30 dark:text-sky-200">
          {googleNotice}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Email &amp; messaging</CardTitle>
          <CardDescription>
            {canManage
              ? "Connect your accounts to unify inbox in Messaging."
              : "Connection status (read-only)."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {mockIntegrationStatus.map((integration) => (
            <div
              key={integration.provider}
              className="flex items-center justify-between rounded-lg border p-4"
            >
              <div className="flex items-center gap-4">
                {integration.provider === "whatsapp" ? (
                  <MessageCircle className="h-8 w-8 text-muted-foreground" />
                ) : (
                  <Mail className="h-8 w-8 text-muted-foreground" />
                )}
                <div>
                  <p className="font-medium">
                    {PROVIDER_LABELS[integration.provider] ?? integration.provider}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {integration.connected
                      ? integration.connectedAt
                        ? `Connected ${new Date(integration.connectedAt).toLocaleDateString()}`
                        : "Connected"
                      : "Not connected"}
                  </p>
                </div>
                <Badge variant={integration.connected ? "default" : "secondary"}>
                  {integration.connected ? (
                    <><Check className="h-3 w-3 mr-1" /> Yes</>
                  ) : (
                    <><X className="h-3 w-3 mr-1" /> No</>
                  )}
                </Badge>
              </div>
              {canManage && (
                <Button variant={integration.connected ? "outline" : "default"}>
                  {integration.connected ? "Disconnect" : "Connect"}
                </Button>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>QuickBooks Online</CardTitle>
          <CardDescription>
            Connect and monitor tenant-level QuickBooks integrations.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild>
            <Link href="/admin/integrations/quickbooks">Open QuickBooks Admin</Link>
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Google Workspace / Google Forms</CardTitle>
          <CardDescription>
            Prepare Google account connection, form import, and sync support for Forms &amp; Intake.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Badge variant={googleIntegration.connected ? "default" : "secondary"}>
                  {googleIntegration.connected ? "Connected" : "Disconnected"}
                </Badge>
                <span className="text-sm font-medium">
                  {googleIntegration.googleEmail ?? "No connected Google account"}
                </span>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                Last sync{" "}
                {googleIntegration.connected
                  ? new Date(googleIntegration.updatedAt).toLocaleString(undefined, {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                    })
                  : "Not synced"}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {canManage && (
                <>
                  {!googleIntegration.connected ? (
                    <Button asChild variant="outline">
                      <Link href="/api/integrations/google/connect?returnTo=/admin/integrations">
                        <Link2 className="mr-2 h-4 w-4" />
                        Connect Google
                      </Link>
                    </Button>
                  ) : (
                    <form action="/api/integrations/google/disconnect" method="post">
                      <input type="hidden" name="returnTo" value="/admin/integrations" />
                      <Button type="submit" variant="outline">
                        <Unplug className="mr-2 h-4 w-4" />
                        Disconnect
                      </Button>
                    </form>
                  )}
                  <Button variant="outline" disabled>
                    <FileSpreadsheet className="mr-2 h-4 w-4" />
                    Import Form
                  </Button>
                  <Button variant="outline" disabled>
                    <FolderSync className="mr-2 h-4 w-4" />
                    Sync
                  </Button>
                  <Button variant="outline" disabled>
                    <Unplug className="mr-2 h-4 w-4" />
                    Disconnect
                  </Button>
                </>
              )}
            </div>
          </div>
          <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
            Google Forms import is staged in the UI and linked to the Forms &amp; Intake workspace.
            Org-level connect, disconnect, secure token storage, and Gmail scanning are live.
          </div>
          <Button asChild variant="outline">
            <Link href="/admin/forms">Open Forms &amp; Intake</Link>
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Gmail Chasing Scanner</CardTitle>
          <CardDescription>
            Scan recent sent Gmail messages, match clients by email, and turn detected document
            requests into tracked client requests with reminders.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant={googleIntegration.connected ? "default" : "secondary"}>
                  {googleIntegration.connected ? "Google connected" : "Google disconnected"}
                </Badge>
                <Badge variant={gmailScopeGranted ? "default" : "secondary"}>
                  {gmailScopeGranted ? "Gmail access granted" : "Reconnect for Gmail access"}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Pending suggestions: {gmailSuggestions.length}
              </p>
            </div>
            {canManage ? (
              <form action={scanGmailChases}>
                <Button type="submit" variant="outline" disabled={!googleIntegration.connected || !gmailScopeGranted}>
                  <Search className="mr-2 h-4 w-4" />
                  Scan Gmail
                </Button>
              </form>
            ) : null}
          </div>

          {!googleIntegration.connected ? (
            <p className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
              Connect Google Workspace to enable Gmail scanning.
            </p>
          ) : !gmailScopeGranted ? (
            <p className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
              This Google connection predates Gmail scanning. Disconnect and reconnect Google to grant
              Gmail readonly access.
            </p>
          ) : gmailSuggestions.length === 0 ? (
            <p className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
              No pending Gmail chase suggestions. Run a scan after sending client document-request emails.
            </p>
          ) : (
            <ul className="space-y-3">
              {gmailSuggestions.map((suggestion) => (
                <li key={suggestion.id} className="rounded-lg border p-4">
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0 space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="break-words text-sm font-medium">{suggestion.workspaceName}</p>
                        <Badge variant={suggestion.confidence === "high" ? "default" : "secondary"}>
                          {suggestion.confidence} confidence
                        </Badge>
                      </div>
                      <p className="break-words text-sm">{suggestion.title}</p>
                      <p className="break-words text-xs leading-5 text-muted-foreground">
                        {suggestion.subject ? `${suggestion.subject} · ` : ""}
                        {suggestion.snippet ?? "No Gmail snippet available."}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        To {suggestion.clientEmail} ·{" "}
                        {new Date(suggestion.receivedAt).toLocaleString(undefined, {
                          month: "short",
                          day: "numeric",
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    {canManage ? (
                      <div className="flex flex-wrap gap-2">
                        <form action={createRequestFromGmailSuggestion}>
                          <input type="hidden" name="suggestionId" value={suggestion.id} />
                          <Button type="submit" size="sm">
                            <Send className="mr-2 h-4 w-4" />
                            Create request
                          </Button>
                        </form>
                        <form action={dismissGmailSuggestion}>
                          <input type="hidden" name="suggestionId" value={suggestion.id} />
                          <Button type="submit" variant="outline" size="sm">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Dismiss
                          </Button>
                        </form>
                      </div>
                    ) : null}
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
