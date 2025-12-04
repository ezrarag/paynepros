"use client"

import { usePathname } from "next/navigation"
import { Navigation } from "@/components/Navigation"
import Link from "next/link"

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isAdminRoute = pathname?.startsWith("/admin") ?? false

  if (isAdminRoute) {
    return <>{children}</>
  }

  return (
    <>
      <Navigation brand="paynepros" />
      <main>{children}</main>
      <footer className="hidden md:flex fixed bottom-0 left-0 right-0 z-40 bg-transparent py-6 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center justify-center gap-8">
            <Link 
              href="/admin/login" 
              className="text-sm font-medium text-gray-300 hover:text-offwhite transition-colors"
            >
              Sign In
            </Link>
            <Link 
              href="/admin" 
              className="text-sm font-medium text-gray-300 hover:text-offwhite transition-colors"
            >
              Admin
            </Link>
            <Link 
              href="/contact" 
              className="text-sm font-medium text-gray-300 hover:text-offwhite transition-colors"
            >
              Contact
            </Link>
          </div>
        </div>
      </footer>
    </>
  )
}

