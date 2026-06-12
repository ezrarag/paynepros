# PaynePros — Client Document Request Notification System
## Claude Code Prompt Packet (execute prompts in order)

**Goal:** DeTania (admin/CPA) can request documentation from any client, and the system
automatically reminds that client on a recurring schedule across their enabled channels
(email, SMS, eventually voice) until the document is actually provided. DeTania can trigger
requests from the admin UI today, and via inbound SMS/email later.

**Ground truth in this codebase (verified — do not re-invent):**
- Email sending already works via **Resend** in `app/api/client-requests/send/route.ts`,
  using `RESEND_API_KEY` + `CLIENT_MAGIC_LINK_FROM`, with templates from
  `clientRequestTemplateRepository` and a portal magic link `/client?requestId=...`.
- Client requests live in `lib/repositories/client-request-repository.ts`; workspaces in
  `lib/repositories/client-workspace-repository.ts` (with `primaryContact.email`).
- Document upload endpoint exists at `app/api/requests/upload/` and request records have
  a status field — fulfillment detection should hook into the existing status change,
  NOT a new mechanism.
- There are TWO persistence layers in this repo: Prisma/Postgres (Intuit models only) and
  the repository pattern in `lib/repositories/` (inspect implementations before writing —
  follow whichever store the client-request repositories actually use; do not migrate
  client requests into Prisma).
- Deployed on Vercel. Use Vercel Cron for scheduled work.

**Rules for all prompts:**
- Read the files referenced above BEFORE writing code. Match existing patterns exactly
  (repository pattern, route handler style, error response shapes).
- Never log full tokens, phone numbers only partially masked in logs.
- Every prompt ends with `npx tsc --noEmit` passing.
- Do not touch `app/api/integrations/intuit/**` or `lib/intuit/**` (separate workstream).

---

## PROMPT 01 — Reminder schedule model + repository

Inspect `lib/repositories/client-request-repository.ts` to learn the storage backend and
repository conventions used for client requests. Then:

1. Add a reminder schedule concept attached to each client request. Fields:
   - `requestId`, `workspaceId`
   - `cadenceDays` (number, default 3)
   - `nextRunAt` (timestamp)
   - `maxAttempts` (number, default 10)
   - `attemptCount` (number, default 0)
   - `channelsLastAttempted` (string[])
   - `active` (boolean) — false once fulfilled, cancelled, or maxAttempts reached
   - `escalate` (boolean, default false) — when true, cadence halves after attempt 3
     (e.g. 3 days → ~1.5 days, floor 1 day)
   - `createdAt`, `updatedAt`
2. Implement it in the SAME storage layer as client requests (likely a subcollection or
   sibling collection — mirror existing naming conventions).
3. Create `lib/repositories/reminder-schedule-repository.ts` with:
   `create`, `findDue(now)`, `findByRequestId`, `markAttempt`, `deactivate`.
4. When a client request is created (find the creation path used by the admin UI and by
   `app/api/client-requests/`), automatically create a reminder schedule with defaults,
   with `nextRunAt = createdAt + cadenceDays`.
5. When a request's status transitions to fulfilled/completed/uploaded (inspect the actual
   status values used in the upload flow under `app/api/requests/upload/` and the request
   status update path), call `deactivate` on its schedule. This is the kill switch — a
   client providing the document must immediately stop all future reminders.

Deliverable: model + repository + lifecycle hooks. No sending yet.

---

## PROMPT 02 — Notification channel preferences

1. Add `notificationPreferences` to the client workspace record:
   ```ts
   {
     email: boolean   // default true
     sms: boolean     // default false until phone verified
     voice: boolean   // default false (future)
     phone?: string   // E.164
     phoneVerifiedAt?: timestamp | null
   }
   ```
   Extend `clientWorkspaceRepository` with `updateNotificationPreferences(workspaceId, prefs)`.
2. Client portal: add a small "Notification Settings" panel to the existing `/client`
   portal page (inspect `app/client/` for layout conventions). Toggles for email + SMS,
   phone number input. Saving phone sets `phoneVerifiedAt = null` (verification comes in
   Prompt 04 — for now, treat an entered phone as usable in sandbox/dev only).
3. Admin side: on the admin client-workspace detail view (find it under `app/admin/`),
   display the client's current preferences read-only, plus an admin override toggle to
   disable a channel (e.g. client asked verbally to stop SMS).
4. API route `app/api/client-requests/preferences/route.ts` (or follow existing route
   placement conventions) with GET/POST, authenticated via the existing
   `getClientPortalSession()` pattern from `lib/client-portal-session`.

---

## PROMPT 03 — Notification dispatcher + email refactor

1. Create `lib/notifications/dispatcher.ts` exposing:
   ```ts
   sendRequestReminder(workspaceId: string, requestId: string, opts?: { isFirstSend?: boolean })
   ```
   It reads workspace preferences and fans out to every enabled channel, returning
   `{ channel: string, ok: boolean, error?: string }[]`.
2. Extract the email-building logic currently inlined in
   `app/api/client-requests/send/route.ts` into `lib/notifications/email.ts`
   (keep Resend, keep the template repository, keep the magic-link format,
   keep the dev_log fallback when RESEND_API_KEY is absent). Refactor the existing
   route to call the dispatcher so first-send and reminders share one code path.
   The email copy for reminders should differ slightly: subject prefixed with
   "Reminder:" and an added line noting how long the request has been open.
3. Create `lib/notifications/sms.ts` with a Telnyx implementation:
   - POST `https://api.telnyx.com/v2/messages` with `Authorization: Bearer ${TELNYX_API_KEY}`
   - Body: `{ from: TELNYX_FROM_NUMBER, to: phone, text }`
   - Message text: short, includes request title + portal magic link. Under 320 chars.
   - If `TELNYX_API_KEY` is absent: log `[SMS dev_log]` with masked phone and return
     ok (mirrors the email dev fallback).
4. Add a notification log: every dispatch attempt (channel, requestId, workspaceId,
   ok/error, timestamp) persisted via a small `notification-log-repository` in the same
   storage layer. DeTania needs an audit trail of "we asked them 6 times."
5. Add to `.env.example`:
   ```
   # Telnyx SMS
   TELNYX_API_KEY=""
   TELNYX_FROM_NUMBER=""        # E.164, from Telnyx portal after 10DLC registration
   TELNYX_PUBLIC_KEY=""         # for inbound webhook signature verification (Prompt 05)
   CRON_SECRET=""               # protects the cron route (Prompt 04)
   ```

---

## PROMPT 04 — Vercel cron: the recurring reminder engine

1. Create `app/api/cron/reminders/route.ts` (GET):
   - Authenticate: require header `Authorization: Bearer ${CRON_SECRET}`; 401 otherwise.
   - `reminderScheduleRepository.findDue(new Date())` → for each due schedule:
     a. Re-fetch the request; if its status is fulfilled/cancelled, `deactivate` and skip
        (defense in depth on the kill switch).
     b. Call `sendRequestReminder(workspaceId, requestId)`.
     c. `markAttempt`: increment attemptCount, record channels, compute next `nextRunAt`
        (cadenceDays, halved after attempt 3 if `escalate`, floor 1 day).
     d. If `attemptCount >= maxAttempts`: `deactivate` and write a notification-log entry
        of type `max_attempts_reached` so it surfaces to admin (next step).
   - Return JSON summary `{ processed, sent, deactivated, errors }`.
   - Hard cap: process at most 50 schedules per run to stay inside serverless limits.
2. Add `vercel.json` cron config (create or extend the file):
   ```json
   { "crons": [{ "path": "/api/cron/reminders", "schedule": "0 14 * * *" }] }
   ```
   (14:00 UTC ≈ 9am Central — reminders land in the client's morning.)
3. Admin visibility: on the admin requests view, show per-request reminder state —
   attempt count, next reminder date, last channels used, and a "Pause reminders" /
   "Resume" control (toggles `active`), plus a "Send reminder now" button that calls
   the dispatcher directly.
4. Write `scripts/test-reminder-cron.md` documenting how to test locally:
   `curl -H "Authorization: Bearer $CRON_SECRET" http://localhost:3000/api/cron/reminders`
   plus how to backdate a `nextRunAt` to force a due schedule.

---

## PROMPT 05 — Inbound Telnyx webhook: DeTania texts the system

1. Create `app/api/telnyx/inbound/route.ts` (POST):
   - Verify the Telnyx webhook signature (Ed25519, headers `telnyx-signature-ed25519` +
     `telnyx-timestamp`, public key from `TELNYX_PUBLIC_KEY`). Reject invalid signatures
     with 401. If `TELNYX_PUBLIC_KEY` is unset in dev, log a warning and continue.
   - Only accept messages whose `from` number matches `ADMIN_PHONE_ALLOWLIST`
     (comma-separated E.164 env var). All other senders: log and return 200 silently.
2. Parse the admin's message with a Claude API call (model `claude-sonnet-4-20250514`,
   key from `ANTHROPIC_API_KEY`). System prompt instructs JSON-only output:
   ```json
   { "clientName": string, "documentRequested": string, "confidence": "high" | "low" }
   ```
   Example inbound: "ask johnson for their W2" →
   `{ "clientName": "johnson", "documentRequested": "W2", "confidence": "high" }`.
3. Fuzzy-match `clientName` against workspace display names / primary contact names via
   `clientWorkspaceRepository`. 
   - Exactly one match + high confidence → create the client request (same creation path
     as the admin UI so the reminder schedule auto-creates per Prompt 01), dispatch the
     first notification immediately, and reply to DeTania via Telnyx SMS:
     "✓ Sent W2 request to Johnson Co. Reminders every 3 days until provided."
   - Zero or multiple matches, or low confidence → reply via SMS listing the ambiguity:
     "Found 2 matches: Johnson Co, Johnson & Sons. Reply 1 or 2." Store a short-lived
     pending-action record (same storage layer, 15 min TTL) so the numeric reply resolves it.
4. Add `ADMIN_PHONE_ALLOWLIST=""` and `ANTHROPIC_API_KEY=""` to `.env.example`.

---

## PROMPT 06 — Cleanup, docs, and verification

1. Run `npx tsc --noEmit` and `npm run build`; fix anything broken.
2. Write `scripts/NOTIFICATIONS_README.md`: architecture diagram in text, env var table,
   the full lifecycle (request created → schedule created → cron reminds → upload kills
   schedule), Telnyx setup steps (buy number, 10DLC registration, messaging profile,
   webhook URL `https://www.paynepros.com/api/telnyx/inbound`), and Vercel env checklist.
3. List any decisions deferred or assumptions made at the top of that README under
   "Open Questions" — especially anything discovered about the repository storage layer
   that diverged from this prompt's expectations.

---

## Out of scope (do NOT build now)
- Voice calls (Telnyx Voice / TTS) — future phase
- Phone number verification flow (OTP) — Prompt 02 stubs the field only
- Email-inbound triggers (DeTania emailing the system) — future phase
- Anything under `lib/intuit/` or `app/api/integrations/intuit/`
