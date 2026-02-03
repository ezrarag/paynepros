"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const EXPIRY_OPTIONS = [
  { value: 24, label: "24 hours" },
  { value: 72, label: "72 hours (3 days)" },
  { value: 168, label: "7 days" },
] as const

export function NewClientIntakeLinkButton() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [url, setUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [expiresInHours, setExpiresInHours] = useState(72)
  const [copied, setCopied] = useState(false)

  const generate = async () => {
    setError(null)
    setUrl(null)
    setLoading(true)
    try {
      const response = await fetch("/api/intake-links/new-client", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          expiresInHours,
          channels: ["email", "sms", "whatsapp"],
        }),
      })
      if (!response.ok) {
        const data = await response.json()
        setError(data?.error ?? "Failed to create link")
        return
      }
      const data = await response.json()
      setUrl(data.url)
    } catch (err) {
      setError("Failed to create link")
    } finally {
      setLoading(false)
    }
  }

  const copyLink = () => {
    if (!url) return
    navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const close = () => {
    setOpen(false)
    setUrl(null)
    setError(null)
  }

  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>
        Generate New Client Intake Link
      </Button>
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={close}
        >
          <Card
            className="w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div>
                <CardTitle>New Client Intake Link</CardTitle>
                <CardDescription>
                  Share this link with someone who isn’t in the system yet. When they submit the form, a new client workspace will be created.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/30 dark:text-red-200">
                  {error}
                </div>
              )}
              {!url ? (
                <>
                  <div className="space-y-2">
                    <Label>Link expires in</Label>
                    <div className="flex gap-2">
                      {EXPIRY_OPTIONS.map((opt) => (
                        <Button
                          key={opt.value}
                          type="button"
                          variant={expiresInHours === opt.value ? "default" : "outline"}
                          size="sm"
                          onClick={() => setExpiresInHours(opt.value)}
                        >
                          {opt.label}
                        </Button>
                      ))}
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={close}>
                      Cancel
                    </Button>
                    <Button onClick={generate} disabled={loading}>
                      {loading ? "Creating..." : "Generate link"}
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label>Link (copy and share)</Label>
                    <div className="flex gap-2">
                      <Input
                        readOnly
                        value={url}
                        className="font-mono text-xs"
                      />
                      <Button variant="outline" size="sm" onClick={copyLink}>
                        {copied ? "Copied" : "Copy"}
                      </Button>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    This link is one-time use. After the client submits the intake, a new workspace will appear in your clients list.
                  </p>
                  <div className="flex justify-end">
                    <Button variant="outline" onClick={close}>
                      Done
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </>
  )
}
