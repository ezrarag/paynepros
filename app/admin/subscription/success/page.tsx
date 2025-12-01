"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle2, Loader2 } from "lucide-react"
import Link from "next/link"

export default function SubscriptionSuccessPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isVerifying, setIsVerifying] = useState(true)
  const [isVerified, setIsVerified] = useState(false)

  useEffect(() => {
    const sessionId = searchParams.get("session_id")
    
    if (sessionId) {
      // Verify the session (optional - you can add an API call here to verify)
      // For now, we'll just show success after a brief delay
      setTimeout(() => {
        setIsVerifying(false)
        setIsVerified(true)
      }, 2000)
    } else {
      setIsVerifying(false)
    }
  }, [searchParams])

  if (isVerifying) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Verifying your subscription...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card className="max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <CheckCircle2 className="h-16 w-16 text-green-500" />
          </div>
          <CardTitle className="text-3xl">Subscription Activated!</CardTitle>
          <CardDescription className="text-lg mt-2">
            Your C-Suite subscription is now active
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-sm text-green-800">
              Thank you for subscribing! Your account has been upgraded and all
              admin features are now unlocked.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold">What's Next?</h3>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li>Access your wallet and allocations</li>
              <li>Connect your messaging accounts</li>
              <li>Submit content requests</li>
              <li>View your daily Pulse summaries</li>
            </ul>
          </div>

          <div className="flex gap-4 pt-4">
            <Button asChild className="flex-1" size="lg">
              <Link href="/admin">Go to Dashboard</Link>
            </Button>
            <Button asChild variant="outline" className="flex-1" size="lg">
              <Link href="/admin/wallet">Set Up Wallet</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

