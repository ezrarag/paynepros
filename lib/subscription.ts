import type { User } from "@/lib/repositories/user-repository"

export const isSubscriptionActive = (user?: User | null): boolean => {
  if (!user) {
    return false
  }
  return Boolean(user.cSuiteEnabled || user.subscriptionStatus === "active")
}
