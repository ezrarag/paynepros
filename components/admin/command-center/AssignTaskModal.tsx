"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { WorkspaceTask } from "@/lib/types/command-center"

interface AssignTaskModalProps {
  workspaceId: string
  clientName: string
  tasks: WorkspaceTask[]
  open: boolean
  onOpenChange: (open: boolean) => void
}

const availableStaff = [
  { id: "nija", name: "Nija", role: "Bookkeeping Assistant" },
  { id: "unassigned", name: "Unassigned", role: "Not assigned" },
]

export function AssignTaskModal({
  workspaceId,
  clientName,
  tasks,
  open,
  onOpenChange,
}: AssignTaskModalProps) {
  const [assignments, setAssignments] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {}
    tasks.forEach((task) => {
      initial[task.id] = task.assignedTo || "unassigned"
    })
    return initial
  })

  const handleAssign = (taskId: string, staffId: string) => {
    setAssignments((prev) => ({ ...prev, [taskId]: staffId }))
  }

  const handleSave = () => {
    // TODO: Save assignments to backend
    console.log("Saving task assignments:", {
      workspaceId,
      assignments,
    })
    // Placeholder: Update tasks
    alert(`Task assignments saved for ${clientName}`)
    onOpenChange(false)
  }

  const unassignedTasks = tasks.filter((t) => !t.assignedTo || t.assignedTo === "unassigned")
  const assignedTasks = tasks.filter((t) => t.assignedTo && t.assignedTo !== "unassigned")

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Assign Tasks for {clientName}</DialogTitle>
          <DialogDescription>
            Assign tasks to team members for better accountability and tracking.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6">
          {unassignedTasks.length > 0 && (
            <div className="space-y-3">
              <Label className="text-base font-semibold">Unassigned Tasks</Label>
              <div className="space-y-2">
                {unassignedTasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-sm">{task.title}</p>
                      <p className="text-xs text-muted-foreground capitalize">
                        {task.category} • {task.priority} priority
                      </p>
                    </div>
                    <Select
                      value={assignments[task.id] || "unassigned"}
                      onValueChange={(value) => handleAssign(task.id, value)}
                    >
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {availableStaff.map((staff) => (
                          <SelectItem key={staff.id} value={staff.id}>
                            {staff.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>
            </div>
          )}

          {assignedTasks.length > 0 && (
            <div className="space-y-3">
              <Label className="text-base font-semibold">Currently Assigned</Label>
              <div className="space-y-2">
                {assignedTasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between p-3 border rounded-lg bg-muted/50"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-sm">{task.title}</p>
                      <p className="text-xs text-muted-foreground capitalize">
                        {task.category} • {task.priority} priority
                      </p>
                    </div>
                    <Select
                      value={assignments[task.id] || task.assignedTo || "unassigned"}
                      onValueChange={(value) => handleAssign(task.id, value)}
                    >
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {availableStaff.map((staff) => (
                          <SelectItem key={staff.id} value={staff.id}>
                            {staff.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tasks.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              No tasks available to assign
            </p>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Assignments</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
