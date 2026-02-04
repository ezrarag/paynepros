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
  const hasUrgentItems = metrics.highPriorityTasks > 0 || metrics.unreadMessagesTotal > 0 || metrics.clientsWaitingOnCustomer > 0
  
  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-background">
      <CardHeader className="p-4 sm:p-6">
        <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
          <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-primary shrink-0" />
          Today's Focus
        </CardTitle>
        <CardDescription className="text-xs sm:text-sm">Your daily command center overview</CardDescription>
      </CardHeader>
      <CardContent className="p-4 sm:p-6 pt-0">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-4">
          <div className="flex flex-col p-2 sm:p-0 rounded-lg bg-muted/30 sm:bg-transparent">
            <div className="flex items-center gap-1.5 text-xs sm:text-sm text-muted-foreground mb-0.5 sm:mb-1">
              <AlertCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-red-500 shrink-0" />
              <span className="truncate">High Priority</span>
            </div>
            <div className="text-xl sm:text-2xl font-bold">{metrics.highPriorityTasks}</div>
            <div className="text-xs text-muted-foreground">
              {metrics.highPriorityTasks === 0 ? "Not wired yet" : "tasks"}
            </div>
          </div>
          <div className="flex flex-col p-2 sm:p-0 rounded-lg bg-muted/30 sm:bg-transparent">
            <div className="flex items-center gap-1.5 text-xs sm:text-sm text-muted-foreground mb-0.5 sm:mb-1">
              <Users className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-blue-500 shrink-0" />
              <span className="truncate">Waiting on Us</span>
            </div>
            <div className="text-xl sm:text-2xl font-bold">{metrics.clientsWaitingOnDeTania}</div>
            <div className="text-xs text-muted-foreground">
              {metrics.clientsWaitingOnDeTania === 0 ? "Not wired yet" : "clients"}
            </div>
          </div>
          <div className="flex flex-col p-2 sm:p-0 rounded-lg bg-muted/30 sm:bg-transparent">
            <div className="flex items-center gap-1.5 text-xs sm:text-sm text-muted-foreground mb-0.5 sm:mb-1">
              <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-amber-500 shrink-0" />
              <span className="truncate">Waiting on Client</span>
            </div>
            <div className="text-xl sm:text-2xl font-bold">{metrics.clientsWaitingOnCustomer}</div>
            <div className="text-xs text-muted-foreground">clients</div>
          </div>
          <div className="flex flex-col p-2 sm:p-0 rounded-lg bg-muted/30 sm:bg-transparent">
            <div className="flex items-center gap-1.5 text-xs sm:text-sm text-muted-foreground mb-0.5 sm:mb-1">
              <MessageSquare className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-green-500 shrink-0" />
              <span className="truncate">Unread</span>
            </div>
            <div className="text-xl sm:text-2xl font-bold">{metrics.unreadMessagesTotal}</div>
            <div className="text-xs text-muted-foreground">messages</div>
          </div>
        </div>
        {hasUrgentItems && (
          <Button asChild className="w-full text-sm" size="sm">
            <Link href="#urgent">Review Urgent Items</Link>
          </Button>
        )}
        {!hasUrgentItems && metrics.highPriorityTasks === 0 && metrics.clientsWaitingOnDeTania === 0 && (
          <p className="text-xs sm:text-sm text-muted-foreground text-center py-2">
            Messaging and task metrics will populate once communications are connected.
          </p>
        )}
      </CardContent>
    </Card>
  )
}
