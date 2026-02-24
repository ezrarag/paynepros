"use client"

import { useState, useEffect } from "react"
import { AdminHeader } from "@/components/admin/AdminHeader"
import { AdminSidebar } from "@/components/admin/AdminSidebar"
import { BeamDrawer } from "@/components/admin/BeamDrawer"
import { cn } from "@/lib/utils"
import type { AdminRole } from "@/lib/types/admin"

type AdminShellProps = {
  children: React.ReactNode
  hasActiveSubscription: boolean
  userRole: AdminRole
  headerUser: {
    name?: string | null
    email?: string | null
    image?: string | null
    role?: AdminRole
  }
}

export function AdminShell({
  children,
  hasActiveSubscription,
  userRole,
  headerUser,
}: AdminShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true)

  // Listen for sidebar collapse changes via custom event
  useEffect(() => {
    const handleCollapseChange = (e: CustomEvent<{ collapsed: boolean }>) => {
      setSidebarCollapsed(e.detail.collapsed)
    }
    window.addEventListener("sidebarCollapseChange", handleCollapseChange as EventListener)
    // Check initial state from localStorage
    const saved = localStorage.getItem("admin.sidebarCollapsed")
    setSidebarCollapsed(saved === "true")
    return () => {
      window.removeEventListener("sidebarCollapseChange", handleCollapseChange as EventListener)
    }
  }, [])

  // Prevent body scroll when mobile sidebar is open
  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [sidebarOpen])

  return (
    <div className="min-h-screen bg-background">
      <AdminHeader
        user={headerUser}
        onMenuClick={() => setSidebarOpen(true)}
      />
      <div className="flex">
        {/* Sidebar overlay */}
        <button
          type="button"
          aria-label="Close menu"
          onClick={() => setSidebarOpen(false)}
          className={cn(
            "fixed inset-0 z-40 bg-black/50 transition-opacity",
            sidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
          )}
        />
        {/* Sidebar drawer (all breakpoints) */}
        <aside
          className={cn(
            "fixed top-14 sm:top-16 left-0 bottom-0 z-50 border-r bg-card dark:bg-[#161b22] dark:border-[#2a313b]",
            "transform transition-transform duration-200 ease-out",
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <AdminSidebar
            hasActiveSubscription={hasActiveSubscription}
            userRole={userRole}
            onNavigate={() => setSidebarOpen(false)}
          />
        </aside>
        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
      <BeamDrawer isSidebarCollapsed={sidebarCollapsed} />
    </div>
  )
}
