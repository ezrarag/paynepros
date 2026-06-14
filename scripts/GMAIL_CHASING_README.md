# PaynePros Gmail Chasing Scanner

No original Gmail chasing prompt packet was found in this repo. This documents the
implementation that now exists.

## What It Does

- Adds Gmail readonly scope to the existing Google Workspace OAuth connection.
- Stores Google access/refresh tokens encrypted in Firestore under the existing
  `integrations/{tenantId}_google_workspace` document.
- Scans recent sent Gmail messages for document-request language.
- Matches recipients to `clientWorkspaces` by `primaryContact.email`.
- Creates reviewable `gmailChaseSuggestions` instead of silently contacting clients.
- Lets an admin create a tracked client request from a suggestion, which then uses the
  existing notification dispatcher and recurring reminder system.

## Admin Flow

1. Go to `/admin/integrations`.
2. Connect or reconnect Google Workspace so Gmail readonly access is granted.
3. Use **Gmail Chasing Scanner → Scan Gmail**.
4. Review pending suggestions.
5. Click **Create request** to send the request and start reminders, or **Dismiss**.

## Environment

| Variable | Notes |
|---|---|
| `GOOGLE_CLIENT_ID` | Required for Google OAuth |
| `GOOGLE_CLIENT_SECRET` | Required for Google OAuth and token refresh |
| `GOOGLE_TOKEN_ENCRYPTION_KEY` | Optional; defaults to `AUTH_SECRET`. Rotate carefully because it encrypts stored Google OAuth tokens. |

Existing Google connections created before this feature need to disconnect/reconnect
to grant the Gmail readonly scope and store a refresh token.
