import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { marketingContentRepository } from "@/lib/repositories/marketing-content-repository"
import type { HomeSectionContent } from "@/lib/marketing/home-content"

function parseSections(raw: unknown): HomeSectionContent[] {
  if (!Array.isArray(raw)) return []
  return raw as HomeSectionContent[]
}

export async function GET() {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  if (user.role === "STAFF") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const doc = await marketingContentRepository.getHomeContent()
  return NextResponse.json({ data: doc })
}

export async function PUT(request: NextRequest) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  if (user.role === "STAFF") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const body = await request.json()
  const sections = parseSections(body?.sections)
  if (sections.length === 0) {
    return NextResponse.json({ error: "At least one section is required" }, { status: 400 })
  }

  const doc = await marketingContentRepository.saveHomeContent({
    sections,
    updatedBy: user.id,
  })

  return NextResponse.json({ data: doc })
}

