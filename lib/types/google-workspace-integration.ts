export interface GoogleWorkspaceTokenMetadata {
  accessTokenExpiresAt?: string | null
  tokenType?: string | null
  hasRefreshToken: boolean
  refreshTokenStored: boolean
}

export interface GoogleWorkspaceIntegration {
  id: string
  tenantId: string
  provider: "google_workspace"
  connected: boolean
  googleEmail: string | null
  googleUserId: string | null
  scopes: string[]
  tokenMetadata: GoogleWorkspaceTokenMetadata
  connectedByUserId: string | null
  connectedAt: string | null
  updatedAt: string
}

