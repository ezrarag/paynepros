import { redirect } from "next/navigation"
import { Suspense } from "react"
import { AdminSidebar } from "@/components/admin/AdminSidebar"
import { AdminHeader } from "@/components/admin/AdminHeader"
import { BeamDrawer } from "@/components/admin/BeamDrawer"
import { getCurrentUser } from "@/lib/auth"
import { isSubscriptionActive } from "@/lib/subscription"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const currentUser = await getCurrentUser()
  
  // If not logged in, just render children (login page handles its own UI)
  // The middleware/auth.config handles redirecting non-login pages to login
  if (!currentUser) {
    return children
  }

  const { userRepository } = await import("@/lib/repositories/user-repository")
  const repoUser = await userRepository.findById(currentUser.id)
  const hasActiveSubscription = isSubscriptionActive(repoUser)

  const headerUser = {
    name: currentUser.name ?? currentUser.email ?? "User",
    email: currentUser.email ?? null,
    image: null,
    role: currentUser.role,
  }

  return (
    <div className="min-h-screen bg-background">
      <AdminHeader user={headerUser} />
      <div className="flex">
        <Suspense fallback={<aside className="w-64 border-r bg-card min-h-[calc(100vh-64px)]" />}>
          <AdminSidebar 
            hasActiveSubscription={hasActiveSubscription} 
            userRole={currentUser.role}
          />
        </Suspense>
        <main className="flex-1 p-6 lg:p-8">
          {children}
        </main>
      </div>
      <BeamDrawer />
    </div>
  )
}
