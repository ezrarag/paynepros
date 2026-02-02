import { NextResponse } from "next/server"
import { auth } from "@/auth.edge"
import { PASSWORD_COOKIE_NAME } from "@/lib/passwords"

export default auth((req) => {
  const { pathname } = req.nextUrl

  // Admin: NextAuth authorized() already ran; if we're here, session is valid or we're on login
  if (pathname.startsWith("/admin")) {
    return NextResponse.next()
  }

  // Allow password page and static assets
  if (
    pathname === "/password" ||
    pathname.startsWith("/api/") ||
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/favicon")
  ) {
    return NextResponse.next()
  }

  // Public site: password cookie
  const passwordCookie = req.cookies.get(PASSWORD_COOKIE_NAME)
  const isAuthenticated = passwordCookie && passwordCookie.value === "authenticated"
  if (!isAuthenticated) {
    const redirectUrl = new URL("/password", req.url)
    redirectUrl.searchParams.set("redirect", pathname)
    return NextResponse.redirect(redirectUrl)
  }

  return NextResponse.next()
})

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}

