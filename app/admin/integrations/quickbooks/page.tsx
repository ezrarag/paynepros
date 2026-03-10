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

function getTokenStatus(expiresAt: Date | null | undefined): {
  label: string
  variant: "default" | "secondary" | "destructive"
} {
  if (!expiresAt) return { label: "N/A", variant: "secondary" }
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

  const organization = await prisma.organization.findUnique({
    where: { id: organizationId },
    select: { tenantId: true },
  })

  if (!organization || organization.tenantId !== user.tenantId) {
    throw new Error("Forbidden")
  }

  await syncQuickBooksForOrganization(organizationId)
  revalidatePath("/admin/integrations/quickbooks")
  revalidatePath("/dashboard/quickbooks")
  revalidatePath("/client")
}

export default async function AdminQuickBooksIntegrationsPage({
  searchParams,
}: {
  searchParams?: Promise<{ connected?: string; error?: string; clientWorkspaceId?: string }>
}) {
  const user = await requireAuth()
  const canManage = canManageIntegrations(user)
  const params = searchParams ? await searchParams : {}

  const { clientWorkspaceRepository } = await import("@/lib/repositories/client-workspace-repository")
  const [workspaces, organizations] = await Promise.all([
    clientWorkspaceRepository.findAll(200),
    prisma.organization.findMany({
      where: { tenantId: user.tenantId },
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
    }),
  ])

  const orgByWorkspaceId = new Map<string, any>(
    (organizations as any[]).map((org) => [org.clientWorkspaceId, org])
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">QuickBooks Admin</h1>
          <p className="mt-2 text-muted-foreground">
            Connect and manage each client workspace QuickBooks integration from one place.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/dashboard/quickbooks">Open tenant QuickBooks overview</Link>
        </Button>
      </div>

      {params.connected === "1" && (
        <div className="rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-700">
          QuickBooks connected successfully for workspace {params.clientWorkspaceId ?? "client"}.
        </div>
      )}
      {params.error && (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          QuickBooks connection failed: {params.error}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Client integrations</CardTitle>
          <CardDescription>
            {workspaces.length} client workspace{workspaces.length === 1 ? "" : "s"} in directory.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {workspaces.length === 0 ? (
            <p className="text-sm text-muted-foreground">No client workspaces found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="py-2 pr-4">Client</th>
                    <th className="py-2 pr-4">Workspace</th>
                    <th className="py-2 pr-4">realmId</th>
                    <th className="py-2 pr-4">Environment</th>
                    <th className="py-2 pr-4">Sync status</th>
                    <th className="py-2 pr-4">Token expiry</th>
                    <th className="py-2 pr-4">Last sync</th>
                    <th className="py-2 pr-4">Data</th>
                    <th className="py-2 pr-4">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {workspaces.map((workspace: any) => {
                    const organization = orgByWorkspaceId.get(workspace.id)
                    const connection = organization?.intuitConnection ?? null
                    const tokenStatus = getTokenStatus(connection?.accessTokenExpiresAt)

                    return (
                      <tr key={workspace.id} className="border-b last:border-0">
                        <td className="py-2 pr-4 font-medium">{workspace.displayName}</td>
                        <td className="py-2 pr-4 font-mono text-xs">{workspace.id}</td>
                        <td className="py-2 pr-4 font-mono text-xs">{connection?.realmId ?? "-"}</td>
                        <td className="py-2 pr-4">
                          {connection ? (
                            <Badge variant="outline">
                              {connection.environment === "SANDBOX" ? "sandbox" : "production"}
                            </Badge>
                          ) : (
                            <span className="text-xs text-muted-foreground">-</span>
                          )}
                        </td>
                        <td className="py-2 pr-4">
                          {connection ? (
                            <Badge variant={connection.syncStatus === "ERROR" ? "destructive" : "secondary"}>
                              {connection.syncStatus.toLowerCase()}
                            </Badge>
                          ) : (
                            <Badge variant="secondary">not connected</Badge>
                          )}
                        </td>
                        <td className="py-2 pr-4">
                          <Badge variant={tokenStatus.variant}>{tokenStatus.label}</Badge>
                          <div className="mt-1 text-xs text-muted-foreground">
                            {formatDateTime(connection?.accessTokenExpiresAt)}
                          </div>
                        </td>
                        <td className="py-2 pr-4">{formatDateTime(connection?.lastSyncedAt)}</td>
                        <td className="py-2 pr-4 text-xs text-muted-foreground">
                          {organization ? `${organization._count.qbCustomers} customers / ${organization._count.qbInvoices} invoices` : "-"}
                        </td>
                        <td className="py-2 pr-4">
                          {canManage ? (
                            connection && organization ? (
                              <form action={syncOrganizationAction}>
                                <input type="hidden" name="organizationId" value={organization.id} />
                                <Button size="sm" type="submit">
                                  Sync now
                                </Button>
                              </form>
                            ) : (
                              <Button asChild size="sm">
                                <Link
                                  href={`/api/integrations/intuit/connect?clientWorkspaceId=${encodeURIComponent(
                                    workspace.id
                                  )}`}
                                >
                                  Connect QuickBooks
                                </Link>
                              </Button>
                            )
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
