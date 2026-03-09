import Link from "next/link"
import { revalidatePath } from "next/cache"
import { requireAuth } from "@/lib/auth"
import { prisma } from "@/lib/db/prisma"
import { syncQuickBooksForTenant } from "@/lib/intuit/sync"
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

function formatCurrency(value: string | number | null): string {
  if (value == null) return "-"
  const numeric = Number(value)
  if (Number.isNaN(numeric)) return "-"
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(numeric)
}

async function syncNowAction() {
  "use server"

  const user = await requireAuth()
  await syncQuickBooksForTenant(user.tenantId)

  revalidatePath("/dashboard/quickbooks")
  revalidatePath("/admin/integrations/quickbooks")
}

export default async function QuickBooksDashboardPage({
  searchParams,
}: {
  searchParams?: Promise<{ connected?: string; error?: string }>
}) {
  const user = await requireAuth()
  const params = searchParams ? await searchParams : {}

  const organization = await prisma.organization.findUnique({
    where: { tenantId: user.tenantId },
    include: {
      intuitConnection: true,
      qbInvoices: {
        orderBy: [{ txnDate: "desc" }, { createdAt: "desc" }],
        take: 8,
      },
      _count: {
        select: {
          qbCustomers: true,
        },
      },
    },
  })

  const connection = organization?.intuitConnection ?? null
  const hasConnection = Boolean(connection)
  const companyName = connection?.qboCompanyName ?? "Not synced yet"

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">QuickBooks</h1>
          <p className="mt-2 text-muted-foreground">
            Connect your QuickBooks Online company and sync accounting data into Readyaimgo.
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant={hasConnection ? "outline" : "default"}>
            <Link href="/api/integrations/intuit/connect">
              {hasConnection ? "Reconnect QuickBooks" : "Connect QuickBooks"}
            </Link>
          </Button>
          {hasConnection && (
            <form action={syncNowAction}>
              <Button type="submit">Sync now</Button>
            </form>
          )}
        </div>
      </div>

      {params.connected === "1" && (
        <div className="rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-700">
          QuickBooks connected successfully. Run a sync to load company data.
        </div>
      )}

      {params.error && (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          QuickBooks connection failed: {params.error}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Status</CardDescription>
            <CardTitle className="text-base">Connection</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant={hasConnection ? "default" : "secondary"}>
              {hasConnection ? "Connected" : "Not connected"}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>QuickBooks Company</CardDescription>
            <CardTitle className="text-base">Company name</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm font-medium">{companyName}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Customer Records</CardDescription>
            <CardTitle className="text-base">Customers</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{organization?._count.qbCustomers ?? 0}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Last Sync</CardDescription>
            <CardTitle className="text-base">Synced at</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{formatDateTime(connection?.lastSyncedAt)}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent invoices</CardTitle>
          <CardDescription>Latest invoices synced from QuickBooks.</CardDescription>
        </CardHeader>
        <CardContent>
          {organization?.qbInvoices.length ? (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="py-2 pr-4">Invoice #</th>
                    <th className="py-2 pr-4">Customer</th>
                    <th className="py-2 pr-4">Date</th>
                    <th className="py-2 pr-4">Balance</th>
                    <th className="py-2 pr-4">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {organization.qbInvoices.map((invoice: any) => (
                    <tr key={invoice.id} className="border-b last:border-0">
                      <td className="py-2 pr-4 font-medium">{invoice.docNumber ?? invoice.qbId}</td>
                      <td className="py-2 pr-4">{invoice.customerName ?? "-"}</td>
                      <td className="py-2 pr-4">{invoice.txnDate ? invoice.txnDate.toLocaleDateString() : "-"}</td>
                      <td className="py-2 pr-4">{formatCurrency(invoice.balance as unknown as string | number | null)}</td>
                      <td className="py-2 pr-4">
                        <Badge variant={invoice.status === "paid" ? "secondary" : "outline"}>
                          {invoice.status ?? "unknown"}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No invoices synced yet. Connect QuickBooks and click "Sync now".
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
