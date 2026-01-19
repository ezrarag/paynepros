"use server"

import { revalidatePath } from "next/cache"
import { clientWorkspaceRepository } from "@/lib/repositories/client-workspace-repository"
import {
  checklistItems,
  checklistStatusLabels,
  isChecklistStatus,
  normalizeChecklist,
} from "@/lib/tax-return-checklist"
import type { ChecklistKey } from "@/lib/tax-return-checklist"
import type { TaxReturnChecklist } from "@/lib/types/client-workspace"

export async function updateClient(input: {
  workspaceId: string
  name: string
  email?: string
  phone?: string
  tags: string[]
  taxYears: number[]
  status: "active" | "inactive"
}) {
  const updatedWorkspace = await clientWorkspaceRepository.update(input.workspaceId, {
    displayName: input.name,
    status: input.status,
    primaryContact: {
      name: input.name,
      email: input.email,
      phone: input.phone,
    },
    tags: input.tags,
    taxYears: input.taxYears,
  })
  if (!updatedWorkspace) {
    return
  }
  await clientWorkspaceRepository.appendTimelineEvent(input.workspaceId, {
    type: "profile_updated",
    title: "Profile updated",
    description: "Client contact details and tax profile updated.",
  })
}

export async function updateChecklistStatus(formData: FormData) {
  const workspaceId = String(formData.get("workspaceId") || "")
  const itemKey = String(formData.get("itemKey") || "")
  const nextStatus = String(formData.get("status") || "")

  if (!workspaceId || !isChecklistStatus(nextStatus)) {
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
    title: "Return checklist updated",
    description: `${itemLabel} moved from ${checklistStatusLabels[currentStatus]} to ${
      checklistStatusLabels[nextStatus]
    }.`,
  })

  revalidatePath(`/admin/clients/${workspaceId}`)
}

export async function uploadClientForm(input: { workspaceId: string; formName: string }) {
  await clientWorkspaceRepository.appendTimelineEvent(input.workspaceId, {
    type: "form_uploaded",
    title: "Form uploaded",
    description: `${input.formName} uploaded to client workspace.`,
  })
  revalidatePath(`/admin/clients/${input.workspaceId}`)
}
