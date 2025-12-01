import type { NextAuthConfig } from "next-auth"

export const authConfig = {
  pages: {
    signIn: "/admin/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const isOnAdmin = nextUrl.pathname.startsWith("/admin")
      const isOnLogin = nextUrl.pathname.startsWith("/admin/login")
      
      if (isOnAdmin && !isOnLogin) {
        if (isLoggedIn) return true
        return false // Redirect unauthenticated users to login page
      }
      
      return true
    },
  },
  providers: [], // Add providers with an empty array for now
} satisfies NextAuthConfig

