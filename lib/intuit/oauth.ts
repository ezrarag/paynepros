import crypto from "node:crypto"

const INTUIT_AUTHORIZATION_URL = "https://appcenter.intuit.com/connect/oauth2"
const INTUIT_TOKEN_URL = "https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer"
const INTUIT_SCOPE = "com.intuit.quickbooks.accounting"
const OAUTH_STATE_MAX_AGE_MS = 10 * 60 * 1000

export const INTUIT_OAUTH_STATE_COOKIE = "intuit_oauth_state"

export type IntuitEnvironment = "sandbox" | "production"

export interface IntuitOAuthConfig {
  clientId: string
  clientSecret: string
  redirectUri: string
  environment: IntuitEnvironment
}

export interface IntuitOAuthState {
  tenantId: string
  nonce: string
  createdAt: number
}

export interface IntuitTokenResponse {
  token_type: string
  access_token: string
  refresh_token: string
  expires_in: number
  x_refresh_token_expires_in?: number
  scope?: string
  id_token?: string
}

function requiredEnv(name: string): string {
  const value = process.env[name]
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`)
  }
  return value
}

export function getIntuitOAuthConfig(): IntuitOAuthConfig {
  const rawEnvironment = (process.env.INTUIT_ENVIRONMENT ?? "sandbox").toLowerCase()
  if (rawEnvironment !== "sandbox" && rawEnvironment !== "production") {
    throw new Error("INTUIT_ENVIRONMENT must be either 'sandbox' or 'production'.")
  }

  return {
    clientId: requiredEnv("INTUIT_CLIENT_ID"),
    clientSecret: requiredEnv("INTUIT_CLIENT_SECRET"),
    redirectUri: requiredEnv("INTUIT_REDIRECT_URI"),
    environment: rawEnvironment,
  }
}

export function getIntuitApiBaseUrl(environment: IntuitEnvironment): string {
  if (environment === "production") {
    return "https://quickbooks.api.intuit.com"
  }
  return "https://sandbox-quickbooks.api.intuit.com"
}

export function createIntuitOAuthState(tenantId: string): string {
  const payload: IntuitOAuthState = {
    tenantId,
    nonce: crypto.randomUUID(),
    createdAt: Date.now(),
  }

  return Buffer.from(JSON.stringify(payload)).toString("base64url")
}

export function parseIntuitOAuthState(state: string): IntuitOAuthState {
  const decoded = Buffer.from(state, "base64url").toString("utf8")
  const parsed = JSON.parse(decoded) as Partial<IntuitOAuthState>

  if (!parsed.tenantId || !parsed.nonce || !parsed.createdAt) {
    throw new Error("Invalid OAuth state payload")
  }

  return {
    tenantId: parsed.tenantId,
    nonce: parsed.nonce,
    createdAt: parsed.createdAt,
  }
}

export function isIntuitOAuthStateFresh(state: IntuitOAuthState): boolean {
  return Date.now() - state.createdAt <= OAUTH_STATE_MAX_AGE_MS
}

export function buildIntuitAuthorizationUrl(state: string): string {
  const { clientId, redirectUri } = getIntuitOAuthConfig()

  const params = new URLSearchParams({
    client_id: clientId,
    response_type: "code",
    scope: INTUIT_SCOPE,
    redirect_uri: redirectUri,
    state,
  })

  return `${INTUIT_AUTHORIZATION_URL}?${params.toString()}`
}

async function requestToken(params: URLSearchParams): Promise<IntuitTokenResponse> {
  const { clientId, clientSecret } = getIntuitOAuthConfig()

  const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64")
  const response = await fetch(INTUIT_TOKEN_URL, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basicAuth}`,
      Accept: "application/json",
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params.toString(),
    cache: "no-store",
  })

  if (!response.ok) {
    const rawBody = await response.text()
    throw new Error(`Intuit token request failed (${response.status}): ${rawBody}`)
  }

  return (await response.json()) as IntuitTokenResponse
}

export async function exchangeAuthorizationCodeForTokens(
  authorizationCode: string
): Promise<IntuitTokenResponse> {
  return requestToken(
    new URLSearchParams({
      grant_type: "authorization_code",
      code: authorizationCode,
      redirect_uri: getIntuitOAuthConfig().redirectUri,
    })
  )
}

export async function refreshAccessToken(refreshToken: string): Promise<IntuitTokenResponse> {
  return requestToken(
    new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    })
  )
}
