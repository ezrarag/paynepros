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

export function InboxSummary({ recentMessages, totalUnread }: InboxSummaryProps) {
  const channelCounts = recentMessages.reduce(
    (acc, msg) => {
      acc[msg.channel] = (acc[msg.channel] || 0) + msg.unreadCount
      return acc
    },
    {} as Record<string, number>
  )

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Inbox Summary</CardTitle>
            <CardDescription>Recent messages and unread counts</CardDescription>
          </div>
          {totalUnread > 0 && (
            <Badge className="bg-blue-500 text-white">{totalUnread} unread</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {Object.keys(channelCounts).length > 0 && (
          <div className="flex gap-2 flex-wrap">
            {Object.entries(channelCounts).map(([channel, count]) => {
              const Icon = channelIcons[channel as keyof typeof channelIcons]
              return (
                <div
                  key={channel}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg border bg-muted/50"
                >
                  {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
                  <span className="text-sm font-medium">
                    {channelLabels[channel as keyof typeof channelLabels] || channel}
                  </span>
                  {count > 0 && (
                    <Badge variant="secondary" className="ml-1">
                      {count}
                    </Badge>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {recentMessages.length > 0 ? (
          <div className="space-y-3">
            <p className="text-sm font-medium text-muted-foreground">Recent messages:</p>
            {recentMessages.map((msg, idx) => (
              <div
                key={`${msg.workspaceId}-${msg.channel}-${idx}`}
                className="flex items-start gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm">{msg.clientName}</span>
                    <Badge variant="outline" className="text-xs">
                      {channelLabels[msg.channel as keyof typeof channelLabels] || msg.channel}
                    </Badge>
                    {msg.unreadCount > 0 && (
                      <Badge className="bg-blue-500 text-white text-xs">
                        {msg.unreadCount}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">{msg.lastSnippet}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(msg.lastAt).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">
            No recent messages
          </p>
        )}

        <Button asChild className="w-full">
          <Link href="/admin/messaging">
            <MessageSquare className="h-4 w-4 mr-2" />
            Go to Messaging
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}
