import NextAuth from "next-auth"
import { authConfig } from "./auth.config"
import Google from "next-auth/providers/google"
import Facebook from "next-auth/providers/facebook"
import Apple from "next-auth/providers/apple"
import Credentials from "next-auth/providers/credentials"

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
    // Admin dashboard: Firestore-backed credentials with bcrypt verification
    Credentials({
      id: "admin",
      name: "Admin",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email as string | undefined
        const password = credentials?.password as string | undefined

        if (!email || !password) {
          console.log("[Auth] Missing email or password")
          return null
        }

        try {
          // Dynamic import to prevent bundling issues
          const { adminUserRepository } = await import(
            "@/lib/repositories/admin-user-repository"
          )

          // Verify password using bcrypt (or mock mode)
          const isValid = await adminUserRepository.verifyPassword(email, password)
          console.log(`[Auth] Password verification for ${email}: ${isValid}`)
          if (!isValid) {
            console.log(`[Auth] Password verification failed for ${email}`)
            return null
          }

          // Get user details
          const adminUser = await adminUserRepository.findByEmail(email)
          console.log(`[Auth] Found user:`, adminUser ? { id: adminUser.id, email: adminUser.email, active: adminUser.active } : "null")
          if (!adminUser) {
            console.log(`[Auth] User not found: ${email}`)
            return null
          }

          // Coerce active to boolean
          const isActive =
            adminUser.active === true ||
            adminUser.active === "true" ||
            (typeof adminUser.active === "string" &&
              adminUser.active.toLowerCase() === "true")

          console.log(`[Auth] User active status: ${isActive}`)
          if (!isActive) {
            console.log(`[Auth] User is not active: ${email}`)
            return null
          }

          const userData = {
            id: adminUser.id,
            name: adminUser.name || adminUser.email,
            email: adminUser.email,
            tenantId: adminUser.tenantId,
            adminRole: adminUser.role,
          }
          console.log(`[Auth] Returning user data:`, { id: userData.id, email: userData.email, role: userData.adminRole })
          return userData
        } catch (error) {
          console.error("Admin authentication error:", error)
          return null
        }
      },
    }),
    Credentials({
      id: "client",
      name: "Client",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email as string | undefined
        const password = credentials?.password as string | undefined

        if (!email || !password) {
          return null
        }

        // Temporary client login for testing all client workspaces.
        if (password !== "temp123") {
          return null
        }

        try {
          const { clientWorkspaceRepository } = await import(
            "@/lib/repositories/client-workspace-repository"
          )
          const workspace = await clientWorkspaceRepository.findByPrimaryContactEmail(email)
          if (!workspace) {
            return null
          }
          const workspaceEmail = workspace.primaryContact?.email ?? email

          return {
            id: `client:${workspace.id}`,
            name: workspace.displayName,
            email: workspaceEmail,
            clientWorkspaceId: workspace.id,
            clientRole: "client",
          }
        } catch (error) {
          console.error("Client authentication error:", error)
          return null
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
      // Client Credentials: no repository sync
      if (account?.provider === "client") return true
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
        // Client session: workspace scoped
        if (token.clientWorkspaceId && token.clientRole) {
          session.user.clientWorkspaceId = token.clientWorkspaceId as string
          session.user.clientRole = token.clientRole as "client"
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
        const u = user as {
          tenantId?: string
          adminRole?: import("@/lib/types/admin").AdminRole
          clientWorkspaceId?: string
          clientRole?: "client"
        }
        if (u.tenantId) token.tenantId = u.tenantId
        if (u.adminRole) token.adminRole = u.adminRole
        if (u.clientWorkspaceId) token.clientWorkspaceId = u.clientWorkspaceId
        if (u.clientRole) token.clientRole = u.clientRole
      }
      return token
    },
  },
})
