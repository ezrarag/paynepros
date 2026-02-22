"use server"

import { revalidatePath } from "next/cache"
import { signOut } from "@/auth"
import { requireClientAuth } from "@/lib/auth"
import { clientWorkspaceRepository } from "@/lib/repositories/client-workspace-repository"
import {
  checklistItems,
  isChecklistStatus,
  normalizeChecklist,
} from "@/lib/tax-return-checklist"
import type { ChecklistKey } from "@/lib/tax-return-checklist"
import type { TaxReturnChecklist } from "@/lib/types/client-workspace"

export async function updateClientChecklistStatus(formData: FormData): Promise<void> {
  try {
    const user = await requireClientAuth()
    const workspaceId = String(formData.get("workspaceId") || "")
    const itemKey = String(formData.get("itemKey") || "")
    const nextStatus = String(formData.get("status") || "")

    if (!workspaceId || workspaceId !== user.clientWorkspaceId) {
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

export async function clientSignOut(): Promise<void> {
  await signOut({ redirectTo: "/client/login" })
}
