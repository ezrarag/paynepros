"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MessageSquare, Mail, Smartphone, MessageCircle } from "lucide-react"
import Link from "next/link"
import type { MessageSummary } from "@/lib/types/command-center"

interface InboxSummaryProps {
  recentMessages: Array<MessageSummary & { clientName: string }>
  totalUnread: number
  hasConnectedInbox: boolean
}

const channelIcons = {
  email: Mail,
  sms: Smartphone,
  whatsapp: MessageCircle,
  ig: MessageCircle,
}

const channelLabels = {
  email: "Email",
  sms: "SMS",
  whatsapp: "WhatsApp",
  ig: "Instagram",
}

export function InboxSummary({ recentMessages, totalUnread, hasConnectedInbox }: InboxSummaryProps) {
  // If no integrations are connected, show empty state
  if (!hasConnectedInbox) {
    return (
      <Card>
        <CardHeader className="p-4 sm:p-6">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <CardTitle className="text-base sm:text-lg">Inbox Summary</CardTitle>
              <CardDescription className="text-xs sm:text-sm truncate">Recent messages</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <div className="text-center py-3 sm:py-4 space-y-3">
            <p className="text-xs sm:text-sm text-muted-foreground">
              No inboxes connected yet.
            </p>
            <Button asChild variant="outline" className="w-full text-xs sm:text-sm" size="sm">
              <Link href="/admin/integrations">
                <MessageSquare className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2 shrink-0" />
                Connect Integrations
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  // If integrations are connected but no messages yet, show pending state
  if (hasConnectedInbox && recentMessages.length === 0) {
    return (
      <Card>
        <CardHeader className="p-4 sm:p-6">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <CardTitle className="text-base sm:text-lg">Inbox Summary</CardTitle>
              <CardDescription className="text-xs sm:text-sm truncate">Recent messages</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <div className="text-center py-3 sm:py-4">
            <p className="text-xs sm:text-sm text-muted-foreground">
              Connected, ingestion pending
            </p>
          </div>
          <Button asChild className="w-full text-xs sm:text-sm" size="sm">
            <Link href="/admin/messaging">
              <MessageSquare className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2 shrink-0" />
              Messaging
            </Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  // Show actual messages only when integrations are connected AND messages exist
  const channelCounts = recentMessages.reduce(
    (acc, msg) => {
      acc[msg.channel] = (acc[msg.channel] || 0) + msg.unreadCount
      return acc
    },
    {} as Record<string, number>
  )

  return (
    <Card>
      <CardHeader className="p-4 sm:p-6">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <CardTitle className="text-base sm:text-lg">Inbox Summary</CardTitle>
            <CardDescription className="text-xs sm:text-sm truncate">Recent messages</CardDescription>
          </div>
          {totalUnread > 0 && (
            <Badge className="bg-blue-500 text-white text-xs shrink-0">{totalUnread} unread</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-4 sm:p-6 space-y-3 sm:space-y-4">
        {Object.keys(channelCounts).length > 0 && (
          <div className="flex gap-1.5 sm:gap-2 flex-wrap">
            {Object.entries(channelCounts).map(([channel, count]) => {
              const Icon = channelIcons[channel as keyof typeof channelIcons]
              return (
                <div
                  key={channel}
                  className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg border bg-muted/50"
                >
                  {Icon && <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground shrink-0" />}
                  <span className="text-xs sm:text-sm font-medium">
                    {channelLabels[channel as keyof typeof channelLabels] || channel}
                  </span>
                  {count > 0 && (
                    <Badge variant="secondary" className="ml-0.5 sm:ml-1 text-[10px] sm:text-xs">
                      {count}
                    </Badge>
                  )}
                </div>
              )
            })}
          </div>
        )}

        <div className="space-y-2 sm:space-y-3">
          <p className="text-xs sm:text-sm font-medium text-muted-foreground">Recent:</p>
          {recentMessages.map((msg, idx) => (
            <div
              key={`${msg.workspaceId}-${msg.channel}-${idx}`}
              className="flex items-start gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg border hover:bg-muted/50 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-0.5 sm:mb-1">
                  <span className="font-medium text-xs sm:text-sm truncate">{msg.clientName}</span>
                  <Badge variant="outline" className="text-[10px] sm:text-xs shrink-0">
                    {channelLabels[msg.channel as keyof typeof channelLabels] || msg.channel}
                  </Badge>
                  {msg.unreadCount > 0 && (
                    <Badge className="bg-blue-500 text-white text-[10px] sm:text-xs shrink-0">
                      {msg.unreadCount}
                    </Badge>
                  )}
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">{msg.lastSnippet}</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 sm:mt-1">
                  {new Date(msg.lastAt).toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>

        <Button asChild className="w-full text-xs sm:text-sm" size="sm">
          <Link href="/admin/messaging">
            <MessageSquare className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2 shrink-0" />
            Messaging
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}
