"use client"

import { useState, useEffect, useRef } from "react"
import { cn } from "@/lib/utils"
import { X, Users, Clock, UserPlus, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"

// Mock data for participants
const mockParticipants = [
  {
    id: "1",
    name: "Nija",
    role: "Bookkeeping Assistant",
    avatar: null,
    status: "active" as const,
  },
]

// Mock cohort roles
const cohortRoles = [
  { id: "1", name: "Document Reviewer", available: 2 },
  { id: "2", name: "Tax Calculation Specialist", available: 1 },
  { id: "3", name: "Client Follow-up Coordinator", available: 3 },
]

export function BeamDrawer() {
  const [isOpen, setIsOpen] = useState(false)
  const drawerRef = useRef<HTMLDivElement>(null)

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false)
    }
    if (isOpen) {
      document.addEventListener("keydown", handleEscape)
    }
    return () => document.removeEventListener("keydown", handleEscape)
  }, [isOpen])

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (drawerRef.current && !drawerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [isOpen])

  return (
    <>
      {/* BEAM Toggle Button - Fixed bottom-left, subtle styling */}
      <button
        onClick={() => setIsOpen(true)}
        className={cn(
          "fixed bottom-4 left-4 z-40",
          "flex items-center gap-1.5 px-2.5 py-1.5",
          "text-xs font-medium text-muted-foreground",
          "bg-card border border-border rounded-md shadow-sm",
          "hover:bg-muted hover:text-foreground",
          "transition-all duration-150",
          "opacity-60 hover:opacity-100"
        )}
      >
        <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500" />
        BEAM
      </button>

      {/* Drawer Overlay */}
      <div
        className={cn(
          "fixed inset-0 z-50 bg-black/20 backdrop-blur-[1px] transition-opacity duration-200",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
      />

      {/* Drawer Panel */}
      <div
        ref={drawerRef}
        className={cn(
          "fixed bottom-0 left-0 z-50 w-80 max-h-[85vh]",
          "bg-card border border-border rounded-tr-xl shadow-xl",
          "transform transition-transform duration-200 ease-out",
          isOpen ? "translate-y-0" : "translate-y-full"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-sm font-semibold text-foreground">BEAM</span>
            <span className="text-xs text-muted-foreground">Developer Tools</span>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(85vh-52px)]">
          {/* Assigned Participants Section */}
          <div className="px-4 py-3 border-b border-border">
            <div className="flex items-center gap-2 mb-3">
              <Users className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Assigned Participants
              </span>
            </div>
            <div className="space-y-2">
              {mockParticipants.map((participant) => (
                <div
                  key={participant.id}
                  className="flex items-center gap-3 p-2 rounded-lg bg-muted/50"
                >
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-medium text-primary">
                    {participant.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {participant.name}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {participant.role}
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-100 text-emerald-700">
                    <span className="w-1 h-1 rounded-full bg-emerald-500" />
                    Active
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Time Availability Section */}
          <div className="px-4 py-3 border-b border-border">
            <div className="flex items-center gap-2 mb-3">
              <Clock className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Time Availability
              </span>
            </div>
            <div className="p-3 rounded-lg bg-muted/30 border border-dashed border-border">
              <p className="text-xs text-muted-foreground text-center">
                Availability calendar coming soon
              </p>
            </div>
          </div>

          {/* Actions Section */}
          <div className="px-4 py-3 space-y-2">
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start gap-2 text-sm font-normal"
            >
              <UserPlus className="h-4 w-4" />
              Request participant
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start gap-2 text-sm font-normal"
            >
              <Eye className="h-4 w-4" />
              View cohort roles
              <span className="ml-auto text-xs text-muted-foreground">
                {cohortRoles.length} available
              </span>
            </Button>
          </div>

          {/* Footer */}
          <div className="px-4 py-2 border-t border-border bg-muted/30">
            <p className="text-[10px] text-muted-foreground text-center">
              BEAM · Backend Execution & Assignment Manager
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
