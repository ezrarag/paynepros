import { getCurrentUser } from "@/lib/auth"
import { canManageIntegrations } from "@/lib/rbac"
import { mockIntegrationStatus } from "@/lib/mock/admin"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Mail, MessageCircle, Check, X, FileSpreadsheet, FolderSync, Link2, Unplug } from "lucide-react"
import Link from "next/link"

const PROVIDER_LABELS: Record<string, string> = {
  gmail: "Gmail",
  outlook: "Outlook",
  whatsapp: "WhatsApp",
}

// TODO: Replace with Firebase-backed Google Workspace OAuth state and token metadata.
const MOCK_GOOGLE_WORKSPACE_INTEGRATION = {
  connected: true,
  accountEmail: "detania@paynepros.com",
  lastSyncAt: "2026-03-15T08:12:00.000Z",
}

export default async function IntegrationsPage() {
  const user = await getCurrentUser()
  if (!user) return null

  const canManage = canManageIntegrations(user)

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
                <Badge variant={MOCK_GOOGLE_WORKSPACE_INTEGRATION.connected ? "default" : "secondary"}>
                  {MOCK_GOOGLE_WORKSPACE_INTEGRATION.connected ? "Connected" : "Disconnected"}
                </Badge>
                <span className="text-sm font-medium">
                  {MOCK_GOOGLE_WORKSPACE_INTEGRATION.accountEmail ?? "No connected Google account"}
                </span>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                Last sync{" "}
                {new Date(MOCK_GOOGLE_WORKSPACE_INTEGRATION.lastSyncAt).toLocaleString(undefined, {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                })}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {canManage && (
                <>
                  <Button variant="outline" disabled>
                    <Link2 className="mr-2 h-4 w-4" />
                    Connect Google
                  </Button>
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
            Google Forms import is staged in the UI and linked to the Forms &amp; Intake workspace. Backend OAuth, Firebase persistence, and sync jobs are still TODO.
          </div>
          <Button asChild variant="outline">
            <Link href="/admin/forms">Open Forms &amp; Intake</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
