import { Suspense } from "react"
import { clientWorkspaceRepository } from "@/lib/repositories/client-workspace-repository"
import ClientLoginClient from "./ClientLoginClient"

export default async function ClientLoginPage() {
  const workspaces = await clientWorkspaceRepository.findAll(200)
  const clientOptions = workspaces
    .filter((workspace) => workspace.primaryContact?.email)
    .map((workspace) => ({
      workspaceId: workspace.id,
      name: workspace.displayName,
      email: workspace.primaryContact?.email ?? "",
    }))

  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
          <div className="w-full max-w-md h-96 rounded-lg border bg-card animate-pulse" />
        </div>
      }
    >
      <ClientLoginClient clientOptions={clientOptions} />
    </Suspense>
  )
}
