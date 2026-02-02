import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { listMessageMetaByTenant } from "@/lib/mock/admin"

export async function GET(request: Request) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const workspaceId = searchParams.get("workspaceId") ?? undefined

  const list = listMessageMetaByTenant(user.tenantId, workspaceId)
  return NextResponse.json({ data: list })
}
