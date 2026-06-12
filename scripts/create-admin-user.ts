#!/usr/bin/env tsx
/**
 * One-time script to create the initial admin user in Firestore.
 * Run: npx tsx scripts/create-admin-user.ts
 */

const getAdminDb = async () => {
  const { adminDb, Timestamp } = await import("../lib/firebase/admin")
  return { adminDb, Timestamp }
}

async function createAdminUser() {
  const { adminDb, Timestamp } = await getAdminDb()

  if (!adminDb) {
    console.error("❌ Firebase Admin not initialized — check your FIREBASE_* env vars.")
    process.exit(1)
  }

  const email = "taxprep@paynepros.com"
  const docRef = adminDb.collection("admin_users").doc(email)
  const existing = await docRef.get()

  if (existing.exists) {
    console.log(`⚠️  Admin user ${email} already exists — skipping creation.`)
    console.log("   Run seed-admin-passwords.ts to set/reset the password.")
    process.exit(0)
  }

  await docRef.set({
    email,
    name: "DeTania",
    tenantId: "paynepros",
    role: "OWNER",
    active: true,
    createdAt: Timestamp.now(),
  })

  console.log(`✅ Created admin user: ${email} (DeTania) — role: OWNER`)
  console.log("   Next: run seed-admin-passwords.ts to set the password hash.")
}

createAdminUser()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("❌ Error:", err)
    process.exit(1)
  })
