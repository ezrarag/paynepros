"use client"

import { useState, useTransition } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import type { LeadAutoResponseTemplate } from "@/lib/types/lead-auto-response-template"

type SaveAction = (
  input: LeadAutoResponseTemplate[]
) => Promise<{ success: true } | { success: false; error: string }>

interface LeadAutoResponseTemplateManagerProps {
  templates: LeadAutoResponseTemplate[]
  saveTemplates: SaveAction
}

export function LeadAutoResponseTemplateManager({
  templates,
  saveTemplates,
}: LeadAutoResponseTemplateManagerProps) {
  const [drafts, setDrafts] = useState(templates)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)
  const [isPending, startTransition] = useTransition()

  const updateTemplate = (
    key: LeadAutoResponseTemplate["key"],
    field: keyof LeadAutoResponseTemplate,
    value: string | boolean
  ) => {
    setDrafts((current) =>
      current.map((template) =>
        template.key === key
          ? {
              ...template,
              [field]: value,
            }
          : template
      )
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Lead Auto-Response Templates</CardTitle>
        <CardDescription>
          These emails are sent to website visitors after the contact form is submitted, using the selected service type.
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
            Auto-response templates saved.
          </div>
        )}

        <div className="rounded-lg border bg-muted/30 p-3 text-xs text-muted-foreground">
          Tokens supported: <code>{"{{clientName}}"}</code>, <code>{"{{serviceTypeLabel}}"}</code>, <code>{"{{preferredContactMethod}}"}</code>, <code>{"{{message}}"}</code>, <code>{"{{clientPortalUrl}}"}</code>.
        </div>

        <div className="space-y-4">
          {drafts.map((template) => (
            <div key={template.key} className="rounded-lg border p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-base font-semibold">{template.label}</h3>
                  <p className="text-sm text-muted-foreground">
                    {template.key === "default"
                      ? "Fallback used when no specific service template is enabled."
                      : "Used when the matching service is selected in the contact form."}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id={`lead-template-enabled-${template.key}`}
                    checked={template.enabled}
                    onCheckedChange={(checked) => updateTemplate(template.key, "enabled", Boolean(checked))}
                  />
                  <Label htmlFor={`lead-template-enabled-${template.key}`}>Enabled</Label>
                </div>
              </div>

              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor={`lead-template-subject-${template.key}`}>Subject *</Label>
                  <Input
                    id={`lead-template-subject-${template.key}`}
                    value={template.subjectTemplate}
                    onChange={(event) => updateTemplate(template.key, "subjectTemplate", event.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`lead-template-signature-${template.key}`}>Signature *</Label>
                  <Input
                    id={`lead-template-signature-${template.key}`}
                    value={template.signatureName}
                    onChange={(event) => updateTemplate(template.key, "signatureName", event.target.value)}
                  />
                </div>
              </div>

              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor={`lead-template-greeting-${template.key}`}>Greeting *</Label>
                  <Input
                    id={`lead-template-greeting-${template.key}`}
                    value={template.greetingLine}
                    onChange={(event) => updateTemplate(template.key, "greetingLine", event.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`lead-template-closing-${template.key}`}>Closing *</Label>
                  <Input
                    id={`lead-template-closing-${template.key}`}
                    value={template.closingLine}
                    onChange={(event) => updateTemplate(template.key, "closingLine", event.target.value)}
                  />
                </div>
              </div>

              <div className="mt-4 space-y-2">
                <Label htmlFor={`lead-template-intro-${template.key}`}>Intro *</Label>
                <Textarea
                  id={`lead-template-intro-${template.key}`}
                  value={template.introLine}
                  onChange={(event) => updateTemplate(template.key, "introLine", event.target.value)}
                  rows={2}
                />
              </div>

              <div className="mt-4 space-y-2">
                <Label htmlFor={`lead-template-body-${template.key}`}>Body *</Label>
                <Textarea
                  id={`lead-template-body-${template.key}`}
                  value={template.bodyTemplate}
                  onChange={(event) => updateTemplate(template.key, "bodyTemplate", event.target.value)}
                  rows={3}
                />
              </div>

              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor={`lead-template-button-label-${template.key}`}>Button label *</Label>
                  <Input
                    id={`lead-template-button-label-${template.key}`}
                    value={template.buttonLabel}
                    onChange={(event) => updateTemplate(template.key, "buttonLabel", event.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`lead-template-button-href-${template.key}`}>Button link *</Label>
                  <Input
                    id={`lead-template-button-href-${template.key}`}
                    value={template.buttonHref}
                    onChange={(event) => updateTemplate(template.key, "buttonHref", event.target.value)}
                    placeholder="{{clientPortalUrl}}"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end">
          <Button
            disabled={isPending}
            onClick={() => {
              setSaved(false)
              setError(null)
              startTransition(async () => {
                const result = await saveTemplates(drafts)
                if (!result.success) {
                  setError(result.error)
                  return
                }
                setSaved(true)
              })
            }}
          >
            {isPending ? "Saving..." : "Save auto-responses"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
