export type RequestMagicLinkState = {
  status: "idle" | "success" | "error"
  message?: string
  magicLink?: string
}

export const initialRequestMagicLinkState: RequestMagicLinkState = {
  status: "idle",
}
