"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useSearchParams } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Users,
  MessageSquare,
  Wallet,
  BookOpen,
  Megaphone,
  LayoutTemplate,
  Truck,
  FileText,
  Calculator,
  ClipboardList,
  Lock,
  ChevronDown,
  ChevronRight,
  Plug,
  X,
  ChevronLeft,
  ChevronRight as ChevronRightIcon,
  Moon,
  Sun,
  Monitor,
  type LucideIcon,
} from "lucide-react"
import type { AdminRole } from "@/lib/types/admin"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const payneProsItems = [
  { href: "/admin/messaging", label: "Messaging", icon: MessageSquare },
  { href: "/admin/integrations", label: "Integrations", icon: Plug },
  { href: "/admin/bookkeeping", label: "Documents", icon: BookOpen },
  { href: "/admin/forms", label: "Forms", icon: ClipboardList },
  { href: "/admin/calculations", label: "Calculations", icon: Calculator },
]

const clientSubItems = [
  { href: "/admin/clients", label: "Client Workspaces", listMode: "active" },
  { href: "/admin/clients?list=completed", label: "Completed / Archive", listMode: "completed" },
] as const

const dashboardSubItems = [
  { href: "/admin", label: "Queue Overview" },
  { href: "/admin/dashboard/focus", label: "Today Focus" },
  { href: "/admin/dashboard/activity", label: "Activity Feed" },
  { href: "/admin/dashboard/inbox", label: "Inbox" },
] as const

const subscriptionItems = [
  { href: "/admin/wallet", label: "Wallet", icon: Wallet },
  { href: "/admin/marketing", label: "Marketing", icon: Megaphone },
  { href: "/admin/marketing/content", label: "Content", icon: LayoutTemplate },
  { href: "/admin/operations", label: "Operations", icon: Truck },
  { href: "/admin/requests", label: "Requests", icon: FileText },
]

type AdminSidebarProps = {
  hasActiveSubscription: boolean
  userRole: AdminRole
  /** Called when user navigates (e.g. close mobile drawer) */
  onNavigate?: () => void
}

type Theme = "light" | "dark" | "system"

export function AdminSidebar({ hasActiveSubscription, userRole, onNavigate }: AdminSidebarProps) {
  // Only OWNER and ADMIN can see Readyaimgo section
  // STAFF members (like Nija, Ezra) should not see it
  // Explicitly exclude STAFF - only show for OWNER or ADMIN
  const canSeeReadyaimgo = userRole !== "STAFF" && (userRole === "OWNER" || userRole === "ADMIN")
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const lockedModule = searchParams.get("locked")
  const clientListMode = searchParams.get("list") === "completed" ? "completed" : "active"
  
  // Sidebar collapse state
  const [isCollapsed, setIsCollapsed] = useState(true)
  
  // Theme state
  const [theme, setTheme] = useState<Theme>("system")

  // Load sidebar state from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("admin.sidebarCollapsed")
    const initialCollapsed = saved === null ? true : saved === "true"
    setIsCollapsed(initialCollapsed)
    localStorage.setItem("admin.sidebarCollapsed", String(initialCollapsed))
    
    const savedTheme = localStorage.getItem("admin.theme") as Theme | null
    if (savedTheme && ["light", "dark", "system"].includes(savedTheme)) {
      setTheme(savedTheme)
      applyTheme(savedTheme)
    } else {
      applyTheme("system")
    }
  }, [])

  // Apply theme to document
  const applyTheme = (newTheme: Theme) => {
    const root = document.documentElement
    if (newTheme === "system") {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
      if (prefersDark) {
        root.classList.add("dark")
      } else {
        root.classList.remove("dark")
      }
    } else {
      if (newTheme === "dark") {
        root.classList.add("dark")
      } else {
        root.classList.remove("dark")
      }
    }
  }

  const handleThemeChange = (newTheme: Theme) => {
    setTheme(newTheme)
    localStorage.setItem("admin.theme", newTheme)
    applyTheme(newTheme)
  }

  const toggleCollapse = () => {
    const newState = !isCollapsed
    setIsCollapsed(newState)
    localStorage.setItem("admin.sidebarCollapsed", String(newState))
    // Notify AdminShell of collapse state change
    if (typeof window !== "undefined") {
      const event = new CustomEvent("sidebarCollapseChange", { detail: { collapsed: newState } })
      window.dispatchEvent(event)
    }
  }
  
  // Auto-expand modules section if on readyaimgo page or locked module is shown
  const isReadyaimgoPage = pathname === "/admin/readyaimgo" || pathname.startsWith("/admin/readyaimgo")
  const [subscriptionOpen, setSubscriptionOpen] = useState(isReadyaimgoPage || !!lockedModule)

  // Update state when pathname or searchParams change
  useEffect(() => {
    if (isReadyaimgoPage || lockedModule) {
      setSubscriptionOpen(true)
    }
  }, [isReadyaimgoPage, lockedModule])

  const renderLink = (item: { href: string; label: string; icon: LucideIcon }) => {
    const Icon = item.icon
    const isActive =
      pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href))

    const linkContent = (
      <Link
        key={item.href}
        href={item.href}
        onClick={onNavigate}
        className={cn(
          "flex items-center rounded-lg text-sm font-medium transition-colors",
          isCollapsed
            ? "justify-center px-2 py-2"
            : "gap-3 px-4 py-2",
          isActive
            ? "bg-primary text-primary-foreground"
            : "text-muted-foreground hover:bg-muted hover:text-foreground"
        )}
      >
        <Icon className="h-5 w-5 shrink-0" />
        {!isCollapsed && <span>{item.label}</span>}
      </Link>
    )

    if (isCollapsed) {
      return (
        <TooltipProvider key={item.href}>
          <Tooltip>
            <TooltipTrigger asChild>
              {linkContent}
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>{item.label}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )
    }

    return linkContent
  }

  const renderLockedLink = (item: { href: string; label: string; icon: LucideIcon }) => {
    const Icon = item.icon

    const linkContent = (
      <Link
        key={item.href}
        href={`/admin/readyaimgo?locked=${encodeURIComponent(item.label)}`}
        onClick={onNavigate}
        title="Activate Readyaimgo to unlock"
        className={cn(
          "flex items-center rounded-lg text-sm font-medium text-muted-foreground opacity-70 hover:bg-muted",
          isCollapsed
            ? "justify-center px-2 py-2"
            : "gap-3 px-4 py-2"
        )}
      >
        <Icon className="h-5 w-5 shrink-0" />
        {!isCollapsed && (
          <>
            <span>{item.label}</span>
            <Lock className="ml-auto h-4 w-4 text-muted-foreground shrink-0" />
          </>
        )}
      </Link>
    )

    if (isCollapsed) {
      return (
        <TooltipProvider key={item.href}>
          <Tooltip>
            <TooltipTrigger asChild>
              {linkContent}
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>{item.label} (Locked)</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )
    }

    return linkContent
  }

  const renderDashboardSubLink = (item: (typeof dashboardSubItems)[number]) => {
    const isActive = pathname === item.href
    return (
      <Link
        key={item.href}
        href={item.href}
        onClick={onNavigate}
        className={cn(
          "flex items-center rounded-lg px-4 py-1.5 text-xs transition-colors",
          isActive
            ? "bg-primary/10 text-primary font-semibold"
            : "text-muted-foreground hover:bg-muted hover:text-foreground"
        )}
      >
        {item.label}
      </Link>
    )
  }

  const renderClientSubLink = (item: (typeof clientSubItems)[number]) => {
    const isClientsPage = pathname === "/admin/clients"
    const isActive = isClientsPage && clientListMode === item.listMode
    return (
      <Link
        key={item.href}
        href={item.href}
        onClick={onNavigate}
        className={cn(
          "flex items-center rounded-lg px-4 py-1.5 text-xs transition-colors",
          isActive
            ? "bg-primary/10 text-primary font-semibold"
            : "text-muted-foreground hover:bg-muted hover:text-foreground"
        )}
      >
        {item.label}
      </Link>
    )
  }

  return (
    <TooltipProvider delayDuration={300}>
      <aside
        className={cn(
          "border-r bg-card min-h-[calc(100vh-64px)] relative transition-all duration-300",
          isCollapsed ? "w-16" : "w-full max-w-[16rem]"
        )}
      >
        <nav className="p-3 sm:p-4 space-y-4">
          {/* Mobile: close button */}
          <div className="flex items-center justify-between px-2 pb-2 border-b border-border md:hidden">
            {!isCollapsed && (
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Menu
              </p>
            )}
            <button
              type="button"
              onClick={onNavigate}
              aria-label="Close menu"
              className="p-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Desktop: collapse toggle */}
          <div className="hidden md:flex items-center justify-between px-2 pb-2 border-b border-border">
            {!isCollapsed && (
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                PaynePros
              </p>
            )}
            <button
              type="button"
              onClick={toggleCollapse}
              aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              className="p-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              {isCollapsed ? (
                <ChevronRightIcon className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
            </button>
          </div>

          <div className="space-y-2">
            {!isCollapsed && (
              <p className="px-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                PaynePros
              </p>
            )}
            <div className="space-y-1">
              {renderLink({ href: "/admin", label: "Dashboard", icon: LayoutDashboard })}
              {!isCollapsed && (
                <div className="ml-8 space-y-1 border-l pl-3">
                  {dashboardSubItems.map(renderDashboardSubLink)}
                </div>
              )}
            </div>
            <div className="space-y-1">
              {renderLink({ href: "/admin/clients", label: "Clients", icon: Users })}
              {!isCollapsed && (
                <div className="ml-8 space-y-1 border-l pl-3">
                  {clientSubItems.map(renderClientSubLink)}
                </div>
              )}
            </div>
            <div className="space-y-1">{payneProsItems.map(renderLink)}</div>
          </div>

        {/* Only show Readyaimgo section for OWNER and ADMIN */}
        {canSeeReadyaimgo && (
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => setSubscriptionOpen((value) => !value)}
              className={cn(
                "flex w-full items-center justify-between rounded-lg px-4 py-2 text-xs font-semibold uppercase tracking-wide transition-colors",
                isReadyaimgoPage
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted"
              )}
            >
              {!isCollapsed && (
                <span className="flex items-center gap-2">
                  Readyaimgo
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-[10px] font-semibold",
                      hasActiveSubscription
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-amber-100 text-amber-700"
                    )}
                  >
                    {hasActiveSubscription ? "Active" : "Locked"}
                  </span>
                </span>
              )}
              {!isCollapsed && (
                subscriptionOpen ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )
              )}
            </button>
            {subscriptionOpen && (
              <div className={cn("space-y-1", !isCollapsed && "pl-4")}>
                {isCollapsed ? (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Link
                          href="/admin/readyaimgo"
                          onClick={onNavigate}
                          className={cn(
                            "flex items-center justify-center rounded-lg px-2 py-2 text-sm font-medium transition-colors",
                            pathname === "/admin/readyaimgo" && !lockedModule
                              ? "bg-primary text-primary-foreground"
                              : "text-muted-foreground hover:bg-muted hover:text-foreground"
                          )}
                        >
                          <span className="text-xs">O</span>
                        </Link>
                      </TooltipTrigger>
                      <TooltipContent side="right">
                        <p>Overview</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ) : (
                  <Link
                    href="/admin/readyaimgo"
                    onClick={onNavigate}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-4 py-2 text-sm font-medium transition-colors",
                      pathname === "/admin/readyaimgo" && !lockedModule
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    Overview
                  </Link>
                )}
                {subscriptionItems.map((item) =>
                  hasActiveSubscription ? renderLink(item) : renderLockedLink(item)
                )}
              </div>
            )}
          </div>
        )}

        {/* Theme toggle */}
        <div className="mt-auto pt-4 border-t">
          {isCollapsed ? (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    onClick={() => {
                      const nextTheme: Theme = theme === "light" ? "dark" : theme === "dark" ? "system" : "light"
                      handleThemeChange(nextTheme)
                    }}
                    className="w-full flex items-center justify-center px-2 py-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                  >
                    {theme === "light" ? (
                      <Sun className="h-5 w-5" />
                    ) : theme === "dark" ? (
                      <Moon className="h-5 w-5" />
                    ) : (
                      <Monitor className="h-5 w-5" />
                    )}
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>Theme: {theme}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ) : (
            <div className="px-4 space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                Theme
              </p>
              <Select value={theme} onValueChange={handleThemeChange}>
                <SelectTrigger className="w-full">
                  <SelectValue>
                    <div className="flex items-center gap-2">
                      {theme === "light" ? (
                        <>
                          <Sun className="h-4 w-4" />
                          <span>Light</span>
                        </>
                      ) : theme === "dark" ? (
                        <>
                          <Moon className="h-4 w-4" />
                          <span>Dark</span>
                        </>
                      ) : (
                        <>
                          <Monitor className="h-4 w-4" />
                          <span>System</span>
                        </>
                      )}
                    </div>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">
                    <div className="flex items-center gap-2">
                      <Sun className="h-4 w-4" />
                      <span>Light</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="dark">
                    <div className="flex items-center gap-2">
                      <Moon className="h-4 w-4" />
                      <span>Dark</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="system">
                    <div className="flex items-center gap-2">
                      <Monitor className="h-4 w-4" />
                      <span>System</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      </nav>
    </aside>
    </TooltipProvider>
  )
}
