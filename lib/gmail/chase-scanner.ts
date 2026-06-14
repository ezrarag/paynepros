import "server-only"
import { getClientRequestTemplate } from "@/lib/client-requests"
import { GOOGLE_GMAIL_READONLY_SCOPE } from "@/lib/google-workspace-integration"
import { getGoogleWorkspaceAccessToken } from "@/lib/google-workspace-tokens"
import { clientRequestRepository } from "@/lib/repositories/client-request-repository"
import { clientWorkspaceRepository } from "@/lib/repositories/client-workspace-repository"
import { gmailChaseRepository, type GmailChaseSuggestion } from "@/lib/repositories/gmail-chase-repository"
import { integrationRepository } from "@/lib/repositories/integration-repository"
import type { ClientRequestType, ClientWorkspace } from "@/lib/types/client-workspace"

interface GmailListResponse {
  messages?: { id: string; threadId?: string }[]
}

interface GmailMessageResponse {
  id: string
  threadId?: string
  snippet?: string
  payload?: {
    headers?: { name: string; value: string }[]
  }
}

interface InferredRequest {
  requestType: ClientRequestType
  title: string
  instructions: string
  confidence: "high" | "low"
}

const SCAN_QUERY =
  'in:sent newer_than:45d (w2 OR "w-2" OR 1099 OR "bank statement" OR mileage OR receipt OR upload OR send OR provide OR missing OR document)'
const MAX_MESSAGES = 25

function header(message: GmailMessageResponse, name: string): string {
  return (
    message.payload?.headers?.find((item) => item.name.toLowerCase() === name.toLowerCase())
      ?.value ?? ""
  )
}

function extractEmails(value: string): string[] {
  const matches = value.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi) ?? []
  return Array.from(new Set(matches.map((email) => email.toLowerCase())))
}

function parseHeaderDate(value: string): string {
  const date = value ? new Date(value) : null
  return date && !Number.isNaN(date.getTime()) ? date.toISOString() : new Date().toISOString()
}

function inferRequest(subject: string, snippet: string): InferredRequest | null {
  const text = `${subject} ${snippet}`.toLowerCase()
  const hasAction = /\b(need|needs|send|sent|upload|provide|missing|request|please|attach|forward|share)\b/.test(text)
  const template = (type: ClientRequestType) => getClientRequestTemplate(type)

  const matches: { type: ClientRequestType; pattern: RegExp; title?: string }[] = [
    { type: "w2", pattern: /\bw-?2s?\b/i },
    { type: "1099", pattern: /\b1099s?\b/i },
    { type: "bank_statements", pattern: /\bbank\s+statements?\b|\bstatements?\b/i },
    { type: "mileage", pattern: /\bmileage\b|\bmiles?\b/i },
    { type: "schedule_c_expenses", pattern: /\bschedule\s*c\b|\bexpenses?\b|\breceipts?\b/i },
    { type: "id", pattern: /\bphoto\s+id\b|\bdrivers?\s+license\b|\bidentification\b/i },
    { type: "engagement_consent", pattern: /\bengagement\b|\bconsent\b|\be-?file\b/i },
  ]

  const matched = matches.find((candidate) => candidate.pattern.test(text))
  if (matched) {
    const foundTemplate = template(matched.type)
    return {
      requestType: matched.type,
      title: foundTemplate?.title ?? matched.title ?? "Send Requested Document",
      instructions: foundTemplate?.instructions ?? "Provide the requested item noted by your preparer.",
      confidence: hasAction ? "high" : "low",
    }
  }

  if (hasAction && /\b(document|documents|docs|paperwork|tax\s+forms?)\b/.test(text)) {
    return {
      requestType: "other",
      title: "Send Requested Documents",
      instructions: "Provide the documents requested in your preparer's email.",
      confidence: "low",
    }
  }

  return null
}

function workspaceByEmail(workspaces: ClientWorkspace[]) {
  const map = new Map<string, ClientWorkspace>()
  for (const workspace of workspaces) {
    const email = workspace.primaryContact?.email?.trim().toLowerCase()
    if (email) {
      map.set(email, workspace)
    }
  }
  return map
}

async function hasOpenDuplicate(
  workspaceId: string,
  inferred: InferredRequest
): Promise<boolean> {
  const requests = await clientRequestRepository.listByWorkspace(workspaceId)
  return requests.some(
    (request) =>
      request.status !== "completed" &&
      (request.type === inferred.requestType ||
        request.title.trim().toLowerCase() === inferred.title.trim().toLowerCase())
  )
}

async function fetchGmailJson<T>(accessToken: string, url: URL): Promise<T> {
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })
  if (!response.ok) {
    const raw = await response.text().catch(() => "")
    throw new Error(raw || `Gmail request failed (${response.status})`)
  }
  return response.json() as Promise<T>
}

export async function scanGmailForClientChases(tenantId: string): Promise<{
  scanned: number
  createdSuggestions: number
  skippedDuplicates: number
  missingScope: boolean
}> {
  const integration = await integrationRepository.getGoogleWorkspaceIntegration(tenantId)
  if (!integration.connected) {
    throw new Error("Google Workspace is not connected")
  }
  if (!integration.scopes.includes(GOOGLE_GMAIL_READONLY_SCOPE)) {
    return { scanned: 0, createdSuggestions: 0, skippedDuplicates: 0, missingScope: true }
  }

  const accessToken = await getGoogleWorkspaceAccessToken(tenantId)
  const listUrl = new URL("https://gmail.googleapis.com/gmail/v1/users/me/messages")
  listUrl.searchParams.set("q", SCAN_QUERY)
  listUrl.searchParams.set("maxResults", String(MAX_MESSAGES))

  const list = await fetchGmailJson<GmailListResponse>(accessToken, listUrl)
  const messages = list.messages ?? []
  const workspaces = await clientWorkspaceRepository.findAll(500)
  const emailWorkspaceMap = workspaceByEmail(workspaces)
  let createdSuggestions = 0
  let skippedDuplicates = 0

  for (const listedMessage of messages) {
    const messageUrl = new URL(
      `https://gmail.googleapis.com/gmail/v1/users/me/messages/${encodeURIComponent(listedMessage.id)}`
    )
    messageUrl.searchParams.set("format", "metadata")
    messageUrl.searchParams.append("metadataHeaders", "To")
    messageUrl.searchParams.append("metadataHeaders", "Cc")
    messageUrl.searchParams.append("metadataHeaders", "Subject")
    messageUrl.searchParams.append("metadataHeaders", "Date")

    const message = await fetchGmailJson<GmailMessageResponse>(accessToken, messageUrl)
    const recipients = [
      ...extractEmails(header(message, "To")),
      ...extractEmails(header(message, "Cc")),
    ]
    const subject = header(message, "Subject")
    const snippet = message.snippet ?? ""
    const inferred = inferRequest(subject, snippet)
    if (!inferred) {
      continue
    }

    for (const email of recipients) {
      const workspace = emailWorkspaceMap.get(email)
      if (!workspace) {
        continue
      }
      if (await hasOpenDuplicate(workspace.id, inferred)) {
        skippedDuplicates += 1
        continue
      }

      const suggestion: Omit<GmailChaseSuggestion, "id" | "status" | "createdAt" | "updatedAt"> = {
        tenantId,
        workspaceId: workspace.id,
        workspaceName: workspace.displayName,
        clientEmail: email,
        gmailMessageId: message.id,
        gmailThreadId: message.threadId,
        requestType: inferred.requestType,
        title: inferred.title,
        instructions: inferred.instructions,
        subject: subject || undefined,
        snippet,
        receivedAt: parseHeaderDate(header(message, "Date")),
        confidence: inferred.confidence,
      }
      const stored = await gmailChaseRepository.upsertPending(suggestion)
      if (stored.status === "pending") {
        createdSuggestions += 1
      }
    }
  }

  return {
    scanned: messages.length,
    createdSuggestions,
    skippedDuplicates,
    missingScope: false,
  }
}
