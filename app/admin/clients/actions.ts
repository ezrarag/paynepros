"use server"

import { createHash, randomBytes } from "crypto"
import { clientWorkspaceRepository } from "@/lib/repositories/client-workspace-repository"
import { intakeLinkRepository } from "@/lib/repositories/intake-link-repository"

 export async function createClient(input: {
   name: string
   email?: string
   phone?: string
   tags: string[]
   taxYears: number[]
 }) {
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
   return { id: workspace.id }
 }

 export async function bulkUpdate(input: {
   workspaceIds: string[]
   action: "add_tag" | "remove_tag" | "set_status"
   tag?: string
   status?: "active" | "inactive"
 }) {
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
 }

 export async function bulkGenerateIntakeLinks(workspaceIds: string[]) {
   const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
   const createdBy = "mock-admin-id"
   return Promise.all(
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
 }
