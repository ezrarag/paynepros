import { clientRequestRepository } from "@/lib/repositories/client-request-repository"
import { clientWorkspaceRepository } from "@/lib/repositories/client-workspace-repository"
import { notificationLogRepository } from "@/lib/repositories/notification-log-repository"
import { sendRequestEmail, type ChannelSendResult } from "@/lib/notifications/email"
import { sendRequestSms } from "@/lib/notifications/sms"
import { DEFAULT_NOTIFICATION_PREFERENCES } from "@/lib/types/client-workspace"

export interface SendRequestReminderOptions {
  isFirstSend?: boolean
  /** Pass through when called from an API route so links use the request origin. */
  baseUrl?: string
}

/**
 * Fans a document-request notification out to every channel the client has
 * enabled, logging each attempt. Used both for the first send (admin clicks
 * "send") and recurring reminders (cron).
 */
export async function sendRequestReminder(
  workspaceId: string,
  requestId: string,
  opts: SendRequestReminderOptions = {}
): Promise<ChannelSendResult[]> {
  const workspace = await clientWorkspaceRepository.findById(workspaceId)
  if (!workspace) {
    return [{ channel: "none", ok: false, error: "Workspace not found" }]
  }

  const requestRecord = await clientRequestRepository.findById(workspaceId, requestId)
  if (!requestRecord) {
    return [{ channel: "none", ok: false, error: "Request not found" }]
  }
  if (requestRecord.status === "completed") {
    return [{ channel: "none", ok: false, error: "Request already completed" }]
  }

  const prefs = {
    ...DEFAULT_NOTIFICATION_PREFERENCES,
    ...workspace.notificationPreferences,
  }
  const isReminder = !opts.isFirstSend
  const results: ChannelSendResult[] = []

  if (prefs.email) {
    try {
      results.push(await sendRequestEmail(workspace, requestRecord, { isReminder, baseUrl: opts.baseUrl }))
    } catch (error) {
      results.push({
        channel: "email",
        ok: false,
        error: error instanceof Error ? error.message : "Email send threw",
      })
    }
  }

  if (prefs.sms && prefs.phone) {
    try {
      results.push(await sendRequestSms(workspace, requestRecord, { isReminder, baseUrl: opts.baseUrl }))
    } catch (error) {
      results.push({
        channel: "sms",
        ok: false,
        error: error instanceof Error ? error.message : "SMS send threw",
      })
    }
  }

  if (results.length === 0) {
    results.push({ channel: "none", ok: false, error: "No notification channels enabled" })
  }

  const logType = opts.isFirstSend ? "first_send" : "reminder"
  for (const result of results) {
    try {
      await notificationLogRepository.create({
        workspaceId,
        requestId,
        type: logType,
        channel: result.channel,
        ok: result.ok,
        ...(result.error ? { error: result.error } : {}),
      })
    } catch (error) {
      console.error("Failed to write notification log:", error)
    }
  }

  return results
}
