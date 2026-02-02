"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ExternalLink, MessageSquare, FileText, CheckCircle2, UserPlus } from "lucide-react"
import type { ClientQueueItem } from "@/lib/types/command-center"
import Link from "next/link"
import { MessageTemplateModal } from "./MessageTemplateModal"
import { DocRequestModal } from "./DocRequestModal"
import { AssignTaskModal } from "./AssignTaskModal"

interface ClientQueueProps {
  items: ClientQueueItem[]
}

export function ClientQueue({ items }: ClientQueueProps) {
  const [messageModalOpen, setMessageModalOpen] = useState<string | null>(null)
  const [docModalOpen, setDocModalOpen] = useState<string | null>(null)
  const [assignModalOpen, setAssignModalOpen] = useState<string | null>(null)

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-700 border-red-200"
      case "med":
        return "bg-amber-100 text-amber-700 border-amber-200"
      default:
        return "bg-gray-100 text-gray-700 border-gray-200"
    }
  }

  return (
    <Card id="urgent">
      <CardHeader>
        <CardTitle>Client Task Queue</CardTitle>
        <CardDescription>Active workspaces sorted by priority and urgency</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            No active clients at this time
          </p>
        ) : (
          items.map((item) => {
            const activeTasks = item.tasks.filter((t) => t.status !== "done")
            const nextTasks = activeTasks.slice(0, 3)
            const unreadCount = item.messageSummaries.reduce((sum, m) => sum + m.unreadCount, 0)

            return (
              <div
                key={item.id}
                className="border rounded-lg p-4 space-y-3 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-lg">{item.clientName}</h3>
                      <Badge variant="outline" className="text-xs">
                        {item.statusLabel}
                      </Badge>
                      {unreadCount > 0 && (
                        <Badge className="bg-blue-500 text-white text-xs">
                          {unreadCount} unread
                        </Badge>
                      )}
                    </div>
                    {item.tags.length > 0 && (
                      <div className="flex gap-1 flex-wrap mt-1">
                        {item.tags.map((tag) => (
                          <span
                            key={tag}
                            className="text-xs px-2 py-0.5 bg-muted rounded text-muted-foreground"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {nextTasks.length > 0 && (
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground mb-1">Next tasks:</p>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      {nextTasks.map((task) => (
                        <li key={task.id} className="flex items-center gap-2">
                          <span>{task.title}</span>
                          <Badge
                            variant="outline"
                            className={`text-xs ${getPriorityColor(task.priority)}`}
                          >
                            {task.priority}
                          </Badge>
                          {task.assignedTo && (
                            <span className="text-xs text-muted-foreground">
                              ({task.assignedTo})
                            </span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="flex flex-wrap gap-2 pt-2 border-t">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/admin/clients/${item.id}`}>
                      <ExternalLink className="h-4 w-4 mr-1" />
                      Open Workspace
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setMessageModalOpen(item.id)}
                  >
                    <MessageSquare className="h-4 w-4 mr-1" />
                    Send Reminder
                  </Button>
                  {item.documentRequest &&
                    (item.documentRequest.status === "pending" ||
                      item.documentRequest.status === "partial") && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setDocModalOpen(item.id)}
                      >
                        <FileText className="h-4 w-4 mr-1" />
                        Request Docs
                      </Button>
                    )}
                  <Button variant="outline" size="sm" onClick={() => setAssignModalOpen(item.id)}>
                    <UserPlus className="h-4 w-4 mr-1" />
                    Assign Task
                  </Button>
                  <Button variant="ghost" size="sm">
                    <CheckCircle2 className="h-4 w-4 mr-1" />
                    Mark Reviewed
                  </Button>
                </div>

                {messageModalOpen === item.id && (
                  <MessageTemplateModal
                    workspaceId={item.id}
                    clientName={item.clientName}
                    missingDocs={item.documentRequest?.missingDocs}
                    open={messageModalOpen === item.id}
                    onOpenChange={(open) => !open && setMessageModalOpen(null)}
                  />
                )}

                {docModalOpen === item.id && (
                  <DocRequestModal
                    workspaceId={item.id}
                    clientName={item.clientName}
                    existingRequest={item.documentRequest}
                    open={docModalOpen === item.id}
                    onOpenChange={(open) => !open && setDocModalOpen(null)}
                  />
                )}

                {assignModalOpen === item.id && (
                  <AssignTaskModal
                    workspaceId={item.id}
                    clientName={item.clientName}
                    tasks={activeTasks}
                    open={assignModalOpen === item.id}
                    onOpenChange={(open) => !open && setAssignModalOpen(null)}
                  />
                )}
              </div>
            )
          })
        )}
      </CardContent>
    </Card>
  )
}
