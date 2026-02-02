import { Suspense } from "react"
import { redirect } from "next/navigation"
import ReadyaimgoClient from "./ReadyaimgoClient"
import { getCurrentUser } from "@/lib/auth"
import { isSubscriptionActive } from "@/lib/subscription"

export default async function ReadyaimgoPage() {
  const currentUser = await getCurrentUser()
  
  // Redirect STAFF members - only OWNER and ADMIN can access Readyaimgo
  if (!currentUser || currentUser.role === "STAFF") {
    redirect("/admin")
  }

  // Mock user ID for development
  const mockUserId = "mock-admin-id"

  // Fetch data with safe fallbacks
  let user = null
  let wallet = null
  let allLeads: Array<{
    id: string
    name: string
    serviceInterest?: string
    createdAt: string
  }> = []
  let hasActiveSubscription = false

  try {
    // Dynamic imports to prevent webpack from bundling Firebase Admin
    const { userRepository } = await import("@/lib/repositories/user-repository")
    const { walletRepository } = await import("@/lib/repositories/wallet-repository")
    const { leadRepository } = await import("@/lib/repositories/lead-repository")

    user = await userRepository.findById(mockUserId)
    wallet = user ? await walletRepository.findByUserId(user.id) : null
    const fetchedLeads = await leadRepository.findByBusiness("paynepros")
    allLeads = fetchedLeads.map((lead) => ({
      id: lead.id,
      name: lead.name,
      serviceInterest: lead.serviceInterest,
      createdAt: lead.createdAt,
    }))
    hasActiveSubscription = isSubscriptionActive(user)
  } catch (error) {
    console.error("Failed to fetch Readyaimgo data:", error)
    // Use fallback values if Firebase Admin not initialized
  }

  const subscriptionData = {
    hasActiveSubscription,
    walletBalance: wallet?.balance ?? 0,
    totalLeads: allLeads.length,
    recentLeads: allLeads.slice(0, 5),
  }

  return (
    <Suspense
      fallback={
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Readyaimgo</h1>
            <p className="text-muted-foreground mt-2">Loading subscription details…</p>
          </div>
          <div className="h-40 rounded-lg border bg-muted animate-pulse" />
        </div>
      }
    >
      <ReadyaimgoClient initialData={subscriptionData} />
    </Suspense>
  )
}
