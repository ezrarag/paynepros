"use client"

import { usePathname } from "next/navigation"
import { MarketingLayout } from "@/components/marketing/MarketingLayout"

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isAdminRoute = pathname?.startsWith("/admin") ?? false
  const isPasswordPage = pathname === "/password"

  if (isAdminRoute || isPasswordPage) {
    return <>{children}</>
  }

  return <MarketingLayout>{children}</MarketingLayout>
}
