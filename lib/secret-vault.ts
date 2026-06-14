import "server-only"
import { createCipheriv, createDecipheriv, createHash, randomBytes } from "crypto"

export interface EncryptedSecret {
  v: "aes-256-gcm"
  iv: string
  ciphertext: string
  authTag: string
}

function getKey() {
  const secret = process.env.GOOGLE_TOKEN_ENCRYPTION_KEY || process.env.AUTH_SECRET
  if (!secret) {
    throw new Error("GOOGLE_TOKEN_ENCRYPTION_KEY or AUTH_SECRET is required to store Google tokens")
  }
  return createHash("sha256").update(secret).digest()
}

export function encryptSecret(value: string): EncryptedSecret {
  const iv = randomBytes(12)
  const cipher = createCipheriv("aes-256-gcm", getKey(), iv)
  const ciphertext = Buffer.concat([cipher.update(value, "utf8"), cipher.final()])
  return {
    v: "aes-256-gcm",
    iv: iv.toString("base64"),
    ciphertext: ciphertext.toString("base64"),
    authTag: cipher.getAuthTag().toString("base64"),
  }
}

export function decryptSecret(secret: EncryptedSecret | undefined | null): string | null {
  if (!secret) return null
  const decipher = createDecipheriv("aes-256-gcm", getKey(), Buffer.from(secret.iv, "base64"))
  decipher.setAuthTag(Buffer.from(secret.authTag, "base64"))
  const plaintext = Buffer.concat([
    decipher.update(Buffer.from(secret.ciphertext, "base64")),
    decipher.final(),
  ])
  return plaintext.toString("utf8")
}
