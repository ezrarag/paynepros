import { NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"

// TEMPORARILY DISABLED AUTH CHECK for development
// import { auth } from "@/auth"

export async function POST(request: NextRequest) {
  try {
    // TEMPORARILY DISABLED AUTH CHECK for development
    // const sessionUser = await auth()
    // if (!sessionUser?.user) {
    //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    // }

    // Mock user for development
    const mockUser = {
      id: "mock-admin-id",
      email: "detania@paynepros.com",
    }

    // Check for Stripe secret key
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY_READY
    if (!stripeSecretKey) {
      console.error("STRIPE_SECRET_KEY_READY is not set")
      return NextResponse.json(
        { error: "Stripe configuration missing" },
        { status: 500 }
      )
    }

    // Check for price ID
    const priceId = process.env.READYAIMGO_CSUITE_PRICE_ID
    if (!priceId) {
      console.error("READYAIMGO_CSUITE_PRICE_ID is not set")
      return NextResponse.json(
        { error: "Price ID not configured" },
        { status: 500 }
      )
    }

    // Check for base URL
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2024-04-10",
    })

    const checkout = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer_email: mockUser.email,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      metadata: {
        userId: mockUser.id,
        email: mockUser.email,
        origin: "paynepros",
      },
      success_url: `${baseUrl}/admin/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/admin/subscription`,
    })

    return NextResponse.json({ url: checkout.url })
  } catch (error: any) {
    console.error("Error creating Stripe checkout session:", error)
    return NextResponse.json(
      { error: error.message || "Failed to create checkout session" },
      { status: 500 }
    )
  }
}



