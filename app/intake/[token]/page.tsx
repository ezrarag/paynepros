import { IntakeFlow } from "@/components/intake/IntakeFlow"
import { verifyIntakeLinkToken } from "@/lib/intake/link-token"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function IntakePage({ params }: { params: { token: string } }) {
  const verification = verifyIntakeLinkToken(params.token)
  if (verification.status !== "valid") {
    const invalidMessage =
      verification.status === "expired"
        ? "This intake link has expired."
        : "This intake link is invalid."

    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="w-full max-w-2xl">
          <div className="mb-6">
            <h1 className="text-3xl font-bold">PaynePros Intake</h1>
            <p className="text-muted-foreground mt-2">
              Complete the intake so we can keep your workspace up to date.
            </p>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Intake link unavailable</CardTitle>
              <CardDescription>{invalidMessage}</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">PaynePros Intake</h1>
          <p className="text-muted-foreground mt-2">
            Complete the intake so we can keep your workspace up to date.
          </p>
        </div>
        <IntakeFlow token={params.token} workspaceId={verification.payload.workspaceId} />
      </div>
    </div>
  )
}
