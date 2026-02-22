import { redirect } from "next/navigation"
import { ContentManager } from "@/components/admin/marketing/ContentManager"
import { getCurrentUser } from "@/lib/auth"
import { marketingContentRepository } from "@/lib/repositories/marketing-content-repository"
import { isSubscriptionActive } from "@/lib/subscription"

export default async function MarketingContentPage() {
  const currentUser = await getCurrentUser()
  if (!currentUser) {
    redirect("/admin/login")
  }
  if (currentUser.role === "STAFF") {
    redirect("/admin")
  }

  const { userRepository } = await import("@/lib/repositories/user-repository")
  const repoUser = await userRepository.findById(currentUser.id)
  const hasActiveSubscription = isSubscriptionActive(repoUser)
  if (!hasActiveSubscription) {
    redirect("/admin/readyaimgo?locked=Content")
  }

  const doc = await marketingContentRepository.getHomeContent()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Marketing Content</h1>
        <p className="text-muted-foreground mt-2">
          Manage content blocks used by homepage sections.
        </p>
      </div>
      <ContentManager initialSections={doc.sections} initialUpdatedAt={doc.updatedAt} />
    </div>
  )
}

