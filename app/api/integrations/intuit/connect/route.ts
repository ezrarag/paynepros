import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { getClientPortalSession } from "@/lib/client-portal-session"
import {
  INTUIT_OAUTH_STATE_COOKIE,
  buildIntuitAuthorizationUrl,
  createIntuitOAuthState,
} from "@/lib/intuit/oauth"

function redirectWithParams(
  request: NextRequest,
  path: string,
  params?: Record<string, string>
): NextResponse {
  const url = new URL(path, request.url)
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      url.searchParams.set(key, value)
    }
  }
  return NextResponse.redirect(url)
}

export async function GET(request: NextRequest) {
  const workspaceIdParam = request.nextUrl.searchParams.get("clientWorkspaceId")?.trim()
  const adminUser = await getCurrentUser()
  const clientSession = adminUser ? null : await getClientPortalSession()

  if (!adminUser && !clientSession) {
    return redirectWithParams(request, workspaceIdParam ? "/admin/login" : "/client/login")
  }

  let actor: "admin" | "client"
  let tenantId: string
  let clientWorkspaceId: string

  if (adminUser) {
    if (!workspaceIdParam) {
      return redirectWithParams(request, "/admin/integrations/quickbooks", {
        error: "missing_client_workspace",
      })
    }
    actor = "admin"
    tenantId = adminUser.tenantId
    clientWorkspaceId = workspaceIdParam
  } else {
    actor = "client"
    // TODO: Replace fallback tenant mapping with a canonical workspace->tenant lookup in Postgres.
    tenantId = process.env.READYAIMGO_DEFAULT_TENANT_ID ?? "paynepros"
    clientWorkspaceId = clientSession!.workspaceId
  }

  const { clientWorkspaceRepository } = await import("@/lib/repositories/client-workspace-repository")
  const workspace = await clientWorkspaceRepository.findById(clientWorkspaceId)

  if (!workspace) {
    return redirectWithParams(
      request,
      actor === "admin" ? "/admin/integrations/quickbooks" : "/client",
      { error: "workspace_not_found" }
    )
  }

  if (actor === "client") {
    const workspaceTenantId = (workspace as any).tenantId
    if (typeof workspaceTenantId === "string" && workspaceTenantId.trim().length > 0) {
      tenantId = workspaceTenantId
    }
  }

  const state = createIntuitOAuthState({
    tenantId,
    clientWorkspaceId,
    actor,
    workspaceName: workspace.displayName,
  })
  const authorizationUrl = buildIntuitAuthorizationUrl(state)

  const response = NextResponse.redirect(authorizationUrl)
  response.cookies.set(INTUIT_OAUTH_STATE_COOKIE, state, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 10 * 60,
  })

  return response
}
