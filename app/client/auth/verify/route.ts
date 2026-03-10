import { NextRequest, NextResponse } from "next/server"
import {
  CLIENT_PORTAL_COOKIE,
  serializeClientPortalSession,
} from "@/lib/client-portal-session"
import { clientPortalAuthRepository } from "@/lib/repositories/client-portal-auth-repository"

export const runtime = "nodejs"

const cookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: 60 * 60 * 24 * 14,
}

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token")

  if (!token) {
    return NextResponse.redirect(new URL("/client/login?error=invalid_link", request.url))
  }

  try {
    const sessionData = await clientPortalAuthRepository.consumeMagicLink(token)
    if (!sessionData) {
      return NextResponse.redirect(new URL("/client/login?error=link_expired", request.url))
    }

    const response = NextResponse.redirect(new URL("/client", request.url))
    response.cookies.set(
      CLIENT_PORTAL_COOKIE,
      serializeClientPortalSession({
        workspaceId: sessionData.workspaceId,
        email: sessionData.email,
      }),
      cookieOptions
    )

    return response
  } catch (error) {
    console.error("Client magic link verify failed:", error)
    return NextResponse.redirect(new URL("/client/login?error=verify_failed", request.url))
  }
}
