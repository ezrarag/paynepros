import { initializeApp, getApps, FirebaseApp } from "firebase/app"
import { getAuth, Auth } from "firebase/auth"
import { getFirestore, Firestore } from "firebase/firestore"
import { getStorage, FirebaseStorage } from "firebase/storage"

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

// Check if we're in Edge runtime (middleware) - Firebase client SDK doesn't work there
const isEdgeRuntime = 
  typeof EdgeRuntime !== 'undefined' || 
  (typeof process !== 'undefined' && process.env.NEXT_RUNTIME === 'edge') ||
  (typeof window === 'undefined' && typeof process !== 'undefined' && !process.env.NEXT_PUBLIC_FIREBASE_API_KEY)

// Initialize Firebase only if not in Edge runtime and config is available
let app: FirebaseApp | null = null
let authInstance: Auth | null = null
let dbInstance: Firestore | null = null
let storageInstance: FirebaseStorage | null = null

if (!isEdgeRuntime && firebaseConfig.apiKey && typeof window !== 'undefined') {
  try {
    if (getApps().length === 0) {
      app = initializeApp(firebaseConfig)
    } else {
      app = getApps()[0]
    }

    // Initialize services
    authInstance = getAuth(app)
    dbInstance = getFirestore(app)
    storageInstance = getStorage(app)
  } catch (error) {
    console.error("Firebase initialization error:", error)
  }
}

// Export getters - will be null in Edge runtime or if not initialized
export const auth: Auth | null = authInstance
export const db: Firestore | null = dbInstance
export const storage: FirebaseStorage | null = storageInstance

export default app

