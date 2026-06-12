# Testing the Reminder Cron Locally

The reminder engine lives at `GET /api/cron/reminders`. In production, Vercel Cron
calls it daily at 14:00 UTC (~9am Central) per `vercel.json`. Vercel automatically
sends `Authorization: Bearer ${CRON_SECRET}` when the `CRON_SECRET` env var is set
on the project.

## 1. Run it manually

With the dev server running (`pnpm dev`):

```bash
source <(grep '^CRON_SECRET' .env.local | sed 's/^/export /')
curl -H "Authorization: Bearer $CRON_SECRET" http://localhost:3000/api/cron/reminders
```

Expected response shape:

```json
{ "processed": 0, "sent": 0, "deactivated": 0, "errors": 0 }
```

A `401` means the header is missing/wrong or `CRON_SECRET` isn't set in `.env.local`.

## 2. Force a schedule to be due

Schedules are created automatically when an admin sends a client request, with
`nextRunAt = sentAt + 3 days`. To test without waiting, backdate `nextRunAt`:

1. Open [Firebase console → Firestore](https://console.firebase.google.com/project/paynepros-dc55a/firestore)
2. Find the `reminderSchedules` collection (doc ID = the request ID)
3. Edit `nextRunAt` to a timestamp in the past (e.g. yesterday)
4. Confirm `active` is `true`
5. Re-run the curl above — `processed` and `sent` should now be `1`

Or do it from a Node script:

```bash
node --env-file=.env.local --import tsx/esm -e "
import { adminDb, Timestamp } from './lib/firebase/admin'
const requestId = process.argv[1]
await adminDb.collection('reminderSchedules').doc(requestId).update({
  nextRunAt: Timestamp.fromDate(new Date(Date.now() - 60_000)),
})
console.log('backdated', requestId)
" <REQUEST_ID>
```

## 3. What to verify

- **Email sent** (or `[ClientRequest Email Link]` dev_log if `RESEND_API_KEY` unset);
  subject is prefixed with `Reminder:` and notes how long the request has been open.
- **SMS dev_log** appears if the client has `sms: true` + a phone, and
  `TELNYX_API_KEY` is empty.
- `reminderSchedules/{requestId}` shows `attemptCount` incremented and `nextRunAt`
  pushed forward by `cadenceDays` (halved after attempt 3 when `escalate` is true).
- A `notificationLogs` entry exists per channel attempted.
- **Kill switch:** complete the request in the client portal, backdate `nextRunAt`
  again, re-run the cron — the schedule should be deactivated and nothing sent.
- **Max attempts:** set `attemptCount` to `maxAttempts - 1`, run the cron — the
  schedule deactivates, a `max_attempts_reached` log is written, and a
  "Reminder limit reached" event appears on the workspace timeline.

## 4. Admin controls

On `/admin/clients/{clientId}` the "Automatic Reminders" card shows attempt count,
next run date, and last channels per open request, with **Pause/Resume** and
**Send reminder now** buttons. "Send reminder now" dispatches immediately and counts
as an attempt (pushes `nextRunAt` forward).

## 5. Production checklist

- Set `CRON_SECRET` in Vercel project env (same value as `.env.local` or rotate both)
- `vercel.json` is committed with the cron entry
- After deploy, check Vercel → Project → Settings → Cron Jobs shows the schedule
