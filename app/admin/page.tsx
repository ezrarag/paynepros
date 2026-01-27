// TEMPORARILY DISABLED AUTH CHECK
// import { auth } from "@/auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { CheckCircle2, XCircle, DollarSign, Users, Lock } from "lucide-react"
import { isSubscriptionActive } from "@/lib/subscription"

export default async function AdminDashboard() {
  // TEMPORARILY DISABLED - Allow access without auth
  // const session = await auth()
  // if (!session?.user?.id) {
  //   redirect("/admin/login")
  // }

  // Dynamic imports to prevent webpack from bundling Firebase Admin
  const { userRepository } = await import("@/lib/repositories/user-repository")
  const { walletRepository } = await import("@/lib/repositories/wallet-repository")
  const { leadRepository } = await import("@/lib/repositories/lead-repository")
  const { clientWorkspaceRepository } = await import(
    "@/lib/repositories/client-workspace-repository"
  )

  // Mock user ID for development
  const mockUserId = "mock-admin-id"
  const user = await userRepository.findById(mockUserId)
  const wallet = user ? await walletRepository.findByUserId(user.id) : null
  const leads = await leadRepository.findByBusiness("paynepros")
  const recentLeads = leads.slice(0, 5)
  const workspaces = await clientWorkspaceRepository.findAll(5)

  const hasActiveSubscription = isSubscriptionActive(user)
  const attentionTemplates = [
    "Missing documents to review",
    "Income review needed",
    "Expenses ready to categorize",
    "Waiting on client response",
  ]
  const attentionItems = workspaces.length
    ? workspaces.slice(0, 4).map((workspace, index) => ({
        id: workspace.id,
        name: workspace.displayName,
        detail: attentionTemplates[index % attentionTemplates.length],
        href: `/admin/clients/${workspace.id}`,
      }))
    : [
        {
          id: "placeholder-1",
          name: "Alicia Jenkins",
          detail: "Missing documents to review",
          href: "/admin/clients",
        },
        {
          id: "placeholder-2",
          name: "Legacy Auto Group",
          detail: "Income review needed",
          href: "/admin/clients",
        },
      ]
  const lockedFeatures = ["Wallet", "Marketing", "Operations", "Requests"]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Welcome back, Dev User
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Today</CardTitle>
          <CardDescription>Next actions for clients needing attention</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {attentionItems.map((item) => (
            <div
              key={item.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-lg border px-4 py-3"
            >
              <div>
                <p className="font-medium">{item.name}</p>
                <p className="text-sm text-muted-foreground">{item.detail}</p>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link href={item.href}>Open workspace</Link>
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium">Subscription</CardTitle>
            {hasActiveSubscription ? (
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            ) : (
              <XCircle className="h-5 w-5 text-red-500" />
            )}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {hasActiveSubscription ? "Active" : "Inactive"}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {hasActiveSubscription ? "C-Suite Plan" : "Activate to unlock features"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium">Wallet Balance</CardTitle>
            <DollarSign className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${wallet?.balance.toFixed(2) || "0.00"}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Available balance
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
            <Users className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{leads.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              All time leads
            </p>
          </CardContent>
        </Card>
      </div>

      {!hasActiveSubscription && (
        <Card>
          <CardHeader>
            <CardTitle>Locked features</CardTitle>
            <CardDescription>Activate Readyaimgo to unlock these modules</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {lockedFeatures.map((feature) => (
              <div
                key={feature}
                className="flex items-center justify-between rounded-md border px-3 py-2 text-sm text-muted-foreground"
              >
                <span>{feature}</span>
                <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs">
                  <Lock className="h-3 w-3" />
                  Locked
                </span>
              </div>
            ))}
            <Button variant="outline" asChild className="w-full">
              <Link href="/admin/subscription">Activate Readyaimgo</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {!hasActiveSubscription && (
        <Card className="border-primary">
          <CardHeader>
            <CardTitle>Activate Readyaimgo Subscription</CardTitle>
            <CardDescription>
              Unlock full admin features with Readyaimgo C-Suite plan
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/admin/subscription">Activate Subscription</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Client Work */}
      <Card>
        <CardHeader>
          <CardTitle>PaynePros work</CardTitle>
          <CardDescription>Jump back into client-facing work</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" asChild>
              <Link href="/admin/clients">Review Clients</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/admin/bookkeeping">Documents</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/admin/forms">Forms</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/admin/messaging">View Messages</Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Leads */}
      <Card>
        <CardHeader>
          <CardTitle>Recent leads</CardTitle>
          <CardDescription>Latest inquiries from your website</CardDescription>
        </CardHeader>
        <CardContent>
          {recentLeads.length === 0 ? (
            <p className="text-sm text-muted-foreground">No leads yet</p>
          ) : (
            <div className="space-y-4">
              {recentLeads.map((lead) => (
                <div
                  key={lead.id}
                  className="flex items-center justify-between border-b pb-4 last:border-0"
                >
                  <div>
                    <p className="font-medium">{lead.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {lead.serviceInterest || "General inquiry"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">
                      {new Date(lead.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
          {leads.length > 5 && (
            <Button variant="outline" className="w-full mt-4" asChild>
              <Link href="/admin/messaging">View All Leads</Link>
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

