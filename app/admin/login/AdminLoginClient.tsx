"use client"

import { useState, useEffect } from "react"
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
  const [csrfToken, setCsrfToken] = useState<string | null>(null)

  // Fetch CSRF token on mount - ensure credentials are included for cross-origin
  useEffect(() => {
    const fetchCsrf = async () => {
      try {
        const res = await fetch("/api/auth/csrf", {
          credentials: "include", // Important for cross-origin requests
          headers: {
            "Accept": "application/json",
          },
        })
        if (!res.ok) {
          throw new Error(`CSRF fetch failed: ${res.status}`)
        }
        const data = await res.json()
        setCsrfToken(data.csrfToken)
      } catch (err) {
        console.error("Failed to fetch CSRF token:", err)
        // Retry once after a short delay
        setTimeout(async () => {
          try {
            const retryRes = await fetch("/api/auth/csrf", {
              credentials: "include",
              headers: { "Accept": "application/json" },
            })
            if (retryRes.ok) {
              const retryData = await retryRes.json()
              setCsrfToken(retryData.csrfToken)
            }
          } catch (retryErr) {
            console.error("CSRF retry failed:", retryErr)
          }
        }, 1000)
      }
    }
    fetchCsrf()
  }, [])

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

    if (!csrfToken) {
      setError("Loading security token... Please wait.")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // Ensure CSRF token is fresh before signing in (important for cross-origin/mobile)
      let tokenToUse = csrfToken
      if (!tokenToUse) {
        const csrfRes = await fetch("/api/auth/csrf", {
          credentials: "include",
          headers: { "Accept": "application/json" },
        })
        if (csrfRes.ok) {
          const { csrfToken: freshToken } = await csrfRes.json()
          tokenToUse = freshToken
          setCsrfToken(freshToken)
        }
      }

      // Use signIn - NextAuth should handle CSRF automatically
      const result = await signIn("admin", {
        email: selectedUser.email,
        password,
        callbackUrl,
        redirect: false,
      })

      if (result?.error) {
        console.error("Sign in error:", result.error)
        // Check if it's a password error or CSRF error
        if (result.error.includes("CSRF") || result.error.includes("csrf")) {
          setError("Security token expired. Please refresh the page and try again.")
          // Refresh CSRF token
          const csrfRes = await fetch("/api/auth/csrf")
          const { csrfToken: newToken } = await csrfRes.json()
          setCsrfToken(newToken)
        } else {
          setError("Invalid password. Please try again.")
        }
        setIsLoading(false)
      } else if (result?.ok) {
        // Success - redirect to callback URL
        window.location.href = callbackUrl
      } else {
        setError("Sign in failed. Please try again.")
        setIsLoading(false)
      }
    } catch (err: any) {
      console.error("Sign in error:", err)
      // NEXT_REDIRECT errors are actually success in Next.js
      if (err?.digest === "NEXT_REDIRECT" || err?.message?.includes("NEXT_REDIRECT")) {
        // This is success - NextAuth is redirecting
        return
      }
      setError(err?.message || "An error occurred. Please try again.")
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
      <div className="min-h-[100dvh] flex items-center justify-center bg-muted/30 px-4 py-6 sm:py-8">
        <Card className="w-full max-w-sm sm:max-w-md">
          <CardHeader className="text-center px-4 sm:px-6 py-4 sm:py-6">
            <CardTitle className="text-xl sm:text-2xl">PaynePros Admin</CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Sign in to access the admin dashboard
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-4 px-4 sm:px-6 pb-4 sm:pb-6">
            {adminUsers.length === 0 ? (
              <div className="text-center py-6 sm:py-8">
                <p className="text-xs sm:text-sm text-muted-foreground">
                  No admin users found. Please contact your administrator.
                </p>
              </div>
            ) : (
              <>
                <p className="text-xs sm:text-sm text-muted-foreground text-center">
                  Select a user to sign in:
                </p>
                <div className="space-y-2">
                  {adminUsers.map((user) => (
                    <Button
                      key={user.id}
                      variant="outline"
                      className="w-full h-auto py-3 sm:py-4 flex flex-col items-center gap-0.5 sm:gap-1"
                      onClick={() => handleUserClick(user)}
                    >
                      <span className="flex items-center gap-1.5 sm:gap-2">
                        {user.role === "OWNER" ? (
                          <Shield className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-amber-500" />
                        ) : (
                          <Users className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
                        )}
                        <span className="font-medium text-sm sm:text-base">{user.name}</span>
                        <Badge
                          variant={user.role === "OWNER" ? "default" : "secondary"}
                          className="text-[10px] sm:text-xs"
                        >
                          {user.role}
                        </Badge>
                      </span>
                      <span className="text-[10px] sm:text-xs text-muted-foreground">{user.email}</span>
                    </Button>
                  ))}
                </div>
                <p className="text-[10px] sm:text-xs text-muted-foreground text-center pt-1 sm:pt-2">
                  Enter your temporary password when prompted.
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Password Dialog */}
      <Dialog open={!!selectedUser} onOpenChange={(open) => !open && handleCloseDialog()}>
        <DialogContent className="w-[calc(100%-2rem)] max-w-sm sm:max-w-md mx-auto rounded-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Lock className="h-4 w-4 sm:h-5 sm:w-5" />
              Enter Password
            </DialogTitle>
            <DialogDescription className="text-xs sm:text-sm">
              Sign in as <strong>{selectedUser?.name}</strong>
              <span className="block sm:inline sm:ml-1 text-[10px] sm:text-xs">({selectedUser?.email})</span>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 sm:space-y-4">
            <div className="space-y-1.5 sm:space-y-2">
              <Label htmlFor="password" className="text-sm">Temporary Password</Label>
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
                  if (e.key === "Enter" && !isLoading && csrfToken) {
                    handleSignIn()
                  }
                }}
                className="h-10 sm:h-11 text-base"
                autoFocus
                disabled={isLoading}
              />
              {error && (
                <p className="text-xs sm:text-sm text-destructive">{error}</p>
              )}
            </div>
          </div>
          <DialogFooter className="flex-col-reverse sm:flex-row gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={handleCloseDialog}
              disabled={isLoading}
              className="w-full sm:w-auto h-10 sm:h-9"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSignIn} 
              disabled={isLoading || !password || !csrfToken}
              className="w-full sm:w-auto h-10 sm:h-9"
            >
              {isLoading ? "Signing in..." : !csrfToken ? "Loading..." : "Sign In"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
