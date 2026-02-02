"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Inbox, FileText, Lock, Mail, MessageCircle, AlertCircle } from "lucide-react"
import type { MessageMeta } from "@/lib/types/admin"

const CHANNEL_LABELS: Record<string, string> = {
  email: "Email",
  sms: "SMS",
  whatsapp: "WhatsApp",
  ig: "Instagram",
  facebook: "Facebook",
}

interface MessagingInboxProps {
  metaList: MessageMeta[]
  error: string | null
  selectedId: string | undefined
  canViewContent: boolean
}

export function MessagingInbox({
  metaList,
  error,
  selectedId,
  canViewContent,
}: MessagingInboxProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [content, setContent] = useState<{
    rawBody: string
    attachments: Array<{ name: string; size: number; contentType: string }>
  } | null>(null)
  const [contentLoading, setContentLoading] = useState(false)
  const [contentError, setContentError] = useState<string | null>(null)

  const workspaceId = searchParams.get("clientId") ?? undefined

  // Fetch content when OWNER lands with ?id= in URL
  useEffect(() => {
    if (!selectedId || !canViewContent) return
    let cancelled = false
    setContentLoading(true)
    setContentError(null)
    fetch(`/api/messages/content?id=${encodeURIComponent(selectedId)}`)
      .then((res) => res.json())
      .then((json) => {
        if (cancelled) return
        if (!json.data) {
          setContentError(json.error ?? "Failed to load")
          setContent(null)
          return
        }
        setContent({
          rawBody: json.data.rawBody,
          attachments: json.data.attachments ?? [],
        })
        setContentError(null)
      })
      .catch(() => {
        if (!cancelled) setContentError("Failed to load content")
      })
      .finally(() => {
        if (!cancelled) setContentLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [selectedId, canViewContent])

  async function selectMessage(id: string) {
    const params = new URLSearchParams(searchParams.toString())
    params.set("id", id)
    router.push(`/admin/messaging?${params.toString()}`, { scroll: false })
    if (canViewContent) {
      setContent(null)
      setContentError(null)
      setContentLoading(true)
      try {
        const res = await fetch(`/api/messages/content?id=${encodeURIComponent(id)}`)
        const json = await res.json()
        if (!res.ok) {
          setContentError(json.error ?? "Failed to load")
          setContent(null)
          return
        }
        setContent({
          rawBody: json.data.rawBody,
          attachments: json.data.attachments ?? [],
        })
        setContentError(null)
      } catch {
        setContentError("Failed to load content")
        setContent(null)
      } finally {
        setContentLoading(false)
      }
    }
  }

  function clearSelection() {
    const params = new URLSearchParams(searchParams.toString())
    params.delete("id")
    router.push(params.toString() ? `/admin/messaging?${params.toString()}` : "/admin/messaging", {
      scroll: false,
    })
    setContent(null)
    setContentError(null)
  }

  const selectedMeta = selectedId ? metaList.find((m) => m.id === selectedId) : null

  return (
    <Tabs defaultValue="inbox" className="space-y-4">
      <TabsList>
        <TabsTrigger value="inbox">
          <Inbox className="h-4 w-4 mr-2" />
          Inbox
        </TabsTrigger>
        <TabsTrigger value="pulse">
          <FileText className="h-4 w-4 mr-2" />
          Pulse Summary
        </TabsTrigger>
      </TabsList>

      <TabsContent value="inbox" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Unified Inbox</CardTitle>
            <CardDescription>
              Messages from Gmail, Outlook, WhatsApp, etc. (masked for privacy)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <p className="text-sm text-destructive mb-4">{error}</p>
            )}
            <div className="flex gap-4">
              <div className="flex-1 space-y-2 min-w-0">
                {metaList.map((msg) => (
                  <button
                    key={msg.id}
                    type="button"
                    onClick={() => selectMessage(msg.id)}
                    className={`w-full text-left border rounded-lg p-4 hover:bg-muted/50 transition-colors ${
                      selectedId === msg.id ? "ring-2 ring-primary" : ""
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-medium text-sm truncate">{msg.fromMasked}</p>
                        {msg.subjectMasked && (
                          <p className="text-sm text-muted-foreground truncate mt-0.5">
                            {msg.subjectMasked}
                          </p>
                        )}
                        {msg.snippetMasked && (
                          <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                            {msg.snippetMasked}
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                          <Badge variant="outline" className="text-xs">
                            {CHANNEL_LABELS[msg.channel] ?? msg.channel}
                          </Badge>
                          <Badge
                            variant={
                              msg.urgency === "high"
                                ? "destructive"
                                : msg.urgency === "med"
                                  ? "secondary"
                                  : "outline"
                            }
                            className="text-xs"
                          >
                            {msg.urgency}
                          </Badge>
                          {msg.unread && (
                            <Badge className="bg-blue-500 text-xs">Unread</Badge>
                          )}
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground shrink-0">
                        {new Date(msg.receivedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </button>
                ))}
                {metaList.length === 0 && !error && (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No messages
                  </p>
                )}
              </div>

              <div className="w-[360px] shrink-0 border rounded-lg p-4 bg-muted/30">
                {!selectedId && (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    Select a message
                  </p>
                )}
                {selectedId && selectedMeta && !canViewContent && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-amber-600">
                      <Lock className="h-5 w-5" />
                      <span className="font-medium">Restricted</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Full message content is only visible to the owner. You can see urgency and
                      metadata above. Contact the owner if you need access to this message.
                    </p>
                    <button
                      type="button"
                      onClick={clearSelection}
                      className="text-sm text-primary hover:underline"
                    >
                      Clear selection
                    </button>
                  </div>
                )}
                {selectedId && canViewContent && (
                  <div className="space-y-4">
                    {contentLoading && (
                      <p className="text-sm text-muted-foreground">Loading...</p>
                    )}
                    {contentError && (
                      <div className="flex items-center gap-2 text-destructive text-sm">
                        <AlertCircle className="h-4 w-4" />
                        {contentError}
                      </div>
                    )}
                    {content && !contentLoading && (
                      <>
                        <div className="whitespace-pre-wrap text-sm">{content.rawBody}</div>
                        {content.attachments.length > 0 && (
                          <div className="pt-2 border-t">
                            <p className="text-xs font-medium text-muted-foreground mb-1">
                              Attachments
                            </p>
                            <ul className="text-sm space-y-1">
                              {content.attachments.map((a) => (
                                <li key={a.name}>
                                  {a.name} ({(a.size / 1024).toFixed(1)} KB)
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </>
                    )}
                    <button
                      type="button"
                      onClick={clearSelection}
                      className="text-sm text-primary hover:underline"
                    >
                      Clear selection
                    </button>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="pulse" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Daily Pulse Summary</CardTitle>
            <CardDescription>
              AI-generated daily summary of urgent items and follow-ups
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="border-l-4 border-yellow-500 pl-4">
                <h3 className="font-semibold mb-2">Urgent Items</h3>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  <li>3 clients need immediate follow-up</li>
                  <li>2 invoices overdue</li>
                </ul>
              </div>
              <div className="border-l-4 border-blue-500 pl-4">
                <h3 className="font-semibold mb-2">Follow-ups Needed</h3>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  <li>5 new leads require response</li>
                  <li>2 bookkeeping documents pending</li>
                </ul>
              </div>
              <div className="border-l-4 border-green-500 pl-4">
                <h3 className="font-semibold mb-2">Completed Today</h3>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  <li>3 tax returns filed</li>
                  <li>1 consultation scheduled</li>
                </ul>
              </div>
            </div>
            <div className="mt-6 pt-4 border-t">
              <p className="text-xs text-muted-foreground">
                Last updated: {new Date().toLocaleString()}
              </p>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
