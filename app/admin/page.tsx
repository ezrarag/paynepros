import { redirect } from "next/navigation"
import { Suspense } from "react"
import { TodayFocusCard } from "@/components/admin/command-center/TodayFocusCard"
import { ClientQueue } from "@/components/admin/command-center/ClientQueue"
import { InboxSummary } from "@/components/admin/command-center/InboxSummary"
import { getCurrentUser } from "@/lib/auth"
import { listMessageMeta } from "@/lib/messages"
import { getMessageMetaMetrics } from "@/lib/mock/admin"
import {
  getTodayFocusMetrics,
  getClientQueue,
  mockWorkspaces,
} from "@/lib/mock/commandCenter"
import type { MessageSummary } from "@/lib/types/command-center"

export default async function AdminDashboard() {
  const user = await getCurrentUser()
  if (!user) {
    redirect("/admin/login")
  }

  const { data: metaList } = await listMessageMeta()
  const messageMetaMetrics = getMessageMetaMetrics(user.tenantId)
  const metrics = getTodayFocusMetrics()
  const mergedMetrics = {
    ...metrics,
    unreadMessagesTotal: messageMetaMetrics.unreadMessagesTotal,
  }
  const clientQueue = getClientQueue()

  const recentMessages: Array<MessageSummary & { clientName: string }> = (metaList ?? [])
    .sort((a, b) => new Date(b.receivedAt).getTime() - new Date(a.receivedAt).getTime())
    .slice(0, 5)
    .map((m) => ({
      workspaceId: m.workspaceId,
      channel: (m.channel === "facebook" ? "ig" : m.channel) as MessageSummary["channel"],
      unreadCount: m.unread ? 1 : 0,
      lastSnippet: m.snippetMasked ?? "",
      lastAt: m.receivedAt,
      clientName: mockWorkspaces.find((w) => w.id === m.workspaceId)?.clientName ?? "Unknown",
    }))
  const totalUnread = messageMetaMetrics.unreadMessagesTotal

  const today = new Date()
  const formattedDate = today.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">DeTania Daily Command Center</h1>
        <p className="text-muted-foreground mt-2">{formattedDate}</p>
      </div>

      <Suspense fallback={<div className="h-32 rounded-lg border bg-muted animate-pulse" />}>
        <TodayFocusCard metrics={mergedMetrics} />
      </Suspense>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Suspense fallback={<div className="h-96 rounded-lg border bg-muted animate-pulse" />}>
            <ClientQueue items={clientQueue} />
          </Suspense>
        </div>
        <div className="lg:col-span-1">
          <Suspense fallback={<div className="h-96 rounded-lg border bg-muted animate-pulse" />}>
            <InboxSummary recentMessages={recentMessages} totalUnread={totalUnread} />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
