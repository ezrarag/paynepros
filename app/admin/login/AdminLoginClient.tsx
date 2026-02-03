"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Shield, Users, Lock } from "lucide-react"
import type { AdminUser } from "@/lib/types/admin"

interface AdminLoginClientProps {
  adminUsers: AdminUser[]
}

export default function AdminLoginClient({ adminUsers }: AdminLoginClientProps) {
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get("callbackUrl") ?? "/admin"
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null)
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleUserClick = (user: AdminUser) => {
    setSelectedUser(user)
    setPassword("")
    setError(null)
  }

  const handleSignIn = async () => {
    if (!selectedUser || !password) {
      setError("Please enter a password")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const result = await signIn("admin", {
        email: selectedUser.email,
        password,
        callbackUrl,
        redirect: false,
      })

      if (result?.error) {
        setError("Invalid password. Please try again.")
        setIsLoading(false)
      } else {
        // Success - NextAuth will handle redirect
        window.location.href = callbackUrl
      }
    } catch (err) {
      setError("An error occurred. Please try again.")
      setIsLoading(false)
    }
  }

  const handleCloseDialog = () => {
    setSelectedUser(null)
    setPassword("")
    setError(null)
  }

  return (
    <>
      <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">PaynePros Admin</CardTitle>
            <CardDescription>
              Sign in to access the admin dashboard (tenant: paynepros)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {adminUsers.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-sm text-muted-foreground">
                  No admin users found. Please contact your administrator.
                </p>
              </div>
            ) : (
              <>
                <p className="text-sm text-muted-foreground text-center">
                  Select a user to sign in:
                </p>
                <div className="space-y-2">
                  {adminUsers.map((user) => (
                    <Button
                      key={user.id}
                      variant="outline"
                      className="w-full h-auto py-4 flex flex-col items-center gap-1"
                      onClick={() => handleUserClick(user)}
                    >
                      <span className="flex items-center gap-2">
                        {user.role === "OWNER" ? (
                          <Shield className="h-4 w-4 text-amber-500" />
                        ) : (
                          <Users className="h-4 w-4 text-muted-foreground" />
                        )}
                        <span className="font-medium">{user.name}</span>
                        <Badge
                          variant={user.role === "OWNER" ? "default" : "secondary"}
                          className="text-xs"
                        >
                          {user.role}
                        </Badge>
                      </span>
                      <span className="text-xs text-muted-foreground">{user.email}</span>
                    </Button>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground text-center pt-2">
                  Enter your temporary password when prompted.
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Password Dialog */}
      <Dialog open={!!selectedUser} onOpenChange={(open) => !open && handleCloseDialog()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Enter Password
            </DialogTitle>
            <DialogDescription>
              Sign in as <strong>{selectedUser?.name}</strong> ({selectedUser?.email})
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Temporary Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  setError(null)
                }}
                placeholder="Enter your password"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !isLoading) {
                    handleSignIn()
                  }
                }}
                autoFocus
                disabled={isLoading}
              />
              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={handleCloseDialog}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button onClick={handleSignIn} disabled={isLoading || !password}>
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
