import { randomUUID } from "crypto"
import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { GOOGLE_FORMS_SCOPES } from "@/lib/google-workspace-integration"
import { integrationOAuthStateRepository } from "@/lib/repositories/integration-oauth-state-repository"
import { getBaseUrl } from "@/lib/utils/url"

function getSafeReturnTo(value: string | null) {
  return value && value.startsWith("/admin") ? value : "/admin/integrations"
}

export async function GET(request: NextRequest) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.redirect(new URL("/admin/login", getBaseUrl(request)))
  }
  const returnTo = getSafeReturnTo(request.nextUrl.searchParams.get("returnTo"))

  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    const destination = new URL(returnTo, getBaseUrl(request))
    destination.searchParams.set("google", "missing_config")
    return NextResponse.redirect(destination)
  }

  const stateId = randomUUID()
  await integrationOAuthStateRepository.create({
    id: stateId,
    provider: "google_workspace",
    tenantId: user.tenantId,
    userId: user.id,
    returnTo,
    expiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
  })

  const redirectUri = `${getBaseUrl(request)}/api/integrations/google/callback`
  const authUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth")
  authUrl.searchParams.set("client_id", process.env.GOOGLE_CLIENT_ID)
  authUrl.searchParams.set("redirect_uri", redirectUri)
  authUrl.searchParams.set("response_type", "code")
  authUrl.searchParams.set("scope", GOOGLE_FORMS_SCOPES.join(" "))
  authUrl.searchParams.set("access_type", "offline")
  authUrl.searchParams.set("include_granted_scopes", "true")
  authUrl.searchParams.set("prompt", "consent")
  authUrl.searchParams.set("state", stateId)

  return NextResponse.redirect(authUrl)
}
