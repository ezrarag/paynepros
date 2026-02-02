import NextAuth from "next-auth"
import { authConfig } from "./auth.config"
import Google from "next-auth/providers/google"
import Facebook from "next-auth/providers/facebook"
import Apple from "next-auth/providers/apple"
import Credentials from "next-auth/providers/credentials"
import { getAdminUserByEmail } from "@/lib/mock/admin"

// Instagram OAuth via Facebook (Instagram Basic Display API)
const InstagramProvider = {
  id: "instagram",
  name: "Instagram",
  type: "oauth",
  authorization: {
    url: "https://api.instagram.com/oauth/authorize",
    params: {
      scope: "user_profile,user_media",
      response_type: "code",
    },
  },
  token: "https://api.instagram.com/oauth/access_token",
  userinfo: "https://graph.instagram.com/me?fields=id,username",
  clientId: process.env.INSTAGRAM_CLIENT_ID,
  clientSecret: process.env.INSTAGRAM_CLIENT_SECRET,
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    Facebook({
      clientId: process.env.FACEBOOK_CLIENT_ID!,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
    }),
    Apple({
      clientId: process.env.APPLE_ID!,
      clientSecret: process.env.APPLE_SECRET!,
    }),
    // Instagram provider (custom)
    InstagramProvider as any,
    // Admin dashboard: test users (DeTania, Nija, Ezra). Used from /admin/login only.
    Credentials({
      id: "admin",
      name: "Admin",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email as string | undefined
        if (!email) return null
        const adminUser = getAdminUserByEmail(email)
        if (!adminUser) return null
        // For local testing: accept any password or none
        return {
          id: adminUser.id,
          name: adminUser.name,
          email: adminUser.email,
          tenantId: adminUser.tenantId,
          adminRole: adminUser.role,
        }
      },
    }),
    // WhatsApp OTP fallback via credentials
    Credentials({
      id: "whatsapp",
      name: "WhatsApp",
      credentials: {
        phone: { label: "Phone", type: "text" },
        code: { label: "Verification Code", type: "text" },
      },
      async authorize() {
        return null
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      // Admin Credentials: no repository sync
      if (account?.provider === "admin") return true
      // Skip repository sync in Edge runtime (middleware) - only run in Node.js runtime
      if (user?.id && typeof globalThis.EdgeRuntime === "undefined") {
        try {
          const { userRepository } = await import("@/lib/repositories/user-repository")
          const existingUser = await userRepository.findById(user.id)
          if (!existingUser) {
            await userRepository.create({
              id: user.id,
              email: user.email || undefined,
              name: user.name || undefined,
              image: user.image || undefined,
              role: "user",
              subscriptionStatus: "inactive",
              connectedAccounts: {
                google: account?.provider === "google",
                facebook: account?.provider === "facebook",
                instagram: account?.provider === "instagram",
                apple: account?.provider === "apple",
              },
            })
          } else {
            const connectedAccounts = {
              ...existingUser.connectedAccounts,
              [account?.provider || ""]: true,
            }
            await userRepository.update(user.id, { connectedAccounts })
          }
        } catch (error) {
          console.error("Error in signIn callback:", error)
        }
      }
      return true
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub ?? token.id ?? ""
        // Admin session: tenantId + adminRole from token
        if (token.tenantId && token.adminRole) {
          session.user.tenantId = token.tenantId as string
          session.user.adminRole = token.adminRole as import("@/lib/types/admin").AdminRole
          return session
        }
        // Skip repository fetch in Edge runtime - only run in Node.js runtime
        if (token.sub && typeof globalThis.EdgeRuntime === "undefined") {
          try {
            const { userRepository } = await import("@/lib/repositories/user-repository")
            const user = await userRepository.findById(token.sub)
            if (user) {
              session.user.role = user.role
              session.user.subscriptionStatus = user.subscriptionStatus
            }
          } catch (error) {
            console.error("Error in session callback:", error)
          }
        }
      }
      return session
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        const u = user as { tenantId?: string; adminRole?: import("@/lib/types/admin").AdminRole }
        if (u.tenantId) token.tenantId = u.tenantId
        if (u.adminRole) token.adminRole = u.adminRole
      }
      return token
    },
  },
})

