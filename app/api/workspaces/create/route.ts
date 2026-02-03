import { NextResponse } from "next/server"
import { clientWorkspaceRepository } from "@/lib/repositories/client-workspace-repository"
import { checklistDefaults } from "@/lib/tax-return-checklist"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const name = typeof body.name === "string" ? body.name.trim() : ""
    const email = typeof body.email === "string" ? body.email.trim() || undefined : undefined
    const phone = typeof body.phone === "string" ? body.phone.trim() || undefined : undefined
    const tags = Array.isArray(body.tags) ? body.tags.filter((t: unknown) => typeof t === "string") : []
    const taxYears = Array.isArray(body.taxYears)
      ? body.taxYears.filter((y: unknown) => typeof y === "number")
      : []

    if (!name) {
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 }
      )
    }

    const now = new Date().toISOString()
    const workspace = await clientWorkspaceRepository.create({
      displayName: name,
      status: "active",
      primaryContact: {
        name,
        email,
        phone,
      },
      tags,
      taxYears,
      taxReturnChecklist: checklistDefaults,
      lastActivityAt: now,
    })

    return NextResponse.json({ workspaceId: workspace.id })
  } catch (error) {
    console.error("POST /api/workspaces/create:", error)
    return NextResponse.json(
      { error: "Failed to create workspace" },
      { status: 500 }
    )
  }
}
