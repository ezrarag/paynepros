"use client"

import { useEffect, useState } from "react"
import { signIn } from "next-auth/react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function ClientLoginClient() {
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get("callbackUrl") ?? "/client"

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("temp123")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [csrfToken, setCsrfToken] = useState<string | null>(null)

  useEffect(() => {
    const fetchCsrf = async () => {
      try {
        const res = await fetch("/api/auth/csrf", {
          credentials: "include",
          headers: { Accept: "application/json" },
        })
        if (!res.ok) {
          throw new Error(`CSRF fetch failed: ${res.status}`)
        }
        const data = await res.json()
        setCsrfToken(data.csrfToken)
      } catch (err) {
        console.error("Failed to fetch CSRF token:", err)
        setError("Unable to initialize login security token. Refresh and try again.")
      }
    }
    fetchCsrf()
  }, [])

  const getCsrfToken = async (): Promise<string | null> => {
    try {
      const res = await fetch("/api/auth/csrf", {
        credentials: "include",
        headers: { Accept: "application/json" },
      })
      if (!res.ok) {
        throw new Error(`CSRF fetch failed: ${res.status}`)
      }
      const data = await res.json()
      setCsrfToken(data.csrfToken)
      return data.csrfToken
    } catch (err) {
      console.error("Failed to fetch CSRF token:", err)
      return null
    }
  }

  const handleSignIn = async () => {
    if (!email || !password) {
      setError("Enter both email and password.")
      return
    }

    setIsLoading(true)
    setError(null)
    try {
      const token = csrfToken ?? (await getCsrfToken())
      if (!token) {
        setError("Unable to initialize login security token. Refresh and try again.")
        setIsLoading(false)
        return
      }

      const result = await signIn("client", {
        email,
        password,
        callbackUrl,
        redirect: false,
      })

      if (result?.error) {
        if (result.error.toLowerCase().includes("csrf")) {
          setError("Security token expired. Refresh the page and try again.")
        } else {
          setError("Invalid credentials. Use a client email and temp123.")
        }
        setIsLoading(false)
        return
      }

      if (result?.ok) {
        window.location.href = callbackUrl
        return
      }

      setError("Sign in failed. Please try again.")
      setIsLoading(false)
    } catch (err) {
      console.error("Client sign-in failed:", err)
      setError("Sign in request failed. Please try again.")
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-[100dvh] flex items-center justify-center bg-muted/30 px-4 py-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Client Portal</CardTitle>
          <CardDescription>
            Sign in with your client email. Temporary password: <code>temp123</code>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="client-email">Email</Label>
            <Input
              id="client-email"
              type="email"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value)
                setError(null)
              }}
              placeholder="ezra@readyaimgo.biz"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="client-password">Password</Label>
            <Input
              id="client-password"
              type="password"
              value={password}
              onChange={(event) => {
                setPassword(event.target.value)
                setError(null)
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !isLoading) {
                  handleSignIn()
                }
              }}
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button className="w-full" onClick={handleSignIn} disabled={isLoading || !csrfToken}>
            {isLoading ? "Signing in..." : "Sign In"}
          </Button>

          <p className="text-xs text-muted-foreground border-t pt-4">
            Use a client primary-contact email and password <code>temp123</code>.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
