"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"

interface CreateIntakeLinkButtonProps {
  workspaceId: string
}

export function CreateIntakeLinkButton({ workspaceId }: CreateIntakeLinkButtonProps) {
  const [loading, setLoading] = useState(false)
  const [link, setLink] = useState<string | null>(null)

  const createLink = async () => {
    setLoading(true)
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
      setLink(data.url)
      await navigator.clipboard.writeText(data.url)
    } catch (error) {
      console.error("Error creating intake link:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Button size="sm" onClick={createLink} disabled={loading}>
        {loading ? "Creating..." : "Generate Intake Link"}
      </Button>
      {link && (
        <span className="text-xs text-muted-foreground">Link copied to clipboard</span>
      )}
    </div>
  )
}
