import Link from "next/link"
import { revalidatePath } from "next/cache"
import { requireAuth } from "@/lib/auth"
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

async function syncNowAction(formData: FormData) {
  "use server"

  const user = await requireAuth()
  const organizationId = String(formData.get("organizationId") ?? "")
  if (!organizationId) return

  const organization = await prisma.organization.findUnique({
    where: { id: organizationId },
    select: { tenantId: true },
  })

  if (!organization || organization.tenantId !== user.tenantId) {
    throw new Error("Forbidden")
  }

  await syncQuickBooksForOrganization(organizationId)

  revalidatePath("/dashboard/quickbooks")
  revalidatePath("/admin/integrations/quickbooks")
  revalidatePath("/client")
}

export default async function QuickBooksDashboardPage() {
  const user = await requireAuth()

  const organizations = await prisma.organization.findMany({
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
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">QuickBooks</h1>
          <p className="mt-2 text-muted-foreground">
            Tenant-level QuickBooks overview. Connect client workspaces from Admin Integrations.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/integrations/quickbooks">Open admin QuickBooks dashboard</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Client workspace integrations</CardTitle>
          <CardDescription>
            {organizations.length} workspace{organizations.length === 1 ? "" : "s"} tracked.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {organizations.length === 0 ? (
            <p className="text-sm text-muted-foreground">No client QuickBooks connections yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="py-2 pr-4">Client</th>
                    <th className="py-2 pr-4">Workspace</th>
                    <th className="py-2 pr-4">Status</th>
                    <th className="py-2 pr-4">Company</th>
                    <th className="py-2 pr-4">Last sync</th>
                    <th className="py-2 pr-4">Data</th>
                    <th className="py-2 pr-4">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {organizations.map((organization: any) => (
                    <tr key={organization.id} className="border-b last:border-0">
                      <td className="py-2 pr-4 font-medium">{organization.name}</td>
                      <td className="py-2 pr-4 font-mono text-xs">{organization.clientWorkspaceId}</td>
                      <td className="py-2 pr-4">
                        <Badge variant={organization.intuitConnection ? "default" : "secondary"}>
                          {organization.intuitConnection ? "Connected" : "Not connected"}
                        </Badge>
                      </td>
                      <td className="py-2 pr-4">
                        {organization.intuitConnection?.qboCompanyName ?? "Not synced"}
                      </td>
                      <td className="py-2 pr-4">
                        {formatDateTime(organization.intuitConnection?.lastSyncedAt)}
                      </td>
                      <td className="py-2 pr-4 text-xs text-muted-foreground">
                        {organization._count.qbCustomers} customers / {organization._count.qbInvoices} invoices
                      </td>
                      <td className="py-2 pr-4">
                        {organization.intuitConnection ? (
                          <form action={syncNowAction}>
                            <input type="hidden" name="organizationId" value={organization.id} />
                            <Button type="submit" size="sm">Sync now</Button>
                          </form>
                        ) : (
                          <Button asChild size="sm" variant="outline">
                            <Link
                              href={`/api/integrations/intuit/connect?clientWorkspaceId=${encodeURIComponent(
                                organization.clientWorkspaceId
                              )}`}
                            >
                              Connect
                            </Link>
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
