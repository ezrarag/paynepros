import { NextRequest, NextResponse } from "next/server"
import { integrationRepository } from "@/lib/repositories/integration-repository"
import { integrationOAuthStateRepository } from "@/lib/repositories/integration-oauth-state-repository"
import { getBaseUrl } from "@/lib/utils/url"

function buildRedirect(request: NextRequest, returnTo: string, status: string) {
  const destination = new URL(returnTo, getBaseUrl(request))
  destination.searchParams.set("google", status)
  return NextResponse.redirect(destination)
}

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code")
  const stateId = request.nextUrl.searchParams.get("state")
  const googleError = request.nextUrl.searchParams.get("error")

  if (!stateId) {
    return NextResponse.redirect(new URL("/admin/integrations?google=oauth_failed", getBaseUrl(request)))
  }

  const oauthState = await integrationOAuthStateRepository.consume(stateId)
  if (!oauthState) {
    return NextResponse.redirect(new URL("/admin/integrations?google=oauth_failed", getBaseUrl(request)))
  }

  if (new Date(oauthState.expiresAt).getTime() < Date.now()) {
    return buildRedirect(request, oauthState.returnTo, "oauth_failed")
  }

  if (googleError === "access_denied") {
    return buildRedirect(request, oauthState.returnTo, "oauth_denied")
  }

  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    return buildRedirect(request, oauthState.returnTo, "missing_config")
  }

  if (!code) {
    return buildRedirect(request, oauthState.returnTo, "oauth_failed")
  }

  try {
    const redirectUri = `${getBaseUrl(request)}/api/integrations/google/callback`
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    })

    if (!tokenResponse.ok) {
      const tokenError = await tokenResponse.text().catch(() => "")
      console.error("Google OAuth token exchange failed:", tokenError)
      return buildRedirect(request, oauthState.returnTo, "oauth_failed")
    }

    const tokenData = (await tokenResponse.json()) as {
      access_token?: string
      expires_in?: number
      refresh_token?: string
      scope?: string
      token_type?: string
    }

    if (!tokenData.access_token) {
      return buildRedirect(request, oauthState.returnTo, "oauth_failed")
    }

    const userInfoResponse = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    })

    if (!userInfoResponse.ok) {
      const userInfoError = await userInfoResponse.text().catch(() => "")
      console.error("Google userinfo fetch failed:", userInfoError)
      return buildRedirect(request, oauthState.returnTo, "oauth_failed")
    }

    const userInfo = (await userInfoResponse.json()) as {
      sub?: string
      email?: string
    }

    if (!userInfo.sub || !userInfo.email) {
      return buildRedirect(request, oauthState.returnTo, "oauth_failed")
    }

    // TODO: Store Google refresh/access tokens securely once secret storage and rotation are in place.
    // For now, only org-level integration metadata is persisted so connect/disconnect/read-state flows work.
    await integrationRepository.upsertGoogleWorkspaceIntegration({
      tenantId: oauthState.tenantId,
      googleEmail: userInfo.email,
      googleUserId: userInfo.sub,
      scopes: (tokenData.scope ?? "").split(" ").filter(Boolean),
      tokenMetadata: {
        accessTokenExpiresAt: tokenData.expires_in
          ? new Date(Date.now() + tokenData.expires_in * 1000).toISOString()
          : null,
        tokenType: tokenData.token_type ?? null,
        hasRefreshToken: Boolean(tokenData.refresh_token),
        refreshTokenStored: false,
      },
      connectedByUserId: oauthState.userId,
    })

    return buildRedirect(request, oauthState.returnTo, "connected")
  } catch (error) {
    console.error("Google OAuth callback failed:", error)
    return buildRedirect(request, oauthState.returnTo, "oauth_failed")
  }
}
