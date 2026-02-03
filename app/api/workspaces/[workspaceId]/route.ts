import { NextResponse } from "next/server"
import { clientWorkspaceRepository } from "@/lib/repositories/client-workspace-repository"

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ workspaceId: string }> }
) {
  try {
    const { workspaceId } = await params
    if (!workspaceId) {
      return NextResponse.json({ error: "workspaceId required" }, { status: 400 })
    }
    const workspace = await clientWorkspaceRepository.findById(workspaceId)
    if (!workspace) {
      return NextResponse.json({ error: "Workspace not found" }, { status: 404 })
    }
    return NextResponse.json(workspace)
  } catch (error) {
    console.error("GET /api/workspaces/[workspaceId]:", error)
    return NextResponse.json(
      { error: "Failed to fetch workspace" },
      { status: 500 }
    )
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ workspaceId: string }> }
) {
  try {
    const { workspaceId } = await params
    if (!workspaceId) {
      return NextResponse.json({ error: "workspaceId required" }, { status: 400 })
    }
    const body = await req.json()
    const updates: Record<string, unknown> = {}
    if (typeof body.displayName === "string") updates.displayName = body.displayName.trim()
    if (body.status === "active" || body.status === "inactive") updates.status = body.status
    if (typeof body.primaryContact === "object" && body.primaryContact !== null) {
      updates.primaryContact = {
        name: typeof body.primaryContact.name === "string" ? body.primaryContact.name : undefined,
        email: typeof body.primaryContact.email === "string" ? body.primaryContact.email : undefined,
        phone: typeof body.primaryContact.phone === "string" ? body.primaryContact.phone : undefined,
      }
    }
    if (Array.isArray(body.tags)) updates.tags = body.tags.filter((t: unknown) => typeof t === "string")
    if (Array.isArray(body.taxYears)) updates.taxYears = body.taxYears.filter((y: unknown) => typeof y === "number")
    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "No valid updates" }, { status: 400 })
    }
    const workspace = await clientWorkspaceRepository.update(workspaceId, updates as Parameters<typeof clientWorkspaceRepository.update>[1])
    if (!workspace) {
      return NextResponse.json({ error: "Workspace not found" }, { status: 404 })
    }
    return NextResponse.json(workspace)
  } catch (error) {
    console.error("PATCH /api/workspaces/[workspaceId]:", error)
    return NextResponse.json(
      { error: "Failed to update workspace" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ workspaceId: string }> }
) {
  try {
    const { workspaceId } = await params
    if (!workspaceId) {
      return NextResponse.json({ error: "workspaceId required" }, { status: 400 })
    }
    const deleted = await clientWorkspaceRepository.delete(workspaceId)
    if (!deleted) {
      return NextResponse.json({ error: "Workspace not found" }, { status: 404 })
    }
    return NextResponse.json({ deleted: true })
  } catch (error) {
    console.error("DELETE /api/workspaces/[workspaceId]:", error)
    return NextResponse.json(
      { error: "Failed to delete workspace" },
      { status: 500 }
    )
  }
}
