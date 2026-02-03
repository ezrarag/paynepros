import { NextResponse } from "next/server"
import { auth } from "@/auth.edge"

export default auth((req) => {
  const { pathname } = req.nextUrl

  // Admin: NextAuth authorized() already ran; if we're here, session is valid or we're on login
  if (pathname.startsWith("/admin")) {
    return NextResponse.next()
  }

  // Password protection removed - all pages are now accessible
  return NextResponse.next()
})

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}

