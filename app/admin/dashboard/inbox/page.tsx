import { redirect } from "next/navigation"
import Link from "next/link"
import { getCurrentUser } from "@/lib/auth"
import { listMessageMeta } from "@/lib/messages"
import { getMessageMetaMetrics } from "@/lib/mock/admin"
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
  let totalUnread = 0
  let recentMessages: Array<MessageSummary & { clientName: string }> = []

  if (hasConnectedInbox) {
    const result = await listMessageMeta()
    const metaList = result.data ?? []
    totalUnread = getMessageMetaMetrics(user.tenantId).unreadMessagesTotal
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
          clientName: workspace?.displayName ?? "Unknown",
        }
      })
  }

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
            hasConnectedInbox={hasConnectedInbox}
          />
        </CardContent>
      </Card>
    </div>
  )
}
