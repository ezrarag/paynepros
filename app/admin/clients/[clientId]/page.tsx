import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default async function ClientWorkspacePage({
  params,
}: {
  params: { clientId: string }
}) {
  const { clientWorkspaceRepository } = await import(
    "@/lib/repositories/client-workspace-repository"
  )
  const workspace = await clientWorkspaceRepository.findById(params.clientId)
  const timeline = workspace
    ? await clientWorkspaceRepository.getTimeline(params.clientId)
    : []

  if (!workspace) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Workspace not found</CardTitle>
          <CardDescription>
            We couldn't locate this client workspace.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild variant="outline">
            <Link href="/admin/clients">Back to clients</Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">{workspace.displayName}</h1>
          <p className="text-muted-foreground mt-2">
            Workspace status: {workspace.status.toUpperCase()}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild variant="outline">
            <Link href="/admin/clients">Back to clients</Link>
          </Button>
          <Button asChild>
            <Link href="/admin/messaging">Open inbox</Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Contact</CardTitle>
            <CardDescription>Primary client details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div>{workspace.primaryContact?.name || "Name not set"}</div>
            <div>{workspace.primaryContact?.email || "Email not set"}</div>
            <div>{workspace.primaryContact?.phone || "Phone not set"}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tax Profile</CardTitle>
            <CardDescription>Selected tax years</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div>{workspace.taxYears.join(", ") || "No tax years selected"}</div>
            <div className="flex flex-wrap gap-2">
              {workspace.tags.map((tag) => (
                <span key={tag} className="text-xs px-2 py-1 rounded bg-muted">
                  {tag}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payment Status</CardTitle>
            <CardDescription>Stripe Connect summary</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Payments, deposits, and installment status will appear here.
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Timeline</CardTitle>
          <CardDescription>Messages, documents, tasks, payments</CardDescription>
        </CardHeader>
        <CardContent>
          {timeline.length === 0 ? (
            <div className="text-sm text-muted-foreground py-6 text-center">
              No activity yet.
            </div>
          ) : (
            <div className="space-y-4">
              {timeline.map((event) => (
                <div key={event.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-sm font-medium">{event.title}</div>
                      {event.description && (
                        <div className="text-sm text-muted-foreground mt-1">
                          {event.description}
                        </div>
                      )}
                      <span className="text-xs px-2 py-1 bg-muted rounded mt-2 inline-block">
                        {event.type}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(event.createdAt).toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Tasks</CardTitle>
            <CardDescription>Auto-generated and assigned tasks</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Task automation will appear here (missing docs, clarifications, signatures).
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Documents</CardTitle>
            <CardDescription>Uploaded files and AI tags</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Document ingestion and tagging will appear here.
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
