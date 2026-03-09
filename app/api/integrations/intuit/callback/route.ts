import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { prisma } from "@/lib/db/prisma"
import {
  INTUIT_OAUTH_STATE_COOKIE,
  exchangeAuthorizationCodeForTokens,
  getIntuitOAuthConfig,
  isIntuitOAuthStateFresh,
  parseIntuitOAuthState,
} from "@/lib/intuit/oauth"

function buildDashboardRedirect(request: NextRequest, params?: Record<string, string>) {
  const url = new URL("/dashboard/quickbooks", request.url)
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.set(key, value)
    })
  }

  const response = NextResponse.redirect(url)
  response.cookies.set(INTUIT_OAUTH_STATE_COOKIE, "", {
    path: "/",
    maxAge: 0,
  })

  return response
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get("code")
  const realmId = searchParams.get("realmId")
  const state = searchParams.get("state")
  const oauthError = searchParams.get("error")

  if (oauthError) {
    return buildDashboardRedirect(request, {
      error: oauthError,
    })
  }

  if (!code || !realmId || !state) {
    return buildDashboardRedirect(request, {
      error: "missing_oauth_params",
    })
  }

  const cookieStore = await cookies()
  const storedState = cookieStore.get(INTUIT_OAUTH_STATE_COOKIE)?.value

  if (!storedState || storedState !== state) {
    return buildDashboardRedirect(request, {
      error: "invalid_oauth_state",
    })
  }

  let parsedState: { tenantId: string }

  try {
    const decodedState = parseIntuitOAuthState(state)
    if (!isIntuitOAuthStateFresh(decodedState)) {
      return buildDashboardRedirect(request, {
        error: "expired_oauth_state",
      })
    }
    parsedState = decodedState
  } catch {
    return buildDashboardRedirect(request, {
      error: "invalid_oauth_state_payload",
    })
  }

  try {
    const environment = getIntuitOAuthConfig().environment
    const tokenResponse = await exchangeAuthorizationCodeForTokens(code)

    const now = new Date()
    const accessTokenExpiresAt = new Date(now.getTime() + tokenResponse.expires_in * 1000)
    const refreshTokenExpiresAt = tokenResponse.x_refresh_token_expires_in
      ? new Date(now.getTime() + tokenResponse.x_refresh_token_expires_in * 1000)
      : null

    const organization = await prisma.organization.upsert({
      where: { tenantId: parsedState.tenantId },
      create: {
        tenantId: parsedState.tenantId,
        name: `Organization ${parsedState.tenantId}`,
      },
      update: {},
    })

    await prisma.intuitConnection.upsert({
      where: { organizationId: organization.id },
      create: {
        organizationId: organization.id,
        realmId,
        environment: environment === "production" ? "PRODUCTION" : "SANDBOX",
        accessToken: tokenResponse.access_token,
        refreshToken: tokenResponse.refresh_token,
        tokenType: tokenResponse.token_type,
        scope: tokenResponse.scope,
        accessTokenExpiresAt,
        refreshTokenExpiresAt,
        connectedAt: now,
        syncStatus: "IDLE",
        syncError: null,
      },
      update: {
        realmId,
        environment: environment === "production" ? "PRODUCTION" : "SANDBOX",
        accessToken: tokenResponse.access_token,
        refreshToken: tokenResponse.refresh_token,
        tokenType: tokenResponse.token_type,
        scope: tokenResponse.scope,
        accessTokenExpiresAt,
        refreshTokenExpiresAt,
        connectedAt: now,
        syncStatus: "IDLE",
        syncError: null,
      },
    })

    return buildDashboardRedirect(request, {
      connected: "1",
    })
  } catch (error) {
    console.error("Intuit callback failed:", error)
    return buildDashboardRedirect(request, {
      error: "token_exchange_failed",
    })
  }
}
