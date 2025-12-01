// TEMPORARILY DISABLED AUTH CHECK
// import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { CheckCircle2, XCircle, DollarSign, Users, FileText } from "lucide-react"

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

  // Mock user ID for development
  const mockUserId = "mock-admin-id"
  const user = await userRepository.findById(mockUserId)
  const wallet = user ? await walletRepository.findByUserId(user.id) : null
  const leads = await leadRepository.findByBusiness("paynepros")
  const recentLeads = leads.slice(0, 5)

  const hasActiveSubscription = user?.cSuiteEnabled || user?.subscriptionStatus === "active"

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Welcome back, Dev User
        </p>
      </div>

      {/* Subscription Status */}
      {!hasActiveSubscription && (
        <Card className="border-primary">
          <CardHeader>
            <CardTitle>Activate C-Suite Subscription</CardTitle>
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

      {/* Recent Leads */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Leads</CardTitle>
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

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" asChild>
              <Link href="/admin/wallet">Add Funds</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/admin/requests">New Request</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/admin/bookkeeping">Upload Receipt</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/admin/messaging">View Messages</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

