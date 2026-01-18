"use client"

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
  Settings,
} from "lucide-react"

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/clients", label: "Clients", icon: Users },
  { href: "/admin/messaging", label: "Messaging", icon: MessageSquare },
  { href: "/admin/wallet", label: "Wallet", icon: Wallet },
  { href: "/admin/bookkeeping", label: "Bookkeeping", icon: BookOpen },
  { href: "/admin/marketing", label: "Marketing", icon: Megaphone },
  { href: "/admin/operations", label: "Operations", icon: Truck },
  { href: "/admin/requests", label: "Requests", icon: FileText },
  { href: "/admin/account", label: "Account", icon: Settings },
]

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 border-r bg-card min-h-[calc(100vh-64px)]">
      <nav className="p-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href))
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}

