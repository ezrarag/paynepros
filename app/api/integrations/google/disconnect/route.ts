import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { integrationRepository } from "@/lib/repositories/integration-repository"
import { getBaseUrl } from "@/lib/utils/url"

function getSafeReturnTo(value: string | null) {
  return value && value.startsWith("/admin") ? value : "/admin/integrations"
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.redirect(new URL("/admin/login", getBaseUrl(request)))
  }
  const formData = await request.formData()
  const returnTo = getSafeReturnTo(
    typeof formData.get("returnTo") === "string" ? String(formData.get("returnTo")) : null
  )

  await integrationRepository.disconnectGoogleWorkspaceIntegration(user.tenantId, user.id)

  const destination = new URL(returnTo, getBaseUrl(request))
  destination.searchParams.set("google", "disconnected")
  return NextResponse.redirect(destination)
}
