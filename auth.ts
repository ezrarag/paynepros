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
    // WhatsApp OTP fallback via credentials
    Credentials({
      name: "WhatsApp",
      credentials: {
        phone: { label: "Phone", type: "text" },
        code: { label: "Verification Code", type: "text" },
      },
      async authorize(credentials) {
        // TODO: Implement WhatsApp OTP verification
        // For now, return null
        return null
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      // Lazy load userRepository to avoid Firebase initialization in Edge runtime
      if (user?.id && typeof window === 'undefined') {
        try {
          const { userRepository } = await import("@/lib/repositories/user-repository")
          // Check if user exists, create if not
          const existingUser = await userRepository.findById(user.id)
          if (!existingUser) {
            await userRepository.create({
              id: user.id,
              email: user.email || undefined,
              name: user.name || undefined,
              image: user.image || undefined,
              role: 'user',
              subscriptionStatus: 'inactive',
              connectedAccounts: {
                google: account?.provider === 'google',
                facebook: account?.provider === 'facebook',
                instagram: account?.provider === 'instagram',
                apple: account?.provider === 'apple',
              },
            })
          } else {
            // Update connected accounts
            const connectedAccounts = {
              ...existingUser.connectedAccounts,
              [account?.provider || '']: true,
            }
            await userRepository.update(user.id, { connectedAccounts })
          }
        } catch (error) {
          console.error("Error in signIn callback:", error)
          // Don't block sign-in if repository fails
        }
      }
      return true
    },
    async session({ session, token }) {
      if (session.user && token.sub && typeof window === 'undefined') {
        try {
          const { userRepository } = await import("@/lib/repositories/user-repository")
          session.user.id = token.sub
          const user = await userRepository.findById(token.sub)
          if (user) {
            session.user.role = user.role
            session.user.subscriptionStatus = user.subscriptionStatus
          }
        } catch (error) {
          console.error("Error in session callback:", error)
        }
      } else if (session.user && token.sub) {
        session.user.id = token.sub
      }
      return session
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
  },
})

