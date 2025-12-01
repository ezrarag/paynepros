"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Wallet as WalletIcon, Plus, Minus, ArrowUpDown } from "lucide-react"
import { loadStripe } from "@stripe/stripe-js"

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

const allocationCategories = [
  { key: "bookkeeping", label: "Bookkeeping" },
  { key: "marketing", label: "Marketing" },
  { key: "logistics", label: "Logistics" },
  { key: "transportation", label: "Transportation" },
  { key: "housing", label: "Housing" },
  { key: "savings", label: "Savings" },
  { key: "taxes", label: "Taxes" },
]

export default function WalletPage() {
  const [balance, setBalance] = useState(0)
  const [allocations, setAllocations] = useState({
    bookkeeping: 0.3,
    marketing: 0.2,
    logistics: 0.1,
    transportation: 0.1,
    housing: 0.1,
    savings: 0.1,
    taxes: 0.1,
  })
  const [fundAmount, setFundAmount] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    // Fetch wallet data
    fetch("/api/wallet")
      .then((res) => res.json())
      .then((data) => {
        if (data.balance !== undefined) setBalance(data.balance)
        if (data.allocations) setAllocations(data.allocations)
      })
      .catch(console.error)
  }, [])

  const handleFund = async () => {
    if (!fundAmount || parseFloat(fundAmount) <= 0) return

    setIsLoading(true)
    try {
      const response = await fetch("/api/wallet/fund", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: parseFloat(fundAmount) * 100 }), // Convert to cents
      })

      const { sessionId } = await response.json()
      const stripe = await stripePromise

      if (stripe) {
        await stripe.redirectToCheckout({ sessionId })
      }
    } catch (error) {
      console.error("Error funding wallet:", error)
      setIsLoading(false)
    }
  }

  const handleUpdateAllocations = async () => {
    const total = Object.values(allocations).reduce((a, b) => a + b, 0)
    if (Math.abs(total - 1) > 0.01) {
      alert("Allocations must sum to 100%")
      return
    }

    await fetch("/api/wallet/allocations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ allocations }),
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Wallet</h1>
        <p className="text-muted-foreground mt-2">
          Manage your funds and allocations
        </p>
      </div>

      {/* Balance Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <WalletIcon className="h-5 w-5" />
            Current Balance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold mb-4">${balance.toFixed(2)}</div>
          <div className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="fund-amount">Add Funds</Label>
              <div className="flex gap-2 mt-2">
                <Input
                  id="fund-amount"
                  type="number"
                  placeholder="0.00"
                  value={fundAmount}
                  onChange={(e) => setFundAmount(e.target.value)}
                />
                <Button onClick={handleFund} disabled={isLoading}>
                  <Plus className="h-4 w-4 mr-2" />
                  Fund
                </Button>
              </div>
            </div>
            <div className="flex items-end">
              <Button variant="outline">
                <ArrowUpDown className="h-4 w-4 mr-2" />
                Withdraw
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Allocations */}
      <Card>
        <CardHeader>
          <CardTitle>Allocation Settings</CardTitle>
          <CardDescription>
            Set how funds are allocated across categories
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {allocationCategories.map((category) => (
            <div key={category.key} className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>{category.label}</Label>
                <span className="text-sm font-medium">
                  {(allocations[category.key as keyof typeof allocations] * 100).toFixed(0)}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={allocations[category.key as keyof typeof allocations] * 100}
                onChange={(e) =>
                  setAllocations({
                    ...allocations,
                    [category.key]: parseFloat(e.target.value) / 100,
                  })
                }
                className="w-full"
              />
            </div>
          ))}
          <div className="pt-4 border-t">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium">Total</span>
              <span className="font-bold">
                {(Object.values(allocations).reduce((a, b) => a + b, 0) * 100).toFixed(0)}%
              </span>
            </div>
            <Button onClick={handleUpdateAllocations} className="w-full">
              Save Allocations
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Transaction history will appear here
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

