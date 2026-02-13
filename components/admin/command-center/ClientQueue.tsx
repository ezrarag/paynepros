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
      <CardHeader className="p-4 sm:p-6">
        <CardTitle className="text-base sm:text-lg">Client Queue</CardTitle>
        <CardDescription className="text-xs sm:text-sm">Active workspaces sorted by recent activity</CardDescription>
      </CardHeader>
      <CardContent className="p-4 sm:p-6 space-y-3 sm:space-y-4">
        {items.length === 0 ? (
          <div className="text-center py-6 sm:py-8 space-y-4">
            <p className="text-sm text-muted-foreground">No active client queue yet</p>
            <Button asChild size="sm">
              <Link href="/admin/clients">
                <UserPlus className="h-4 w-4 mr-2" />
                Add New Client
              </Link>
            </Button>
          </div>
        ) : (
          items.map((item) => {
            const activeTasks = item.tasks.filter((t) => t.status !== "done")
            const nextTasks = activeTasks.slice(0, 3)
            const unreadCount = item.messageSummaries.reduce((sum, m) => sum + m.unreadCount, 0)

            return (
              <div
                key={item.id}
                className="border rounded-lg p-3 sm:p-4 space-y-2 sm:space-y-3 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-0.5 sm:mb-1">
                      <h3 className="font-semibold text-base sm:text-lg truncate">{item.clientName}</h3>
                      <Badge variant="outline" className="text-[10px] sm:text-xs shrink-0">
                        {item.statusLabel}
                      </Badge>
                      {unreadCount > 0 && (
                        <Badge className="bg-blue-500 text-white text-[10px] sm:text-xs shrink-0">
                          {unreadCount} unread
                        </Badge>
                      )}
                    </div>
                    {item.tags.length > 0 && (
                      <div className="flex gap-1 flex-wrap mt-1">
                        {item.tags.map((tag) => (
                          <span
                            key={tag}
                            className="text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 bg-muted rounded text-muted-foreground"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="shrink-0 rounded-md border px-2 py-1 text-right bg-background">
                    <div className="flex items-end justify-end gap-1">
                      <span className="text-3xl sm:text-4xl font-black leading-none">{item.checklistPercentComplete}</span>
                      <span className="text-xl sm:text-2xl font-black leading-none text-muted-foreground">%</span>
                    </div>
                    <div className="text-[10px] sm:text-xs text-muted-foreground">
                      {item.checklistRemainingCount > 0
                        ? `${item.checklistRemainingCount} remaining`
                        : "Complete"}
                    </div>
                  </div>
                </div>

                <div className="text-[11px] sm:text-xs text-muted-foreground rounded border border-dashed p-2">
                  <span className="font-medium">Missing:</span>{" "}
                  {item.checklistMissingLabels.length > 0
                    ? item.checklistMissingLabels.join(", ")
                    : "None"}
                </div>

                {nextTasks.length > 0 ? (
                  <div className="space-y-0.5 sm:space-y-1">
                    <p className="text-[10px] sm:text-xs font-medium text-muted-foreground mb-0.5 sm:mb-1">Next tasks:</p>
                    <ul className="list-disc list-inside space-y-0.5 sm:space-y-1 text-xs sm:text-sm">
                      {nextTasks.map((task) => (
                        <li key={task.id} className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                          <span className="break-words">{task.title}</span>
                          <Badge
                            variant="outline"
                            className={`text-[10px] sm:text-xs shrink-0 ${getPriorityColor(task.priority)}`}
                          >
                            {task.priority}
                          </Badge>
                          {task.assignedTo && (
                            <span className="text-[10px] sm:text-xs text-muted-foreground">
                              ({task.assignedTo})
                            </span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <div className="text-xs sm:text-sm text-muted-foreground py-2">
                    {item.statusLabel === "Missing documents" && (
                      <p className="mb-2">Next step: Request documents</p>
                    )}
                    {item.statusLabel === "Needs review" && (
                      <p className="mb-2">Next step: Review income</p>
                    )}
                    {item.statusLabel === "In progress" && (
                      <p className="mb-2">Next step: Send intake link</p>
                    )}
                  </div>
                )}

                <div className="flex flex-wrap gap-1.5 sm:gap-2 pt-2 border-t">
                  <Button variant="outline" size="sm" asChild className="text-xs h-8 sm:h-9">
                    <Link href={`/admin/clients/${item.id}`}>
                      <ExternalLink className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 shrink-0" />
                      <span className="hidden sm:inline">Open</span>
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setMessageModalOpen(item.id)}
                    className="text-xs h-8 sm:h-9"
                    disabled={true}
                    title="Coming soon"
                  >
                    <MessageSquare className="h-3.5 w-3.5 sm:h-4 sm:w-4 sm:mr-1 shrink-0" />
                    <span className="hidden sm:inline">Reminder</span>
                  </Button>
                  {item.documentRequest &&
                    (item.documentRequest.status === "pending" ||
                      item.documentRequest.status === "partial") && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setDocModalOpen(item.id)}
                        className="text-xs h-8 sm:h-9"
                        disabled={true}
                        title="Coming soon"
                      >
                        <FileText className="h-3.5 w-3.5 sm:h-4 sm:w-4 sm:mr-1 shrink-0" />
                        <span className="hidden sm:inline">Docs</span>
                      </Button>
                    )}
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setAssignModalOpen(item.id)} 
                    className="text-xs h-8 sm:h-9"
                    disabled={true}
                    title="Coming soon"
                  >
                    <UserPlus className="h-3.5 w-3.5 sm:h-4 sm:w-4 sm:mr-1 shrink-0" />
                    <span className="hidden sm:inline">Assign</span>
                  </Button>
                  <Button variant="ghost" size="sm" className="text-xs h-8 sm:h-9" disabled={true} title="Coming soon">
                    <CheckCircle2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 sm:mr-1 shrink-0" />
                    <span className="hidden sm:inline">Reviewed</span>
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
