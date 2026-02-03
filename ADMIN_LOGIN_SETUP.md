# Admin Login "Tonight Mode" Setup

This document explains the Firestore-backed admin login system with temp passwords.

## Overview

The admin login system uses:
- **Firestore** `admin_users` collection for user storage
- **bcrypt** for password hashing
- **NextAuth Credentials provider** for authentication
- **User picker + password dialog** UI

## Prerequisites

Install required packages:
```bash
npm install bcryptjs @types/bcryptjs
npm install -D tsx  # For running seed script
```

## Firestore Collection: `admin_users`

### Document Structure

**Document ID**: Use email as doc ID (preferred) or random ID with email field

**Fields**:
- `email`: string (required)
- `name`: string (optional, recommended for UI)
- `tenantId`: string (required, e.g., "paynepros")
- `role`: "OWNER" | "ADMIN" | "STAFF" (required)
- `active`: boolean | string (required, supports "true"/"false" strings)
- `passwordHash`: string (bcrypt hash, required for login)
- `tempPasswordSetAt`: timestamp (optional, auto-set when passwordHash is updated)
- `createdAt`: timestamp (optional)

### Example Document

```javascript
// Document ID: detania@paynepros.com
{
  email: "detania@paynepros.com",
  name: "DeTania",
  tenantId: "paynepros",
  role: "OWNER",
  active: true,  // or "true" string
  passwordHash: "$2a$10$...",  // bcrypt hash
  tempPasswordSetAt: Timestamp(...),
  createdAt: Timestamp(...)
}
```

## Seeding Temp Passwords

Use the seed script to hash passwords and write to Firestore:

```bash
# Default temp password: "temp123"
npx tsx scripts/seed-admin-passwords.ts

# Custom temp password
TEMP_PASSWORD=mySecurePass123 npx tsx scripts/seed-admin-passwords.ts
```

The script will:
1. List all active admin users for tenant "paynepros"
2. Hash the temp password using bcrypt
3. Update users without `passwordHash` field
4. Skip users that already have a passwordHash

## Login Flow

1. User visits `/admin/login`
2. Server fetches admin users from Firestore (`listByTenant`)
3. User clicks on their name in the picker
4. Password dialog opens
5. User enters temp password
6. NextAuth Credentials provider:
   - Looks up user by email
   - Verifies password with `bcrypt.compare`
   - Checks `active` status
   - Returns user with `tenantId` and `adminRole`
7. User is redirected to `/admin` dashboard

## Code Files

- **`lib/repositories/admin-user-repository.ts`**: Firestore operations
  - `listByTenant()`: Get active users for tenant
  - `findByEmail()`: Find user by email (supports docId=email or email field)
  - `verifyPassword()`: bcrypt password verification
  - `setPasswordHash()`: Update password hash

- **`auth.ts`**: NextAuth Credentials provider
  - Updated to use `adminUserRepository.verifyPassword()`
  - Returns user with `tenantId` and `adminRole`

- **`app/admin/login/page.tsx`**: Server component
  - Fetches admin users from Firestore
  - Passes to client component

- **`app/admin/login/AdminLoginClient.tsx`**: Client component
  - Displays user picker
  - Shows password dialog
  - Calls `signIn("admin", { email, password })`

- **`scripts/seed-admin-passwords.ts`**: Seed script
  - Hashes temp password
  - Updates Firestore docs

## Security Notes

- Passwords are hashed with bcrypt (10 salt rounds)
- Only active users can sign in
- Password verification happens server-side
- No password reset or email verification (by design for "tonight mode")

## Troubleshooting

**"No admin users found"**
- Check Firestore `admin_users` collection exists
- Verify `tenantId` field is set to "paynepros"
- Ensure `active` is `true` or `"true"`

**"Invalid password"**
- Run seed script to set passwordHash
- Verify temp password matches what was seeded
- Check passwordHash field exists in Firestore doc

**"Firebase Admin not initialized"**
- Set `FIREBASE_SERVICE_ACCOUNT` env var (JSON string)
- Or set `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`

## Future Enhancements

- Password reset flow
- Email verification
- OAuth for admins (Google SSO)
- Password expiration
- Audit logging
