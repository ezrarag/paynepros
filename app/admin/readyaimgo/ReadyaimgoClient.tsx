"use client"

import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { CheckCircle2, XCircle, DollarSign, Users, Lock } from "lucide-react"

interface SubscriptionData {
  hasActiveSubscription: boolean
  walletBalance: number
  totalLeads: number
  recentLeads: Array<{
    id: string
    name: string
    serviceInterest?: string
    createdAt: string
  }>
}

interface ReadyaimgoClientProps {
  initialData: SubscriptionData
}

export default function ReadyaimgoClient({ initialData }: ReadyaimgoClientProps) {
  const searchParams = useSearchParams()
  const lockedModule = searchParams.get("locked")

  const hasActiveSubscription = initialData.hasActiveSubscription
  const walletBalance = initialData.walletBalance
  const totalLeads = initialData.totalLeads
  const recentLeads = initialData.recentLeads
  const lockedFeatures = ["Wallet", "Marketing", "Operations", "Requests"]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Readyaimgo</h1>
        <p className="text-muted-foreground mt-2">
          Subscription management and premium features
        </p>
      </div>

      {/* Locked Module Message */}
      {lockedModule && (
        <Card className="border-primary">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              {lockedModule} is Locked
            </CardTitle>
            <CardDescription>
              Activate your Readyaimgo subscription to access this feature
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/admin/readyaimgo">Activate Subscription</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Subscription Status */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Subscription Status</CardTitle>
            <CardDescription>Your Readyaimgo C-Suite plan status</CardDescription>
          </div>
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
          {!hasActiveSubscription && (
            <Button asChild className="mt-4">
              <Link href="/admin/subscription">Activate Subscription</Link>
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium">Wallet Balance</CardTitle>
            <DollarSign className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${walletBalance.toFixed(2)}
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
            <div className="text-2xl font-bold">{totalLeads}</div>
            <p className="text-xs text-muted-foreground mt-1">
              All time leads
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Locked Features */}
      {!hasActiveSubscription && (
        <Card>
          <CardHeader>
            <CardTitle>Locked Features</CardTitle>
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
            <Button variant="outline" asChild className="w-full mt-4">
              <Link href="/admin/subscription">Activate Readyaimgo</Link>
            </Button>
          </CardContent>
        </Card>
      )}

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
          {totalLeads > 5 && (
            <Button variant="outline" className="w-full mt-4" asChild>
              <Link href="/admin/messaging">View All Leads</Link>
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
