import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { canViewMessageContent } from "@/lib/rbac"
import { listMessageMeta } from "@/lib/messages"
import { MessagingInbox } from "./MessagingInbox"

export default async function MessagingPage({
  searchParams,
}: {
  searchParams?: Promise<{ clientId?: string; id?: string }>
}) {
  const user = await getCurrentUser()
  if (!user) redirect("/admin/login")

  const params = searchParams ? await searchParams : {}
  const workspaceId = params.clientId
  const selectedId = params.id

  const { data: metaList, error } = await listMessageMeta(workspaceId)
  const canViewContent = canViewMessageContent(user)

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Messaging</h1>
          <p className="text-muted-foreground mt-2">
            Unified inbox (metadata). Full content visible to owner only.
          </p>
          {workspaceId && (
            <p className="text-sm text-muted-foreground mt-1">
              Filtered by workspace: {workspaceId}
            </p>
          )}
        </div>
      </div>

      <MessagingInbox
        metaList={metaList ?? []}
        error={error ?? null}
        selectedId={selectedId}
        canViewContent={canViewContent}
      />
    </div>
  )
}
