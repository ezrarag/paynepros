"use server"

import { revalidatePath } from "next/cache"
import { clientWorkspaceRepository } from "@/lib/repositories/client-workspace-repository"
import { getMileageRate } from "@/lib/mileage-rates"
import {
  checklistItems,
  isChecklistStatus,
  normalizeChecklist,
} from "@/lib/tax-return-checklist"
import type { ChecklistKey } from "@/lib/tax-return-checklist"
import type {
  TaxReturnChecklist,
  EmailFormInput,
  FaxFormInput,
  MailFormInput,
  MileageCalculation,
  ScheduleCRow,
} from "@/lib/types/client-workspace"

export type ActionResult<T = void> = 
  | { success: true; data: T }
  | { success: false; error: string }

export async function updateClient(input: {
  workspaceId: string
  name: string
  email?: string
  phone?: string
  tags: string[]
  taxYears: number[]
  status: "active" | "inactive"
}): Promise<ActionResult> {
  try {
    const existingWorkspace = await clientWorkspaceRepository.findById(input.workspaceId)
    if (!existingWorkspace) {
      return { success: false, error: "Client not found" }
    }

    const nextPrimaryContact = {
      name: input.name,
      ...(input.email ? { email: input.email } : {}),
      ...(input.phone ? { phone: input.phone } : {}),
    }

    const updatedWorkspace = await clientWorkspaceRepository.update(input.workspaceId, {
      displayName: input.name,
      status: input.status,
      primaryContact: nextPrimaryContact,
      tags: input.tags,
      taxYears: input.taxYears,
    })
    if (!updatedWorkspace) {
      return { success: false, error: "Client not found" }
    }

    const changed: Record<string, { from: string; to: string }> = {}
    const maybeAddChange = (key: string, fromValue: unknown, toValue: unknown) => {
      const from = fromValue == null ? "" : JSON.stringify(fromValue)
      const to = toValue == null ? "" : JSON.stringify(toValue)
      if (from !== to) {
        changed[key] = { from, to }
      }
    }

    maybeAddChange("displayName", existingWorkspace.displayName, input.name)
    maybeAddChange("status", existingWorkspace.status, input.status)
    maybeAddChange("primaryContact.name", existingWorkspace.primaryContact?.name, input.name)
    maybeAddChange("primaryContact.email", existingWorkspace.primaryContact?.email, input.email)
    maybeAddChange("primaryContact.phone", existingWorkspace.primaryContact?.phone, input.phone)
    maybeAddChange("tags", existingWorkspace.tags, input.tags)
    maybeAddChange("taxYears", existingWorkspace.taxYears, input.taxYears)

    await clientWorkspaceRepository.appendTimelineEvent(input.workspaceId, {
      type: "profile_updated",
      title: "Profile updated",
      description: "Client contact details and tax profile updated.",
      metadata: {
        changed,
      },
    })
    return { success: true, data: undefined }
  } catch (error) {
    console.error("Failed to update client:", error)
    return { success: false, error: "Failed to update client. Please try again." }
  }
}

export async function updateChecklistStatus(formData: FormData): Promise<ActionResult> {
  try {
    const workspaceId = String(formData.get("workspaceId") || "")
    const itemKey = String(formData.get("itemKey") || "")
    const nextStatus = String(formData.get("status") || "")

    if (!workspaceId || !isChecklistStatus(nextStatus)) {
      return { success: false, error: "Invalid input" }
    }

    const allowedKeys = checklistItems.map((item) => item.key)
    if (!allowedKeys.includes(itemKey as ChecklistKey)) {
      return { success: false, error: "Invalid checklist item" }
    }

    const workspace = await clientWorkspaceRepository.findById(workspaceId)
    if (!workspace) {
      return { success: false, error: "Client not found" }
    }

    const currentChecklist = normalizeChecklist(workspace.taxReturnChecklist)
    const currentStatus = currentChecklist[itemKey as ChecklistKey]
    if (currentStatus === nextStatus) {
      return { success: true, data: undefined }
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
      description: `${itemLabel} marked ${nextStatus === "complete" ? "complete" : "not complete"}.`,
    })

    revalidatePath(`/admin/clients/${workspaceId}`)
    return { success: true, data: undefined }
  } catch (error) {
    console.error("Failed to update checklist status:", error)
    return { success: false, error: "Failed to update checklist. Please try again." }
  }
}

export async function uploadClientForm(input: { workspaceId: string; formName: string }): Promise<ActionResult> {
  try {
    await clientWorkspaceRepository.appendTimelineEvent(input.workspaceId, {
      type: "form_uploaded",
      title: "Form uploaded",
      description: `${input.formName} uploaded to client workspace.`,
    })
    revalidatePath(`/admin/clients/${input.workspaceId}`)
    return { success: true, data: undefined }
  } catch (error) {
    console.error("Failed to upload form:", error)
    return { success: false, error: "Failed to upload form. Please try again." }
  }
}

/**
 * Stub: Email a form to a recipient.
 * Does NOT actually send email - logs timeline event only.
 * Wire real email integration later.
 */
export async function emailForm(input: EmailFormInput): Promise<ActionResult> {
  try {
    // TODO: Wire real email integration (SendGrid, Resend, etc.)
    // For now, just log the timeline event
    await clientWorkspaceRepository.appendTimelineEvent(input.workspaceId, {
      type: "form_emailed",
      title: "Form emailed",
      description: `${input.formName} emailed to ${input.recipientEmail}`,
      metadata: {
        formId: input.formId,
        formName: input.formName,
        recipientEmail: input.recipientEmail,
        subject: input.subject,
        note: input.note,
        timestamp: new Date().toISOString(),
      },
    })
    revalidatePath(`/admin/clients/${input.workspaceId}`)
    return { success: true, data: undefined }
  } catch (error) {
    console.error("Failed to email form:", error)
    return { success: false, error: "Failed to email form. Please try again." }
  }
}

/**
 * Stub: Fax a form to a recipient.
 * Does NOT actually send fax - logs timeline event only.
 * Wire real fax integration later (e.g., Twilio Fax, eFax API).
 */
export async function faxForm(input: FaxFormInput): Promise<ActionResult> {
  try {
    // TODO: Wire real fax integration
    await clientWorkspaceRepository.appendTimelineEvent(input.workspaceId, {
      type: "form_faxed",
      title: "Form faxed",
      description: `${input.formName} faxed to ${input.faxNumber}`,
      metadata: {
        formId: input.formId,
        formName: input.formName,
        faxNumber: input.faxNumber,
        note: input.note,
        timestamp: new Date().toISOString(),
      },
    })
    revalidatePath(`/admin/clients/${input.workspaceId}`)
    return { success: true, data: undefined }
  } catch (error) {
    console.error("Failed to fax form:", error)
    return { success: false, error: "Failed to fax form. Please try again." }
  }
}

/**
 * Stub: Mail a form to a physical address.
 * Does NOT actually send mail - logs timeline event only.
 * Wire real mail integration later (e.g., Lob, Click2Mail).
 */
export async function mailForm(input: MailFormInput): Promise<ActionResult> {
  try {
    // TODO: Wire real mail integration
    const addressSummary = `${input.address.name}, ${input.address.street}, ${input.address.city}, ${input.address.state} ${input.address.zip}`
    await clientWorkspaceRepository.appendTimelineEvent(input.workspaceId, {
      type: "form_mailed",
      title: "Form mailed",
      description: `${input.formName} mailed to ${addressSummary}`,
      metadata: {
        formId: input.formId,
        formName: input.formName,
        address: input.address,
        addressSummary,
        note: input.note,
        timestamp: new Date().toISOString(),
      },
    })
    revalidatePath(`/admin/clients/${input.workspaceId}`)
    return { success: true, data: undefined }
  } catch (error) {
    console.error("Failed to mail form:", error)
    return { success: false, error: "Failed to mail form. Please try again." }
  }
}

/**
 * Save mileage deduction calculation to workspace
 */
export async function saveMileageCalculation(input: {
  workspaceId: string
  year: number
  miles: number
}): Promise<ActionResult<MileageCalculation>> {
  try {
    const rate = getMileageRate(input.year)
    const estimatedDeduction = Math.round(input.miles * rate * 100) / 100

    const mileageCalc: MileageCalculation = {
      year: input.year,
      miles: input.miles,
      rateUsed: rate,
      estimatedDeduction,
      updatedAt: new Date().toISOString(),
    }

    const workspace = await clientWorkspaceRepository.findById(input.workspaceId)
    if (!workspace) {
      return { success: false, error: "Client not found" }
    }

    await clientWorkspaceRepository.update(input.workspaceId, {
      calculations: {
        ...workspace.calculations,
        mileage: mileageCalc,
      },
      lastActivityAt: new Date().toISOString(),
    })

    await clientWorkspaceRepository.appendTimelineEvent(input.workspaceId, {
      type: "calculation_updated",
      title: "Mileage calculation updated",
      description: `${input.year} mileage: ${input.miles.toLocaleString()} miles × $${rate}/mi = $${estimatedDeduction.toLocaleString()}`,
    })

    revalidatePath(`/admin/clients/${input.workspaceId}`)
    return { success: true, data: mileageCalc }
  } catch (error) {
    console.error("Failed to save mileage calculation:", error)
    return { success: false, error: "Failed to save mileage calculation. Please try again." }
  }
}

/**
 * Save Schedule C expense rows to workspace
 */
export async function saveScheduleCCalculation(input: {
  workspaceId: string
  rows: ScheduleCRow[]
}): Promise<ActionResult<{ rows: ScheduleCRow[]; updatedAt: string }>> {
  try {
    const workspace = await clientWorkspaceRepository.findById(input.workspaceId)
    if (!workspace) {
      return { success: false, error: "Client not found" }
    }

    const scheduleC = {
      rows: input.rows,
      updatedAt: new Date().toISOString(),
    }

    await clientWorkspaceRepository.update(input.workspaceId, {
      calculations: {
        ...workspace.calculations,
        scheduleC,
      },
      lastActivityAt: new Date().toISOString(),
    })

    const total = input.rows.reduce((sum, row) => sum + row.amount, 0)
    await clientWorkspaceRepository.appendTimelineEvent(input.workspaceId, {
      type: "calculation_updated",
      title: "Schedule C expenses updated",
      description: `${input.rows.length} expense categories totaling $${total.toLocaleString()}`,
    })

    revalidatePath(`/admin/clients/${input.workspaceId}`)
    return { success: true, data: scheduleC }
  } catch (error) {
    console.error("Failed to save Schedule C calculation:", error)
    return { success: false, error: "Failed to save Schedule C calculation. Please try again." }
  }
}
