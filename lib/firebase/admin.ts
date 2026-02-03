import { initializeApp, cert, getApps } from "firebase-admin/app"
import { getFirestore } from "firebase-admin/firestore"
import { Timestamp } from "firebase-admin/firestore"

function getPrivateKey(): string | undefined {
  const key = process.env.FIREBASE_PRIVATE_KEY
  if (!key) return undefined
  return key.replace(/\\n/g, "\n")
}

function getServiceAccount():
  | { projectId: string; clientEmail: string; privateKey: string }
  | undefined {
  const json = process.env.FIREBASE_SERVICE_ACCOUNT
  if (json) {
    try {
      const parsed = JSON.parse(json) as {
        project_id?: string
        client_email?: string
        private_key?: string
      }
      const privateKey = parsed.private_key?.replace(/\\n/g, "\n")
      if (parsed.project_id && parsed.client_email && privateKey) {
        return {
          projectId: parsed.project_id,
          clientEmail: parsed.client_email,
          privateKey,
        }
      }
    } catch (e) {
      console.error("FIREBASE_SERVICE_ACCOUNT JSON parse error:", e)
    }
    return undefined
  }
  const projectId =
    process.env.FIREBASE_PROJECT_ID ?? process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL
  const privateKey = getPrivateKey()
  if (projectId && clientEmail && privateKey) {
    return { projectId, clientEmail, privateKey }
  }
  return undefined
}

let adminApp: ReturnType<typeof getApps>[0] | null = null

try {
  if (!getApps().length) {
    const creds = getServiceAccount()
    if (creds) {
      adminApp = initializeApp({
        credential: cert(creds),
        projectId: creds.projectId,
      })
    } else if (process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) {
      adminApp = initializeApp({
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      })
    }
  } else {
    adminApp = getApps()[0]
  }
} catch (error) {
  console.error("Firebase Admin initialization error:", error)
  adminApp = null
}

export const adminDb = adminApp ? getFirestore(adminApp) : null
export { Timestamp }
