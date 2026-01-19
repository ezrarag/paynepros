"use client"

import { useEffect, useState, useTransition } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ClientWorkspace, TimelineEvent } from "@/lib/types/client-workspace"
import {
  checklistItems,
  checklistStatusLabels,
  checklistStatusStyles,
  normalizeChecklist,
} from "@/lib/tax-return-checklist"

const TAG_OPTIONS = ["tax", "bookkeeping", "payroll", "cleanup"] as const
const TAX_YEAR_OPTIONS = [2022, 2023, 2024, 2025, 2026] as const
const STATUS_OPTIONS = ["active", "inactive"] as const

type UpdateClientInput = {
  workspaceId: string
  name: string
  email?: string
  phone?: string
  tags: string[]
  taxYears: number[]
  status: "active" | "inactive"
}

interface ClientWorkspaceDetailsProps {
  workspace: ClientWorkspace
  timeline: TimelineEvent[]
  updateClient: (input: UpdateClientInput) => Promise<void>
  updateChecklistStatus: (formData: FormData) => Promise<void>
  uploadClientForm: (input: { workspaceId: string; formName: string }) => Promise<void>
}

export function ClientWorkspaceDetails({
  workspace,
  timeline,
  updateClient,
  updateChecklistStatus,
  uploadClientForm,
}: ClientWorkspaceDetailsProps) {
  const router = useRouter()
  const [editOpen, setEditOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  const [name, setName] = useState(workspace.displayName)
  const [email, setEmail] = useState(workspace.primaryContact?.email ?? "")
  const [phone, setPhone] = useState(workspace.primaryContact?.phone ?? "")
  const [tags, setTags] = useState<string[]>(workspace.tags)
  const [taxYears, setTaxYears] = useState<number[]>(workspace.taxYears)
  const [status, setStatus] = useState<"active" | "inactive">(workspace.status)
  const checklist = normalizeChecklist(workspace.taxReturnChecklist)
  const [clientForms, setClientForms] = useState([
    {
      id: "form-001",
      name: "Signed engagement letter.pdf",
      uploadedAt: "2025-12-10T15:30:00.000Z",
      sensitive: false,
    },
    {
      id: "form-002",
      name: "E-file authorization.pdf",
      uploadedAt: "2025-12-12T18:05:00.000Z",
      sensitive: true,
    },
  ])
  const [isUploadingForm, startFormUpload] = useTransition()
  // TODO: Replace with real auth role; students cannot see sensitive forms.
  const currentRole: "admin" | "student" = "admin"

  const templateForms = [
    { id: "engagement-letter", label: "Engagement Letter", downloadName: "Engagement Letter.pdf" },
    { id: "efile-auth", label: "E-file Authorization", downloadName: "E-file Authorization.pdf" },
    { id: "document-checklist", label: "Document Checklist", downloadName: "Document Checklist.pdf" },
  ]

  const visibleClientForms =
    currentRole === "student"
      ? clientForms.filter((form) => !form.sensitive)
      : clientForms

  useEffect(() => {
    if (!editOpen) return
    setName(workspace.displayName)
    setEmail(workspace.primaryContact?.email ?? "")
    setPhone(workspace.primaryContact?.phone ?? "")
    setTags(workspace.tags)
    setTaxYears(workspace.taxYears)
    setStatus(workspace.status)
  }, [editOpen, workspace])

  const updateCheckboxList = <T,>(value: T, items: T[], setItems: (next: T[]) => void) => {
    if (items.includes(value)) {
      setItems(items.filter((item) => item !== value))
      return
    }
    setItems([...items, value])
  }

  const submitEdit = () => {
    if (!name.trim()) {
      return
    }
    startTransition(async () => {
      await updateClient({
        workspaceId: workspace.id,
        name: name.trim(),
        email: email.trim() || undefined,
        phone: phone.trim() || undefined,
        tags,
        taxYears,
        status,
      })
      setEditOpen(false)
      router.refresh()
    })
  }

  const handleMockUpload = () => {
    const mockName = `Client form upload ${clientForms.length + 1}.pdf`
    const uploadedAt = new Date().toISOString()
    const newForm = {
      id: `form-${Date.now()}`,
      name: mockName,
      uploadedAt,
      sensitive: false,
    }

    startFormUpload(async () => {
      await uploadClientForm({ workspaceId: workspace.id, formName: mockName })
      setClientForms((prev) => [newForm, ...prev])
      router.refresh()
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">{workspace.displayName}</h1>
          <p className="text-muted-foreground mt-2">
            QuickBooks-ready workspace • Status: {workspace.status.toUpperCase()}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setEditOpen(true)}>
            Edit Client
          </Button>
          <Button asChild variant="outline">
            <Link href="/admin/clients">Back to clients</Link>
          </Button>
          <Button asChild>
            <Link href={`/admin/messaging?clientId=${workspace.id}`}>Open inbox</Link>
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="flex flex-wrap gap-2">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="forms">Forms</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="tax-return">Tax Return</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Contact</CardTitle>
                <CardDescription>Primary client details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div>{workspace.primaryContact?.name || "Name not set"}</div>
                <div>{workspace.primaryContact?.email || "Email not set"}</div>
                <div>{workspace.primaryContact?.phone || "Phone not set"}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tax Profile</CardTitle>
                <CardDescription>Selected tax years</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div>{workspace.taxYears.join(", ") || "No tax years selected"}</div>
                <div className="flex flex-wrap gap-2">
                  {workspace.tags.map((tag) => (
                    <span key={tag} className="text-xs px-2 py-1 rounded bg-muted">
                      {tag}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Payment Status</CardTitle>
                <CardDescription>Stripe Connect summary</CardDescription>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Payments, deposits, and installment status will appear here.
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Timeline</CardTitle>
              <CardDescription>Messages, documents, tasks, payments</CardDescription>
            </CardHeader>
            <CardContent>
              {timeline.length === 0 ? (
                <div className="text-sm text-muted-foreground py-6 text-center">
                  No activity yet.
                </div>
              ) : (
                <div className="space-y-4">
                  {timeline.map((event) => (
                    <div key={event.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="text-sm font-medium">{event.title}</div>
                          {event.description && (
                            <div className="text-sm text-muted-foreground mt-1">
                              {event.description}
                            </div>
                          )}
                          <span className="text-xs px-2 py-1 bg-muted rounded mt-2 inline-block">
                            {event.type}
                          </span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {new Date(event.createdAt).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Document vault</CardTitle>
              <CardDescription>Upload and tag tax documents</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center justify-between border rounded-md px-3 py-2">
                  <span>W-2s and 1099s</span>
                  <span className="text-xs bg-muted px-2 py-1 rounded">Pending</span>
                </div>
                <div className="flex items-center justify-between border rounded-md px-3 py-2">
                  <span>Bank statements</span>
                  <span className="text-xs bg-muted px-2 py-1 rounded">Pending</span>
                </div>
                <div className="flex items-center justify-between border rounded-md px-3 py-2">
                  <span>Receipts + expenses</span>
                  <span className="text-xs bg-muted px-2 py-1 rounded">Pending</span>
                </div>
              </div>
              <Button variant="outline">Upload documents</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="forms" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Templates</CardTitle>
              <CardDescription>Download form templates to share with clients</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {templateForms.map((template) => (
                <div key={template.id} className="flex items-center justify-between border rounded-md px-3 py-2">
                  <div className="text-sm">{template.label}</div>
                  <Button asChild variant="outline" size="sm">
                    <a
                      href={`data:text/plain;charset=utf-8,${encodeURIComponent(
                        `Placeholder for ${template.label}`
                      )}`}
                      download={template.downloadName}
                    >
                      Download
                    </a>
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Client Forms</CardTitle>
              <CardDescription>Uploaded and generated PDFs for this client</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {currentRole === "student" && (
                <div className="text-xs text-muted-foreground">
                  Sensitive forms are hidden for student roles.
                </div>
              )}

              {visibleClientForms.length === 0 ? (
                <div className="text-sm text-muted-foreground">No forms uploaded yet.</div>
              ) : (
                <div className="space-y-2">
                  {visibleClientForms.map((form) => (
                    <div
                      key={form.id}
                      className="flex flex-col gap-1 rounded-md border px-3 py-2 text-sm md:flex-row md:items-center md:justify-between"
                    >
                      <div className="font-medium">{form.name}</div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        {form.sensitive && currentRole !== "student" && (
                          <span className="rounded bg-muted px-2 py-1">Sensitive</span>
                        )}
                        <span>{new Date(form.uploadedAt).toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <Button variant="outline" onClick={handleMockUpload} disabled={isUploadingForm}>
                {isUploadingForm ? "Uploading..." : "Upload form"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tasks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Tasks</CardTitle>
              <CardDescription>Auto-generated and assigned tasks</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Task automation will appear here (missing docs, clarifications, signatures).
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tax-return" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Return checklist</CardTitle>
              <CardDescription>Track readiness before TaxHawk entry</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {checklistItems.map((item) => {
                const status = checklist[item.key]
                return (
                  <div
                    key={item.key}
                    className="flex flex-col gap-3 rounded-lg border p-3 md:flex-row md:items-center md:justify-between"
                  >
                    <div className="space-y-1">
                      <div className="text-sm font-medium">{item.label}</div>
                      <span
                        className={`text-xs px-2 py-1 rounded ${checklistStatusStyles[status]}`}
                      >
                        {checklistStatusLabels[status]}
                      </span>
                    </div>
                    <form action={updateChecklistStatus} className="flex items-center gap-2">
                      <input type="hidden" name="workspaceId" value={workspace.id} />
                      <input type="hidden" name="itemKey" value={item.key} />
                      <select
                        name="status"
                        defaultValue={status}
                        className="h-9 rounded-md border border-input bg-background px-2 text-sm"
                      >
                        {Object.entries(checklistStatusLabels).map(([value, label]) => (
                          <option key={value} value={value}>
                            {label}
                          </option>
                        ))}
                      </select>
                      <Button variant="outline" size="sm" type="submit">
                        Update
                      </Button>
                    </form>
                  </div>
                )
              })}

              <div className="flex items-center justify-end">
                <Button disabled>Export summary</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Stripe status</CardTitle>
              <CardDescription>Invoices and deposit status</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Stripe payments, invoices, and installment schedules will appear here.
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {editOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
          onClick={() => setEditOpen(false)}
        >
          <Card className="w-full max-w-2xl" onClick={(event) => event.stopPropagation()}>
            <CardHeader>
              <CardTitle>Edit client profile</CardTitle>
              <CardDescription>Update contact info, tags, and tax years.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Name</Label>
                <Input
                  id="edit-name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="edit-email">Email</Label>
                  <Input
                    id="edit-email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-phone">Phone</Label>
                  <Input
                    id="edit-phone"
                    value={phone}
                    onChange={(event) => setPhone(event.target.value)}
                  />
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Tags</Label>
                  <div className="flex flex-col gap-2">
                    {TAG_OPTIONS.map((tag) => (
                      <label key={tag} className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={tags.includes(tag)}
                          onChange={() => updateCheckboxList(tag, tags, setTags)}
                          className="h-4 w-4 rounded border-muted"
                        />
                        {tag}
                      </label>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Tax years</Label>
                  <div className="flex flex-col gap-2">
                    {TAX_YEAR_OPTIONS.map((year) => (
                      <label key={year} className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={taxYears.includes(year)}
                          onChange={() => updateCheckboxList(year, taxYears, setTaxYears)}
                          className="h-4 w-4 rounded border-muted"
                        />
                        {year}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={status} onValueChange={(value) => setStatus(value as "active" | "inactive")}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setEditOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={submitEdit} disabled={!name.trim() || isPending}>
                  Save changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
