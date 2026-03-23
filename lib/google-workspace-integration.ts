import type { GoogleWorkspaceIntegration } from "@/lib/types/google-workspace-integration"

export const GOOGLE_FORMS_SCOPES = [
  "openid",
  "email",
  "profile",
  "https://www.googleapis.com/auth/forms.body.readonly",
  "https://www.googleapis.com/auth/forms.responses.readonly",
]

export const DEFAULT_GOOGLE_WORKSPACE_INTEGRATION = (
  tenantId: string
): GoogleWorkspaceIntegration => ({
  id: `${tenantId}_google_workspace`,
  tenantId,
  provider: "google_workspace",
  connected: false,
  googleEmail: null,
  googleUserId: null,
  scopes: [],
  tokenMetadata: {
    accessTokenExpiresAt: null,
    tokenType: null,
    hasRefreshToken: false,
    refreshTokenStored: false,
  },
  connectedByUserId: null,
  connectedAt: null,
  updatedAt: new Date(0).toISOString(),
})

export function getGoogleIntegrationStatusNotice(status?: string | null) {
  if (!status) return null
  switch (status) {
    case "connected":
      return "Google Workspace is connected for this organization."
    case "disconnected":
      return "Google Workspace was disconnected for this organization."
    case "missing_config":
      return "Google OAuth is not configured yet. Add Google client credentials before connecting."
    case "oauth_denied":
      return "Google connection was cancelled before consent completed."
    case "oauth_failed":
      return "Google connection failed during callback processing."
    default:
      return null
  }
}

