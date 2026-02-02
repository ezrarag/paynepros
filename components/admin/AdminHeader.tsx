"use client"

import { signOut } from "next-auth/react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { LogOut, User, HelpCircle } from "lucide-react"
import type { AdminRole } from "@/lib/types/admin"

interface AdminHeaderProps {
  user: {
    name?: string | null
    email?: string | null
    image?: string | null
    role?: AdminRole
  }
}

export function AdminHeader({ user }: AdminHeaderProps) {
  return (
    <header className="h-16 border-b bg-card flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-bold">PaynePros Admin</h1>
      </div>
      <div className="flex items-center gap-4">
        <Link
          href="/admin/security"
          className="p-2 rounded-md hover:bg-muted transition-colors"
          title="Security Center"
        >
          <HelpCircle className="h-5 w-5 text-muted-foreground hover:text-foreground" />
        </Link>
        <div className="flex items-center gap-2 text-sm">
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
          <span className="font-medium">{user.name || user.email}</span>
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
        >
          <LogOut className="h-4 w-4 mr-2" />
          Sign Out
        </Button>
      </div>
    </header>
  )
}

