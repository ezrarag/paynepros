"use server"

import { headers } from "next/headers"
import { clientWorkspaceRepository } from "@/lib/repositories/client-workspace-repository"
import { clientPortalAuthRepository } from "@/lib/repositories/client-portal-auth-repository"

export type RequestMagicLinkState = {
  status: "idle" | "success" | "error"
  message?: string
  magicLink?: string
}

const initialState: RequestMagicLinkState = {
  status: "idle",
}

function getBaseUrl(hostHeader: string | null): string {
  if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL
  if (process.env.NEXTAUTH_URL) return process.env.NEXTAUTH_URL
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`
  if (hostHeader) {
    const isLocal = hostHeader.includes("localhost") || hostHeader.startsWith("127.0.0.1")
    return `${isLocal ? "http" : "https"}://${hostHeader}`
  }
  return "http://localhost:3000"
}

export async function requestClientMagicLink(
  _prevState: RequestMagicLinkState,
  formData: FormData
): Promise<RequestMagicLinkState> {
  const email = String(formData.get("email") || "").trim().toLowerCase()

  if (!email) {
    return {
      status: "error",
      message: "Enter a client email.",
    }
  }

  const workspace = await clientWorkspaceRepository.findByPrimaryContactEmail(email)
  if (!workspace) {
    return {
      status: "error",
      message: "Email not found in client workspace records.",
    }
  }

  const expiresAt = new Date(Date.now() + 15 * 60 * 1000)
  const { token } = await clientPortalAuthRepository.createMagicLink({
    workspaceId: workspace.id,
    email,
    expiresAt,
  })

  const host = (await headers()).get("host")
  const baseUrl = getBaseUrl(host)
  const magicLink = `${baseUrl}/client/auth/verify?token=${encodeURIComponent(token)}`

  console.log("[Client Magic Link]", { email, workspaceId: workspace.id, magicLink })

  return {
    status: "success",
    message: "Magic link generated. It expires in 15 minutes.",
    magicLink,
  }
}

export { initialState }
