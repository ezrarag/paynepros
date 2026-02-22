import type { NextAuthConfig } from "next-auth"

export const authConfig = {
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
  // Trust the host header - required for local dev on mobile (different IP/origin)
  trustHost: true,
  pages: {
    signIn: "/admin/login",
  },
  // Ensure CSRF protection is enabled but works in dev
  debug: process.env.NODE_ENV === "development",
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const isAdminSession = !!auth?.user?.adminRole
      const isOnAdmin = nextUrl.pathname.startsWith("/admin")
      const isOnLogin = nextUrl.pathname.startsWith("/admin/login")
      
      if (isOnAdmin && !isOnLogin) {
        if (isLoggedIn && isAdminSession) return true
        return false // Redirect unauthenticated users to login page
      }
      
      return true
    },
  },
  providers: [], // Add providers with an empty array for now
} satisfies NextAuthConfig
