import { NextRequest, NextResponse } from "next/server"
import { clientRequestRepository } from "@/lib/repositories/client-request-repository"
import { clientRequestTemplateRepository } from "@/lib/repositories/client-request-template-repository"
import { clientWorkspaceRepository } from "@/lib/repositories/client-workspace-repository"
import { getBaseUrl } from "@/lib/utils/url"

const escapeHtml = (value: string) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;")

const applyTokens = (input: string, tokens: Record<string, string>) =>
  input.replace(/\{\{(.*?)\}\}/g, (_match, keyRaw) => {
    const key = String(keyRaw || "").trim()
    return tokens[key] ?? ""
  })

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}))
    const workspaceId = typeof body.workspaceId === "string" ? body.workspaceId : ""
    const requestId = typeof body.requestId === "string" ? body.requestId : ""
    if (!workspaceId || !requestId) {
      return NextResponse.json({ error: "workspaceId and requestId are required" }, { status: 400 })
    }

    const workspace = await clientWorkspaceRepository.findById(workspaceId)
    if (!workspace) {
      return NextResponse.json({ error: "Workspace not found" }, { status: 404 })
    }
    const requestRecord = await clientRequestRepository.findById(workspaceId, requestId)
    if (!requestRecord) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 })
    }
    const emailTemplate = await clientRequestTemplateRepository.get()

    const email = workspace.primaryContact?.email
    if (!email) {
      return NextResponse.json({ error: "Client email not available" }, { status: 400 })
    }

    const portalLink = `${getBaseUrl(request)}/client?requestId=${encodeURIComponent(requestId)}`
    const apiKey = process.env.RESEND_API_KEY
    const from = process.env.CLIENT_MAGIC_LINK_FROM
    const isProduction = process.env.NODE_ENV === "production"
    const clientName = workspace.primaryContact?.name || workspace.displayName || "Client"
    const tokens = {
      clientName,
      requestTitle: requestRecord.title,
    }
    const subject = applyTokens(emailTemplate.subjectTemplate, tokens).trim() || `PaynePros request: ${requestRecord.title}`
    const greetingLine = applyTokens(emailTemplate.greetingLine, tokens).trim()
    const introLine = applyTokens(emailTemplate.introLine, tokens).trim()
    const buttonLabel = applyTokens(emailTemplate.buttonLabel, tokens).trim() || "Open Requested Item"
    const footerNote = applyTokens(emailTemplate.footerNote, tokens).trim()
    const closingLine = applyTokens(emailTemplate.closingLine, tokens).trim()
    const signatureName = applyTokens(emailTemplate.signatureName, tokens).trim()

    if (!apiKey || !from) {
      if (isProduction) {
        return NextResponse.json({ error: "Email delivery not configured" }, { status: 500 })
      }
      console.log("[ClientRequest Email Link]", {
        workspaceId,
        requestId,
        email,
        portalLink,
      })
      return NextResponse.json({ ok: true, mode: "dev_log" })
    }

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [email],
        subject,
        html: `
          ${greetingLine ? `<p>${escapeHtml(greetingLine)}</p>` : ""}
          ${introLine ? `<p>${escapeHtml(introLine)}</p>` : ""}
          <p><strong>${escapeHtml(requestRecord.title)}</strong></p>
          <p>${escapeHtml(requestRecord.instructions)}</p>
          ${
            requestRecord.noteFromPreparer
              ? `<p><strong>Note from preparer:</strong> ${escapeHtml(requestRecord.noteFromPreparer)}</p>`
              : ""
          }
          <p>
            <a href="${portalLink}" style="display:inline-block;padding:10px 16px;border-radius:8px;background:#0f172a;color:#ffffff;text-decoration:none;font-weight:600;">
              ${escapeHtml(buttonLabel)}
            </a>
          </p>
          ${footerNote ? `<p>${escapeHtml(footerNote)}</p>` : ""}
          ${(closingLine || signatureName) ? `<p>${escapeHtml(closingLine)}<br/>${escapeHtml(signatureName)}</p>` : ""}
        `,
      }),
    })

    if (!response.ok) {
      const raw = await response.text().catch(() => "")
      return NextResponse.json({ error: raw || `resend_${response.status}` }, { status: 502 })
    }

    return NextResponse.json({ ok: true, mode: "email" })
  } catch (error) {
    console.error("POST /api/client-requests/send failed:", error)
    return NextResponse.json({ error: "Failed to send client request email" }, { status: 500 })
  }
}
