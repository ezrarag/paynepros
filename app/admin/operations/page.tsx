"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Truck, Home, Calendar } from "lucide-react"

export default function OperationsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Operations</h1>
        <p className="text-muted-foreground mt-2">
          Request transportation, housing, and logistics support
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5" />
              Transportation Request
            </CardTitle>
            <CardDescription>
              Request transportation services
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="transport-date">Date</Label>
              <Input id="transport-date" type="date" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="transport-time">Time</Label>
              <Input id="transport-time" type="time" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="transport-destination">Destination</Label>
              <Input id="transport-destination" placeholder="Where to?" />
            </div>
            <Button className="w-full">Submit Request</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Home className="h-5 w-5" />
              Housing Request
            </CardTitle>
            <CardDescription>
              Request housing assistance
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="housing-checkin">Check-in Date</Label>
              <Input id="housing-checkin" type="date" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="housing-checkout">Check-out Date</Label>
              <Input id="housing-checkout" type="date" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="housing-location">Location</Label>
              <Input id="housing-location" placeholder="City, State" />
            </div>
            <Button className="w-full">Submit Request</Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Logistics & Scheduling
          </CardTitle>
          <CardDescription>
            Manage logistics and scheduling requests
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="logistics-request">Request Details</Label>
              <textarea
                id="logistics-request"
                className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm"
                placeholder="Describe your logistics or scheduling need..."
              />
            </div>
            <Button>Submit Request</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

