/**
 * Server-only guard for Next.js.
 * Import this file in Next.js server components/routes to ensure
 * the code doesn't accidentally get bundled into client code.
 * 
 * Note: This file should NOT be imported by Node scripts (like seed scripts)
 * as they don't have the "server-only" package behavior.
 */
import "server-only"
