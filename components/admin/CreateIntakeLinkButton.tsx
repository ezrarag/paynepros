"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { copyText } from "@/lib/utils"

interface CreateIntakeLinkButtonProps {
  workspaceId: string
}

export function CreateIntakeLinkButton({ workspaceId }: CreateIntakeLinkButtonProps) {
  const [loading, setLoading] = useState(false)
  const [link, setLink] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const createLink = async () => {
    setLoading(true)
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
      setLink(data.url)
      const didCopy = await copyText(data.url)
      setCopied(didCopy)
      if (didCopy) {
        setTimeout(() => setCopied(false), 2000)
      }
    } catch (error) {
      console.error("Error creating intake link:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = async () => {
    if (!link) return
    const didCopy = await copyText(link)
    setCopied(didCopy)
    if (didCopy) {
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="flex w-full flex-col items-stretch gap-2 md:w-auto">
      <Button size="sm" onClick={createLink} disabled={loading}>
        {loading ? "Creating..." : "Generate Intake Link"}
      </Button>
      {link && (
        <div className="flex w-full flex-col gap-2 md:max-w-[420px]">
          <Input value={link} readOnly className="h-8 text-xs" />
          <div className="flex flex-wrap items-center gap-2">
            <Button size="sm" variant="outline" onClick={handleCopy}>
              {copied ? "Copied" : "Copy link"}
            </Button>
            <Button asChild size="sm" variant="ghost">
              <a href={link} target="_blank" rel="noreferrer">
                Open link
              </a>
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
