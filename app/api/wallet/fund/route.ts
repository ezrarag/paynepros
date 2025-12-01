import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import Stripe from "stripe"
import { userRepository } from "@/lib/repositories/user-repository"
import { walletRepository } from "@/lib/repositories/wallet-repository"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-11-20.acacia",
})

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { amount } = body // amount in cents

    const user = await userRepository.findById(session.user.id)
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    let customerId = user.stripeCustomerId
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name,
        metadata: { userId: user.id },
      })
      customerId = customer.id
      await userRepository.update(user.id, { stripeCustomerId: customerId })
    }

    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "Wallet Funding",
              description: "Add funds to your wallet",
            },
            unit_amount: amount,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/admin/wallet?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/admin/wallet?canceled=true`,
      metadata: {
        userId: user.id,
        type: "wallet_funding",
      },
    })

    return NextResponse.json({ sessionId: checkoutSession.id })
  } catch (error) {
    console.error("Error creating funding session:", error)
    return NextResponse.json(
      { error: "Failed to create funding session" },
      { status: 500 }
    )
  }
}

