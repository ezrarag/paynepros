import { cookies } from "next/headers"
import { redirect } from "next/navigation"

const CLIENT_PORTAL_COOKIE = "pp_client_portal"

type SessionPayload = {
  workspaceId: string
  email: string
}

export interface ClientPortalSession {
  workspaceId: string
  email: string
}

const encodePayload = (payload: SessionPayload) =>
  Buffer.from(JSON.stringify(payload), "utf8").toString("base64url")

const decodePayload = (encoded: string): SessionPayload | null => {
  try {
    const decoded = Buffer.from(encoded, "base64url").toString("utf8")
    const parsed = JSON.parse(decoded) as Partial<SessionPayload>
    if (!parsed.workspaceId || !parsed.email) {
      return null
    }
    return {
      workspaceId: parsed.workspaceId,
      email: parsed.email,
    }
  } catch {
    return null
  }
}

export async function getClientPortalSession(): Promise<ClientPortalSession | null> {
  const store = await cookies()
  const cookieValue = store.get(CLIENT_PORTAL_COOKIE)?.value
  if (!cookieValue) {
    return null
  }

  const payload = decodePayload(cookieValue)
  if (!payload) {
    return null
  }

  return {
    workspaceId: payload.workspaceId,
    email: payload.email,
  }
}

export async function requireClientPortalSession(): Promise<ClientPortalSession> {
  const session = await getClientPortalSession()
  if (!session) {
    redirect("/client/login")
  }
  return session
}

export async function setClientPortalSession(session: ClientPortalSession): Promise<void> {
  const store = await cookies()
  store.set(CLIENT_PORTAL_COOKIE, encodePayload(session), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 14,
  })
}

export async function clearClientPortalSession(): Promise<void> {
  const store = await cookies()
  store.delete(CLIENT_PORTAL_COOKIE)
}
