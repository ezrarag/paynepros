"use client"

import { signIn } from "next-auth/react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Shield, Users } from "lucide-react"

const TEST_USERS = [
  {
    email: "detania@paynepros.com",
    name: "DeTania",
    role: "OWNER" as const,
    description: "Full access: integrations, message content",
  },
  {
    email: "nija@paynepros.com",
    name: "Nija",
    role: "STAFF" as const,
    description: "Masked inbox, urgency, tasks",
  },
  {
    email: "ezra@paynepros.com",
    name: "Ezra",
    role: "STAFF" as const,
    description: "Masked inbox, urgency, tasks",
  },
]

export default function AdminLoginPage() {
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get("callbackUrl") ?? "/admin"

  async function signInAs(email: string) {
    await signIn("admin", {
      email,
      password: "dev",
      callbackUrl,
    })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">PaynePros Admin</CardTitle>
          <CardDescription>
            Sign in to access the admin dashboard (tenant: paynepros)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground text-center">
            Choose a test user for local development:
          </p>
          <div className="space-y-2">
            {TEST_USERS.map((user) => (
              <Button
                key={user.email}
                variant="outline"
                className="w-full h-auto py-4 flex flex-col items-center gap-1"
                onClick={() => signInAs(user.email)}
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
                <span className="text-xs text-muted-foreground max-w-[240px] text-center">
                  {user.description}
                </span>
              </Button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground text-center pt-2">
            No password required for local test users.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
