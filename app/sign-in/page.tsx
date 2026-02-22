import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, User } from "lucide-react"

export default function SignInSelectionPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-16">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="text-3xl font-semibold tracking-tight text-[#2f2a22] sm:text-4xl">
          Sign In
        </h1>
        <p className="mt-3 text-sm text-[#5d5547] sm:text-base">
          Choose your access type to continue.
        </p>
      </div>

      <div className="mt-8 grid gap-4 sm:mt-10 sm:grid-cols-2">
        <Card className="border-[#c8c0ad] bg-[#fbf9f4]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-[#2f2a22]">
              <User className="h-5 w-5" />
              Client
            </CardTitle>
            <CardDescription className="text-[#5d5547]">
              Access your client portal and workspace updates.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/client/login">Continue as Client</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="border-[#c8c0ad] bg-[#fbf9f4]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-[#2f2a22]">
              <Shield className="h-5 w-5" />
              Admin
            </CardTitle>
            <CardDescription className="text-[#5d5547]">
              Continue to admin login, then select your team member (DeTania, Ezra, Nija, etc.).
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/admin/login">Continue as Admin</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
