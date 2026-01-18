import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CreateIntakeLinkButton } from "@/components/admin/CreateIntakeLinkButton"

export default async function ClientsPage() {
  const { clientWorkspaceRepository } = await import(
    "@/lib/repositories/client-workspace-repository"
  )
  const workspaces = await clientWorkspaceRepository.findAll()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Client Workspaces</h1>
        <p className="text-muted-foreground mt-2">
          Central source of truth for documents, tasks, messages, and payments.
        </p>
      </div>

      <div className="grid gap-4">
        {workspaces.length === 0 ? (
          <Card>
            <CardContent className="py-10 text-center text-muted-foreground">
              No client workspaces yet.
            </CardContent>
          </Card>
        ) : (
          workspaces.map((workspace) => (
            <Card key={workspace.id}>
              <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div>
                  <CardTitle>{workspace.displayName}</CardTitle>
                  <CardDescription>
                    {workspace.primaryContact?.email || "No contact email"} •{" "}
                    {workspace.status.toUpperCase()}
                  </CardDescription>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Button asChild size="sm" variant="outline">
                    <Link href={`/admin/clients/${workspace.id}`}>Open workspace</Link>
                  </Button>
                  <CreateIntakeLinkButton workspaceId={workspace.id} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground">
                  Tax years: {workspace.taxYears.join(", ") || "Not selected"}
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {workspace.tags.map((tag) => (
                    <span key={tag} className="text-xs px-2 py-1 rounded bg-muted">
                      {tag}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
