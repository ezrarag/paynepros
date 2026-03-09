import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  const rawBody = await request.text()
  const signature = request.headers.get("intuit-signature")

  // TODO: Verify webhook signature using Intuit verifier token before trusting payload contents.
  // TODO: After signature verification, parse event notifications and queue tenant-scoped sync jobs.
  console.log("Received Intuit webhook event", {
    signaturePresent: Boolean(signature),
    payloadSize: rawBody.length,
  })

  return NextResponse.json({ received: true })
}
