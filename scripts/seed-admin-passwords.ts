#!/usr/bin/env tsx
/**
 * Seed script to hash temp passwords and write passwordHash to admin_users collection.
 * 
 * Usage:
 *   npx tsx scripts/seed-admin-passwords.ts
 * 
 * Or with specific temp password:
 *   TEMP_PASSWORD=myTempPass123 npx tsx scripts/seed-admin-passwords.ts
 * 
 * This script:
 * 1. Reads admin_users from Firestore (tenantId="paynepros")
 * 2. For each user without passwordHash, hashes the temp password
 * 3. Updates the user doc with passwordHash and tempPasswordSetAt
 * 
 * Requirements:
 * - Install bcryptjs: npm install bcryptjs @types/bcryptjs
 * - Install tsx: npm install -D tsx
 * - Set Firebase Admin env vars (FIREBASE_SERVICE_ACCOUNT or FIREBASE_*)
 */

import bcrypt from "bcryptjs"
import { adminUserRepository } from "../lib/repositories/admin-user-repository"
import { adminDb } from "../lib/firebase/admin"

const TEMP_PASSWORD = process.env.TEMP_PASSWORD || "temp123"
const TENANT_ID = "paynepros"

async function seedAdminPasswords() {
  console.log("🔐 Starting admin password seeding...")
  console.log(`📋 Tenant: ${TENANT_ID}`)
  console.log(`🔑 Temp password: ${TEMP_PASSWORD}`)
  console.log("")

  if (!adminDb) {
    console.error("❌ Firebase Admin not initialized!")
    console.error("   Make sure FIREBASE_SERVICE_ACCOUNT or FIREBASE_* env vars are set.")
    process.exit(1)
  }

  try {
    // Get all admin users for the tenant
    const users = await adminUserRepository.listByTenant(TENANT_ID)
    
    if (users.length === 0) {
      console.log("⚠️  No admin users found in Firestore.")
      console.log("   Make sure admin_users collection exists with tenantId='paynepros'")
      process.exit(0)
    }

    console.log(`📊 Found ${users.length} admin user(s):`)
    users.forEach((u) => {
      console.log(`   - ${u.name} (${u.email}) [${u.role}]`)
    })
    console.log("")

    // Hash the temp password once
    const saltRounds = 10
    console.log("🔨 Hashing password...")
    const passwordHash = await bcrypt.hash(TEMP_PASSWORD, saltRounds)
    console.log("✅ Password hashed successfully")
    console.log("")

    // Update each user
    let updated = 0
    let skipped = 0
    let errors = 0

    for (const user of users) {
      try {
        // Check if user already has a passwordHash
        const userDoc = await adminUserRepository.findByEmail(user.email)
        
        if (userDoc?.passwordHash) {
          console.log(`⏭️  Skipping ${user.email} (already has passwordHash)`)
          skipped++
          continue
        }

        // Set password hash
        await adminUserRepository.setPasswordHash(user.email, passwordHash)
        console.log(`✅ Updated ${user.email} (${user.name})`)
        updated++
      } catch (error) {
        console.error(`❌ Error updating ${user.email}:`, error)
        errors++
      }
    }

    console.log("")
    console.log("📈 Summary:")
    console.log(`   ✅ Updated: ${updated}`)
    console.log(`   ⏭️  Skipped: ${skipped}`)
    console.log(`   ❌ Errors: ${errors}`)
    console.log("")
    console.log("🎉 Done! Users can now sign in with the temp password.")
    console.log(`   Temp password: ${TEMP_PASSWORD}`)
  } catch (error) {
    console.error("❌ Fatal error:", error)
    process.exit(1)
  }
}

// Run the script
seedAdminPasswords()
  .then(() => {
    process.exit(0)
  })
  .catch((error) => {
    console.error("❌ Unhandled error:", error)
    process.exit(1)
  })
