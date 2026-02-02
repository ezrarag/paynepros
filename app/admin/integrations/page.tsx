import { getCurrentUser } from "@/lib/auth"
import { canManageIntegrations } from "@/lib/rbac"
import { mockIntegrationStatus } from "@/lib/mock/admin"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Mail, MessageCircle, Check, X } from "lucide-react"

const PROVIDER_LABELS: Record<string, string> = {
  gmail: "Gmail",
  outlook: "Outlook",
  whatsapp: "WhatsApp",
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
            : "View connection status. Only the owner can connect or disconnect providers."}
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
    </div>
  )
}
