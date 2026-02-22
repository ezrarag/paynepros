"use client"

import { useMemo, useState } from "react"
import { signIn } from "next-auth/react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type ClientLoginOption = {
  workspaceId: string
  name: string
  email: string
}

interface ClientLoginClientProps {
  clientOptions: ClientLoginOption[]
}

export default function ClientLoginClient({ clientOptions }: ClientLoginClientProps) {
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get("callbackUrl") ?? "/client"

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("temp123")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const quickClients = useMemo(() => clientOptions.slice(0, 12), [clientOptions])

  const handleSignIn = async () => {
    if (!email || !password) {
      setError("Enter both email and password.")
      return
    }

    setIsLoading(true)
    setError(null)

    const result = await signIn("client", {
      email,
      password,
      callbackUrl,
      redirect: false,
    })

    if (result?.error) {
      setError("Invalid credentials. Use a client email and temp123.")
      setIsLoading(false)
      return
    }

    if (result?.ok) {
      window.location.href = callbackUrl
      return
    }

    setError("Sign in failed. Please try again.")
    setIsLoading(false)
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

          <Button className="w-full" onClick={handleSignIn} disabled={isLoading}>
            {isLoading ? "Signing in..." : "Sign In"}
          </Button>

          {quickClients.length > 0 && (
            <div className="space-y-2 border-t pt-4">
              <p className="text-xs text-muted-foreground">Quick-fill test users</p>
              <div className="flex flex-wrap gap-2">
                {quickClients.map((client) => (
                  <Button
                    key={client.workspaceId}
                    variant="outline"
                    size="sm"
                    className="h-auto py-1"
                    onClick={() => setEmail(client.email)}
                  >
                    {client.name}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
