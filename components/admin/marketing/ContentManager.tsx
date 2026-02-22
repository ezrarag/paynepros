"use client"

import { useEffect, useMemo, useState } from "react"
import { ArrowDown, ArrowUp, Plus, Save, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { HomeSectionContent } from "@/lib/marketing/home-content"

interface ContentManagerProps {
  initialSections: HomeSectionContent[]
  initialUpdatedAt: string
}

interface EditableSection extends HomeSectionContent {
  bodyText: string
  bulletsText: string
  serviceCardsText: string
  benefitCardsText: string
  formFieldsText: string
}

const newSection = (): EditableSection => ({
  id: `section-${crypto.randomUUID()}`,
  variant: "split",
  title: "New Section",
  subtitle: "",
  body: [],
  bullets: [],
  bodyText: "",
  bulletsText: "",
  imageSrc: "",
  imageAlt: "Marketing image",
  ctaPrimaryLabel: "",
  ctaPrimaryHref: "",
  ctaSecondaryLabel: "",
  ctaSecondaryHref: "",
  serviceCards: [],
  benefitCards: [],
  formFields: [],
  serviceCardsText: "",
  benefitCardsText: "",
  formFieldsText: "",
  enabled: true,
})

const toEditable = (section: HomeSectionContent): EditableSection => ({
  ...section,
  subtitle: section.subtitle ?? "",
  ctaPrimaryLabel: section.ctaPrimaryLabel ?? "",
  ctaPrimaryHref: section.ctaPrimaryHref ?? "",
  ctaSecondaryLabel: section.ctaSecondaryLabel ?? "",
  ctaSecondaryHref: section.ctaSecondaryHref ?? "",
  serviceCards: section.serviceCards ?? [],
  benefitCards: section.benefitCards ?? [],
  formFields: section.formFields ?? [],
  bodyText: (section.body ?? []).join("\n"),
  bulletsText: (section.bullets ?? []).join("\n"),
  serviceCardsText: (section.serviceCards ?? [])
    .map((card) => `${card.title}|${card.description}`)
    .join("\n"),
  benefitCardsText: (section.benefitCards ?? [])
    .map((card) => `${card.title}|${card.description}`)
    .join("\n"),
  formFieldsText: (section.formFields ?? []).join("\n"),
})

const toSaved = (section: EditableSection): HomeSectionContent => ({
  id: section.id.trim(),
  variant: section.variant,
  title: section.title.trim(),
  subtitle: (section.subtitle ?? "").trim(),
  body: section.bodyText
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean),
  bullets: section.bulletsText
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean),
  imageSrc: section.imageSrc.trim(),
  imageAlt: section.imageAlt.trim(),
  ctaPrimaryLabel: (section.ctaPrimaryLabel ?? "").trim(),
  ctaPrimaryHref: (section.ctaPrimaryHref ?? "").trim(),
  ctaSecondaryLabel: (section.ctaSecondaryLabel ?? "").trim(),
  ctaSecondaryHref: (section.ctaSecondaryHref ?? "").trim(),
  serviceCards: section.serviceCardsText
    .split("\n")
    .map((line) => {
      const [title, ...rest] = line.split("|")
      return { title: title?.trim() || "", description: rest.join("|").trim() }
    })
    .filter((card) => card.title || card.description),
  benefitCards: section.benefitCardsText
    .split("\n")
    .map((line) => {
      const [title, ...rest] = line.split("|")
      return { title: title?.trim() || "", description: rest.join("|").trim() }
    })
    .filter((card) => card.title || card.description),
  formFields: section.formFieldsText
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean),
  enabled: section.enabled,
})

export function ContentManager({ initialSections, initialUpdatedAt }: ContentManagerProps) {
  const [sections, setSections] = useState<EditableSection[]>(initialSections.map(toEditable))
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState("")
  const [updatedAt, setUpdatedAt] = useState(initialUpdatedAt)

  useEffect(() => {
    setSections(initialSections.map(toEditable))
    setUpdatedAt(initialUpdatedAt)
  }, [initialSections, initialUpdatedAt])

  const activeCount = useMemo(() => sections.filter((section) => section.enabled).length, [sections])

  const patchSection = (index: number, patch: Partial<EditableSection>) => {
    setSections((current) =>
      current.map((section, idx) => (idx === index ? { ...section, ...patch } : section))
    )
  }

  const moveSection = (from: number, to: number) => {
    if (to < 0 || to >= sections.length) return
    setSections((current) => {
      const next = [...current]
      const [item] = next.splice(from, 1)
      next.splice(to, 0, item)
      return next
    })
  }

  const removeSection = (index: number) => {
    setSections((current) => current.filter((_, idx) => idx !== index))
  }

  const save = async () => {
    setSaving(true)
    setStatus("")
    try {
      const payload = { sections: sections.map(toSaved) }
      const res = await fetch("/api/admin/marketing-content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const json = await res.json()
      if (!res.ok) {
        setStatus(json?.error || "Failed to save content.")
        return
      }
      setStatus("Saved. Home page content updated.")
      setUpdatedAt(json?.data?.updatedAt || new Date().toISOString())
    } catch (error) {
      setStatus("Failed to save content.")
      console.error(error)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Home Page Content</CardTitle>
          <CardDescription>
            Add, remove, reorder, and edit sections for the home page slider.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-xs text-muted-foreground">
            Active sections: {activeCount} | Last update: {new Date(updatedAt).toLocaleString()}
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setSections((current) => [...current, newSection()])}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Section
            </Button>
            <Button type="button" onClick={save} disabled={saving || sections.length === 0}>
              <Save className="mr-2 h-4 w-4" />
              {saving ? "Saving..." : "Save Content"}
            </Button>
          </div>
          {status ? <p className="text-sm text-muted-foreground">{status}</p> : null}
        </CardContent>
      </Card>

      {sections.map((section, index) => (
        <Card key={section.id}>
          <CardHeader>
            <CardTitle className="text-lg">
              Section {index + 1}: {section.title || "Untitled"}
            </CardTitle>
            <CardDescription>Edit the section content and display behavior.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              <div className="space-y-2">
                <label className="text-xs font-medium">ID</label>
                <Input value={section.id} onChange={(e) => patchSection(index, { id: e.target.value })} />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium">Variant</label>
                <Select
                  value={section.variant}
                  onValueChange={(value) =>
                    patchSection(index, {
                      variant: value as "hero" | "split" | "services" | "connect" | "benefits",
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hero">Hero</SelectItem>
                    <SelectItem value="split">Split</SelectItem>
                    <SelectItem value="services">Services</SelectItem>
                    <SelectItem value="connect">Connect</SelectItem>
                    <SelectItem value="benefits">Benefits</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end gap-2">
                <label className="flex items-center gap-2 text-xs font-medium">
                  <input
                    type="checkbox"
                    checked={section.enabled}
                    onChange={(e) => patchSection(index, { enabled: e.target.checked })}
                  />
                  Enabled
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-xs font-medium">Title</label>
                <Input value={section.title} onChange={(e) => patchSection(index, { title: e.target.value })} />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium">Subtitle</label>
                <Input value={section.subtitle} onChange={(e) => patchSection(index, { subtitle: e.target.value })} />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              <div className="space-y-2">
                <label className="text-xs font-medium">Service Cards (`title|description` per line)</label>
                <Textarea
                  value={section.serviceCardsText}
                  onChange={(e) => patchSection(index, { serviceCardsText: e.target.value })}
                  className="min-h-[130px]"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium">Benefit Cards (`title|description` per line)</label>
                <Textarea
                  value={section.benefitCardsText}
                  onChange={(e) => patchSection(index, { benefitCardsText: e.target.value })}
                  className="min-h-[130px]"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium">Form Fields (one per line)</label>
                <Textarea
                  value={section.formFieldsText}
                  onChange={(e) => patchSection(index, { formFieldsText: e.target.value })}
                  className="min-h-[130px]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-xs font-medium">Body (one line per paragraph)</label>
                <Textarea
                  value={section.bodyText}
                  onChange={(e) => patchSection(index, { bodyText: e.target.value })}
                  className="min-h-[130px]"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium">Bullets (one line per bullet)</label>
                <Textarea
                  value={section.bulletsText}
                  onChange={(e) => patchSection(index, { bulletsText: e.target.value })}
                  className="min-h-[130px]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-xs font-medium">Image URL</label>
                <Input value={section.imageSrc} onChange={(e) => patchSection(index, { imageSrc: e.target.value })} />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium">Image Alt Text</label>
                <Input value={section.imageAlt} onChange={(e) => patchSection(index, { imageAlt: e.target.value })} />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-xs font-medium">Primary CTA Label</label>
                <Input
                  value={section.ctaPrimaryLabel}
                  onChange={(e) => patchSection(index, { ctaPrimaryLabel: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium">Primary CTA Link</label>
                <Input
                  value={section.ctaPrimaryHref}
                  onChange={(e) => patchSection(index, { ctaPrimaryHref: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium">Secondary CTA Label</label>
                <Input
                  value={section.ctaSecondaryLabel}
                  onChange={(e) => patchSection(index, { ctaSecondaryLabel: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium">Secondary CTA Link</label>
                <Input
                  value={section.ctaSecondaryHref}
                  onChange={(e) => patchSection(index, { ctaSecondaryHref: e.target.value })}
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-2 border-t pt-3">
              <Button type="button" size="sm" variant="outline" onClick={() => moveSection(index, index - 1)}>
                <ArrowUp className="mr-2 h-4 w-4" />
                Move Up
              </Button>
              <Button type="button" size="sm" variant="outline" onClick={() => moveSection(index, index + 1)}>
                <ArrowDown className="mr-2 h-4 w-4" />
                Move Down
              </Button>
              <Button type="button" size="sm" variant="destructive" onClick={() => removeSection(index)}>
                <Trash2 className="mr-2 h-4 w-4" />
                Remove
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
