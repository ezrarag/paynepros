"use client"

import { useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import type { ClientRequestEmailTemplate } from "@/lib/types/client-request-template"

type SaveAction = (input: {
  subjectTemplate: string
  greetingLine: string
  introLine: string
  buttonLabel: string
  footerNote: string
  closingLine: string
  signatureName: string
}) => Promise<{ success: true } | { success: false; error: string }>

interface ClientRequestTemplateManagerProps {
  template: ClientRequestEmailTemplate
  saveTemplate: SaveAction
}

export function ClientRequestTemplateManager({
  template,
  saveTemplate,
}: ClientRequestTemplateManagerProps) {
  const [subjectTemplate, setSubjectTemplate] = useState(template.subjectTemplate)
  const [greetingLine, setGreetingLine] = useState(template.greetingLine)
  const [introLine, setIntroLine] = useState(template.introLine)
  const [buttonLabel, setButtonLabel] = useState(template.buttonLabel)
  const [footerNote, setFooterNote] = useState(template.footerNote)
  const [closingLine, setClosingLine] = useState(template.closingLine)
  const [signatureName, setSignatureName] = useState(template.signatureName)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)
  const [isPending, startTransition] = useTransition()

  return (
    <Card>
      <CardHeader>
        <CardTitle>Client Request Email Template</CardTitle>
        <CardDescription>
          Controls the email format used when sending client requests.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}
        {saved && !error && (
          <div className="rounded border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
            Template saved.
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="subject-template">Subject template *</Label>
            <Input
              id="subject-template"
              value={subjectTemplate}
              onChange={(event) => setSubjectTemplate(event.target.value)}
              placeholder="PaynePros request: {{requestTitle}}"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="button-label">Button label *</Label>
            <Input
              id="button-label"
              value={buttonLabel}
              onChange={(event) => setButtonLabel(event.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="greeting-line">Greeting line *</Label>
          <Input
            id="greeting-line"
            value={greetingLine}
            onChange={(event) => setGreetingLine(event.target.value)}
            placeholder="Hello {{clientName}},"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="intro-line">Intro line *</Label>
          <Textarea
            id="intro-line"
            value={introLine}
            onChange={(event) => setIntroLine(event.target.value)}
            rows={2}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="footer-note">Footer note</Label>
          <Textarea
            id="footer-note"
            value={footerNote}
            onChange={(event) => setFooterNote(event.target.value)}
            rows={2}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="closing-line">Closing line *</Label>
            <Input
              id="closing-line"
              value={closingLine}
              onChange={(event) => setClosingLine(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="signature-name">Signature name *</Label>
            <Input
              id="signature-name"
              value={signatureName}
              onChange={(event) => setSignatureName(event.target.value)}
            />
          </div>
        </div>

        <div className="rounded-lg border bg-muted/30 p-3 text-xs text-muted-foreground">
          Tokens supported: <code>{"{{clientName}}"}</code>, <code>{"{{requestTitle}}"}</code>.
        </div>

        <div className="flex justify-end">
          <Button
            disabled={isPending}
            onClick={() => {
              setSaved(false)
              setError(null)
              startTransition(async () => {
                const result = await saveTemplate({
                  subjectTemplate,
                  greetingLine,
                  introLine,
                  buttonLabel,
                  footerNote,
                  closingLine,
                  signatureName,
                })
                if (!result.success) {
                  setError(result.error)
                  return
                }
                setSaved(true)
              })
            }}
          >
            {isPending ? "Saving..." : "Save template"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

