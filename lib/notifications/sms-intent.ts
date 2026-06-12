import type { ClientRequestType } from "@/lib/types/client-workspace"

export interface ParsedSmsIntent {
  clientName: string
  documentRequested: string
  templateType: ClientRequestType
  customTitle?: string
  confidence: "high" | "low"
}

const VALID_TEMPLATE_TYPES: ClientRequestType[] = [
  "w2",
  "1099",
  "id",
  "bank_statements",
  "mileage",
  "schedule_c_expenses",
  "engagement_consent",
  "other",
]

const SYSTEM_PROMPT = `You parse SMS messages from a tax preparer asking to request documents from a client. Output ONLY a JSON object, no other text:
{
  "clientName": string,       // the client's name as mentioned
  "documentRequested": string, // short human description of what's needed
  "templateType": string,     // one of: w2, 1099, id, bank_statements, mileage, schedule_c_expenses, engagement_consent, other
  "customTitle": string,      // only when templateType is "other": a short request title
  "confidence": "high" | "low" // low if the message is ambiguous or might not be a document request
}
Examples:
"ask johnson for their W2" -> {"clientName":"johnson","documentRequested":"W-2","templateType":"w2","confidence":"high"}
"need bank statements from alicia" -> {"clientName":"alicia","documentRequested":"bank statements","templateType":"bank_statements","confidence":"high"}
"get the llc operating agreement from marcus" -> {"clientName":"marcus","documentRequested":"LLC operating agreement","templateType":"other","customTitle":"Send LLC Operating Agreement","confidence":"high"}`

export async function parseSmsIntent(text: string): Promise<ParsedSmsIntent | null> {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    console.warn("[SMS intent] ANTHROPIC_API_KEY not set — cannot parse inbound SMS")
    return null
  }

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 300,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: text }],
    }),
  })

  if (!response.ok) {
    const raw = await response.text().catch(() => "")
    console.error("[SMS intent] Claude API error:", response.status, raw.slice(0, 200))
    return null
  }

  try {
    const data = (await response.json()) as {
      content?: { type: string; text?: string }[]
    }
    const textBlock = data.content?.find((block) => block.type === "text")?.text ?? ""
    const jsonMatch = textBlock.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return null
    }
    const parsed = JSON.parse(jsonMatch[0]) as Partial<ParsedSmsIntent>
    if (!parsed.clientName || !parsed.documentRequested) {
      return null
    }
    const templateType = VALID_TEMPLATE_TYPES.includes(parsed.templateType as ClientRequestType)
      ? (parsed.templateType as ClientRequestType)
      : "other"
    return {
      clientName: String(parsed.clientName),
      documentRequested: String(parsed.documentRequested),
      templateType,
      customTitle:
        templateType === "other"
          ? parsed.customTitle || `Send ${parsed.documentRequested}`
          : undefined,
      confidence: parsed.confidence === "high" ? "high" : "low",
    }
  } catch (error) {
    console.error("[SMS intent] Failed to parse Claude response:", error)
    return null
  }
}
