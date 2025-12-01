"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Megaphone, BarChart3, Image } from "lucide-react"
import Link from "next/link"

export default function MarketingPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Marketing</h1>
        <p className="text-muted-foreground mt-2">
          Request content and view analytics
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Megaphone className="h-5 w-5" />
              Social Content Requests
            </CardTitle>
            <CardDescription>
              Request new social media content from your marketing team
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/admin/requests?category=social">
                Create Content Request
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Analytics
            </CardTitle>
            <CardDescription>
              View analytics from connected social accounts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 border rounded">
                <p className="text-sm font-medium mb-1">Instagram</p>
                <p className="text-xs text-muted-foreground">
                  Connected • Last synced: 2 hours ago
                </p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm font-medium mb-1">Facebook</p>
                <p className="text-xs text-muted-foreground">
                  Connected • Last synced: 1 hour ago
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Content</CardTitle>
          <CardDescription>
            Recently published social media content
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Content history will appear here once content is published
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

