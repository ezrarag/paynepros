"use server"

import { createHash, randomBytes } from "crypto"
import { clientWorkspaceRepository } from "@/lib/repositories/client-workspace-repository"
import { intakeLinkRepository } from "@/lib/repositories/intake-link-repository"

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
      lastActivityAt: now,
    })
    return { success: true, data: { id: workspace.id } }
  } catch (error) {
    console.error("Failed to create client:", error)
    return { success: false, error: "Failed to create client. Please try again." }
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
  workspaceIds: string[]
): Promise<ActionResult<{ workspaceId: string; url: string }[]>> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
    const createdBy = "mock-admin-id"
    const results = await Promise.all(
      workspaceIds.map(async (workspaceId) => {
        const token = randomBytes(32).toString("hex")
        const tokenHash = createHash("sha256").update(token).digest("hex")
        const expiresAt = new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString()
        await intakeLinkRepository.create({
          clientWorkspaceId: workspaceId,
          tokenHash,
          tokenLast4: token.slice(-4),
          channels: ["email", "sms", "whatsapp"],
          status: "active",
          createdBy,
          expiresAt,
        })
        return { workspaceId, url: `${baseUrl}/intake/${token}` }
      })
    )
    return { success: true, data: results }
  } catch (error) {
    console.error("Failed to generate intake links:", error)
    return { success: false, error: "Failed to generate intake links. Please try again." }
  }
}
