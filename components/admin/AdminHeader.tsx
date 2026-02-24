"use client"

import { signOut } from "next-auth/react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { LogOut, User, HelpCircle, Menu } from "lucide-react"
import type { AdminRole } from "@/lib/types/admin"

interface AdminHeaderProps {
  user: {
    name?: string | null
    email?: string | null
    image?: string | null
    role?: AdminRole
  }
  /** Open sidebar drawer */
  onMenuClick?: () => void
}

export function AdminHeader({ user, onMenuClick }: AdminHeaderProps) {
  return (
    <header className="h-14 sm:h-16 border-b border-border/80 bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/85 dark:bg-[#12161c] dark:border-[#2a313b] flex items-center justify-between px-3 sm:px-6 gap-2">
      <div className="flex items-center gap-2 min-w-0">
        {onMenuClick && (
          <button
            type="button"
            onClick={onMenuClick}
            aria-label="Open menu"
            className="p-2 rounded-lg hover:bg-muted dark:hover:bg-[#1e2631] text-foreground shrink-0"
          >
            <Menu className="h-5 w-5" />
          </button>
        )}
        <h1 className="text-base sm:text-xl font-bold truncate">PaynePros Admin</h1>
      </div>
      <div className="flex items-center gap-1 sm:gap-4 shrink-0">
        <Link
          href="/admin/security"
          className="p-2 rounded-md hover:bg-muted dark:hover:bg-[#1e2631] transition-colors hidden sm:inline-flex"
          title="Security Center"
          aria-label="Security Center"
        >
          <HelpCircle className="h-5 w-5 text-muted-foreground hover:text-foreground" />
        </Link>
        <div className="hidden sm:flex items-center gap-2 text-sm">
          {user.image && (
            <img
              src={user.image}
              alt={user.name || "User"}
              className="h-8 w-8 rounded-full"
            />
          )}
          {!user.image && (
            <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
              <User className="h-4 w-4 text-primary-foreground" />
            </div>
          )}
          <span className="font-medium max-w-[120px] truncate">{user.name || user.email}</span>
          {user.role && (
            <Badge
              variant={user.role === "OWNER" ? "default" : "secondary"}
              className="text-xs"
            >
              {user.role}
            </Badge>
          )}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => signOut({ callbackUrl: "/admin/login" })}
          className="text-xs sm:text-sm"
        >
          <LogOut className="h-4 w-4 sm:mr-2" />
          <span className="hidden sm:inline">Sign Out</span>
        </Button>
      </div>
    </header>
  )
}
