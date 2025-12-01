import { NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get("stripe-signature")

  if (!sig) {
    return NextResponse.json(
      { error: "Missing stripe-signature header" },
      { status: 400 }
    )
  }

  const stripeSecretKey = process.env.STRIPE_SECRET_KEY_READY
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET_READY

  if (!stripeSecretKey) {
    console.error("STRIPE_SECRET_KEY_READY is not set")
    return NextResponse.json(
      { error: "Stripe configuration missing" },
      { status: 500 }
    )
  }

  if (!webhookSecret) {
    console.error("STRIPE_WEBHOOK_SECRET_READY is not set")
    return NextResponse.json(
      { error: "Webhook secret not configured" },
      { status: 500 }
    )
  }

  const stripe = new Stripe(stripeSecretKey, {
    apiVersion: "2024-04-10",
  })

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret)
  } catch (err: any) {
    console.error("Webhook signature verification failed:", err.message)
    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` },
      { status: 400 }
    )
  }

  // Handle successful checkout and payment events
  if (
    event.type === "checkout.session.completed" ||
    event.type === "invoice.payment_succeeded"
  ) {
    try {
      // Dynamic import to prevent webpack bundling issues
      const { adminDb, Timestamp } = await import("@/lib/firebase/admin")

      let userId: string | undefined
      let customerEmail: string | undefined

      if (event.type === "checkout.session.completed") {
        const session = event.data.object as Stripe.Checkout.Session
        userId = session.metadata?.userId
        customerEmail = session.customer_email || undefined
      } else if (event.type === "invoice.payment_succeeded") {
        const invoice = event.data.object as Stripe.Invoice
        userId = invoice.metadata?.userId
        customerEmail = invoice.customer_email || undefined
      }

      if (!userId) {
        console.warn("No userId found in webhook event metadata")
        return NextResponse.json({ error: "Missing userId" }, { status: 400 })
      }

      if (adminDb) {
        // Update user subscription in Firestore
        const userRef = adminDb.collection("users").doc(userId)
        const now = Timestamp.now()

        await userRef.set(
          {
            subscription: {
              status: "active",
              plan: "c-suite",
              startedAt: now,
            },
            subscriptionStatus: "active",
            cSuiteEnabled: true,
            updatedAt: now,
          },
          { merge: true }
        )

        console.log(`Subscription activated for user ${userId}`)
      } else {
        console.warn(
          "Firebase Admin not initialized. Subscription activation logged but not saved."
        )
        // In development, we'll still return success but log the warning
      }

      return NextResponse.json({ received: true })
    } catch (error: any) {
      console.error("Error processing webhook:", error)
      return NextResponse.json(
        { error: `Webhook processing failed: ${error.message}` },
        { status: 500 }
      )
    }
  }

  // Return success for other event types
  return NextResponse.json({ received: true })
}

