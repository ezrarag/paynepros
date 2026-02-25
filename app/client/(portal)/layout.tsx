import { requireClientPortalSession } from "@/lib/client-portal-session"

export default async function ClientPortalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await requireClientPortalSession()

  return <div className="min-h-screen bg-muted/20">{children}</div>
}
