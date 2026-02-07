"use client"

import { Suspense, useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

function PasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    // Check if already authenticated
    const checkAuth = async () => {
      const response = await fetch("/api/auth/check-password")
      if (response.ok) {
        const redirectTo = searchParams.get("redirect") || "/"
        router.push(redirectTo)
      }
    }
    checkAuth()
  }, [router, searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const response = await fetch("/api/auth/verify-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        // Redirect to the originally requested page or home
        const redirectTo = searchParams.get("redirect") || "/"
        router.push(redirectTo)
      } else {
        setError(data.error || "Invalid password. Please try again.")
        setPassword("")
      }
    } catch (err) {
      setError("An error occurred. Please try again.")
      setPassword("")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-[100dvh] flex items-center justify-center bg-gradient-to-br from-navy via-navy-dark to-navy-light px-4 py-6 sm:py-8">
      <div className="w-full max-w-sm sm:max-w-md">
        <div className="bg-offwhite rounded-lg shadow-xl p-5 sm:p-8 space-y-4 sm:space-y-6">
          <div className="text-center space-y-1 sm:space-y-2">
            <h1 className="text-xl sm:text-2xl font-bold text-navy">Site Access</h1>
            <p className="text-xs sm:text-sm text-gray-600">
              Please enter the password to access this site
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
            <div className="space-y-1.5 sm:space-y-2">
              <Label htmlFor="password" className="text-navy text-sm">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full h-10 sm:h-11 text-base"
                autoFocus
                disabled={isLoading}
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 sm:px-4 sm:py-3 rounded text-xs sm:text-sm">
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-10 sm:h-11 bg-gold text-navy hover:bg-gold-dark text-sm sm:text-base"
              disabled={isLoading || !password}
            >
              {isLoading ? "Verifying..." : "Access Site"}
            </Button>
          </form>

          <div className="text-center pt-3 sm:pt-4 border-t border-gray-200">
            <p className="text-[10px] sm:text-xs text-gray-500">
              Don't have access?{" "}
              <a
                href="https://readyaimgo.biz"
                className="text-gold hover:text-gold-dark underline"
              >
                Visit Ready Aim Go
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function PasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[100dvh] flex items-center justify-center bg-gradient-to-br from-navy via-navy-dark to-navy-light px-4 py-6 sm:py-8">
        <div className="w-full max-w-sm sm:max-w-md">
          <div className="bg-offwhite rounded-lg shadow-xl p-5 sm:p-8 space-y-4 sm:space-y-6">
            <div className="text-center space-y-1 sm:space-y-2">
              <h1 className="text-xl sm:text-2xl font-bold text-navy">Site Access</h1>
              <p className="text-xs sm:text-sm text-gray-600">Loading...</p>
            </div>
          </div>
        </div>
      </div>
    }>
      <PasswordForm />
    </Suspense>
  )
}

