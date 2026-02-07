# Where Intake Form Data Goes

When a client completes an intake form, here's where the data is stored and how to access it:

## Data Storage Locations

### 1. Intake Response Document
**Location:** `clientWorkspaces/{workspaceId}/intakeResponses/{responseId}`

The complete intake form responses are stored as a subcollection under each client workspace:

```typescript
{
  id: string
  clientWorkspaceId: string
  intakeLinkId: string  // SHA-256 hash of the JWT token
  submittedAt: string   // ISO timestamp
  responses: Record<string, any>  // All form field responses
}
```

**Access via code:**
```typescript
import { intakeResponseRepository } from "@/lib/repositories/intake-response-repository"

// Get latest intake response for a workspace
const latestIntake = await intakeResponseRepository.findLatest(workspaceId)
```

### 2. Timeline Event
**Location:** `clientWorkspaces/{workspaceId}/timeline/{eventId}`

A timeline event is automatically created when intake is submitted:

```typescript
{
  type: "intake"
  title: "Intake submitted"
  description: "Client submitted the intake form." (or "New client submitted the intake form.")
  metadata: {
    event: "intake_submitted"
    intakeResponseId: string
  }
  createdAt: string
}
```

**Where to see it:**
- Client workspace page → Timeline tab
- Dashboard → Activity Feed (last 10 events across all clients)

### 3. Workspace Updates (for new clients)
**Location:** `clientWorkspaces/{workspaceId}`

When a **new client** submits intake (not existing workspace), a new workspace is created with:

- `displayName`: From `responses.fullName`
- `primaryContact`: Name, email, phone from responses
- `taxYears`: Parsed from `responses.taxYears`
- `tags`: Derived from income types and expense categories
- `status`: Set to `"new"`
- `taxReturnChecklist`: Initialized with default statuses

## Viewing Intake Data

### In Admin UI

1. **Timeline View** (Current):
   - Go to `/admin/clients/{clientId}`
   - Click "Timeline" tab
   - Look for "Intake submitted" events
   - Click event to see metadata (includes `intakeResponseId`)

2. **Client Workspace Details** (Future):
   - Currently no dedicated UI to view full intake responses
   - Can be accessed programmatically via `intakeResponseRepository.findLatest(workspaceId)`

### Programmatic Access

```typescript
// Get latest intake response
const latestIntake = await intakeResponseRepository.findLatest(workspaceId)
console.log(latestIntake.responses) // All form responses

// Get all timeline events (includes intake submissions)
const timeline = await clientWorkspaceRepository.getTimeline(workspaceId)
const intakeEvents = timeline.filter(e => e.type === "intake")
```

## Data Flow

```
Client submits form
  ↓
POST /api/intake-links/{token}
  ↓
Creates IntakeResponse document
  ↓
Creates/Updates Workspace (if new client)
  ↓
Adds Timeline Event
  ↓
Updates IntakeLink status (if applicable)
```

## Notes

- **Multiple Submissions**: Clients can submit multiple intake forms. Each creates a new `IntakeResponse` document.
- **No Auto-Sync**: Intake responses are NOT automatically synced back into workspace fields (e.g., updating `primaryContact.email` if it changes). This is manual or future feature.
- **Token Tracking**: The `intakeLinkId` in responses is the SHA-256 hash of the JWT token, used for linking responses to the original intake link.
