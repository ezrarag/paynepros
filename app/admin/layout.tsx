import { AdminShell } from "@/components/admin/AdminShell"
import { getCurrentUser } from "@/lib/auth"
import { isSubscriptionActive } from "@/lib/subscription"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const currentUser = await getCurrentUser()

  // If not logged in, just render children (login page handles its own UI)
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
    <AdminShell
      hasActiveSubscription={hasActiveSubscription}
      userRole={currentUser.role}
      headerUser={headerUser}
    >
      {children}
    </AdminShell>
  )
}
