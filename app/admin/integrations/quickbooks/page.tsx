import Link from "next/link"
import { revalidatePath } from "next/cache"
import { requireAuth } from "@/lib/auth"
import { canManageIntegrations } from "@/lib/rbac"
import { prisma } from "@/lib/db/prisma"
import { syncQuickBooksForOrganization } from "@/lib/intuit/sync"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

function formatDateTime(value: Date | null | undefined): string {
  if (!value) return "Never"
  return value.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })
}

function getTokenStatus(expiresAt: Date): { label: string; variant: "default" | "secondary" | "destructive" } {
  const diffMs = expiresAt.getTime() - Date.now()
  if (diffMs <= 0) return { label: "Expired", variant: "destructive" }
  if (diffMs <= 24 * 60 * 60 * 1000) return { label: "Expiring <24h", variant: "secondary" }
  return { label: "Valid", variant: "default" }
}

async function syncOrganizationAction(formData: FormData) {
  "use server"

  const user = await requireAuth()
  if (!canManageIntegrations(user)) {
    throw new Error("Forbidden")
  }

  const organizationId = String(formData.get("organizationId") ?? "")
  if (!organizationId) {
    throw new Error("Missing organizationId")
  }

  await syncQuickBooksForOrganization(organizationId)
  revalidatePath("/admin/integrations/quickbooks")
  revalidatePath("/dashboard/quickbooks")
}

export default async function AdminQuickBooksIntegrationsPage() {
  const user = await requireAuth()
  const canManage = canManageIntegrations(user)

  const organizations = await prisma.organization.findMany({
    where: {
      intuitConnection: { isNot: null },
    },
    include: {
      intuitConnection: true,
      _count: {
        select: {
          qbCustomers: true,
          qbInvoices: true,
        },
      },
    },
    orderBy: {
      updatedAt: "desc",
    },
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">QuickBooks Admin</h1>
          <p className="mt-2 text-muted-foreground">
            Organization-wide QuickBooks connection and sync health across tenants.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/dashboard/quickbooks">Open user dashboard view</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Connected organizations</CardTitle>
          <CardDescription>
            {organizations.length} organization{organizations.length === 1 ? "" : "s"} currently connected.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {organizations.length === 0 ? (
            <p className="text-sm text-muted-foreground">No QuickBooks connections yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="py-2 pr-4">Organization</th>
                    <th className="py-2 pr-4">realmId</th>
                    <th className="py-2 pr-4">Environment</th>
                    <th className="py-2 pr-4">Sync status</th>
                    <th className="py-2 pr-4">Token expiry</th>
                    <th className="py-2 pr-4">Last sync</th>
                    <th className="py-2 pr-4">Data</th>
                    <th className="py-2 pr-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {organizations.map((organization: any) => {
                    const connection = organization.intuitConnection
                    if (!connection) return null

                    const tokenStatus = getTokenStatus(connection.accessTokenExpiresAt)

                    return (
                      <tr key={organization.id} className="border-b last:border-0">
                        <td className="py-2 pr-4">
                          <div className="font-medium">{organization.name}</div>
                          <div className="text-xs text-muted-foreground">tenant: {organization.tenantId}</div>
                        </td>
                        <td className="py-2 pr-4 font-mono text-xs">{connection.realmId}</td>
                        <td className="py-2 pr-4">
                          <Badge variant="outline">
                            {connection.environment === "SANDBOX" ? "sandbox" : "production"}
                          </Badge>
                        </td>
                        <td className="py-2 pr-4">
                          <Badge variant={connection.syncStatus === "ERROR" ? "destructive" : "secondary"}>
                            {connection.syncStatus.toLowerCase()}
                          </Badge>
                        </td>
                        <td className="py-2 pr-4">
                          <Badge variant={tokenStatus.variant}>{tokenStatus.label}</Badge>
                          <div className="mt-1 text-xs text-muted-foreground">
                            {formatDateTime(connection.accessTokenExpiresAt)}
                          </div>
                        </td>
                        <td className="py-2 pr-4">{formatDateTime(connection.lastSyncedAt)}</td>
                        <td className="py-2 pr-4 text-xs text-muted-foreground">
                          {organization._count.qbCustomers} customers / {organization._count.qbInvoices} invoices
                        </td>
                        <td className="py-2 pr-4">
                          {canManage ? (
                            <form action={syncOrganizationAction}>
                              <input type="hidden" name="organizationId" value={organization.id} />
                              <Button size="sm" type="submit">
                                Sync now
                              </Button>
                            </form>
                          ) : (
                            <span className="text-xs text-muted-foreground">Read only</span>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
