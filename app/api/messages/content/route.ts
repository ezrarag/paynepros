import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { canViewMessageContent } from "@/lib/rbac"
import { getMessageContentByTenantAndId } from "@/lib/mock/admin"

export async function GET(request: Request) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  if (!canViewMessageContent(user)) {
    return NextResponse.json(
      { error: "Forbidden: message content is owner-only" },
      { status: 403 }
    )
  }

  const { searchParams } = new URL(request.url)
  const id = searchParams.get("id")
  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 })
  }

  const content = getMessageContentByTenantAndId(user.tenantId, id)
  if (!content) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  return NextResponse.json({ data: content })
}
