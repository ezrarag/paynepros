import { Suspense } from "react"
import SubscriptionClient from "./SubscriptionClient"

export default function SubscriptionPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-6 max-w-2xl">
          <div>
            <h1 className="text-3xl font-bold">C-Suite Subscription</h1>
            <p className="text-muted-foreground mt-2">
              Loading subscription details…
            </p>
          </div>

          <div className="h-40 rounded-lg border bg-muted animate-pulse" />
        </div>
      }
    >
      <SubscriptionClient />
    </Suspense>
  )
}
