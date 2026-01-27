"use client"

import { useState } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Check } from "lucide-react"

const features = [
  "Bookkeeping team access",
  "Marketing team support",
  "Logistics coordination",
  "Transportation requests",
  "Housing assistance",
  "Wallet & allocations",
  "Messaging aggregator",
  "Content request panel",
  "Pulse daily summaries",
]

export default function SubscriptionPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const searchParams = useSearchParams()
  const lockedModule = searchParams.get("locked")

  const handleActivate = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await fetch("/api/subscription/create-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to create checkout session")
      }

      const data = await response.json()
      
      if (data.url) {
        // Redirect to Stripe Checkout
        window.location.href = data.url
      } else {
        throw new Error("No checkout URL received")
      }
    } catch (error: any) {
      console.error("Error creating checkout session:", error)
      setError(error.message || "Failed to activate subscription. Please try again.")
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">C-Suite Subscription</h1>
        <p className="text-muted-foreground mt-2">
          Activate your Readyaimgo C-Suite plan to unlock all admin features
        </p>
      </div>

      {lockedModule && (
        <Card className="max-w-2xl border-amber-200 bg-amber-50">
          <CardHeader>
            <CardTitle>Module locked</CardTitle>
            <CardDescription>
              Activate Readyaimgo to unlock {lockedModule.toLowerCase()} tools and
              workflows.
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Readyaimgo C-Suite Plan</CardTitle>
          <CardDescription>
            Comprehensive business support and management tools
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-4">What's Included:</h3>
            <ul className="space-y-2">
              {features.map((feature) => (
                <li key={feature} className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-green-500" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="pt-4 border-t">
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}
            <Button
              onClick={handleActivate}
              disabled={isLoading}
              className="w-full"
              size="lg"
            >
              {isLoading ? "Processing..." : "Activate Subscription"}
            </Button>
            <p className="text-xs text-muted-foreground text-center mt-2">
              You'll be redirected to Stripe to complete payment
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

