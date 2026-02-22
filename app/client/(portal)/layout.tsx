import { requireClientAuth } from "@/lib/auth"

export default async function ClientPortalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await requireClientAuth()

  return <div className="min-h-screen bg-muted/20">{children}</div>
}
