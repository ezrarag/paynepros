"use server"

import { revalidatePath } from "next/cache"
import { getClientRequestTemplate } from "@/lib/client-requests"
import { getCurrentUser } from "@/lib/auth"
import { canManageIntegrations } from "@/lib/rbac"
import { sendRequestReminder } from "@/lib/notifications/dispatcher"
import { clientRequestRepository } from "@/lib/repositories/client-request-repository"
import { clientWorkspaceRepository } from "@/lib/repositories/client-workspace-repository"
import { gmailChaseRepository } from "@/lib/repositories/gmail-chase-repository"
import { scanGmailForClientChases } from "@/lib/gmail/chase-scanner"
import type { ClientRequestDelivery } from "@/lib/types/client-workspace"

async function requireIntegrationManager() {
  const user = await getCurrentUser()
  if (!user || !canManageIntegrations(user)) {
    return null
  }
  return user
}

export async function scanGmailChases(): Promise<void> {
  const user = await requireIntegrationManager()
  if (!user) return

  try {
    const result = await scanGmailForClientChases(user.tenantId)
    console.log("Gmail chase scan complete:", result)
    revalidatePath("/admin/integrations")
  } catch (error) {
    console.error("Gmail chase scan failed:", error)
    revalidatePath("/admin/integrations")
  }
}

export async function createRequestFromGmailSuggestion(formData: FormData): Promise<void> {
  const user = await requireIntegrationManager()
  if (!user) return

  const suggestionId = String(formData.get("suggestionId") || "")
  if (!suggestionId) return

  try {
    const suggestion = await gmailChaseRepository.findById(suggestionId)
    if (!suggestion || suggestion.tenantId !== user.tenantId || suggestion.status !== "pending") {
      return
    }

    const workspace = await clientWorkspaceRepository.findById(suggestion.workspaceId)
    if (!workspace) {
      return
    }

    const delivery: ClientRequestDelivery[] = ["email"]
    if (workspace.notificationPreferences?.sms && workspace.notificationPreferences.phone) {
      delivery.push("sms")
    }

    const template = getClientRequestTemplate(suggestion.requestType)
    const requestRecord = await clientRequestRepository.create(suggestion.workspaceId, {
      type: suggestion.requestType,
      title: suggestion.title || template?.title || "Send Requested Documents",
      instructions:
        suggestion.instructions ||
        template?.instructions ||
        "Provide the requested item noted by your preparer.",
      noteFromPreparer: suggestion.subject
        ? `Detected from Gmail message: ${suggestion.subject}`
        : "Detected from Gmail message.",
      delivery,
      status: "sent",
    })

    await clientWorkspaceRepository.appendTimelineEvent(suggestion.workspaceId, {
      type: "client_request_sent",
      title: "Client request created from Gmail scan",
      description: requestRecord.title,
      metadata: {
        requestId: requestRecord.id,
        gmailMessageId: suggestion.gmailMessageId,
        gmailThreadId: suggestion.gmailThreadId,
        delivery,
      },
    })

    await sendRequestReminder(suggestion.workspaceId, requestRecord.id, { isFirstSend: true })
    await gmailChaseRepository.markCreated(suggestion.id, requestRecord.id)

    revalidatePath("/admin/integrations")
    revalidatePath(`/admin/clients/${suggestion.workspaceId}`)
    revalidatePath("/client")
  } catch (error) {
    console.error("Failed to create request from Gmail suggestion:", error)
  }
}

export async function dismissGmailSuggestion(formData: FormData): Promise<void> {
  const user = await requireIntegrationManager()
  if (!user) return

  const suggestionId = String(formData.get("suggestionId") || "")
  if (!suggestionId) return

  try {
    const suggestion = await gmailChaseRepository.findById(suggestionId)
    if (!suggestion || suggestion.tenantId !== user.tenantId) {
      return
    }
    await gmailChaseRepository.dismiss(suggestionId)
    revalidatePath("/admin/integrations")
  } catch (error) {
    console.error("Failed to dismiss Gmail suggestion:", error)
  }
}
