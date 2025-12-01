// TEMPORARILY DISABLED - Allowing access to admin without auth for development
// import { auth } from "./auth"
import { NextResponse } from "next/server"

export default function middleware(req: any) {
  // Temporarily allow all requests through
  return NextResponse.next()
}

// Original middleware code (commented out for now):
// export default auth((req) => {
//   const { pathname } = req.nextUrl
//   const isLoggedIn = !!req.auth
//
//   // Protect admin routes
//   if (pathname.startsWith("/admin") && !pathname.startsWith("/admin/login")) {
//     if (!isLoggedIn) {
//       return NextResponse.redirect(new URL("/admin/login", req.url))
//     }
//   }
//
//   // Redirect logged-in users away from login page
//   if (pathname === "/admin/login" && isLoggedIn) {
//     return NextResponse.redirect(new URL("/admin", req.url))
//   }
//
//   return NextResponse.next()
// })

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}

