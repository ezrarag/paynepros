import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { walletRepository } from "@/lib/repositories/wallet-repository"

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    let wallet = await walletRepository.findByUserId(session.user.id)

    if (!wallet) {
      // Create default wallet
      wallet = await walletRepository.create({
        userId: session.user.id,
        balance: 0,
        allocations: {
          bookkeeping: 0.3,
          marketing: 0.2,
          logistics: 0.1,
          transportation: 0.1,
          housing: 0.1,
          savings: 0.1,
          taxes: 0.1,
        },
      })
    }

    return NextResponse.json({
      balance: wallet.balance,
      allocations: wallet.allocations,
    })
  } catch (error) {
    console.error("Error fetching wallet:", error)
    return NextResponse.json(
      { error: "Failed to fetch wallet" },
      { status: 500 }
    )
  }
}

