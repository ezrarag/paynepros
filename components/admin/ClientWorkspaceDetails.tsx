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
import { Textarea } from "@/components/ui/textarea"
import { AlertTriangle, Plus, Trash2 } from "lucide-react"
import {
  ClientWorkspace,
  IntakeResponse,
  TimelineEvent,
  FormSendRecord,
  EmailFormInput,
  FaxFormInput,
  MailFormInput,
  ScheduleCRow,
  MileageCalculation,
  ScheduleCCalculation,
} from "@/lib/types/client-workspace"
import {
  checklistItems,
  normalizeChecklist,
} from "@/lib/tax-return-checklist"
import type { ChecklistKey } from "@/lib/tax-return-checklist"

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

// Local form type with mock send history
interface ClientForm {
  id: string
  name: string
  uploadedAt: string
  sensitive: boolean
  sendHistory: FormSendRecord[]
}

type SendModalType = "email" | "fax" | "mail" | null

// IRS standard mileage rates by year (must match server-side)
const MILEAGE_RATES: Record<number, number> = {
  2020: 0.575,
  2021: 0.56,
  2022: 0.585,
  2023: 0.655,
  2024: 0.67,
  2025: 0.70,
  2026: 0.70,
}

const MILEAGE_YEARS = Object.keys(MILEAGE_RATES).map(Number).sort((a, b) => b - a)

const SCHEDULE_C_CATEGORIES = [
  "Advertising",
  "Car & truck expenses",
  "Commissions & fees",
  "Contract labor",
  "Depreciation",
  "Employee benefit programs",
  "Insurance (other than health)",
  "Interest (mortgage)",
  "Interest (other)",
  "Legal & professional services",
  "Office expense",
  "Pension & profit-sharing",
  "Rent (vehicles, machinery)",
  "Rent (other business property)",
  "Repairs & maintenance",
  "Supplies",
  "Taxes & licenses",
  "Travel",
  "Meals (50%)",
  "Utilities",
  "Wages",
  "Other expenses",
]

type ActionResult<T = void> = 
  | { success: true; data: T }
  | { success: false; error: string }

interface ClientWorkspaceDetailsProps {
  workspace: ClientWorkspace
  timeline: TimelineEvent[]
  latestIntake?: IntakeResponse | null
  updateClient: (input: UpdateClientInput) => Promise<ActionResult>
  updateChecklistStatus: (formData: FormData) => Promise<ActionResult>
  uploadClientForm: (input: { workspaceId: string; formName: string }) => Promise<ActionResult>
  emailForm: (input: EmailFormInput) => Promise<ActionResult>
  faxForm: (input: FaxFormInput) => Promise<ActionResult>
  mailForm: (input: MailFormInput) => Promise<ActionResult>
  saveMileageCalculation: (input: { workspaceId: string; year: number; miles: number }) => Promise<ActionResult<MileageCalculation>>
  saveScheduleCCalculation: (input: { workspaceId: string; rows: ScheduleCRow[] }) => Promise<ActionResult<ScheduleCCalculation>>
  deleteClient: (workspaceId: string) => Promise<ActionResult>
}

export function ClientWorkspaceDetails({
  workspace,
  timeline,
  latestIntake,
  updateClient,
  updateChecklistStatus,
  uploadClientForm,
  emailForm,
  faxForm,
  mailForm,
  saveMileageCalculation,
  saveScheduleCCalculation,
  deleteClient,
}: ClientWorkspaceDetailsProps) {
  const router = useRouter()
  const [editOpen, setEditOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const [name, setName] = useState(workspace.displayName)
  const [email, setEmail] = useState(workspace.primaryContact?.email ?? "")
  const [phone, setPhone] = useState(workspace.primaryContact?.phone ?? "")
  const [tags, setTags] = useState<string[]>(workspace.tags)
  const [taxYears, setTaxYears] = useState<number[]>(workspace.taxYears)
  const [status, setStatus] = useState<"active" | "inactive">(workspace.status)
  const [checklistOverrides, setChecklistOverrides] = useState<
    Partial<Record<ChecklistKey, "not_started" | "in_progress" | "complete">>
  >({})
  const checklist = {
    ...normalizeChecklist(workspace.taxReturnChecklist),
    ...checklistOverrides,
  }
  
  // Mock client forms with send history
  const [clientForms, setClientForms] = useState<ClientForm[]>([
    {
      id: "form-001",
      name: "Signed engagement letter.pdf",
      uploadedAt: "2025-12-10T15:30:00.000Z",
      sensitive: false,
      sendHistory: [
        {
          id: "send-001",
          method: "email",
          recipient: "client@example.com",
          sentAt: "2025-12-11T10:00:00.000Z",
        },
      ],
    },
    {
      id: "form-002",
      name: "E-file authorization.pdf",
      uploadedAt: "2025-12-12T18:05:00.000Z",
      sensitive: true,
      sendHistory: [],
    },
    {
      id: "form-003",
      name: "W-9 Form.pdf",
      uploadedAt: "2025-12-15T09:30:00.000Z",
      sensitive: false,
      sendHistory: [
        {
          id: "send-002",
          method: "fax",
          recipient: "(555) 123-4567",
          sentAt: "2025-12-16T14:20:00.000Z",
        },
        {
          id: "send-003",
          method: "mail",
          recipient: "123 Main St, City, ST 12345",
          sentAt: "2025-12-18T11:00:00.000Z",
        },
      ],
    },
  ])
  const [isUploadingForm, startFormUpload] = useTransition()
  const [isSendingForm, startSendForm] = useTransition()
  
  // TODO: Replace with real auth role; students cannot see sensitive forms.
  const currentRole: "admin" | "student" = "admin"
  
  // Send modal state
  const [sendModalType, setSendModalType] = useState<SendModalType>(null)
  const [selectedForm, setSelectedForm] = useState<ClientForm | null>(null)
  const [actionsDropdownOpen, setActionsDropdownOpen] = useState<string | null>(null)
  
  // Email form state
  const [emailRecipient, setEmailRecipient] = useState("")
  const [emailSubject, setEmailSubject] = useState("")
  const [emailNote, setEmailNote] = useState("")
  
  // Fax form state
  const [faxNumber, setFaxNumber] = useState("")
  const [faxNote, setFaxNote] = useState("")
  
  // Mail form state
  const [mailName, setMailName] = useState("")
  const [mailStreet, setMailStreet] = useState("")
  const [mailCity, setMailCity] = useState("")
  const [mailState, setMailState] = useState("")
  const [mailZip, setMailZip] = useState("")
  const [mailNote, setMailNote] = useState("")
  const checklistRowStyles: Record<ChecklistKey, { container: string; action: string }> = {
    documentsComplete: {
      container: "bg-slate-100/90 border-slate-200",
      action: "border-sky-300 text-sky-700",
    },
    expensesCategorized: {
      container: "bg-emerald-100/80 border-emerald-200",
      action: "border-emerald-300 text-emerald-700",
    },
    readyForTaxHawk: {
      container: "bg-blue-100/80 border-blue-200",
      action: "border-blue-300 text-blue-700",
    },
    incomeReviewed: {
      container: "bg-violet-100/80 border-violet-200",
      action: "border-violet-300 text-violet-700",
    },
    bankInfoCollected: {
      container: "bg-amber-100/80 border-amber-200",
      action: "border-amber-300 text-amber-700",
    },
    otherCompleted: {
      container: "bg-cyan-100/80 border-cyan-200",
      action: "border-cyan-300 text-cyan-700",
    },
    filed: {
      container: "bg-indigo-100/80 border-indigo-200",
      action: "border-indigo-300 text-indigo-700",
    },
    accepted: {
      container: "bg-teal-100/80 border-teal-200",
      action: "border-teal-300 text-teal-700",
    },
  }

  // Calculations state
  const [isSavingCalc, startSaveCalc] = useTransition()
  
  // Mileage calculator state
  const [mileageYear, setMileageYear] = useState<number>(workspace.calculations?.mileage?.year ?? MILEAGE_YEARS[0])
  const [mileageAmount, setMileageAmount] = useState<string>(
    workspace.calculations?.mileage?.miles?.toString() ?? ""
  )
  const mileageRate = MILEAGE_RATES[mileageYear] ?? 0.70
  const mileageDeduction = mileageAmount ? Math.round(parseFloat(mileageAmount) * mileageRate * 100) / 100 : 0
  
  // Schedule C state
  const [scheduleCRows, setScheduleCRows] = useState<ScheduleCRow[]>(
    workspace.calculations?.scheduleC?.rows ?? []
  )
  const [newCategory, setNewCategory] = useState("")
  const [newAmount, setNewAmount] = useState("")
  const [newNote, setNewNote] = useState("")
  
  const scheduleCTotalsByCategory = scheduleCRows.reduce((acc, row) => {
    acc[row.category] = (acc[row.category] || 0) + row.amount
    return acc
  }, {} as Record<string, number>)
  
  const scheduleCGrandTotal = scheduleCRows.reduce((sum, row) => sum + row.amount, 0)

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

  const completeChecklistItem = (itemKey: ChecklistKey) => {
    const nextStatus: "complete" = "complete"
    const previousStatus = checklist[itemKey]
    if (previousStatus === nextStatus) {
      return
    }

    setError(null)
    setChecklistOverrides((prev) => ({
      ...prev,
      [itemKey]: nextStatus,
    }))

    const formData = new FormData()
    formData.set("workspaceId", workspace.id)
    formData.set("itemKey", itemKey)
    formData.set("status", nextStatus)

    startTransition(async () => {
      const result = await updateChecklistStatus(formData)
      if (!result.success) {
        setChecklistOverrides((prev) => ({
          ...prev,
          [itemKey]: previousStatus,
        }))
        setError(result.error)
        return
      }
      router.refresh()
    })
  }

  const submitEdit = () => {
    if (!name.trim()) {
      return
    }
    setError(null)
    startTransition(async () => {
      const result = await updateClient({
        workspaceId: workspace.id,
        name: name.trim(),
        email: email.trim() || undefined,
        phone: phone.trim() || undefined,
        tags,
        taxYears,
        status,
      })
      if (!result.success) {
        setError(result.error)
        return
      }
      setEditOpen(false)
      router.refresh()
    })
  }

  const handleMockUpload = () => {
    const mockName = `Client form upload ${clientForms.length + 1}.pdf`
    const uploadedAt = new Date().toISOString()
    const newForm: ClientForm = {
      id: `form-${Date.now()}`,
      name: mockName,
      uploadedAt,
      sensitive: false,
      sendHistory: [],
    }

    setError(null)
    startFormUpload(async () => {
      const result = await uploadClientForm({ workspaceId: workspace.id, formName: mockName })
      if (!result.success) {
        setError(result.error)
        return
      }
      setClientForms((prev) => [newForm, ...prev])
      router.refresh()
    })
  }

  const openSendModal = (form: ClientForm, type: SendModalType) => {
    // Student role restriction: cannot send sensitive forms
    if (currentRole === "student" && form.sensitive) {
      alert("Students cannot send sensitive forms.")
      return
    }
    setSelectedForm(form)
    setSendModalType(type)
    setActionsDropdownOpen(null)
    // Reset form fields
    setEmailRecipient(workspace.primaryContact?.email ?? "")
    setEmailSubject(`${form.name} - ${workspace.displayName}`)
    setEmailNote("")
    setFaxNumber("")
    setFaxNote("")
    setMailName(workspace.primaryContact?.name ?? "")
    setMailStreet("")
    setMailCity("")
    setMailState("")
    setMailZip("")
    setMailNote("")
  }

  const closeSendModal = () => {
    setSendModalType(null)
    setSelectedForm(null)
  }

  const handleEmailSend = () => {
    if (!selectedForm || !emailRecipient.trim() || !emailSubject.trim()) return
    
    setError(null)
    startSendForm(async () => {
      const result = await emailForm({
        workspaceId: workspace.id,
        formId: selectedForm.id,
        formName: selectedForm.name,
        recipientEmail: emailRecipient.trim(),
        subject: emailSubject.trim(),
        note: emailNote.trim() || undefined,
      })
      
      if (!result.success) {
        setError(result.error)
        closeSendModal()
        return
      }
      
      // Update local state with mock send record
      const newSendRecord: FormSendRecord = {
        id: `send-${Date.now()}`,
        method: "email",
        recipient: emailRecipient.trim(),
        sentAt: new Date().toISOString(),
        note: emailNote.trim() || undefined,
      }
      setClientForms((prev) =>
        prev.map((f) =>
          f.id === selectedForm.id
            ? { ...f, sendHistory: [...f.sendHistory, newSendRecord] }
            : f
        )
      )
      closeSendModal()
      router.refresh()
    })
  }

  const handleFaxSend = () => {
    if (!selectedForm || !faxNumber.trim()) return
    
    setError(null)
    startSendForm(async () => {
      const result = await faxForm({
        workspaceId: workspace.id,
        formId: selectedForm.id,
        formName: selectedForm.name,
        faxNumber: faxNumber.trim(),
        note: faxNote.trim() || undefined,
      })
      
      if (!result.success) {
        setError(result.error)
        closeSendModal()
        return
      }
      
      const newSendRecord: FormSendRecord = {
        id: `send-${Date.now()}`,
        method: "fax",
        recipient: faxNumber.trim(),
        sentAt: new Date().toISOString(),
        note: faxNote.trim() || undefined,
      }
      setClientForms((prev) =>
        prev.map((f) =>
          f.id === selectedForm.id
            ? { ...f, sendHistory: [...f.sendHistory, newSendRecord] }
            : f
        )
      )
      closeSendModal()
      router.refresh()
    })
  }

  const handleMailSend = () => {
    if (!selectedForm || !mailName.trim() || !mailStreet.trim() || !mailCity.trim() || !mailState.trim() || !mailZip.trim()) return
    
    setError(null)
    startSendForm(async () => {
      const result = await mailForm({
        workspaceId: workspace.id,
        formId: selectedForm.id,
        formName: selectedForm.name,
        address: {
          name: mailName.trim(),
          street: mailStreet.trim(),
          city: mailCity.trim(),
          state: mailState.trim(),
          zip: mailZip.trim(),
        },
        note: mailNote.trim() || undefined,
      })
      
      if (!result.success) {
        setError(result.error)
        closeSendModal()
        return
      }
      
      const addressSummary = `${mailStreet.trim()}, ${mailCity.trim()}, ${mailState.trim()} ${mailZip.trim()}`
      const newSendRecord: FormSendRecord = {
        id: `send-${Date.now()}`,
        method: "mail",
        recipient: addressSummary,
        sentAt: new Date().toISOString(),
        note: mailNote.trim() || undefined,
      }
      setClientForms((prev) =>
        prev.map((f) =>
          f.id === selectedForm.id
            ? { ...f, sendHistory: [...f.sendHistory, newSendRecord] }
            : f
        )
      )
      closeSendModal()
      router.refresh()
    })
  }

  const getLastSent = (form: ClientForm) => {
    if (form.sendHistory.length === 0) return null
    const sorted = [...form.sendHistory].sort(
      (a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime()
    )
    return sorted[0]
  }

  const formatSendMethod = (method: string) => {
    switch (method) {
      case "email": return "Emailed"
      case "fax": return "Faxed"
      case "mail": return "Mailed"
      default: return method
    }
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/30 dark:text-red-200">
          {error}
        </div>
      )}
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">{workspace.displayName}</h1>
          <p className="text-muted-foreground mt-2">
            QuickBooks-ready workspace • Status: {workspace.status.toUpperCase()}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" onClick={() => setEditOpen(true)}>
            Edit Client
          </Button>
          <Button asChild variant="outline">
            <Link href="/admin/clients">Back to clients</Link>
          </Button>
          <Button asChild>
            <Link href={`/admin/messaging?clientId=${workspace.id}`}>Open inbox</Link>
          </Button>
          <Button
            variant="outline"
            className="border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800 dark:border-red-900 dark:text-red-300 dark:hover:bg-red-950/50"
            disabled={isPending}
            onClick={() => {
              if (typeof window !== "undefined" && window.confirm("Delete this client workspace? This cannot be undone.")) {
                setError(null)
                startTransition(async () => {
                  const result = await deleteClient(workspace.id)
                  if (!result.success) {
                    setError(result.error)
                    return
                  }
                  router.push("/admin/clients")
                  router.refresh()
                })
              }
            }}
          >
            Delete workspace
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
          <TabsTrigger value="calculations">Calculations</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {latestIntake && (
            <Card>
              <CardHeader>
                <CardTitle>Latest intake</CardTitle>
                <CardDescription>
                  Submitted{" "}
                  {new Date(latestIntake.submittedAt).toLocaleString(undefined, {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Name:</span>{" "}
                  {String(latestIntake.responses?.fullName ?? "—")}
                </div>
                <div>
                  <span className="text-muted-foreground">Email:</span>{" "}
                  {String(latestIntake.responses?.email ?? "—")}
                </div>
                <div>
                  <span className="text-muted-foreground">Tax years:</span>{" "}
                  {Array.isArray(latestIntake.responses?.taxYears)
                    ? latestIntake.responses.taxYears.join(", ")
                    : "—"}
                </div>
                {latestIntake.responses?.notes && (
                  <div className="pt-2 border-t">
                    <span className="text-muted-foreground">Notes:</span>{" "}
                    {String(latestIntake.responses.notes)}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
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
                  Sensitive forms are hidden for student roles. You cannot send sensitive forms.
                </div>
              )}

              {visibleClientForms.length === 0 ? (
                <div className="text-sm text-muted-foreground">No forms uploaded yet.</div>
              ) : (
                <div className="space-y-3">
                  {visibleClientForms.map((form) => {
                    const lastSent = getLastSent(form)
                    const canSend = !(currentRole === "student" && form.sensitive)
                    
                    return (
                      <div
                        key={form.id}
                        className="rounded-md border px-4 py-3"
                      >
                        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                          <div className="space-y-1">
                            <div className="font-medium text-sm">{form.name}</div>
                            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                              {form.sensitive && currentRole !== "student" && (
                                <span className="rounded bg-amber-100 text-amber-800 px-2 py-0.5">Sensitive</span>
                              )}
                              <span>Uploaded {new Date(form.uploadedAt).toLocaleDateString()}</span>
                              {lastSent && (
                                <span className="text-emerald-600">
                                  • {formatSendMethod(lastSent.method)} {new Date(lastSent.sentAt).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                          </div>
                          
                          {/* Actions dropdown */}
                          <div className="relative">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setActionsDropdownOpen(
                                actionsDropdownOpen === form.id ? null : form.id
                              )}
                            >
                              Actions
                              <svg
                                className="ml-2 h-4 w-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            </Button>
                            
                            {actionsDropdownOpen === form.id && (
                              <div
                                className="absolute right-0 top-full mt-1 z-50 w-40 rounded-md border bg-popover shadow-lg"
                              >
                                <div className="py-1">
                                  <button
                                    className={`w-full px-4 py-2 text-left text-sm hover:bg-muted ${!canSend ? "opacity-50 cursor-not-allowed" : ""}`}
                                    onClick={() => canSend && openSendModal(form, "email")}
                                    disabled={!canSend}
                                  >
                                    Email
                                  </button>
                                  <button
                                    className={`w-full px-4 py-2 text-left text-sm hover:bg-muted ${!canSend ? "opacity-50 cursor-not-allowed" : ""}`}
                                    onClick={() => canSend && openSendModal(form, "fax")}
                                    disabled={!canSend}
                                  >
                                    Fax
                                  </button>
                                  <button
                                    className={`w-full px-4 py-2 text-left text-sm hover:bg-muted ${!canSend ? "opacity-50 cursor-not-allowed" : ""}`}
                                    onClick={() => canSend && openSendModal(form, "mail")}
                                    disabled={!canSend}
                                  >
                                    Mail
                                  </button>
                                  <hr className="my-1 border-muted" />
                                  <a
                                    href={`data:text/plain;charset=utf-8,${encodeURIComponent(
                                      `Placeholder content for ${form.name}`
                                    )}`}
                                    download={form.name}
                                    className="block w-full px-4 py-2 text-left text-sm hover:bg-muted"
                                    onClick={() => setActionsDropdownOpen(null)}
                                  >
                                    Download
                                  </a>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {/* Send history */}
                        {form.sendHistory.length > 0 && (
                          <div className="mt-3 pt-3 border-t">
                            <div className="text-xs font-medium text-muted-foreground mb-2">Send History</div>
                            <div className="space-y-1">
                              {form.sendHistory.map((record) => (
                                <div key={record.id} className="flex items-center gap-2 text-xs text-muted-foreground">
                                  <span className={`inline-flex items-center px-2 py-0.5 rounded ${
                                    record.method === "email" ? "bg-blue-100 text-blue-700" :
                                    record.method === "fax" ? "bg-purple-100 text-purple-700" :
                                    "bg-green-100 text-green-700"
                                  }`}>
                                    {formatSendMethod(record.method)}
                                  </span>
                                  <span className="truncate max-w-[200px]">{record.recipient}</span>
                                  <span>•</span>
                                  <span>{new Date(record.sentAt).toLocaleString()}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
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
              <CardTitle>Return Checklist</CardTitle>
              <CardDescription>
                Last updated{" "}
                {new Date(workspace.lastActivityAt ?? workspace.updatedAt).toLocaleString(undefined, {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                })}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {checklistItems.filter((item) => checklist[item.key] !== "complete").length === 0 ? (
                <div className="rounded-lg border border-dashed p-3 text-sm text-muted-foreground">
                  All checklist items completed.
                </div>
              ) : (
                checklistItems
                  .filter((item) => checklist[item.key] !== "complete")
                  .map((item) => {
                    const rowStyle = checklistRowStyles[item.key]
                    return (
                      <div
                        key={item.key}
                        className={`flex items-center justify-between rounded-xl border px-3 py-2 text-sm ${rowStyle.container}`}
                      >
                        <span className="font-medium">{item.label}</span>
                        <button
                          type="button"
                          onClick={() => completeChecklistItem(item.key)}
                          className={`inline-flex h-8 w-8 items-center justify-center rounded-full border text-xl leading-none ${rowStyle.action}`}
                          aria-label={`Complete ${item.label}`}
                        >
                          +
                        </button>
                      </div>
                    )
                  })
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="calculations" className="space-y-4">
          {/* Disclaimer Banner */}
          <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-950/30">
            <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-amber-800 dark:text-amber-200">
              <span className="font-medium">Support tool</span> — These calculators help estimate deductions during prep. 
              Final numbers are confirmed in TaxHawk before filing.
            </div>
          </div>

          {/* Mileage Deduction Helper */}
          <Card>
            <CardHeader>
              <CardTitle>Mileage Deduction Helper</CardTitle>
              <CardDescription>
                Calculate standard mileage deduction using IRS rates
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="mileage-year">Tax Year</Label>
                  <Select
                    value={mileageYear.toString()}
                    onValueChange={(value) => setMileageYear(parseInt(value))}
                  >
                    <SelectTrigger id="mileage-year">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {MILEAGE_YEARS.map((year) => (
                        <SelectItem key={year} value={year.toString()}>
                          {year} (${MILEAGE_RATES[year]}/mile)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mileage-amount">Business Miles</Label>
                  <Input
                    id="mileage-amount"
                    type="number"
                    min="0"
                    placeholder="e.g., 12000"
                    value={mileageAmount}
                    onChange={(e) => setMileageAmount(e.target.value)}
                  />
                </div>
              </div>

              {mileageAmount && parseFloat(mileageAmount) > 0 && (
                <div className="rounded-lg border bg-muted/30 p-4">
                  <div className="text-sm text-muted-foreground mb-1">Estimated Deduction</div>
                  <div className="text-2xl font-bold text-primary">
                    ${mileageDeduction.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {parseFloat(mileageAmount).toLocaleString()} miles × ${mileageRate}/mile
                  </div>
                </div>
              )}

              {workspace.calculations?.mileage && (
                <div className="text-xs text-muted-foreground border-t pt-3">
                  Last saved: {workspace.calculations.mileage.year} — {workspace.calculations.mileage.miles.toLocaleString()} miles 
                  = ${workspace.calculations.mileage.estimatedDeduction.toLocaleString()} 
                  ({new Date(workspace.calculations.mileage.updatedAt).toLocaleDateString()})
                </div>
              )}

              <div className="flex justify-end">
                <Button
                  onClick={() => {
                    if (!mileageAmount || parseFloat(mileageAmount) <= 0) return
                    setError(null)
                    startSaveCalc(async () => {
                      const result = await saveMileageCalculation({
                        workspaceId: workspace.id,
                        year: mileageYear,
                        miles: parseFloat(mileageAmount),
                      })
                      if (!result.success) {
                        setError(result.error)
                        return
                      }
                      router.refresh()
                    })
                  }}
                  disabled={!mileageAmount || parseFloat(mileageAmount) <= 0 || isSavingCalc}
                >
                  {isSavingCalc ? "Saving..." : "Save Mileage Calculation"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Schedule C Totals Builder */}
          <Card>
            <CardHeader>
              <CardTitle>Schedule C Totals Builder</CardTitle>
              <CardDescription>
                Track business expenses by category for Schedule C
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Add new row */}
              <div className="rounded-lg border p-4 space-y-3">
                <div className="text-sm font-medium">Add Expense</div>
                <div className="grid gap-3 md:grid-cols-3">
                  <div className="space-y-1">
                    <Label htmlFor="new-category" className="text-xs">Category</Label>
                    <Select value={newCategory} onValueChange={setNewCategory}>
                      <SelectTrigger id="new-category">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {SCHEDULE_C_CATEGORIES.map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="new-amount" className="text-xs">Amount</Label>
                    <Input
                      id="new-amount"
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      value={newAmount}
                      onChange={(e) => setNewAmount(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="new-note" className="text-xs">Note (optional)</Label>
                    <Input
                      id="new-note"
                      placeholder="e.g., QuickBooks total"
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                    />
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (!newCategory || !newAmount || parseFloat(newAmount) <= 0) return
                    const newRow: ScheduleCRow = {
                      id: `row-${Date.now()}`,
                      category: newCategory,
                      amount: parseFloat(newAmount),
                      note: newNote || undefined,
                    }
                    setScheduleCRows([...scheduleCRows, newRow])
                    setNewCategory("")
                    setNewAmount("")
                    setNewNote("")
                  }}
                  disabled={!newCategory || !newAmount || parseFloat(newAmount) <= 0}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Row
                </Button>
              </div>

              {/* Expense rows */}
              {scheduleCRows.length > 0 && (
                <div className="space-y-2">
                  <div className="text-sm font-medium">Expense Rows</div>
                  <div className="rounded-lg border divide-y">
                    {scheduleCRows.map((row) => (
                      <div key={row.id} className="flex items-center justify-between p-3 text-sm">
                        <div className="flex-1">
                          <div className="font-medium">{row.category}</div>
                          {row.note && (
                            <div className="text-xs text-muted-foreground">{row.note}</div>
                          )}
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-mono">
                            ${row.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                            onClick={() => {
                              setScheduleCRows(scheduleCRows.filter((r) => r.id !== row.id))
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Totals by category */}
              {Object.keys(scheduleCTotalsByCategory).length > 0 && (
                <div className="space-y-2">
                  <div className="text-sm font-medium">Totals by Category</div>
                  <div className="rounded-lg border bg-muted/30 p-4 space-y-2">
                    {Object.entries(scheduleCTotalsByCategory)
                      .sort(([, a], [, b]) => b - a)
                      .map(([category, total]) => (
                        <div key={category} className="flex justify-between text-sm">
                          <span>{category}</span>
                          <span className="font-mono">
                            ${total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        </div>
                      ))}
                    <div className="border-t pt-2 mt-2 flex justify-between font-semibold">
                      <span>Grand Total</span>
                      <span className="text-primary font-mono">
                        ${scheduleCGrandTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {workspace.calculations?.scheduleC && (
                <div className="text-xs text-muted-foreground border-t pt-3">
                  Last saved: {workspace.calculations.scheduleC.rows.length} rows totaling $
                  {workspace.calculations.scheduleC.rows.reduce((sum, r) => sum + r.amount, 0).toLocaleString()} 
                  ({new Date(workspace.calculations.scheduleC.updatedAt).toLocaleDateString()})
                </div>
              )}

              <div className="flex justify-end">
                <Button
                  onClick={() => {
                    setError(null)
                    startSaveCalc(async () => {
                      const result = await saveScheduleCCalculation({
                        workspaceId: workspace.id,
                        rows: scheduleCRows,
                      })
                      if (!result.success) {
                        setError(result.error)
                        return
                      }
                      router.refresh()
                    })
                  }}
                  disabled={scheduleCRows.length === 0 || isSavingCalc}
                >
                  {isSavingCalc ? "Saving..." : "Save Schedule C"}
                </Button>
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

      {/* Email Send Modal */}
      {sendModalType === "email" && selectedForm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
          onClick={closeSendModal}
        >
          <Card className="w-full max-w-md" onClick={(event) => event.stopPropagation()}>
            <CardHeader>
              <CardTitle>Email Form</CardTitle>
              <CardDescription>Send "{selectedForm.name}" via email</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email-recipient">Recipient Email *</Label>
                <Input
                  id="email-recipient"
                  type="email"
                  placeholder="client@example.com"
                  value={emailRecipient}
                  onChange={(event) => setEmailRecipient(event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email-subject">Subject *</Label>
                <Input
                  id="email-subject"
                  placeholder="Email subject"
                  value={emailSubject}
                  onChange={(event) => setEmailSubject(event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email-note">Note (optional)</Label>
                <Textarea
                  id="email-note"
                  placeholder="Add a message to include with the form..."
                  value={emailNote}
                  onChange={(event) => setEmailNote(event.target.value)}
                  rows={3}
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={closeSendModal}>
                  Cancel
                </Button>
                <Button
                  onClick={handleEmailSend}
                  disabled={!emailRecipient.trim() || !emailSubject.trim() || isSendingForm}
                >
                  {isSendingForm ? "Sending..." : "Confirm Send"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Fax Send Modal */}
      {sendModalType === "fax" && selectedForm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
          onClick={closeSendModal}
        >
          <Card className="w-full max-w-md" onClick={(event) => event.stopPropagation()}>
            <CardHeader>
              <CardTitle>Fax Form</CardTitle>
              <CardDescription>Send "{selectedForm.name}" via fax</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fax-number">Fax Number *</Label>
                <Input
                  id="fax-number"
                  type="tel"
                  placeholder="(555) 123-4567"
                  value={faxNumber}
                  onChange={(event) => setFaxNumber(event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fax-note">Note (optional)</Label>
                <Textarea
                  id="fax-note"
                  placeholder="Add a cover page note..."
                  value={faxNote}
                  onChange={(event) => setFaxNote(event.target.value)}
                  rows={3}
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={closeSendModal}>
                  Cancel
                </Button>
                <Button
                  onClick={handleFaxSend}
                  disabled={!faxNumber.trim() || isSendingForm}
                >
                  {isSendingForm ? "Sending..." : "Confirm Send"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Mail Send Modal */}
      {sendModalType === "mail" && selectedForm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
          onClick={closeSendModal}
        >
          <Card className="w-full max-w-md" onClick={(event) => event.stopPropagation()}>
            <CardHeader>
              <CardTitle>Mail Form</CardTitle>
              <CardDescription>Send "{selectedForm.name}" via postal mail</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="mail-name">Recipient Name *</Label>
                <Input
                  id="mail-name"
                  placeholder="John Doe"
                  value={mailName}
                  onChange={(event) => setMailName(event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="mail-street">Street Address *</Label>
                <Input
                  id="mail-street"
                  placeholder="123 Main St"
                  value={mailStreet}
                  onChange={(event) => setMailStreet(event.target.value)}
                />
              </div>
              <div className="grid grid-cols-6 gap-2">
                <div className="col-span-3 space-y-2">
                  <Label htmlFor="mail-city">City *</Label>
                  <Input
                    id="mail-city"
                    placeholder="City"
                    value={mailCity}
                    onChange={(event) => setMailCity(event.target.value)}
                  />
                </div>
                <div className="col-span-1 space-y-2">
                  <Label htmlFor="mail-state">State *</Label>
                  <Input
                    id="mail-state"
                    placeholder="ST"
                    maxLength={2}
                    value={mailState}
                    onChange={(event) => setMailState(event.target.value.toUpperCase())}
                  />
                </div>
                <div className="col-span-2 space-y-2">
                  <Label htmlFor="mail-zip">ZIP *</Label>
                  <Input
                    id="mail-zip"
                    placeholder="12345"
                    value={mailZip}
                    onChange={(event) => setMailZip(event.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="mail-note">Note (optional)</Label>
                <Textarea
                  id="mail-note"
                  placeholder="Add a note to include with the mailing..."
                  value={mailNote}
                  onChange={(event) => setMailNote(event.target.value)}
                  rows={3}
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={closeSendModal}>
                  Cancel
                </Button>
                <Button
                  onClick={handleMailSend}
                  disabled={
                    !mailName.trim() ||
                    !mailStreet.trim() ||
                    !mailCity.trim() ||
                    !mailState.trim() ||
                    !mailZip.trim() ||
                    isSendingForm
                  }
                >
                  {isSendingForm ? "Sending..." : "Confirm Send"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Click outside to close actions dropdown */}
      {actionsDropdownOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setActionsDropdownOpen(null)}
        />
      )}
    </div>
  )
}
