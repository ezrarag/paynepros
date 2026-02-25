"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Link2, Search, Copy, Check, UserPlus } from "lucide-react"
import type { ClientWorkspace } from "@/lib/types/client-workspace"
import { copyText } from "@/lib/utils"

interface GenerateIntakeLinkDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  workspaces: ClientWorkspace[]
  onLinkGenerated?: (url: string, clientName: string) => void
}

export function GenerateIntakeLinkDialog({
  open,
  onOpenChange,
  workspaces,
  onLinkGenerated,
}: GenerateIntakeLinkDialogProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [generatedLink, setGeneratedLink] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  // Filter workspaces based on search
  const filteredWorkspaces = useMemo(() => {
    if (!searchQuery.trim()) {
      return workspaces
    }
    const query = searchQuery.toLowerCase()
    return workspaces.filter(
      (w) =>
        w.displayName.toLowerCase().includes(query) ||
        w.primaryContact?.email?.toLowerCase().includes(query) ||
        w.primaryContact?.name?.toLowerCase().includes(query) ||
        w.tags.some((tag) => tag.toLowerCase().includes(query))
    )
  }, [workspaces, searchQuery])

  // Get latest workspace (most recently created)
  const latestWorkspace = useMemo(() => {
    if (workspaces.length === 0) return null
    return [...workspaces].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )[0]
  }, [workspaces])

  const handleQuickAddLatest = () => {
    if (latestWorkspace) {
      setSelectedWorkspaceId(latestWorkspace.id)
      generateLink(latestWorkspace.id)
    }
  }

  const generateLink = async (workspaceId: string) => {
    setLoading(true)
    setGeneratedLink(null)
    setCopied(false)

    try {
      const response = await fetch("/api/intake-links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientWorkspaceId: workspaceId,
          channels: ["email", "sms", "whatsapp"],
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to create link")
      }

      const data = await response.json()
      setGeneratedLink(data.url)
      const workspace = workspaces.find((w) => w.id === workspaceId)
      onLinkGenerated?.(data.url, workspace?.displayName || "Client")
      
      // Auto-copy to clipboard
      const didCopy = await copyText(data.url)
      if (didCopy) {
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      }
    } catch (error) {
      console.error("Error creating intake link:", error)
      alert("Failed to generate intake link. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleCopyLink = async () => {
    if (!generatedLink) return
    const didCopy = await copyText(generatedLink)
    if (didCopy) {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleClose = () => {
    setSearchQuery("")
    setSelectedWorkspaceId(null)
    setGeneratedLink(null)
    setCopied(false)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Link2 className="h-5 w-5" />
            Generate Intake Link
          </DialogTitle>
          <DialogDescription>
            Select a client to generate an intake form link
          </DialogDescription>
        </DialogHeader>

        {generatedLink ? (
          <div className="space-y-4">
            <div className="rounded-lg border bg-muted/50 p-4">
              <Label className="text-sm font-medium mb-2 block">Generated Link</Label>
              <div className="flex items-center gap-2">
                <Input
                  value={generatedLink}
                  readOnly
                  className="font-mono text-xs"
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleCopyLink}
                  className="shrink-0"
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4 mr-1" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 mr-1" />
                      Copy
                    </>
                  )}
                </Button>
              </div>
              {copied && (
                <p className="text-xs text-muted-foreground mt-2">
                  Link copied to clipboard!
                </p>
              )}
            </div>
            <div className="flex gap-2">
              <Button onClick={handleClose} className="flex-1">
                Done
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setGeneratedLink(null)
                  setSelectedWorkspaceId(null)
                }}
                className="flex-1"
              >
                Generate Another
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Quick Add Latest */}
            {latestWorkspace && (
              <Button
                variant="outline"
                onClick={handleQuickAddLatest}
                disabled={loading}
                className="w-full justify-start"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Quick Add: {latestWorkspace.displayName}
              </Button>
            )}

            {/* Search */}
            <div className="space-y-2">
              <Label htmlFor="search">Search Clients</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search by name, email, or tags..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            {/* Client List */}
            <div className="max-h-[300px] overflow-y-auto space-y-1 border rounded-lg p-2">
              {filteredWorkspaces.length === 0 ? (
                <div className="text-center py-8 text-sm text-muted-foreground">
                  {searchQuery ? "No clients found" : "No clients available"}
                </div>
              ) : (
                filteredWorkspaces.map((workspace) => (
                  <Button
                    key={workspace.id}
                    variant={selectedWorkspaceId === workspace.id ? "default" : "ghost"}
                    onClick={() => {
                      setSelectedWorkspaceId(workspace.id)
                      generateLink(workspace.id)
                    }}
                    disabled={loading}
                    className="w-full justify-start h-auto py-2 px-3"
                  >
                    <div className="flex flex-col items-start gap-1 flex-1">
                      <span className="font-medium text-sm">{workspace.displayName}</span>
                      {workspace.primaryContact?.email && (
                        <span className="text-xs text-muted-foreground">
                          {workspace.primaryContact.email}
                        </span>
                      )}
                    </div>
                  </Button>
                ))
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
