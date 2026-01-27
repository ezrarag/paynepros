'use client'

import { useSearchParams } from 'next/navigation'

export default function SubscriptionClient() {
  const searchParams = useSearchParams()
  const plan = searchParams.get('plan')

  return (
    <div>
      <h1>Subscription</h1>
      {plan && <p>Selected plan: {plan}</p>}
    </div>
  )
}