import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { prisma } from "@/lib/db/prisma"
import {
  INTUIT_OAUTH_STATE_COOKIE,
  exchangeAuthorizationCodeForTokens,
  getIntuitOAuthConfig,
  isIntuitOAuthStateFresh,
  parseIntuitOAuthState,
  type IntuitOAuthState,
} from "@/lib/intuit/oauth"

function redirectAfterCallback(
  request: NextRequest,
  state: IntuitOAuthState | null,
  params?: Record<string, string>
): NextResponse {
  const path = state?.actor === "client" ? "/client" : "/admin/integrations/quickbooks"
  const url = new URL(path, request.url)

  if (state?.actor === "admin") {
    url.searchParams.set("clientWorkspaceId", state.clientWorkspaceId)
  }

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
  const stateValue = searchParams.get("state")
  const oauthError = searchParams.get("error")

  let parsedState: IntuitOAuthState | null = null
  if (stateValue) {
    try {
      parsedState = parseIntuitOAuthState(stateValue)
    } catch {
      parsedState = null
    }
  }

  if (oauthError) {
    return redirectAfterCallback(request, parsedState, {
      error: oauthError,
    })
  }

  if (!code || !realmId || !stateValue) {
    return redirectAfterCallback(request, parsedState, {
      error: "missing_oauth_params",
    })
  }

  const cookieStore = await cookies()
  const storedState = cookieStore.get(INTUIT_OAUTH_STATE_COOKIE)?.value

  if (!storedState || storedState !== stateValue || !parsedState || !isIntuitOAuthStateFresh(parsedState)) {
    return redirectAfterCallback(request, parsedState, {
      error: "invalid_oauth_state",
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
      where: { clientWorkspaceId: parsedState.clientWorkspaceId },
      create: {
        tenantId: parsedState.tenantId,
        clientWorkspaceId: parsedState.clientWorkspaceId,
        name: parsedState.workspaceName ?? `Workspace ${parsedState.clientWorkspaceId}`,
      },
      update: {
        tenantId: parsedState.tenantId,
        name: parsedState.workspaceName ?? undefined,
      },
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

    return redirectAfterCallback(request, parsedState, {
      connected: "1",
    })
  } catch (error) {
    console.error("Intuit callback failed:", error)
    return redirectAfterCallback(request, parsedState, {
      error: "token_exchange_failed",
    })
  }
}
