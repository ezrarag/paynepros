"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import {
  clearClientPortalSession,
  requireClientPortalSession,
} from "@/lib/client-portal-session"
import { clientWorkspaceRepository } from "@/lib/repositories/client-workspace-repository"
import { clientRequestRepository } from "@/lib/repositories/client-request-repository"
import { isDocumentRequestType } from "@/lib/client-requests"
import {
  checklistItems,
  isChecklistStatus,
  normalizeChecklist,
} from "@/lib/tax-return-checklist"
import type { ChecklistKey } from "@/lib/tax-return-checklist"
import type { TaxReturnChecklist } from "@/lib/types/client-workspace"

async function maybeCompleteDocumentsChecklist(workspaceId: string) {
  const requests = await clientRequestRepository.listByWorkspace(workspaceId)
  const documentRequests = requests.filter((request) => isDocumentRequestType(request.type))
  if (documentRequests.length === 0) return
  const hasOpenDocRequest = documentRequests.some((request) => request.status !== "completed")
  if (hasOpenDocRequest) return

  const workspace = await clientWorkspaceRepository.findById(workspaceId)
  if (!workspace) return
  const checklist = normalizeChecklist(workspace.taxReturnChecklist)
  if (checklist.documentsComplete === "complete") return

  await clientWorkspaceRepository.update(workspaceId, {
    taxReturnChecklist: {
      ...checklist,
      documentsComplete: "complete",
    },
    lastActivityAt: new Date().toISOString(),
  })
  await clientWorkspaceRepository.appendTimelineEvent(workspaceId, {
    type: "tax_return",
    title: "Documents checklist auto-completed",
    description: "All open document requests are completed.",
  })
}

export async function updateClientChecklistStatus(formData: FormData): Promise<void> {
  try {
    const user = await requireClientPortalSession()
    const workspaceId = String(formData.get("workspaceId") || "")
    const itemKey = String(formData.get("itemKey") || "")
    const nextStatus = String(formData.get("status") || "")

    if (!workspaceId || workspaceId !== user.workspaceId) {
      return
    }

    if (!isChecklistStatus(nextStatus)) {
      return
    }

    const allowedKeys = checklistItems.map((item) => item.key)
    if (!allowedKeys.includes(itemKey as ChecklistKey)) {
      return
    }

    const workspace = await clientWorkspaceRepository.findById(workspaceId)
    if (!workspace) {
      return
    }

    const currentChecklist = normalizeChecklist(workspace.taxReturnChecklist)
    const currentStatus = currentChecklist[itemKey as ChecklistKey]
    if (currentStatus === nextStatus) {
      return
    }

    const updatedChecklist = {
      ...currentChecklist,
      [itemKey]: nextStatus,
    } as TaxReturnChecklist

    await clientWorkspaceRepository.update(workspaceId, {
      taxReturnChecklist: updatedChecklist,
      lastActivityAt: new Date().toISOString(),
    })

    const itemLabel =
      checklistItems.find((item) => item.key === itemKey)?.label ?? "Checklist item"
    await clientWorkspaceRepository.appendTimelineEvent(workspaceId, {
      type: "tax_return",
      title: "Client updated checklist",
      description: `${itemLabel} marked ${nextStatus.replace("_", " ")}.`,
    })

    revalidatePath("/client")
    revalidatePath(`/admin/clients/${workspaceId}`)
  } catch (error) {
    console.error("Failed to update client checklist status:", error)
  }
}

export async function completeClientRequest(formData: FormData): Promise<void> {
  try {
    const user = await requireClientPortalSession()
    const workspaceId = String(formData.get("workspaceId") || "")
    const requestId = String(formData.get("requestId") || "")
    if (!workspaceId || workspaceId !== user.workspaceId || !requestId) {
      return
    }

    const request = await clientRequestRepository.findById(workspaceId, requestId)
    if (!request || request.status === "completed") {
      return
    }

    const completedAt = new Date().toISOString()
    await clientRequestRepository.updateStatus(workspaceId, requestId, {
      status: "completed",
      completedAt,
    })
    await clientWorkspaceRepository.appendTimelineEvent(workspaceId, {
      type: "client_request_completed",
      title: "Client request completed",
      description: request.title,
      metadata: {
        requestId: request.id,
        type: request.type,
      },
    })

    await maybeCompleteDocumentsChecklist(workspaceId)

    revalidatePath("/client")
    revalidatePath(`/admin/clients/${workspaceId}`)
  } catch (error) {
    console.error("Failed to complete client request:", error)
  }
}

export async function clientSignOut(): Promise<void> {
  await clearClientPortalSession()
  redirect("/client/login")
}
