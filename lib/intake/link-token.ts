import "server-only"
import jwt, { JwtPayload, TokenExpiredError } from "jsonwebtoken"
import type { IntakeLinkKind } from "@/lib/types/client-workspace"

export type { IntakeLinkKind }

export type IntakeLinkTokenPayload = JwtPayload & {
  purpose: "intake"
  kind: IntakeLinkKind
  expiresAt: string
  workspaceId?: string
  tenantId?: string
  createdBy?: string
}

export type IntakeLinkTokenVerification =
  | { status: "valid"; payload: IntakeLinkTokenPayload }
  | { status: "expired" | "invalid" }

const getIntakeLinkSecret = () =>
  process.env.INTAKE_LINK_SECRET ?? "dev-intake-link-secret"

export const createIntakeLinkToken = (params: {
  kind: IntakeLinkKind
  expiresAt: string
  workspaceId?: string
  tenantId?: string
  createdBy?: string
}) => {
  const { kind, expiresAt, workspaceId, tenantId, createdBy } = params
  if (kind === "existing_workspace" && !workspaceId) {
    throw new Error("workspaceId is required for existing_workspace intake links")
  }
  const expiresAtDate = new Date(expiresAt)
  const expiresAtSeconds = Math.floor(expiresAtDate.getTime() / 1000)
  const payload: IntakeLinkTokenPayload = {
    purpose: "intake",
    kind,
    expiresAt,
    exp: expiresAtSeconds,
    ...(workspaceId != null && { workspaceId }),
    ...(tenantId != null && { tenantId }),
    ...(createdBy != null && { createdBy }),
  }

  return jwt.sign(payload, getIntakeLinkSecret())
}

export const verifyIntakeLinkToken = (
  token: string
): IntakeLinkTokenVerification => {
  try {
    const decoded = jwt.verify(token, getIntakeLinkSecret()) as IntakeLinkTokenPayload
    if (decoded.purpose !== "intake" || !decoded.kind || !decoded.expiresAt) {
      return { status: "invalid" }
    }
    if (decoded.kind === "existing_workspace" && !decoded.workspaceId) {
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
