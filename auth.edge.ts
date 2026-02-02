/**
 * Edge-compatible auth export for middleware.
 * This file must NOT import any Node.js-only modules like firebase-admin.
 */
import NextAuth from "next-auth"
import { authConfig } from "./auth.config"

// Minimal auth for Edge runtime (middleware) - no providers needed,
// just session validation via the authorized callback in authConfig
export const { auth } = NextAuth({
  ...authConfig,
  providers: [],
  // No callbacks that import firebase-admin
})
