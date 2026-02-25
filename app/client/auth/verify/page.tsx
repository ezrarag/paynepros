import Link from "next/link"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { setClientPortalSession } from "@/lib/client-portal-session"
import { clientPortalAuthRepository } from "@/lib/repositories/client-portal-auth-repository"

export default async function ClientVerifyPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>
}) {
  const { token } = await searchParams

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Invalid link</CardTitle>
            <CardDescription>This sign-in link is missing a token.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline">
              <Link href="/client/login">Back to login</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const sessionData = await clientPortalAuthRepository.consumeMagicLink(token)
  if (!sessionData) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Link expired or already used</CardTitle>
            <CardDescription>
              Request a new sign-in link and try again.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline">
              <Link href="/client/login">Back to login</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  await setClientPortalSession({
    workspaceId: sessionData.workspaceId,
    email: sessionData.email,
  })

  redirect("/client")
}
