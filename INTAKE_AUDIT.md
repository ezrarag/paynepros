# Intake Form Audit

Audit of the PaynePros client intake flow for scope analysis and potential changes. Built with ChatGPT; this document summarizes current behavior, data model, and gaps.

---

## 1. Purpose & Current Scope

**Purpose:** Let admins send a one-time (or time-limited) link to a client. The client opens the link, completes a multi-step intake form, and responses are stored on the client workspace and appear in the admin timeline.

**In scope today:**
- Generate intake links (single workspace or bulk) from the admin client list.
- Client visits `/intake/{token}` and completes steps: Contact → Tax year → Income → Expenses → Consent.
- Responses are saved under the client workspace; a timeline event is added.
- Token is JWT-based; link can expire (configurable hours).

**Out of scope / not implemented:**
- Link is never marked "used" after submit (reuse possible until expiry).
- No admin UI to view a specific intake response (only timeline event).
- No sync of intake responses back into workspace fields (e.g. primary contact, tax years).
- No email/SMS sending of the link from the app (copy URL only).

---

## 2. End-to-End Flow

```
Admin: Clients list → "Generate Intake Link" (single) or select clients → "Generate intake links" (bulk)
  → API/server creates JWT, stores intake link in Firestore (tokenHash, workspaceId, expiresAt)
  → Admin gets URL: {baseUrl}/intake/{jwt}

Client: Opens URL → Intake page verifies JWT (valid/expired/invalid)
  → If valid: IntakeFlow loads steps from GET /api/intake-links/{token}
  → Client fills steps (contact, tax_year, income, expenses, consent), clicks Submit
  → POST /api/intake-links/{token} with { responses, clientWorkspaceId }
  → Server creates IntakeResponse under clientWorkspaces/{id}/intakeResponses, adds timeline event
  → Thank-you message
```

---

## 3. Data Model

### 3.1 IntakeLink (Firestore: `intakeLinks`)

| Field             | Type     | Notes                                      |
|-------------------|----------|--------------------------------------------|
| id                | string   | Firestore doc id                           |
| clientWorkspaceId | string   | Which workspace this link is for           |
| tokenHash         | string   | SHA-256 of the JWT (used for lookups)      |
| tokenLast4         | string   | Last 4 chars of token (display only)       |
| channels          | string[] | e.g. ["email", "sms", "whatsapp"]          |
| status             | string   | "active" \| "expired" \| "used"            |
| createdBy         | string   | e.g. "mock-admin-id"                       |
| createdAt         | timestamp|                                            |
| expiresAt         | timestamp| JWT exp matches this                       |

- **Token in URL:** JWT signed with `INTAKE_LINK_SECRET` (or dev default). Payload: `workspaceId`, `expiresAt`, `purpose: "intake"`.
- **Verification:** Intake page and API use `verifyIntakeLinkToken(token)` (decode JWT, check exp and payload). They do **not** look up the IntakeLink doc by tokenHash for validation; validation is JWT-only. Firestore intake link is for audit/listing (and future “mark used” / revoke).

### 3.2 IntakeResponse (Firestore: `clientWorkspaces/{id}/intakeResponses`)

| Field             | Type   | Notes                                  |
|-------------------|--------|----------------------------------------|
| id                | string | Firestore doc id                       |
| clientWorkspaceId | string | Same as link’s workspace               |
| intakeLinkId      | string | **Stored as tokenHash** (not link doc id) |
| submittedAt       | timestamp |                                     |
| responses         | object | Key-value by field id (see Steps)      |

- One submission = one document. Multiple submissions = multiple docs; no “latest” merge in UI (admin can use `findLatest` in code if needed).

### 3.3 Intake Steps (code: `lib/intake/steps.ts`)

Step ids: `contact` | `tax_year` | `income` | `expenses` | `consent`.

| Step id   | Title                    | Fields (id → type) |
|-----------|--------------------------|---------------------|
| contact   | Contact Info             | fullName (text), email (email), phone (tel), preferredChannel (select: Email, SMS, WhatsApp) |
| tax_year  | Tax Year                 | taxYears (multiselect: 2022, 2023, 2024) |
| income    | Income Types             | incomeTypes (multiselect: W-2, 1099, Self-employed, Rental, Investments, Other) |
| expenses  | Expense Categories       | expenseCategories (multiselect: Mileage, Supplies, Travel, Home office, Meals, Other) |
| consent   | Consent & Authorization  | consentSignature (checkbox), notes (textarea) |

- Field types used: `text`, `email`, `tel`, `select`, `multiselect`, `textarea`, `checkbox`.
- Required in schema: `fullName`, `email`, `taxYears`, `consentSignature`. Client-side does not enforce required before submit (no validation layer documented).

---

## 4. UI & Behavior

- **Route:** `app/intake/[token]/page.tsx` — server component; verifies token, then renders `IntakeFlow` with `token` and `workspaceId`.
- **IntakeFlow** (`components/intake/IntakeFlow.tsx`): Client component. One step at a time; state in `formState` (keyed by field id). No draft persistence (refresh = lose data). On submit: POST to `/api/intake-links/{token}` with `responses` and `clientWorkspaceId`.
- **Field rendering:** `FieldRenderer` in same file — supports text, email, tel, textarea, select, multiselect, checkbox. All steps share the same renderer.
- **Errors:** Invalid/expired token shows “Intake link unavailable” with message. Submit errors show “Intake link unavailable” + error text (from API).

---

## 5. APIs & Repositories

| Endpoint / Repo                    | Role |
|------------------------------------|------|
| POST `/api/intake-links`           | Create one link (JWT + store in Firestore); return `url`. Used by “Generate Intake Link” button. |
| GET `/api/intake-links/[token]`    | Verify JWT; return `{ valid, clientWorkspaceId, steps }`. Used by IntakeFlow to load steps. |
| POST `/api/intake-links/[token]`   | Verify JWT; create IntakeResponse; add timeline event. Does **not** mark link used or update workspace fields. |
| `intakeLinkRepository`             | create, findByTokenHash, markUsed (markUsed not called anywhere). |
| `intakeResponseRepository`        | create (under workspace subcollection), findLatest. |

---

## 6. Bug Fix Applied: Bulk Generate Intake Links

**Issue:** Bulk “Generate intake links” used a **raw hex token** and put it in the URL. The intake page and API expect a **JWT**. So bulk-generated links always showed “invalid” or “expired”.

**Change:** `bulkGenerateIntakeLinks` in `app/admin/clients/actions.ts` now uses `createIntakeLinkToken({ workspaceId, expiresAt })` (same as single-link API), stores `tokenHash = sha256(JWT)` and returns `url: ${baseUrl}/intake/${token}`. Bulk and single-link flows now both produce JWT URLs that verify correctly.

---

## 7. Gaps & Quirks (for scope decisions)

1. **Link not marked “used”)**  
   `intakeLinkRepository.markUsed(linkId)` exists but is never called. To call it, you’d need to resolve the Firestore link doc by `tokenHash` (from the JWT) after verification, then call `markUsed(doc.id)`. Currently links can be reused until expiry.

2. **intakeLinkId = tokenHash**  
   IntakeResponse stores `intakeLinkId: tokenHash`. So it’s not the Firestore IntakeLink document id. Fine for “which token was used”; awkward if you want to join back to IntakeLink doc (you’d query by tokenHash).

3. **No validation before submit**  
   Required fields are defined in steps but there’s no client- or server-side validation before saving. You can add required checks in IntakeFlow and/or in POST `/api/intake-links/[token]`.

4. **No workspace sync**  
   Submissions don’t update `clientWorkspaces` (e.g. primaryContact, taxYears). If you want “intake pre-fills workspace,” you’d add that in the POST handler after creating IntakeResponse.

5. **Tax years in steps**  
   Steps only list 2022–2024. You may want to align with `TAX_YEAR_OPTIONS` elsewhere (e.g. 2022–2026) and/or make this configurable.

6. **Single expiry for bulk**  
   Bulk generation uses a fixed 72-hour expiry. Single-link API uses `expiresInHours` (default 7 days). You might want one config (e.g. 72h for bulk, 7d for single) or make both configurable.

7. **No admin view of response**  
   Admin sees “Intake submitted” on the timeline but doesn’t have a dedicated “View intake response” UI showing the latest (or all) responses. `intakeResponseRepository.findLatest(workspaceId)` exists for that.

---

## 8. Suggestions for Scope Change

- **Narrow scope:** Fewer steps (e.g. contact + consent only); or shorter steps (fewer fields per step). Easiest: edit `lib/intake/steps.ts` and optionally hide steps in IntakeFlow by step id.
- **Expand scope:**  
  - Mark link “used” after first successful submit (look up by tokenHash, then markUsed).  
  - Optional: one-time link (invalidate after submit even if not expired).  
  - Sync key fields (name, email, phone, tax years) from intake response to workspace.  
  - Admin UI: “View latest intake” (and optionally history) on the client workspace page using `findLatest`.  
  - Validate required fields on client and/or server.  
  - Align tax year options with rest of app; consider configurable expiry for bulk vs single.
- **UX:** Save draft to localStorage (or backend) so refresh doesn’t lose data; optional progress indicator (e.g. “Step 2 of 5”).

---

## 9. File Reference

| Area           | Files |
|----------------|--------|
| Token          | `lib/intake/link-token.ts` |
| Steps schema   | `lib/intake/steps.ts` |
| Types          | `lib/types/client-workspace.ts` (IntakeLink, IntakeResponse, IntakeStepId) |
| Repos          | `lib/repositories/intake-link-repository.ts`, `lib/repositories/intake-response-repository.ts` |
| API            | `app/api/intake-links/route.ts`, `app/api/intake-links/[token]/route.ts` |
| Pages          | `app/intake/[token]/page.tsx` |
| UI             | `components/intake/IntakeFlow.tsx` |
| Admin triggers | `components/admin/CreateIntakeLinkButton.tsx`, `app/admin/clients/actions.ts` (bulkGenerateIntakeLinks), `components/admin/ClientWorkspaceList.tsx` |

Use this audit to decide scope (e.g. fewer steps, sync to workspace, mark used, admin view) and then adjust the steps schema, API, and UI accordingly.
