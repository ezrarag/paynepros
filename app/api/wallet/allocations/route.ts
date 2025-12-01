import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { walletRepository } from "@/lib/repositories/wallet-repository"

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { allocations } = body

    const wallet = await walletRepository.findByUserId(session.user.id)
    if (!wallet) {
      return NextResponse.json({ error: "Wallet not found" }, { status: 404 })
    }

    await walletRepository.updateAllocations(wallet.id, allocations)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating allocations:", error)
    return NextResponse.json(
      { error: "Failed to update allocations" },
      { status: 500 }
    )
  }
}

