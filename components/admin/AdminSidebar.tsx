"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Users,
  MessageSquare,
  Wallet,
  BookOpen,
  Megaphone,
  Truck,
  FileText,
  Calculator,
  ClipboardList,
  Lock,
  ChevronDown,
  ChevronRight,
  type LucideIcon,
} from "lucide-react"

const payneProsItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/clients", label: "Clients", icon: Users },
  { href: "/admin/messaging", label: "Messaging", icon: MessageSquare },
  { href: "/admin/bookkeeping", label: "Documents", icon: BookOpen },
  { href: "/admin/forms", label: "Forms", icon: ClipboardList },
  { href: "/admin/calculations", label: "Calculations", icon: Calculator },
]

const subscriptionItems = [
  { href: "/admin/wallet", label: "Wallet", icon: Wallet },
  { href: "/admin/marketing", label: "Marketing", icon: Megaphone },
  { href: "/admin/operations", label: "Operations", icon: Truck },
  { href: "/admin/requests", label: "Requests", icon: FileText },
]

type AdminSidebarProps = {
  hasActiveSubscription: boolean
}

export function AdminSidebar({ hasActiveSubscription }: AdminSidebarProps) {
  const pathname = usePathname()
  const [subscriptionOpen, setSubscriptionOpen] = useState(false)

  const renderLink = (item: { href: string; label: string; icon: LucideIcon }) => {
    const Icon = item.icon
    const isActive =
      pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href))

    return (
      <Link
        key={item.href}
        href={item.href}
        className={cn(
          "flex items-center gap-3 rounded-lg px-4 py-2 text-sm font-medium transition-colors",
          isActive
            ? "bg-primary text-primary-foreground"
            : "text-muted-foreground hover:bg-muted hover:text-foreground"
        )}
      >
        <Icon className="h-5 w-5" />
        {item.label}
      </Link>
    )
  }

  const renderLockedLink = (item: { href: string; label: string; icon: LucideIcon }) => {
    const Icon = item.icon

    return (
      <Link
        key={item.href}
        href={`/admin/subscription?locked=${encodeURIComponent(item.label)}`}
        title="Activate Readyaimgo to unlock"
        className="flex items-center gap-3 rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground opacity-70 hover:bg-muted"
      >
        <Icon className="h-5 w-5" />
        {item.label}
        <Lock className="ml-auto h-4 w-4 text-muted-foreground" />
      </Link>
    )
  }

  return (
    <aside className="w-64 border-r bg-card min-h-[calc(100vh-64px)] relative">
      <nav className="p-4 space-y-4">
        <div className="space-y-2">
          <p className="px-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            PaynePros
          </p>
          <div className="space-y-1">{payneProsItems.map(renderLink)}</div>
        </div>

        <div className="space-y-2">
          <button
            type="button"
            onClick={() => setSubscriptionOpen((value) => !value)}
            className="flex w-full items-center justify-between rounded-lg px-4 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground hover:bg-muted"
          >
            <span className="flex items-center gap-2">
              Readyaimgo (Subscription)
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
            {subscriptionOpen ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </button>
          {subscriptionOpen && (
            <div className="space-y-1">
              {subscriptionItems.map((item) =>
                hasActiveSubscription ? renderLink(item) : renderLockedLink(item)
              )}
            </div>
          )}
        </div>
      </nav>
    </aside>
  )
}

