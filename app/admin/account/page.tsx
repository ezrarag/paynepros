// TEMPORARILY DISABLED AUTH CHECK
// import { auth } from "@/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle2, XCircle, Link2, Shield } from "lucide-react"

export default async function AccountPage() {
  // TEMPORARILY DISABLED - Allow access without auth
  // const session = await auth()
  // if (!session?.user?.id) {
  //   redirect("/admin/login")
  // }

  // Dynamic import to prevent webpack from bundling Firebase Admin
  const { userRepository } = await import("@/lib/repositories/user-repository")
  const mockUserId = "dev-user-id"
  const user = await userRepository.findById(mockUserId)

  const connectedAccounts = [
    {
      name: "Google",
      connected: user?.connectedAccounts?.google || false,
      icon: "🔵",
    },
    {
      name: "Facebook",
      connected: user?.connectedAccounts?.facebook || false,
      icon: "🔷",
    },
    {
      name: "Instagram",
      connected: user?.connectedAccounts?.instagram || false,
      icon: "📷",
    },
    {
      name: "Apple",
      connected: user?.connectedAccounts?.apple || false,
      icon: "🍎",
    },
    {
      name: "WhatsApp",
      connected: user?.connectedAccounts?.whatsapp || false,
      icon: "💬",
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Account Settings</h1>
        <p className="text-muted-foreground mt-2">
          Manage your account and connected services
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium">Name</label>
            <p className="text-sm text-muted-foreground mt-1">
              {user?.name || "Dev User"}
            </p>
          </div>
          <div>
            <label className="text-sm font-medium">Email</label>
            <p className="text-sm text-muted-foreground mt-1">
              {user?.email || "dev@paynepros.com"}
            </p>
          </div>
          <div>
            <label className="text-sm font-medium">Phone</label>
            <p className="text-sm text-muted-foreground mt-1">
              {user?.phone || "Not set"}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Connected Accounts</CardTitle>
          <CardDescription>
            Manage your social login connections
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {connectedAccounts.map((account) => (
            <div
              key={account.name}
              className="flex items-center justify-between p-4 border rounded-lg"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{account.icon}</span>
                <div>
                  <p className="font-medium">{account.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {account.connected
                      ? "Connected"
                      : "Not connected"}
                  </p>
                </div>
              </div>
              {account.connected ? (
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              ) : (
                <Button variant="outline" size="sm">
                  <Link2 className="h-4 w-4 mr-2" />
                  Connect
                </Button>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Subscription</CardTitle>
          <CardDescription>
            Manage your Readyaimgo C-Suite subscription
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Status</p>
              <p className="text-sm text-muted-foreground">
                {user?.subscriptionStatus === "active"
                  ? "Active - C-Suite Plan"
                  : "Inactive"}
              </p>
            </div>
            {user?.subscriptionStatus === "active" ? (
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            ) : (
              <XCircle className="h-5 w-5 text-red-500" />
            )}
          </div>
          {user?.subscriptionStatus !== "active" && (
            <Button asChild>
              <a href="/admin/subscription">Activate Subscription</a>
            </Button>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security & Compliance
          </CardTitle>
          <CardDescription>
            Guidelines for handling sensitive client data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Review our internal security guidelines for handling SSNs, banking information, 
            and other sensitive tax documents.
          </p>
          <Button asChild variant="outline">
            <Link href="/admin/security">
              <Shield className="h-4 w-4 mr-2" />
              View Security Center
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

