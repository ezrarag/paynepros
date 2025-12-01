import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import Stripe from "stripe"
import { userRepository } from "@/lib/repositories/user-repository"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-11-20.acacia",
})

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await userRepository.findById(session.user.id)
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const body = await request.json()
    const { plan } = body

    // Create or retrieve Stripe customer
    let customerId = user.stripeCustomerId
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name,
        metadata: {
          userId: user.id,
        },
      })
      customerId = customer.id
      await userRepository.update(user.id, { stripeCustomerId: customerId })
    }

    // Create checkout session
    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "Readyaimgo C-Suite Plan",
              description: "Comprehensive business support and management",
            },
            recurring: {
              interval: "month",
            },
            unit_amount: 29900, // $299/month
          },
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/admin?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/admin/subscription?canceled=true`,
      metadata: {
        userId: user.id,
        plan: plan || "csuite",
      },
    })

    return NextResponse.json({ sessionId: checkoutSession.id })
  } catch (error) {
    console.error("Error creating checkout session:", error)
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    )
  }
}

