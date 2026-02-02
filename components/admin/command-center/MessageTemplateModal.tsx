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
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface MessageTemplateModalProps {
  workspaceId: string
  clientName: string
  missingDocs?: string[]
  open: boolean
  onOpenChange: (open: boolean) => void
}

const messageTemplates = {
  "missing-docs": {
    subject: "Missing Documents Reminder",
    body: (clientName: string, missingDocs?: string[]) =>
      `Hi ${clientName},\n\nWe're still waiting on the following documents to complete your tax return:\n\n${missingDocs?.map((doc) => `• ${doc}`).join("\n") || "• Please check your workspace for the full list"}\n\nPlease upload these documents at your earliest convenience. If you have any questions, feel free to reach out.\n\nThank you!`,
  },
  "next-steps": {
    subject: "Next Steps",
    body: (clientName: string) =>
      `Hi ${clientName},\n\nHere are the next steps in your tax preparation process:\n\n• Review your documents\n• Categorize expenses\n• Finalize your return\n\nWe'll keep you updated as we progress.\n\nBest regards,`,
  },
  "schedule-call": {
    subject: "Schedule a Call",
    body: (clientName: string) =>
      `Hi ${clientName},\n\nWe'd like to schedule a call to discuss your tax return. Please let us know your availability.\n\nBest regards,`,
  },
  "received-files": {
    subject: "We Received Your Files",
    body: (clientName: string) =>
      `Hi ${clientName},\n\nThank you for uploading your documents. We've received them and will begin reviewing shortly.\n\nWe'll be in touch if we need anything else.\n\nBest regards,`,
  },
  custom: {
    subject: "",
    body: () => "",
  },
}

export function MessageTemplateModal({
  workspaceId,
  clientName,
  missingDocs,
  open,
  onOpenChange,
}: MessageTemplateModalProps) {
  const [templateKey, setTemplateKey] = useState<string>("missing-docs")
  const [subject, setSubject] = useState("")
  const [body, setBody] = useState("")
  const [channel, setChannel] = useState<string>("email")

  const handleTemplateChange = (key: string) => {
    setTemplateKey(key)
    if (key === "custom") {
      setSubject("")
      setBody("")
    } else {
      const template = messageTemplates[key as keyof typeof messageTemplates]
      setSubject(template.subject)
      setBody(template.body(clientName, missingDocs))
    }
  }

  const handleSend = () => {
    // TODO: Integrate with messaging system
    console.log("Sending message:", {
      workspaceId,
      channel,
      subject,
      body,
    })
    // Placeholder: route to messaging system
    window.location.href = `/admin/messaging?workspace=${workspaceId}&compose=1`
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Send Message to {clientName}</DialogTitle>
          <DialogDescription>Choose a template or write a custom message</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Template</Label>
            <Select value={templateKey} onValueChange={handleTemplateChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="missing-docs">Missing Documents Reminder</SelectItem>
                <SelectItem value="next-steps">Next Steps</SelectItem>
                <SelectItem value="schedule-call">Schedule a Call</SelectItem>
                <SelectItem value="received-files">We Received Your Files</SelectItem>
                <SelectItem value="custom">Custom Message</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Channel</Label>
            <Select value={channel} onValueChange={setChannel}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="sms">SMS</SelectItem>
                <SelectItem value="whatsapp">WhatsApp</SelectItem>
                <SelectItem value="ig">Instagram</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Subject</Label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              placeholder="Message subject"
            />
          </div>

          <div className="space-y-2">
            <Label>Message</Label>
            <Textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={8}
              placeholder="Message body"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSend}>Send Message</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
