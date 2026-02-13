"use server"

import { createHash } from "crypto"
import { revalidatePath } from "next/cache"
import { clientWorkspaceRepository } from "@/lib/repositories/client-workspace-repository"
import { intakeLinkRepository } from "@/lib/repositories/intake-link-repository"
import {
  checklistDefaults,
  checklistItems,
  checklistStatusLabels,
  isChecklistStatus,
  normalizeChecklist,
} from "@/lib/tax-return-checklist"
import { createIntakeLinkToken } from "@/lib/intake/link-token"
import type { ChecklistKey } from "@/lib/tax-return-checklist"
import type { TaxReturnChecklist } from "@/lib/types/client-workspace"

export type ActionResult<T = void> = 
  | { success: true; data: T }
  | { success: false; error: string }

export async function createClient(input: {
  name: string
  email?: string
  phone?: string
  tags: string[]
  taxYears: number[]
}): Promise<ActionResult<{ id: string }>> {
  try {
    const now = new Date().toISOString()
    const workspace = await clientWorkspaceRepository.create({
      displayName: input.name,
      status: "active",
      primaryContact: {
        name: input.name,
        email: input.email,
        phone: input.phone,
      },
      tags: input.tags,
      taxYears: input.taxYears,
      taxReturnChecklist: checklistDefaults,
      lastActivityAt: now,
    })
    return { success: true, data: { id: workspace.id } }
  } catch (error) {
    console.error("Failed to create client:", error)
    return { success: false, error: "Failed to create client. Please try again." }
  }
}

export async function deleteClient(workspaceId: string): Promise<ActionResult> {
  try {
    const deleted = await clientWorkspaceRepository.delete(workspaceId)
    if (!deleted) {
      return { success: false, error: "Client not found" }
    }
    return { success: true, data: undefined }
  } catch (error) {
    console.error("Failed to delete client:", error)
    return { success: false, error: "Failed to delete client. Please try again." }
  }
}

export async function bulkUpdate(input: {
  workspaceIds: string[]
  action: "add_tag" | "remove_tag" | "set_status"
  tag?: string
  status?: "active" | "inactive"
}): Promise<ActionResult> {
  try {
    const { workspaceIds, action } = input

    await Promise.all(
      workspaceIds.map(async (workspaceId) => {
        const workspace = await clientWorkspaceRepository.findById(workspaceId)
        if (!workspace) return

        if (action === "set_status" && input.status) {
          await clientWorkspaceRepository.update(workspaceId, { status: input.status })
          return
        }

        if ((action === "add_tag" || action === "remove_tag") && input.tag) {
          const hasTag = workspace.tags.includes(input.tag)
          const nextTags =
            action === "add_tag"
              ? hasTag
                ? workspace.tags
                : [...workspace.tags, input.tag]
              : workspace.tags.filter((tag) => tag !== input.tag)
          await clientWorkspaceRepository.update(workspaceId, { tags: nextTags })
        }
      })
    )
    return { success: true, data: undefined }
  } catch (error) {
    console.error("Failed to bulk update clients:", error)
    return { success: false, error: "Failed to update clients. Please try again." }
  }
}

export async function bulkGenerateIntakeLinks(
  workspaceIds: string[],
  baseUrl?: string
): Promise<ActionResult<{ workspaceId: string; url: string }[]>> {
  try {
    // Use provided baseUrl (from client), or fall back to environment variable
    // Priority: client-provided baseUrl > NEXT_PUBLIC_APP_URL > VERCEL_URL > localhost
    const url = baseUrl || 
      process.env.NEXT_PUBLIC_APP_URL || 
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000")
    const createdBy = "mock-admin-id"
    const expiresAt = new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString()
    const results = await Promise.all(
      workspaceIds.map(async (workspaceId) => {
        const token = createIntakeLinkToken({ kind: "existing_workspace", workspaceId, expiresAt })
        const tokenHash = createHash("sha256").update(token).digest("hex")
        await intakeLinkRepository.create({
          kind: "existing_workspace",
          clientWorkspaceId: workspaceId,
          tokenHash,
          tokenLast4: token.slice(-4),
          channels: ["email", "sms", "whatsapp"],
          status: "active",
          createdBy,
          expiresAt,
        })
        return { workspaceId, url: `${url}/intake/${token}` }
      })
    )
    return { success: true, data: results }
  } catch (error) {
    console.error("Failed to generate intake links:", error)
    return { success: false, error: "Failed to generate intake links. Please try again." }
  }
}

export async function updateClientChecklistStatus(input: {
  workspaceId: string
  itemKey: ChecklistKey
  status: "not_started" | "in_progress" | "complete"
}): Promise<ActionResult> {
  try {
    if (!input.workspaceId || !isChecklistStatus(input.status)) {
      return { success: false, error: "Invalid input" }
    }

    const allowedKeys = checklistItems.map((item) => item.key)
    if (!allowedKeys.includes(input.itemKey)) {
      return { success: false, error: "Invalid checklist item" }
    }

    const workspace = await clientWorkspaceRepository.findById(input.workspaceId)
    if (!workspace) {
      return { success: false, error: "Client not found" }
    }

    const currentChecklist = normalizeChecklist(workspace.taxReturnChecklist)
    const currentStatus = currentChecklist[input.itemKey]
    if (currentStatus === input.status) {
      return { success: true, data: undefined }
    }

    const updatedChecklist = {
      ...currentChecklist,
      [input.itemKey]: input.status,
    } as TaxReturnChecklist

    await clientWorkspaceRepository.update(input.workspaceId, {
      taxReturnChecklist: updatedChecklist,
      lastActivityAt: new Date().toISOString(),
    })

    const itemLabel =
      checklistItems.find((item) => item.key === input.itemKey)?.label ?? "Checklist item"
    await clientWorkspaceRepository.appendTimelineEvent(input.workspaceId, {
      type: "tax_return",
      title: "Return checklist updated",
      description: `${itemLabel} moved from ${checklistStatusLabels[currentStatus]} to ${
        checklistStatusLabels[input.status]
      }.`,
    })

    revalidatePath("/admin/clients")
    revalidatePath(`/admin/clients/${input.workspaceId}`)
    revalidatePath("/admin")
    return { success: true, data: undefined }
  } catch (error) {
    console.error("Failed to update checklist status:", error)
    return { success: false, error: "Failed to update checklist. Please try again." }
  }
}
