import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { Lead, LeadBusiness, LeadSource } from "@/packages/core"
import { leadRepository } from "@/lib/repositories/lead-repository"
import { classifyLead } from "@/lib/classify-lead"

const LEAD_NOTIFICATION_TO = "taxprep@paynepros.com"

const escapeHtml = (value: string) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;")

const leadSchema = z.object({
  business: z.enum(['paynepros', 'ibms']),
  source: z.enum(['website', 'whatsapp', 'instagram', 'facebook', 'sms', 'email']),
  name: z.string().min(1, "Name is required"),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional().or(z.literal('')),
  company: z.string().optional(),
  message: z.string().min(1, "Message is required"),
  serviceInterest: z.string().optional(),
  meta: z.record(z.any()).optional(),
})

async function sendLeadNotificationEmail(lead: Lead): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY
  const from = process.env.CONTACT_FORM_FROM || process.env.CLIENT_MAGIC_LINK_FROM
  const isProduction = process.env.NODE_ENV === "production"

  if (!apiKey || !from) {
    if (isProduction) {
      console.error("Lead email notification is not configured (missing RESEND_API_KEY or sender).")
      return
    }
    console.log("[Lead Notification Email]", {
      to: LEAD_NOTIFICATION_TO,
      business: lead.business,
      source: lead.source,
      name: lead.name,
      email: lead.email,
      phone: lead.phone,
      serviceInterest: lead.serviceInterest,
      createdAt: lead.createdAt,
      message: lead.message,
    })
    return
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [LEAD_NOTIFICATION_TO],
      subject: `New ${lead.source} submission: ${lead.name}`,
      html: `
        <p><strong>New submission received</strong></p>
        <p><strong>Name:</strong> ${escapeHtml(lead.name)}</p>
        <p><strong>Email:</strong> ${escapeHtml(lead.email || "Not provided")}</p>
        <p><strong>Phone:</strong> ${escapeHtml(lead.phone || "Not provided")}</p>
        <p><strong>Source:</strong> ${escapeHtml(lead.source)}</p>
        <p><strong>Service interest:</strong> ${escapeHtml(lead.serviceInterest || "General inquiry")}</p>
        <p><strong>Submitted at:</strong> ${escapeHtml(lead.createdAt)}</p>
        <p><strong>Message:</strong></p>
        <p>${escapeHtml(lead.message).replaceAll("\n", "<br/>")}</p>
      `,
    }),
  })

  if (!response.ok) {
    const raw = await response.text().catch(() => "")
    console.error("Failed to send lead notification email:", raw || `resend_${response.status}`)
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate incoming data with Zod
    const validationResult = leadSchema.safeParse(body)
    
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: "Validation failed", 
          details: validationResult.error.errors 
        },
        { status: 400 }
      )
    }

    const validatedData = validationResult.data

    // Create Lead object
    const lead: Lead = {
      id: crypto.randomUUID(),
      business: validatedData.business as LeadBusiness,
      source: validatedData.source as LeadSource,
      name: validatedData.name,
      email: validatedData.email || undefined,
      phone: validatedData.phone || undefined,
      company: validatedData.company,
      message: validatedData.message,
      serviceInterest: validatedData.serviceInterest,
      meta: validatedData.meta,
      createdAt: new Date().toISOString(),
    }

    // Save to repository
    await leadRepository.save(lead)

    // Notify intake inbox for all lead submissions
    await sendLeadNotificationEmail(lead)

    // Send to OpenAI Pulse webhook
    const pulseWebhookUrl = process.env.PULSE_WEBHOOK_URL
    if (pulseWebhookUrl) {
      try {
        await fetch(pulseWebhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            business: lead.business,
            source: lead.source,
            message: lead.message,
            serviceInterest: lead.serviceInterest,
            name: lead.name,
            email: lead.email,
            phone: lead.phone,
          }),
        })
      } catch (webhookError) {
        console.error('Error sending to Pulse webhook:', webhookError)
        // Don't fail the request if webhook fails
      }
    }

    // Classify the lead
    const classification = await classifyLead(lead)

    // Return success with classification summary
    return NextResponse.json(
      { 
        success: true,
        summary: {
          probableService: classification.probableService,
          urgency: classification.urgency,
          suggestedNextAction: classification.suggestedNextAction,
        }
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Error processing lead:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
