import { Suspense } from "react"
import ClientLoginClient from "./ClientLoginClient"

export default async function ClientLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
          <div className="w-full max-w-md h-96 rounded-lg border bg-card animate-pulse" />
        </div>
      }
    >
      <ClientLoginClient />
    </Suspense>
  )
}
