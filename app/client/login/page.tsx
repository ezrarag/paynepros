import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import MagicLinkForm from "./MagicLinkForm"

const verifyErrorMessages: Record<string, string> = {
  invalid_link: "This sign-in link is invalid.",
  link_expired: "This sign-in link is expired or already used.",
  verify_failed: "We hit a server error while verifying your link. Please request a new one.",
}

export default async function ClientLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const { error } = await searchParams
  const verifyError = error ? verifyErrorMessages[error] ?? null : null

  return (
    <div className="min-h-[100dvh] flex items-center justify-center bg-muted/30 px-4 py-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Client Portal</CardTitle>
          <CardDescription>
            Enter your client email and we will generate a one-time sign-in link.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {verifyError && <p className="text-sm text-destructive">{verifyError}</p>}
          <MagicLinkForm />
        </CardContent>
      </Card>
    </div>
  )
}
