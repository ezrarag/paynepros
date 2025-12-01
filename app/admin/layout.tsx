// TEMPORARILY DISABLED AUTH CHECK - Allowing access without login for development
// import { auth } from "@/auth"
// import { redirect } from "next/navigation"
// import { headers } from "next/headers"
import { AdminSidebar } from "@/components/admin/AdminSidebar"
import { AdminHeader } from "@/components/admin/AdminHeader"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // TEMPORARILY DISABLED - Allow access without auth
  // const session = await auth()
  // if (!session?.user) {
  //   redirect("/admin/login")
  // }

  // Mock user for development
  const mockUserId = "mock-admin-id"
  
  // TEMPORARILY DISABLED subscription check - Firebase Admin not configured
  // TODO: Re-enable when Firebase Admin is configured
  // Check subscription status
  // Dynamic import to prevent webpack bundling issues
  // const { userRepository } = await import("@/lib/repositories/user-repository")
  // const user = await userRepository.findById(mockUserId)

  // TEMPORARILY DISABLED redirect check - pathname detection doesn't work in server components
  // TODO: Implement client-side redirect check or use middleware for subscription check
  // const headersList = await headers()
  // const pathname = headersList.get("x-pathname") || ""
  // const isSubscriptionPage = pathname.includes("/admin/subscription")
  // if (
  //   !isSubscriptionPage &&
  //   !user?.cSuiteEnabled &&
  //   user?.subscriptionStatus !== "active"
  // ) {
  //   redirect("/admin/subscription")
  // }

  const mockUser = {
    name: "Dev User",
    email: "dev@paynepros.com",
    image: null,
  }

  return (
    <div className="min-h-screen bg-background">
      <AdminHeader user={mockUser} />
      <div className="flex">
        <AdminSidebar />
        <main className="flex-1 p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}

