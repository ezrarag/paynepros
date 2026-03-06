import { redirect } from "next/navigation"
import Link from "next/link"
import { getCurrentUser } from "@/lib/auth"
import { listMessageMeta } from "@/lib/messages"
import { integrationRepository } from "@/lib/repositories/integration-repository"
import { clientWorkspaceRepository } from "@/lib/repositories/client-workspace-repository"
import { InboxSummary } from "@/components/admin/command-center/InboxSummary"
import type { MessageSummary } from "@/lib/types/command-center"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default async function DashboardInboxPage() {
  const user = await getCurrentUser()
  if (!user) {
    redirect("/admin/login")
  }

  const workspaces = await clientWorkspaceRepository.findAll(50)
  const hasConnectedInbox = await integrationRepository.hasConnectedInbox(user.tenantId)
  const result = await listMessageMeta()
  const metaList = result.data ?? []
  const hasFallbackSubmissions = metaList.length > 0
  const shouldShowInbox = hasConnectedInbox || hasFallbackSubmissions
  const totalUnread = metaList.filter((meta) => meta.unread).length
  let recentMessages: Array<MessageSummary & { clientName: string }> = []

  recentMessages = metaList
    .sort((a, b) => new Date(b.receivedAt).getTime() - new Date(a.receivedAt).getTime())
    .slice(0, 20)
    .map((meta) => {
      const workspace = workspaces.find((w) => w.id === meta.workspaceId)
      return {
        workspaceId: meta.workspaceId,
        channel: (meta.channel === "facebook" ? "ig" : meta.channel) as MessageSummary["channel"],
        unreadCount: meta.unread ? 1 : 0,
        lastSnippet: meta.snippetMasked ?? "",
        lastAt: meta.receivedAt,
        clientName:
          workspace?.displayName ??
          (meta.workspaceId === "website-submissions" ? "Website submissions" : "Unknown"),
      }
    })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard Inbox</h1>
          <p className="text-muted-foreground mt-1">Unread and recent message activity.</p>
        </div>
        <Button asChild variant="outline">
          <Link href="/admin">Back to Dashboard</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Inbox Summary</CardTitle>
          <CardDescription>Connected channels and latest messages</CardDescription>
        </CardHeader>
        <CardContent>
          <InboxSummary
            recentMessages={recentMessages}
            totalUnread={totalUnread}
            hasConnectedInbox={shouldShowInbox}
          />
        </CardContent>
      </Card>
    </div>
  )
}
