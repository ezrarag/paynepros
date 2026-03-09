import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import {
  INTUIT_OAUTH_STATE_COOKIE,
  buildIntuitAuthorizationUrl,
  createIntuitOAuthState,
} from "@/lib/intuit/oauth"

export async function GET(request: NextRequest) {
  const user = await getCurrentUser()

  if (!user) {
    return NextResponse.redirect(new URL("/admin/login", request.url))
  }

  const state = createIntuitOAuthState(user.tenantId)
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
