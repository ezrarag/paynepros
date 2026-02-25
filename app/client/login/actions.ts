"use server"

import { headers } from "next/headers"
import { clientWorkspaceRepository } from "@/lib/repositories/client-workspace-repository"
import { clientPortalAuthRepository } from "@/lib/repositories/client-portal-auth-repository"

type RequestMagicLinkState = {
  status: "idle" | "success" | "error"
  message?: string
  magicLink?: string
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

async function sendMagicLinkEmail(input: {
  to: string
  magicLink: string
  expiresInMinutes: number
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const apiKey = process.env.RESEND_API_KEY
  const from = process.env.CLIENT_MAGIC_LINK_FROM

  if (!apiKey || !from) {
    return {
      ok: false,
      error: "missing_email_config",
    }
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [input.to],
        subject: "Your PaynePros client sign-in link",
        html: `
          <p>Your secure sign-in link is ready.</p>
          <p><a href="${input.magicLink}">Sign in to PaynePros Client Portal</a></p>
          <p>This link expires in ${input.expiresInMinutes} minutes and can only be used once.</p>
        `,
      }),
    })

    if (!response.ok) {
      const raw = await response.text().catch(() => "")
      return { ok: false, error: raw || `resend_${response.status}` }
    }

    return { ok: true }
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "email_send_failed" }
  }
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
  const expiresInMinutes = 15

  console.log("[Client Magic Link]", { email, workspaceId: workspace.id, magicLink })
  const sent = await sendMagicLinkEmail({
    to: email,
    magicLink,
    expiresInMinutes,
  })

  if (sent.ok) {
    return {
      status: "success",
      message: "Magic link sent to your email. It expires in 15 minutes.",
    }
  }

  return {
    status: "success",
    message:
      "Email sending is not configured yet, so the magic link is shown below for testing.",
    magicLink,
  }
}
