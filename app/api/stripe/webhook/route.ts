import { NextRequest, NextResponse } from "next/server"
import { headers } from "next/headers"
import Stripe from "stripe"
import { userRepository } from "@/lib/repositories/user-repository"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-11-20.acacia",
})

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(request: NextRequest) {
  const body = await request.text()
  const headersList = await headers()
  const signature = headersList.get("stripe-signature")!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err) {
    console.error("Webhook signature verification failed:", err)
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session
        const userId = session.metadata?.userId
        const type = session.metadata?.type

        if (userId) {
          if (session.subscription && type !== "wallet_funding") {
            // Subscription activation
            await userRepository.updateSubscription(
              userId,
              session.subscription as string,
              "active"
            )
          } else if (type === "wallet_funding") {
            // Wallet funding
            const amount = session.amount_total || 0
            const walletRepository = (await import("@/lib/repositories/wallet-repository")).walletRepository
            
            let wallet = await walletRepository.findByUserId(userId)
            if (!wallet) {
              wallet = await walletRepository.create({
                userId,
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

            const newBalance = wallet.balance + amount / 100 // Convert cents to dollars
            await walletRepository.updateBalance(wallet.id, newBalance)

            // Create transaction record
            await walletRepository.createTransaction({
              walletId: wallet.id,
              type: "fund",
              amount: amount / 100,
              category: "funding",
              description: "Wallet funding via Stripe",
              stripePaymentIntentId: session.payment_intent as string,
            })
          }
        }
        break
      }

      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription
        const userId = subscription.metadata?.userId

        if (userId) {
          const status =
            subscription.status === "active" ? "active" : "inactive"
          await userRepository.updateSubscription(
            userId,
            subscription.id,
            status
          )
        }
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("Error processing webhook:", error)
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    )
  }
}

