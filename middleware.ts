import { NextRequest, NextResponse } from "next/server"
import { PASSWORD_COOKIE_NAME } from "@/lib/passwords"

export default function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  
  // Allow access to password page and API routes
  if (
    pathname === "/password" ||
    pathname.startsWith("/api/auth/") ||
    pathname.startsWith("/api/") ||
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/favicon")
  ) {
    return NextResponse.next()
  }

  // Check for password authentication cookie
  const passwordCookie = req.cookies.get(PASSWORD_COOKIE_NAME)
  const isAuthenticated = passwordCookie && passwordCookie.value === "authenticated"

  // If not authenticated, redirect to password page
  if (!isAuthenticated) {
    const redirectUrl = new URL("/password", req.url)
    redirectUrl.searchParams.set("redirect", pathname)
    return NextResponse.redirect(redirectUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}

