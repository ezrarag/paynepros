"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function PasswordPage() {
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-navy via-navy-dark to-navy-light px-4">
      <div className="w-full max-w-md">
        <div className="bg-offwhite rounded-lg shadow-xl p-8 space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold text-navy">Site Access</h1>
            <p className="text-sm text-gray-600">
              Please enter the password to access this site
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password" className="text-navy">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full"
                autoFocus
                disabled={isLoading}
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-gold text-navy hover:bg-gold-dark"
              disabled={isLoading || !password}
            >
              {isLoading ? "Verifying..." : "Access Site"}
            </Button>
          </form>

          <div className="text-center pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500">
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

