#!/usr/bin/env tsx
/**
 * Directly sets the bcrypt password hash on the admin_users document.
 * No path-alias dependencies — works with plain tsx + --env-file.
 *
 * Usage:
 *   TEMP_PASSWORD=<password> node --env-file=.env.local --import tsx/esm scripts/set-admin-password.ts
 */
import bcrypt from "bcryptjs"
import { initializeApp, cert, getApps } from "firebase-admin/app"
import { getFirestore, Timestamp } from "firebase-admin/firestore"

function buildCredential() {
  const privateKey = (process.env.FIREBASE_PRIVATE_KEY ?? "").replace(/\\n/g, "\n")
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL ?? ""
  const projectId =
    process.env.FIREBASE_PROJECT_ID ?? process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? ""
  if (!projectId || !clientEmail || !privateKey) return null
  return { projectId, clientEmail, privateKey }
}

async function run() {
  const creds = buildCredential()
  if (!creds) {
    console.error("❌ Missing Firebase env vars (FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY)")
    process.exit(1)
  }

  const app = getApps().length
    ? getApps()[0]
    : initializeApp({ credential: cert(creds), projectId: creds.projectId })

  const db = getFirestore(app)

  const email = process.env.ADMIN_EMAIL ?? "taxprep@paynepros.com"
  const password = process.env.TEMP_PASSWORD
  if (!password) {
    console.error("❌ Set TEMP_PASSWORD env var — no default password.")
    process.exit(1)
  }

  console.log(`🔐 Setting password for: ${email}`)

  const docRef = db.collection("admin_users").doc(email)
  const doc = await docRef.get()

  if (!doc.exists) {
    console.error(`❌ No admin_users document found for ${email}`)
    console.error("   Run create-admin-user.ts first.")
    process.exit(1)
  }

  const passwordHash = await bcrypt.hash(password, 10)
  await docRef.update({
    passwordHash,
    tempPasswordSetAt: Timestamp.now(),
  })

  console.log(`✅ Password hash set for ${email}`)
  console.log(`   Login at /admin/login with: ${email} / ${password}`)
}

run()
  .then(() => process.exit(0))
  .catch((err) => { console.error("❌", err); process.exit(1) })
