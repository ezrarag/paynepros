import "server-only"
import { initializeApp, cert, getApps, getApp } from "firebase-admin/app"
import { getFirestore } from "firebase-admin/firestore"
import { Timestamp } from "firebase-admin/firestore"

// Initialize Firebase Admin
let adminApp: ReturnType<typeof getApps>[0] | null = null

try {
  if (!getApps().length) {
    const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT
      ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
      : undefined

    if (serviceAccount) {
      adminApp = initializeApp({
        credential: cert(serviceAccount),
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      })
    } else if (process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) {
      // For local development, use default credentials
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

// Export Firestore instance and Timestamp only if app is initialized
export const adminDb = adminApp ? getFirestore(adminApp) : null
export { Timestamp }
