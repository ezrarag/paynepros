"use client"

import { useDeferredValue, useEffect, useState } from "react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ClientRequestTemplateManager } from "@/components/admin/ClientRequestTemplateManager"
import { LeadAutoResponseTemplateManager } from "@/components/admin/LeadAutoResponseTemplateManager"
import type { ClientRequestEmailTemplate } from "@/lib/types/client-request-template"
import type { LeadAutoResponseTemplate } from "@/lib/types/lead-auto-response-template"
import {
  ClipboardList,
  FileSpreadsheet,
  FolderSync,
  Link2,
  Mail,
  Route,
  Sparkles,
  Unplug,
} from "lucide-react"

type SaveRequestTemplateAction = (input: {
  subjectTemplate: string
  greetingLine: string
  introLine: string
  buttonLabel: string
  footerNote: string
  closingLine: string
  signatureName: string
}) => Promise<{ success: true } | { success: false; error: string }>

type SaveLeadAutoResponseTemplatesAction = (
  input: LeadAutoResponseTemplate[]
) => Promise<{ success: true } | { success: false; error: string }>

type FormSource = "internal" | "google"
type FormStatus = "draft" | "live"
type LibraryFilter = "all" | "internal" | "google" | "draft" | "live"

type MockFormField = {
  id: string
  label: string
  type: string
  required: boolean
}

type MockFormRecord = {
  id: string
  name: string
  source: FormSource
  status: FormStatus
  updatedAt: string
  responseCount: number
  newResponses: number
  description: string
  routingSummary: string
  fields: MockFormField[]
}

type GoogleFormsIntegrationState = {
  connected: boolean
  accountEmail: string | null
  lastSyncAt: string | null
}

interface FormsIntakeWorkspaceProps {
  requestTemplate: ClientRequestEmailTemplate
  saveRequestTemplate: SaveRequestTemplateAction
  leadAutoResponseTemplates: LeadAutoResponseTemplate[]
  saveLeadAutoResponseTemplates: SaveLeadAutoResponseTemplatesAction
}

// TODO: Replace seeded records with Firebase-backed form definitions and imported Google Form records.
const SEEDED_FORMS: MockFormRecord[] = [
  {
    id: "client-intake",
    name: "Client Intake",
    source: "internal",
    status: "live",
    updatedAt: "2026-03-14T14:20:00.000Z",
    responseCount: 48,
    newResponses: 6,
    description: "Primary onboarding intake for new PaynePros clients.",
    routingSummary: "Creates or updates a client workspace and routes notes to DeTania's checklist queue.",
    fields: [
      { id: "full-name", label: "Full name", type: "short text", required: true },
      { id: "email", label: "Email", type: "email", required: true },
      { id: "phone", label: "Phone", type: "phone", required: true },
      { id: "tax-year", label: "Tax year", type: "single select", required: true },
      { id: "anything-else", label: "Anything else", type: "long text", required: false },
    ],
  },
  {
    id: "tax-organizer",
    name: "Tax Organizer",
    source: "google",
    status: "live",
    updatedAt: "2026-03-13T18:05:00.000Z",
    responseCount: 22,
    newResponses: 3,
    description: "Imported organizer used to collect filing details and follow-up info.",
    routingSummary: "Routes responses to the assigned workspace and flags organizer follow-up items.",
    fields: [
      { id: "filing-status", label: "Filing status", type: "dropdown", required: true },
      { id: "dependents", label: "Dependents", type: "repeatable group", required: false },
      { id: "income-summary", label: "Income summary", type: "long text", required: false },
    ],
  },
  {
    id: "document-request",
    name: "Document Request",
    source: "internal",
    status: "live",
    updatedAt: "2026-03-12T09:15:00.000Z",
    responseCount: 31,
    newResponses: 4,
    description: "Operational form for missing documents and client follow-up.",
    routingSummary: "Triggers client request timeline entries and checklist updates in workspace detail.",
    fields: [
      { id: "request-type", label: "Request type", type: "dropdown", required: true },
      { id: "due-date", label: "Due date", type: "date", required: false },
      { id: "note", label: "Preparer note", type: "long text", required: false },
    ],
  },
  {
    id: "estimate-request",
    name: "Estimate Request",
    source: "internal",
    status: "draft",
    updatedAt: "2026-03-10T11:40:00.000Z",
    responseCount: 7,
    newResponses: 1,
    description: "Draft intake flow for price estimates before full client onboarding.",
    routingSummary: "Will route to admin review before a workspace is created.",
    fields: [
      { id: "service-type", label: "Service type", type: "single select", required: true },
      { id: "timeline", label: "Preferred timeline", type: "single select", required: false },
      { id: "project-notes", label: "Project notes", type: "long text", required: false },
    ],
  },
]

// TODO: Replace with Firebase-backed OAuth connection state and Google Forms import jobs.
const MOCK_GOOGLE_FORMS_INTEGRATION: GoogleFormsIntegrationState = {
  connected: true,
  accountEmail: "detania@paynepros.com",
  lastSyncAt: "2026-03-15T08:12:00.000Z",
}

const FILTER_OPTIONS: Array<{ key: LibraryFilter; label: string }> = [
  { key: "all", label: "All" },
  { key: "internal", label: "Internal" },
  { key: "google", label: "Google" },
  { key: "draft", label: "Draft" },
  { key: "live", label: "Live" },
]

const SOURCE_LABELS: Record<FormSource, string> = {
  internal: "Internal",
  google: "Google Form",
}

const STATUS_LABELS: Record<FormStatus, string> = {
  draft: "Draft",
  live: "Live",
}

const STATUS_BADGE_CLASSES: Record<FormStatus, string> = {
  draft: "bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300",
  live: "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300",
}

const SOURCE_BADGE_CLASSES: Record<FormSource, string> = {
  internal: "bg-slate-100 text-slate-700 dark:bg-slate-700/40 dark:text-slate-200",
  google: "bg-blue-100 text-blue-800 dark:bg-blue-500/15 dark:text-blue-300",
}

function formatDateTime(value: string | null) {
  if (!value) return "Not synced"
  return new Date(value).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

export function FormsIntakeWorkspace({
  requestTemplate,
  saveRequestTemplate,
  leadAutoResponseTemplates,
  saveLeadAutoResponseTemplates,
}: FormsIntakeWorkspaceProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [activeFilter, setActiveFilter] = useState<LibraryFilter>("all")
  const [selectedFormId, setSelectedFormId] = useState<string>(SEEDED_FORMS[0]?.id ?? "")
  const [uiNotice, setUiNotice] = useState<string | null>(null)
  const deferredSearchTerm = useDeferredValue(searchTerm)

  const filteredForms = SEEDED_FORMS.filter((form) => {
    const search = deferredSearchTerm.trim().toLowerCase()
    const matchesSearch =
      !search ||
      form.name.toLowerCase().includes(search) ||
      form.description.toLowerCase().includes(search)

    const matchesFilter =
      activeFilter === "all" ||
      (activeFilter === "internal" && form.source === "internal") ||
      (activeFilter === "google" && form.source === "google") ||
      (activeFilter === "draft" && form.status === "draft") ||
      (activeFilter === "live" && form.status === "live")

    return matchesSearch && matchesFilter
  })

  useEffect(() => {
    if (!filteredForms.length) return
    if (!filteredForms.some((form) => form.id === selectedFormId)) {
      setSelectedFormId(filteredForms[0].id)
    }
  }, [filteredForms, selectedFormId])

  const selectedForm =
    SEEDED_FORMS.find((form) => form.id === selectedFormId) ?? SEEDED_FORMS[0] ?? null

  const activeFormsCount = SEEDED_FORMS.filter((form) => form.status === "live").length
  const googleFormsConnected = MOCK_GOOGLE_FORMS_INTEGRATION.connected ? 1 : 0
  const newResponses = SEEDED_FORMS.reduce((sum, form) => sum + form.newResponses, 0)
  const lastSyncLabel = formatDateTime(MOCK_GOOGLE_FORMS_INTEGRATION.lastSyncAt)

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Forms &amp; Intake</h1>
          <p className="mt-2 text-muted-foreground">
            Manage client forms, Google Form imports, routing, and message templates.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline">
            <Link href="/admin/integrations">
              <Link2 className="mr-2 h-4 w-4" />
              Connect Google
            </Link>
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() =>
              setUiNotice("Google Forms import UI is prepared. OAuth import and Firebase sync are the next backend step.")
            }
          >
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            Import Google Form
          </Button>
          <Button
            type="button"
            onClick={() =>
              setUiNotice("Internal form creation is queued for the next backend pass. This workspace is ready for Firebase-backed form builder data.")
            }
          >
            <ClipboardList className="mr-2 h-4 w-4" />
            Create Internal Form
          </Button>
        </div>
      </div>

      {uiNotice && (
        <div className="rounded-lg border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-800 dark:border-sky-900 dark:bg-sky-950/30 dark:text-sky-200">
          {uiNotice}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Active Forms</CardDescription>
            <CardTitle className="text-3xl">{activeFormsCount}</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Live internal and Google-backed form flows.
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Google Forms Connected</CardDescription>
            <CardTitle className="text-3xl">{googleFormsConnected}</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Workspace connection ready for import and sync controls.
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>New Responses</CardDescription>
            <CardTitle className="text-3xl">{newResponses}</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Mock response volume across active forms this cycle.
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Last Sync</CardDescription>
            <CardTitle className="text-lg">{lastSyncLabel}</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Google Forms and routed intake submissions.
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Form Library</CardTitle>
            <CardDescription>Search, filter, and open the form workspace.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="Search forms"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
            <div className="flex flex-wrap gap-2">
              {FILTER_OPTIONS.map((filter) => (
                <Button
                  key={filter.key}
                  type="button"
                  variant={activeFilter === filter.key ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveFilter(filter.key)}
                >
                  {filter.label}
                </Button>
              ))}
            </div>

            <div className="space-y-3">
              {filteredForms.length === 0 ? (
                <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                  No forms match the current search or filter.
                </div>
              ) : (
                filteredForms.map((form) => {
                  const isSelected = selectedForm?.id === form.id
                  return (
                    <button
                      key={form.id}
                      type="button"
                      onClick={() => setSelectedFormId(form.id)}
                      className={`w-full rounded-xl border p-4 text-left transition-colors ${
                        isSelected
                          ? "border-primary bg-primary/5 dark:border-slate-500 dark:bg-[#1f2630]"
                          : "hover:bg-muted/60 dark:hover:bg-[#1b212a]"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="text-sm font-semibold">{form.name}</div>
                          <div className="mt-1 flex flex-wrap items-center gap-2">
                            <Badge className={SOURCE_BADGE_CLASSES[form.source]}>
                              {SOURCE_LABELS[form.source]}
                            </Badge>
                            <Badge className={STATUS_BADGE_CLASSES[form.status]}>
                              {STATUS_LABELS[form.status]}
                            </Badge>
                          </div>
                        </div>
                        <span className="shrink-0 text-xs text-muted-foreground">
                          {formatDate(form.updatedAt)}
                        </span>
                      </div>
                    </button>
                  )
                })
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="min-w-0">
          <CardHeader>
            <CardTitle>Selected Form Workspace</CardTitle>
            <CardDescription>
              {selectedForm
                ? `Manage structure, messaging, routing, and integrations for ${selectedForm.name}.`
                : "Select a form from the library."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {selectedForm ? (
              <Tabs defaultValue="overview" className="space-y-6">
                <TabsList className="flex flex-wrap gap-2">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="fields">Fields</TabsTrigger>
                  <TabsTrigger value="messages">Messages</TabsTrigger>
                  <TabsTrigger value="routing">Routing</TabsTrigger>
                  <TabsTrigger value="integrations">Integrations</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardDescription>Source</CardDescription>
                        <CardTitle>{SOURCE_LABELS[selectedForm.source]}</CardTitle>
                      </CardHeader>
                      <CardContent className="text-sm text-muted-foreground">
                        Updated {formatDate(selectedForm.updatedAt)}
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardDescription>Status</CardDescription>
                        <CardTitle>{STATUS_LABELS[selectedForm.status]}</CardTitle>
                      </CardHeader>
                      <CardContent className="text-sm text-muted-foreground">
                        {selectedForm.responseCount} total responses
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardDescription>New Responses</CardDescription>
                        <CardTitle>{selectedForm.newResponses}</CardTitle>
                      </CardHeader>
                      <CardContent className="text-sm text-muted-foreground">
                        Awaiting review or sync.
                      </CardContent>
                    </Card>
                  </div>

                  <Card>
                    <CardHeader>
                      <CardTitle>{selectedForm.name}</CardTitle>
                      <CardDescription>{selectedForm.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm text-muted-foreground">
                      <div>
                        <span className="font-medium text-foreground">Routing:</span>{" "}
                        {selectedForm.routingSummary}
                      </div>
                      <div>
                        <span className="font-medium text-foreground">Field count:</span>{" "}
                        {selectedForm.fields.length}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="fields" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Field Definition</CardTitle>
                      <CardDescription>Current structure for this form.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {selectedForm.fields.map((field) => (
                        <div
                          key={field.id}
                          className="flex flex-col gap-2 rounded-lg border p-3 sm:flex-row sm:items-center sm:justify-between"
                        >
                          <div>
                            <div className="text-sm font-medium">{field.label}</div>
                            <div className="text-xs text-muted-foreground">{field.type}</div>
                          </div>
                          <Badge variant={field.required ? "default" : "secondary"}>
                            {field.required ? "Required" : "Optional"}
                          </Badge>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="messages" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Template Slots</CardTitle>
                      <CardDescription>
                        Shared messaging templates used by form and intake workflows.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-3 md:grid-cols-3">
                      {[
                        {
                          title: "Confirmation Email",
                          body: "Reserved for client-facing submission confirmation after intake is complete.",
                        },
                        {
                          title: "Reminder Email",
                          body: "Reserved for nudges when a form has not been completed by the due date.",
                        },
                        {
                          title: "Internal Notification",
                          body: "Reserved for team alerts when priority forms or imported responses need review.",
                        },
                      ].map((templateCard) => (
                        <div key={templateCard.title} className="rounded-lg border p-4">
                          <div className="flex items-center gap-2 text-sm font-semibold">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            {templateCard.title}
                          </div>
                          <p className="mt-2 text-sm text-muted-foreground">{templateCard.body}</p>
                          <p className="mt-3 text-xs uppercase tracking-wide text-muted-foreground">
                            Placeholder
                          </p>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  <ClientRequestTemplateManager
                    template={requestTemplate}
                    saveTemplate={saveRequestTemplate}
                  />

                  <LeadAutoResponseTemplateManager
                    templates={leadAutoResponseTemplates}
                    saveTemplates={saveLeadAutoResponseTemplates}
                  />
                </TabsContent>

                <TabsContent value="routing" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Routing Rules</CardTitle>
                      <CardDescription>
                        Current operational flow for {selectedForm.name}.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm text-muted-foreground">
                      <div className="rounded-lg border p-4">
                        <div className="flex items-center gap-2 font-medium text-foreground">
                          <Route className="h-4 w-4" />
                          Workspace destination
                        </div>
                        <p className="mt-2">{selectedForm.routingSummary}</p>
                      </div>
                      <div className="rounded-lg border border-dashed p-4">
                        <div className="font-medium text-foreground">Next routing expansion</div>
                        <p className="mt-2">
                          Add conditional routing for DeTania, inbox assignment, and checklist status updates after response review.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="integrations" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Google Forms Integration</CardTitle>
                      <CardDescription>
                        Connection state and import controls for Google Forms.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <Badge variant={MOCK_GOOGLE_FORMS_INTEGRATION.connected ? "default" : "secondary"}>
                              {MOCK_GOOGLE_FORMS_INTEGRATION.connected ? "Connected" : "Disconnected"}
                            </Badge>
                            <span className="text-sm font-medium">
                              {MOCK_GOOGLE_FORMS_INTEGRATION.accountEmail ?? "No Google account connected"}
                            </span>
                          </div>
                          <p className="mt-2 text-sm text-muted-foreground">
                            Last sync: {formatDateTime(MOCK_GOOGLE_FORMS_INTEGRATION.lastSyncAt)}
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Button asChild variant="outline">
                            <Link href="/admin/integrations">
                              <Link2 className="mr-2 h-4 w-4" />
                              Connect Google
                            </Link>
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() =>
                              setUiNotice("Google Form import is wired at the UI layer. OAuth scopes, Firebase persistence, and import jobs still need to be connected.")
                            }
                          >
                            <FileSpreadsheet className="mr-2 h-4 w-4" />
                            Import
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() =>
                              setUiNotice("Google Forms sync is still mock-only. The next step is a Firebase-backed sync job that stores imported schema and responses.")
                            }
                          >
                            <FolderSync className="mr-2 h-4 w-4" />
                            Sync
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() =>
                              setUiNotice("Disconnect is staged in the UI only. OAuth token revocation and Firebase cleanup still need to be implemented.")
                            }
                          >
                            <Unplug className="mr-2 h-4 w-4" />
                            Disconnect
                          </Button>
                        </div>
                      </div>

                      <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                        Google Forms import is coming soon. The UI is ready; backend import, OAuth token storage, and response sync should connect here next.
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Form-to-Integration Notes</CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-3 md:grid-cols-2">
                      <div className="rounded-lg border p-4">
                        <div className="flex items-center gap-2 text-sm font-semibold">
                          <Sparkles className="h-4 w-4 text-muted-foreground" />
                          Selected form source
                        </div>
                        <p className="mt-2 text-sm text-muted-foreground">
                          {selectedForm.source === "google"
                            ? "This form is positioned as a Google import and should eventually read schema and responses from a Firebase-backed sync."
                            : "This is an internal form and should eventually load editable field config from Firebase."}
                        </p>
                      </div>
                      <div className="rounded-lg border p-4">
                        <div className="flex items-center gap-2 text-sm font-semibold">
                          <FolderSync className="h-4 w-4 text-muted-foreground" />
                          Sync target
                        </div>
                        <p className="mt-2 text-sm text-muted-foreground">
                          Response records should eventually land in Firebase collections tied to client workspace routing and intake audit history.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            ) : (
              <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
                Select a form from the library to open the workspace.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
