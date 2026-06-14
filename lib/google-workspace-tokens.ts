import "server-only"
import { integrationRepository } from "@/lib/repositories/integration-repository"

const REFRESH_SAFETY_WINDOW_MS = 2 * 60 * 1000

export async function getGoogleWorkspaceAccessToken(tenantId: string): Promise<string> {
  const integration = await integrationRepository.getGoogleWorkspaceIntegration(tenantId)
  if (!integration.connected) {
    throw new Error("Google Workspace is not connected")
  }

  const tokens = await integrationRepository.getGoogleWorkspaceTokens(tenantId)
  const expiresAt = integration.tokenMetadata.accessTokenExpiresAt
    ? new Date(integration.tokenMetadata.accessTokenExpiresAt).getTime()
    : 0

  if (tokens.accessToken && expiresAt - REFRESH_SAFETY_WINDOW_MS > Date.now()) {
    return tokens.accessToken
  }

  if (!tokens.refreshToken) {
    throw new Error("Google refresh token is not stored; reconnect Google Workspace")
  }
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    throw new Error("Google OAuth credentials are not configured")
  }

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      refresh_token: tokens.refreshToken,
      grant_type: "refresh_token",
    }),
  })

  if (!response.ok) {
    const raw = await response.text().catch(() => "")
    throw new Error(raw || `Google token refresh failed (${response.status})`)
  }

  const data = (await response.json()) as {
    access_token?: string
    expires_in?: number
    scope?: string
    token_type?: string
  }
  if (!data.access_token) {
    throw new Error("Google token refresh returned no access token")
  }

  await integrationRepository.updateGoogleWorkspaceTokens({
    tenantId,
    accessToken: data.access_token,
    accessTokenExpiresAt: data.expires_in
      ? new Date(Date.now() + data.expires_in * 1000).toISOString()
      : null,
    tokenType: data.token_type ?? integration.tokenMetadata.tokenType,
    scopes: data.scope ? data.scope.split(" ").filter(Boolean) : integration.scopes,
  })

  return data.access_token
}
