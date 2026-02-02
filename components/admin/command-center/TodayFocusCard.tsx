"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertCircle, Clock, MessageSquare, Users } from "lucide-react"
import type { TodayFocusMetrics } from "@/lib/types/command-center"
import Link from "next/link"

interface TodayFocusCardProps {
  metrics: TodayFocusMetrics
}

export function TodayFocusCard({ metrics }: TodayFocusCardProps) {
  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-background">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary" />
          Today's Focus
        </CardTitle>
        <CardDescription>Your daily command center overview</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div className="flex flex-col">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
              <AlertCircle className="h-4 w-4 text-red-500" />
              High Priority
            </div>
            <div className="text-2xl font-bold">{metrics.highPriorityTasks}</div>
            <div className="text-xs text-muted-foreground">tasks</div>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
              <Users className="h-4 w-4 text-blue-500" />
              Waiting on Us
            </div>
            <div className="text-2xl font-bold">{metrics.clientsWaitingOnDeTania}</div>
            <div className="text-xs text-muted-foreground">clients</div>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
              <Clock className="h-4 w-4 text-amber-500" />
              Waiting on Client
            </div>
            <div className="text-2xl font-bold">{metrics.clientsWaitingOnCustomer}</div>
            <div className="text-xs text-muted-foreground">clients</div>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
              <MessageSquare className="h-4 w-4 text-green-500" />
              Unread Messages
            </div>
            <div className="text-2xl font-bold">{metrics.unreadMessagesTotal}</div>
            <div className="text-xs text-muted-foreground">messages</div>
          </div>
        </div>
        {(metrics.highPriorityTasks > 0 || metrics.unreadMessagesTotal > 0) && (
          <Button asChild className="w-full">
            <Link href="#urgent">Review Urgent Items</Link>
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
