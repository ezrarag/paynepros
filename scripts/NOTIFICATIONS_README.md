# PaynePros Notification System

Automated client document-request reminders: the admin asks once (UI or SMS), the
system reminds the client on a cadence across their enabled channels until the
document is provided, then stops instantly.

## Open Questions / Assumptions

- **Storage layer**: client requests live in Firestore (repository pattern in
  `lib/repositories/`), NOT Prisma — all new collections follow that pattern.
  `reminderSchedules` is a **top-level collection keyed by requestId** (not a
  subcollection) so the cron's due-query needs only one composite index
  (`active ASC, nextRunAt ASC` — deployed via `firestore.indexes.json`).
- **Request statuses** are `sent | viewed | completed` — there is no separate
  "cancelled"; pausing reminders is handled on the schedule (`active: false`).
- **Kill switch lives in the repository**: `clientRequestRepository.updateStatus`
  deactivates the schedule on `completed`, so both the admin "mark complete" and
  the client portal completion path are covered by one chokepoint.
- **SMS intent parsing** classifies directly into the existing request template
  types (w2, 1099, bank_statements, …) rather than free text, so SMS-created
  requests are identical to UI-created ones. Model: `claude-sonnet-4-6`.
- **Phone verification (OTP)** is stubbed: entering a new phone sets
  `phoneVerifiedAt = null`; an entered phone is treated as usable (sandbox/dev
  expectation until the OTP flow ships).
- **Voice channel** is typed (`notificationPreferences.voice`) but has no sender.

## Architecture

```
ADMIN TRIGGERS                          CLIENT EXPERIENCE
──────────────                          ─────────────────
Admin UI (clients page)──┐              Email (Resend) ──> portal link
                         │              SMS (Telnyx)   ──> portal link
SMS to Telnyx number ────┤                    ▲
  └ /api/telnyx/inbound  │                    │
    · Ed25519 verify     ▼                    │
    · allowlist     createClientRequest ──> dispatcher (lib/notifications/)
    · Claude parse       │   (admin action)   │ sendRequestReminder()
    · fuzzy match        │                    │ fans out per workspace
    · reply via SMS      ▼                    │ notificationPreferences
                  clientRequestRepository     │
                    .create() ───────────┐    │
                         │               ▼    │
                         │      reminderSchedules (Firestore)
                         │        · nextRunAt, attemptCount, active
                         │               ▲
                         │               │ daily 14:00 UTC
                         │      /api/cron/reminders (Vercel Cron)
                         │        · findDue → re-check status → send
                         │        · markAttempt (cadence, escalation)
                         │        · max attempts → timeline alert
                         ▼
                  COMPLETION (kill switch)
                  client portal upload/confirm OR admin "mark complete"
                    └→ updateStatus("completed") → schedule deactivated
                                                 → notificationLogs audit trail
```

## Lifecycle

1. **Request created** (admin UI or inbound SMS) → `clientRequestRepository.create`
   auto-creates a `reminderSchedules` doc: `nextRunAt = sentAt + 3 days`,
   `maxAttempts 10`, `active: true`.
2. **First notification** sent immediately via the dispatcher (email + SMS per the
   client's `notificationPreferences`). Every attempt is written to `notificationLogs`.
3. **Daily cron** (`vercel.json`, 14:00 UTC ≈ 9am Central) processes due schedules
   (≤50/run): re-checks the request status (defense in depth), sends reminders
   ("Reminder:" subject + days-open line), increments `attemptCount`, advances
   `nextRunAt` by `cadenceDays` (halved after attempt 3 when `escalate`, floor 1 day).
4. **Completion** — client uploads/confirms in the portal, or admin marks complete
   → schedule deactivated immediately, reminders stop.
5. **Max attempts** — schedule deactivates, `max_attempts_reached` log written, and
   a "Reminder limit reached — needs personal follow-up" event lands on the
   workspace timeline for the admin.

Admin controls per request (client detail page → "Automatic Reminders"):
attempt count, next run date, last channels, **Pause/Resume**, **Send reminder now**.

## Environment Variables

| Variable | Required for | Notes |
|---|---|---|
| `RESEND_API_KEY` | Email sending | Falls back to console `dev_log` in dev; 500s in prod if missing |
| `CLIENT_MAGIC_LINK_FROM` | Email sending | e.g. `PaynePros <taxprep@paynepros.com>` — **exact spelling MAGIC** |
| `CRON_SECRET` | Reminder cron | Vercel sends it as `Authorization: Bearer` automatically |
| `TELNYX_API_KEY` | SMS out | Empty → `[SMS dev_log]` fallback |
| `TELNYX_FROM_NUMBER` | SMS out | E.164; requires completed 10DLC registration |
| `TELNYX_PUBLIC_KEY` | SMS in | Webhook signature verify; unset = skip in dev, **reject in prod** |
| `ADMIN_PHONE_ALLOWLIST` | SMS in | Comma-separated E.164 admin numbers |
| `ANTHROPIC_API_KEY` | SMS in | Parses inbound texts into structured requests |

## Telnyx Setup Steps

1. Create a Telnyx account, buy a US number (Messaging-capable).
2. Complete **10DLC registration** (brand + campaign) — required for US A2P SMS;
   approval can take days.
3. Create a Messaging Profile, assign the number to it.
4. Set the profile's inbound webhook URL to
   `https://www.paynepros.com/api/telnyx/inbound` (HTTP POST, JSON).
5. Copy the API key, the number (E.164), and the Ed25519 public key into env.

## Vercel Deploy Checklist

- [ ] `CRON_SECRET` set in Vercel env (all environments)
- [ ] `TELNYX_*`, `ADMIN_PHONE_ALLOWLIST`, `ANTHROPIC_API_KEY` set when going live with SMS
- [ ] **Fix existing env drift**: `FIREBASE_*` vars in Vercel point at the old
      `readyaimgo-clients-temp` project — must be repointed to `paynepros-dc55a`,
      and the `NEXT_PUBLIC_FIREBASE_*` client vars added
- [ ] **Fix typo'd key**: Vercel has `CLIENT_MAGIK_LINK_FROM`; code reads
      `CLIENT_MAGIC_LINK_FROM`
- [ ] After deploy: Vercel → Settings → Cron Jobs shows `/api/cron/reminders` daily
- [ ] Firestore composite index for `reminderSchedules` is deployed
      (`firebase deploy --only firestore:indexes`)

## Testing

See `scripts/test-reminder-cron.md` for the cron walkthrough and
`scripts/e2e-reminder-test.ts` for the end-to-end harness
(setup → backdate → cron → complete → cleanup). Verified working against live
Firestore + Resend on 2026-06-12.
