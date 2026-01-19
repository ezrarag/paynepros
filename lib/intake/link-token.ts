import "server-only"
import jwt, { JwtPayload, TokenExpiredError } from "jsonwebtoken"

export type IntakeLinkTokenPayload = JwtPayload & {
  workspaceId: string
  expiresAt: string
  purpose: "intake"
}

export type IntakeLinkTokenVerification =
  | { status: "valid"; payload: IntakeLinkTokenPayload }
  | { status: "expired" | "invalid" }

const getIntakeLinkSecret = () =>
  process.env.INTAKE_LINK_SECRET ?? "dev-intake-link-secret"

export const createIntakeLinkToken = ({
  workspaceId,
  expiresAt,
}: {
  workspaceId: string
  expiresAt: string
}) => {
  const expiresAtDate = new Date(expiresAt)
  const expiresAtSeconds = Math.floor(expiresAtDate.getTime() / 1000)
  const payload: IntakeLinkTokenPayload = {
    workspaceId,
    expiresAt,
    purpose: "intake",
    exp: expiresAtSeconds,
  }

  return jwt.sign(payload, getIntakeLinkSecret())
}

export const verifyIntakeLinkToken = (
  token: string
): IntakeLinkTokenVerification => {
  try {
    const decoded = jwt.verify(token, getIntakeLinkSecret()) as IntakeLinkTokenPayload
    if (!decoded?.workspaceId || decoded.purpose !== "intake" || !decoded.expiresAt) {
      return { status: "invalid" }
    }
    const expiresAtMs = new Date(decoded.expiresAt).getTime()
    if (Number.isNaN(expiresAtMs) || expiresAtMs <= Date.now()) {
      return { status: "expired" }
    }
    return { status: "valid", payload: decoded }
  } catch (error) {
    if (error instanceof TokenExpiredError) {
      return { status: "expired" }
    }
    return { status: "invalid" }
  }
}
