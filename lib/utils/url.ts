/**
 * Get the base URL for the application.
 * In API routes, uses request.nextUrl.origin
 * In server actions, falls back to environment variable or localhost
 */
export function getBaseUrl(request?: { nextUrl?: { origin: string } }): string {
  // If we have a request object (API route), use it
  if (request?.nextUrl?.origin) {
    return request.nextUrl.origin
  }
  
  // Otherwise, use environment variable or fallback
  // Priority: NEXT_PUBLIC_APP_URL > VERCEL_URL > localhost
  return process.env.NEXT_PUBLIC_APP_URL || 
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000")
}

/**
 * Get base URL from client-side (browser)
 * Uses window.location.origin
 */
export function getBaseUrlFromClient(): string {
  if (typeof window !== "undefined") {
    return window.location.origin
  }
  return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
}
