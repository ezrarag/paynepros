import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { Lead, LeadBusiness, LeadSource } from "@/packages/core"
import { leadRepository } from "@/lib/repositories/lead-repository"
import { classifyLead } from "@/lib/classify-lead"

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

