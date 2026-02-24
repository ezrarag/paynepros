"use client"

import { useState, useEffect, useRef } from "react"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  X,
  Users,
  Clock,
  UserPlus,
  Eye,
  GraduationCap,
  Camera,
  Send,
  CheckCircle2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const mockParticipants = [
  {
    id: "1",
    name: "Nija",
    role: "Bookkeeping Assistant",
    avatar: null,
    status: "active" as const,
  },
]

const cohortRoles = [
  { id: "1", name: "Document Reviewer", available: 2 },
  { id: "2", name: "Tax Calculation Specialist", available: 1 },
  { id: "3", name: "Client Follow-up Coordinator", available: 3 },
]

type BeamRequest = {
  id: string
  title: string
  description: string
  priority: "low" | "medium" | "high"
  status: "pending" | "in_progress" | "completed" | "needs_revision"
  pagePath?: string
  screenshotUrl?: string
  createdAt: string
}

type BeamDrawerProps = {
  isSidebarCollapsed?: boolean
}

export function BeamDrawer({ isSidebarCollapsed = false }: BeamDrawerProps) {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(isSidebarCollapsed)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoadingRequests, setIsLoadingRequests] = useState(false)
  const [requests, setRequests] = useState<BeamRequest[]>([])
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "medium" as "low" | "medium" | "high",
  })
  const drawerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setSidebarCollapsed(isSidebarCollapsed)
  }, [isSidebarCollapsed])

  useEffect(() => {
    const handleStorageChange = () => {
      const saved = localStorage.getItem("admin.sidebarCollapsed")
      setSidebarCollapsed(saved === "true")
    }
    const handleCollapseChange = (e: CustomEvent<{ collapsed: boolean }>) => {
      setSidebarCollapsed(e.detail.collapsed)
    }
    window.addEventListener("storage", handleStorageChange)
    window.addEventListener("sidebarCollapseChange", handleCollapseChange as EventListener)
    handleStorageChange()
    return () => {
      window.removeEventListener("storage", handleStorageChange)
      window.removeEventListener("sidebarCollapseChange", handleCollapseChange as EventListener)
    }
  }, [])

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false)
    }
    if (isOpen) {
      document.addEventListener("keydown", handleEscape)
    }
    return () => document.removeEventListener("keydown", handleEscape)
  }, [isOpen])

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

  useEffect(() => {
    if (isOpen) {
      fetchBeamRequests()
    }
  }, [isOpen])

  const fetchBeamRequests = async () => {
    setIsLoadingRequests(true)
    try {
      const response = await fetch("/api/requests?source=beam")
      const data = await response.json()
      setRequests(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error("Error fetching BEAM requests:", error)
      setRequests([])
    } finally {
      setIsLoadingRequests(false)
    }
  }

  const uploadScreenshot = async (file: File): Promise<string> => {
    const uploadForm = new FormData()
    uploadForm.append("file", file)

    const uploadResponse = await fetch("/api/requests/upload", {
      method: "POST",
      body: uploadForm,
    })

    if (!uploadResponse.ok) {
      throw new Error("Screenshot upload failed")
    }

    const uploadData = await uploadResponse.json()
    return uploadData.url || ""
  }

  const submitBeamRequest = async () => {
    if (!formData.title.trim() || !formData.description.trim()) {
      return
    }

    setIsSubmitting(true)
    try {
      let screenshotUrl = ""
      if (attachmentFile) {
        screenshotUrl = await uploadScreenshot(attachmentFile)
      }

      const response = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          priority: formData.priority,
          category: "system",
          source: "beam",
          pagePath: pathname,
          screenshotUrl,
          sendToBeamParticipants: true,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to create request")
      }

      setFormData({
        title: "",
        description: "",
        priority: "medium",
      })
      setAttachmentFile(null)
      await fetchBeamRequests()
    } catch (error) {
      console.error("Error creating BEAM request:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const updateRequestStatus = async (
    requestId: string,
    status: BeamRequest["status"]
  ) => {
    try {
      const response = await fetch(`/api/requests/${requestId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })
      if (response.ok) {
        await fetchBeamRequests()
      }
    } catch (error) {
      console.error("Error updating request status:", error)
    }
  }

  const openRequests = requests.filter((request) => request.status !== "completed")

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={cn(
          "fixed bottom-4 z-40",
          sidebarCollapsed ? "left-4" : "left-[17rem]",
          "flex items-center gap-1.5",
          sidebarCollapsed ? "px-2 py-2" : "px-2.5 py-1.5",
          "text-xs font-medium text-muted-foreground",
          "bg-card border border-border rounded-md shadow-sm",
          "hover:bg-muted hover:text-foreground",
          "transition-all duration-300",
          "opacity-60 hover:opacity-100"
        )}
      >
        <GraduationCap className="h-4 w-4" />
        {!sidebarCollapsed && (
          <>
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>BEAM</span>
          </>
        )}
      </button>

      <div
        className={cn(
          "fixed inset-0 z-50 bg-black/20 backdrop-blur-[1px] transition-opacity duration-200",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
      />

      <div
        ref={drawerRef}
        className={cn(
          "fixed bottom-0 left-0 z-50 w-96 max-h-[92vh]",
          "bg-card border border-border rounded-tr-xl shadow-xl",
          "transform transition-transform duration-200 ease-out",
          isOpen ? "translate-y-0" : "translate-y-full"
        )}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-sm font-semibold text-foreground">BEAM</span>
            <span className="text-xs text-muted-foreground">Issue Center</span>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="overflow-y-auto max-h-[calc(92vh-52px)]">
          <div className="px-4 py-3 border-b border-border space-y-2">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Report current page issue
            </p>
            <Input
              value={formData.title}
              onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
              placeholder="Short title"
            />
            <Textarea
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, description: e.target.value }))
              }
              placeholder="What needs to be fixed or added?"
              rows={3}
            />
            <Select
              value={formData.priority}
              onValueChange={(value: "low" | "medium" | "high") =>
                setFormData((prev) => ({ ...prev, priority: value }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low priority</SelectItem>
                <SelectItem value="medium">Medium priority</SelectItem>
                <SelectItem value="high">High priority</SelectItem>
              </SelectContent>
            </Select>
            <label className="block">
              <span className="text-xs text-muted-foreground">Screenshot (optional)</span>
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => setAttachmentFile(e.target.files?.[0] || null)}
                className="mt-1"
              />
            </label>
            <p className="text-[11px] text-muted-foreground">Context captured from: {pathname}</p>
            <Button
              className="w-full"
              size="sm"
              disabled={isSubmitting}
              onClick={submitBeamRequest}
            >
              <Send className="h-3.5 w-3.5 mr-2" />
              {isSubmitting ? "Sending..." : "Send to Slack + Queue"}
            </Button>
          </div>

          <div className="px-4 py-3 border-b border-border">
            <div className="flex items-center gap-2 mb-3">
              <Clock className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Open requests
              </span>
            </div>
            {isLoadingRequests ? (
              <p className="text-xs text-muted-foreground">Loading requests...</p>
            ) : openRequests.length === 0 ? (
              <p className="text-xs text-muted-foreground">No open requests in BEAM.</p>
            ) : (
              <div className="space-y-2">
                {openRequests.map((request) => (
                  <div key={request.id} className="rounded-lg border p-2 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium leading-tight">{request.title}</p>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-muted">
                        {request.status}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">{request.description}</p>
                    {request.screenshotUrl ? (
                      <a
                        href={request.screenshotUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs underline inline-flex items-center gap-1"
                      >
                        <Camera className="h-3 w-3" /> View screenshot
                      </a>
                    ) : null}
                    <div className="flex gap-2">
                      {request.status !== "in_progress" ? (
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 text-xs"
                          onClick={() => updateRequestStatus(request.id, "in_progress")}
                        >
                          Start
                        </Button>
                      ) : null}
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 text-xs"
                        onClick={() => updateRequestStatus(request.id, "completed")}
                      >
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Complete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

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
