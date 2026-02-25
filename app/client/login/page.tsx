import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import MagicLinkForm from "./MagicLinkForm"

export default function ClientLoginPage() {
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
          <MagicLinkForm />
        </CardContent>
      </Card>
    </div>
  )
}
