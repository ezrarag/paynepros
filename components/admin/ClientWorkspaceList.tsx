"use client"

import { useEffect, useMemo, useState, useTransition } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Trash2 } from "lucide-react"
import { CreateIntakeLinkButton } from "@/components/admin/CreateIntakeLinkButton"
import { NewClientIntakeLinkButton } from "@/components/admin/NewClientIntakeLinkButton"
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
import {
  checklistItems,
  getLifecycleBadgeLabel,
  normalizeChecklist,
  type LifecycleBadgeLabel,
} from "@/lib/tax-return-checklist"
import type { ChecklistKey } from "@/lib/tax-return-checklist"
import type { ClientWorkspace, TaxReturnChecklistStatus } from "@/lib/types/client-workspace"

const TAG_OPTIONS = ["tax", "bookkeeping", "payroll", "cleanup"] as const
const TAX_YEAR_OPTIONS = [2022, 2023, 2024, 2025, 2026] as const
const STATUS_OPTIONS = ["active", "inactive"] as const

type CreateClientInput = {
  name: string
  email?: string
  phone?: string
  tags: string[]
  taxYears: number[]
}

type BulkUpdateInput = {
  workspaceIds: string[]
  action: "add_tag" | "remove_tag" | "set_status"
  tag?: string
  status?: "active" | "inactive"
}

type BulkIntakeLinkResult = { workspaceId: string; url: string }

type ActionResult<T = void> = 
  | { success: true; data: T }
  | { success: false; error: string }

interface ClientWorkspaceListProps {
  workspaces: ClientWorkspace[]
  listMode: "active" | "completed"
  createClient: (input: CreateClientInput) => Promise<ActionResult<{ id: string }>>
  bulkUpdate: (input: BulkUpdateInput) => Promise<ActionResult>
  bulkGenerateIntakeLinks: (
    workspaceIds: string[],
    baseUrl?: string
  ) => Promise<ActionResult<BulkIntakeLinkResult[]>>
  completeClientWorkspace: (workspaceId: string) => Promise<ActionResult>
  restoreClientWorkspace: (workspaceId: string) => Promise<ActionResult>
  updateClientChecklistStatus: (input: {
    workspaceId: string
    itemKey: ChecklistKey
    status: TaxReturnChecklistStatus
  }) => Promise<ActionResult>
}

export function ClientWorkspaceList({
  workspaces,
  listMode,
  createClient,
  bulkUpdate,
  bulkGenerateIntakeLinks,
  completeClientWorkspace,
  restoreClientWorkspace,
  updateClientChecklistStatus,
}: ClientWorkspaceListProps) {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [tagFilter, setTagFilter] = useState("all")
  const [taxYearFilter, setTaxYearFilter] = useState("all")
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [newClientOpen, setNewClientOpen] = useState(false)
  const [bulkTagAction, setBulkTagAction] = useState<"add_tag" | "remove_tag">(
    "add_tag"
  )
  const [bulkTagValue, setBulkTagValue] = useState<(typeof TAG_OPTIONS)[number]>(TAG_OPTIONS[0])
  const [bulkStatusValue, setBulkStatusValue] = useState<"active" | "inactive">("active")
  const [generatedLinks, setGeneratedLinks] = useState<BulkIntakeLinkResult[]>([])
  const [isPending, startTransition] = useTransition()

  const [newClientName, setNewClientName] = useState("")
  const [newClientEmail, setNewClientEmail] = useState("")
  const [newClientPhone, setNewClientPhone] = useState("")
  const [newClientTags, setNewClientTags] = useState<string[]>([])
  const [newClientTaxYears, setNewClientTaxYears] = useState<number[]>([])
  const [archivedWorkspaceIds, setArchivedWorkspaceIds] = useState<string[]>([])
  const [checklistOverrides, setChecklistOverrides] = useState<
    Record<string, Record<ChecklistKey, TaxReturnChecklistStatus>>
  >({})

  const getChecklistForWorkspace = (workspace: ClientWorkspace) => {
    const fallbackChecklist = normalizeChecklist(workspace.taxReturnChecklist)
    const overrideChecklist = checklistOverrides[workspace.id]
    if (!overrideChecklist) {
      return fallbackChecklist
    }
    return {
      ...fallbackChecklist,
      ...overrideChecklist,
    }
  }

  const badgeClassNameByStatus: Record<LifecycleBadgeLabel, string> = {
    "Waiting on Documents": "bg-slate-100 text-slate-700",
    Reviewing: "bg-amber-100 text-amber-800",
    "Ready to File": "bg-blue-100 text-blue-800",
    Filed: "bg-indigo-100 text-indigo-800",
    Accepted: "bg-emerald-100 text-emerald-800",
  }

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

  const filteredWorkspaces = useMemo(() => {
    const lowered = searchTerm.trim().toLowerCase()
    return workspaces
      .filter((workspace) => {
        const matchesSearch = lowered.length
          ? [
              workspace.displayName,
              workspace.primaryContact?.email,
              workspace.primaryContact?.phone,
            ]
              .filter(Boolean)
              .some((value) => value?.toLowerCase().includes(lowered))
          : true
        const matchesTag = tagFilter === "all" ? true : workspace.tags.includes(tagFilter)
        const matchesTaxYear =
          taxYearFilter === "all"
            ? true
            : workspace.taxYears.includes(Number(taxYearFilter))
        return matchesSearch && matchesTag && matchesTaxYear
      })
      .sort((a, b) => {
        const aTime = a.lastActivityAt ? new Date(a.lastActivityAt).getTime() : 0
        const bTime = b.lastActivityAt ? new Date(b.lastActivityAt).getTime() : 0
        return bTime - aTime
      })
  }, [searchTerm, tagFilter, taxYearFilter, workspaces, checklistOverrides])

  const visibleWorkspaces = filteredWorkspaces.filter(
    (workspace) => !archivedWorkspaceIds.includes(workspace.id)
  )

  const allSelected =
    visibleWorkspaces.length > 0 &&
    visibleWorkspaces.every((workspace) => selectedIds.includes(workspace.id))

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds([])
      return
    }
    setSelectedIds(visibleWorkspaces.map((workspace) => workspace.id))
  }

  const completeWorkspaceCard = (workspaceId: string) => {
    setError(null)
    setArchivedWorkspaceIds((prev) => (prev.includes(workspaceId) ? prev : [...prev, workspaceId]))
    setSelectedIds((prev) => prev.filter((id) => id !== workspaceId))

    startTransition(async () => {
      const result =
        listMode === "completed"
          ? await restoreClientWorkspace(workspaceId)
          : await completeClientWorkspace(workspaceId)
      if (!result.success) {
        setArchivedWorkspaceIds((prev) => prev.filter((id) => id !== workspaceId))
        setError(result.error)
        return
      }
      router.refresh()
    })
  }

  const resetNewClientForm = () => {
    setNewClientName("")
    setNewClientEmail("")
    setNewClientPhone("")
    setNewClientTags([])
    setNewClientTaxYears([])
  }

  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const refreshOnFocus = () => router.refresh()
    const refreshOnVisible = () => {
      if (document.visibilityState === "visible") {
        router.refresh()
      }
    }
    const interval = window.setInterval(() => {
      if (document.visibilityState === "visible") {
        router.refresh()
      }
    }, 15000)

    window.addEventListener("focus", refreshOnFocus)
    document.addEventListener("visibilitychange", refreshOnVisible)

    return () => {
      window.clearInterval(interval)
      window.removeEventListener("focus", refreshOnFocus)
      document.removeEventListener("visibilitychange", refreshOnVisible)
    }
  }, [router])

  const submitNewClient = () => {
    if (!newClientName.trim()) {
      return
    }
    setError(null)
    startTransition(async () => {
      const result = await createClient({
        name: newClientName.trim(),
        email: newClientEmail.trim() || undefined,
        phone: newClientPhone.trim() || undefined,
        tags: newClientTags,
        taxYears: newClientTaxYears,
      })
      if (!result.success) {
        setError(result.error)
        return
      }
      resetNewClientForm()
      setNewClientOpen(false)
      router.push(`/admin/clients/${result.data.id}`)
    })
  }

  const runBulkTagAction = () => {
    if (selectedIds.length === 0) return
    setError(null)
    startTransition(async () => {
      const result = await bulkUpdate({
        workspaceIds: selectedIds,
        action: bulkTagAction,
        tag: bulkTagValue,
      })
      if (!result.success) {
        setError(result.error)
        return
      }
      setSelectedIds([])
      router.refresh()
    })
  }

  const runBulkStatusUpdate = () => {
    if (selectedIds.length === 0) return
    setError(null)
    startTransition(async () => {
      const result = await bulkUpdate({
        workspaceIds: selectedIds,
        action: "set_status",
        status: bulkStatusValue,
      })
      if (!result.success) {
        setError(result.error)
        return
      }
      setSelectedIds([])
      router.refresh()
    })
  }

  const runBulkIntakeLinks = () => {
    if (selectedIds.length === 0) return
    setError(null)
    startTransition(async () => {
      // Pass the current origin so links use the correct domain (localhost or Vercel)
      const baseUrl = typeof window !== "undefined" ? window.location.origin : undefined
      const result = await bulkGenerateIntakeLinks(selectedIds, baseUrl)
      if (!result.success) {
        setError(result.error)
        return
      }
      setGeneratedLinks(result.data)
    })
  }

  const completeChecklistItem = (workspace: ClientWorkspace, itemKey: ChecklistKey) => {
    const nextStatus: TaxReturnChecklistStatus = "complete"
    const currentChecklist = getChecklistForWorkspace(workspace)
    const previousStatus = currentChecklist[itemKey]
    if (previousStatus === nextStatus) {
      return
    }

    setError(null)
    setChecklistOverrides((prev) => ({
      ...prev,
      [workspace.id]: {
        ...currentChecklist,
        [itemKey]: nextStatus,
      },
    }))

    startTransition(async () => {
      const result = await updateClientChecklistStatus({
        workspaceId: workspace.id,
        itemKey,
        status: nextStatus,
      })
      if (!result.success) {
        setChecklistOverrides((prev) => ({
          ...prev,
          [workspace.id]: {
            ...currentChecklist,
            [itemKey]: previousStatus,
          },
        }))
        setError(result.error)
        return
      }
      router.refresh()
    })
  }

  const updateCheckboxList = <T,>(
    value: T,
    items: T[],
    setItems: (next: T[]) => void
  ) => {
    if (items.includes(value)) {
      setItems(items.filter((item) => item !== value))
      return
    }
    setItems([...items, value])
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
          <h1 className="text-3xl font-bold">Client Workspaces</h1>
          {listMode === "completed" && (
            <p className="text-muted-foreground mt-2">
              Central source of truth for documents, tasks, messages, and payments.
            </p>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button onClick={() => setNewClientOpen(true)}>New Client</Button>
          <NewClientIntakeLinkButton />
        </div>
      </div>

      {listMode === "completed" && <Card>
        <CardHeader>
          <CardTitle>Client utilities</CardTitle>
          <CardDescription>Search, filter, and bulk actions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="client-search">Search</Label>
              <Input
                id="client-search"
                placeholder="Name, email, or phone"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Tag</Label>
              <Select value={tagFilter} onValueChange={setTagFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All tags" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All tags</SelectItem>
                  {TAG_OPTIONS.map((tag) => (
                    <SelectItem key={tag} value={tag}>
                      {tag}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Tax year</Label>
              <Select value={taxYearFilter} onValueChange={setTaxYearFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All years" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All years</SelectItem>
                  {TAX_YEAR_OPTIONS.map((year) => (
                    <SelectItem key={year} value={String(year)}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 rounded-lg border border-dashed p-3">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={toggleSelectAll}
                className="h-4 w-4 rounded border-muted"
              />
              Select all ({visibleWorkspaces.length})
            </label>
            <span className="text-sm text-muted-foreground">
              {selectedIds.length} selected
            </span>
          </div>

          {selectedIds.length > 0 && (
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label>Tag actions</Label>
                <div className="flex items-center gap-2">
                  <Select
                    value={bulkTagAction}
                    onValueChange={(value) =>
                      setBulkTagAction(value as "add_tag" | "remove_tag")
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="add_tag">Add tag</SelectItem>
                      <SelectItem value="remove_tag">Remove tag</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select
                    value={bulkTagValue}
                    onValueChange={(value) => setBulkTagValue(value as typeof TAG_OPTIONS[number])}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TAG_OPTIONS.map((tag) => (
                        <SelectItem key={tag} value={tag}>
                          {tag}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button variant="outline" onClick={runBulkTagAction} disabled={isPending}>
                    Apply
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Status</Label>
                <div className="flex items-center gap-2">
                  <Select
                    value={bulkStatusValue}
                    onValueChange={(value) =>
                      setBulkStatusValue(value as "active" | "inactive")
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUS_OPTIONS.map((status) => (
                        <SelectItem key={status} value={status}>
                          {status}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button variant="outline" onClick={runBulkStatusUpdate} disabled={isPending}>
                    Set status
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Intake links</Label>
                <Button variant="outline" onClick={runBulkIntakeLinks} disabled={isPending}>
                  Generate intake links
                </Button>
                {generatedLinks.length > 0 && (
                  <div className="space-y-2 text-xs text-muted-foreground">
                    {generatedLinks.map((link) => (
                      <div key={link.workspaceId} className="flex items-center gap-2">
                        <span className="truncate">{link.url}</span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => navigator.clipboard.writeText(link.url)}
                        >
                          Copy
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>}

      <div className="grid gap-4">
        {visibleWorkspaces.length === 0 ? (
          <Card>
            <CardContent className="py-10 text-center text-muted-foreground">
              {listMode === "completed" ? "No completed clients yet." : "No client workspaces yet."}
            </CardContent>
          </Card>
        ) : (
          visibleWorkspaces.map((workspace) => {
            const checklist = getChecklistForWorkspace(workspace)
            const lifecycleBadge = getLifecycleBadgeLabel(checklist)
            const pendingItems = checklistItems.filter((item) => checklist[item.key] !== "complete")
            return (
            <Card key={workspace.id}>
              <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div className="flex items-start gap-3">
                  <button
                    type="button"
                    onClick={() => completeWorkspaceCard(workspace.id)}
                    aria-label={
                      listMode === "completed"
                        ? `Restore ${workspace.displayName} to client workspaces`
                        : `Complete ${workspace.displayName} and move to completed`
                    }
                    className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-emerald-300 text-xl leading-none text-emerald-700"
                  >
                    {listMode === "completed" ? "+" : <Trash2 className="h-4 w-4" />}
                  </button>
                  <div>
                    <CardTitle>{workspace.displayName}</CardTitle>
                    <CardDescription>
                      {workspace.primaryContact?.email || "No contact email"}
                    </CardDescription>
                    <div className="mt-2 flex items-center gap-2 text-xs">
                      <span
                        className={`inline-flex rounded px-2 py-1 font-medium ${badgeClassNameByStatus[lifecycleBadge]}`}
                      >
                        {lifecycleBadge}
                      </span>
                      <span className="text-muted-foreground">{workspace.status.toUpperCase()}</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Button asChild size="sm" variant="outline">
                    <Link href={`/admin/clients/${workspace.id}`}>Open workspace</Link>
                  </Button>
                  <CreateIntakeLinkButton workspaceId={workspace.id} />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-lg border p-4">
                  <div className="mb-3 text-sm font-medium">Return Status</div>
                  {pendingItems.length === 0 ? (
                    <div className="rounded-lg border border-dashed p-3 text-sm text-muted-foreground">
                      All checklist items completed.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {pendingItems.map((item) => {
                        const rowStyle = checklistRowStyles[item.key]
                        return (
                          <div
                            key={`${workspace.id}-${item.key}`}
                            className={`flex items-center justify-between rounded-xl border px-3 py-2 text-sm ${rowStyle.container}`}
                          >
                            <span className="font-medium">{item.label}</span>
                            <button
                              type="button"
                              onClick={() => completeChecklistItem(workspace, item.key)}
                              className={`inline-flex h-8 w-8 items-center justify-center rounded-full border text-xl leading-none ${rowStyle.action}`}
                              aria-label={`Complete ${item.label} for ${workspace.displayName}`}
                            >
                              +
                            </button>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>

                <div className="text-sm text-muted-foreground">
                  Tax years: {workspace.taxYears.join(", ") || "Not selected"}
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {workspace.tags.map((tag) => (
                    <span key={tag} className="text-xs px-2 py-1 rounded bg-muted">
                      {tag}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          )})
        )}
      </div>

      {newClientOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
          onClick={() => setNewClientOpen(false)}
        >
          <Card className="w-full max-w-xl" onClick={(event) => event.stopPropagation()}>
            <CardHeader>
              <CardTitle>New client workspace</CardTitle>
              <CardDescription>Capture core contact and tax details.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="client-name">Name</Label>
                <Input
                  id="client-name"
                  value={newClientName}
                  onChange={(event) => setNewClientName(event.target.value)}
                  placeholder="Client name"
                />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="client-email">Email</Label>
                  <Input
                    id="client-email"
                    value={newClientEmail}
                    onChange={(event) => setNewClientEmail(event.target.value)}
                    placeholder="name@email.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="client-phone">Phone</Label>
                  <Input
                    id="client-phone"
                    value={newClientPhone}
                    onChange={(event) => setNewClientPhone(event.target.value)}
                    placeholder="(555) 123-4567"
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
                          checked={newClientTags.includes(tag)}
                          onChange={() =>
                            updateCheckboxList(tag, newClientTags, setNewClientTags)
                          }
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
                          checked={newClientTaxYears.includes(year)}
                          onChange={() =>
                            updateCheckboxList(year, newClientTaxYears, setNewClientTaxYears)
                          }
                          className="h-4 w-4 rounded border-muted"
                        />
                        {year}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    resetNewClientForm()
                    setNewClientOpen(false)
                  }}
                >
                  Cancel
                </Button>
                <Button onClick={submitNewClient} disabled={!newClientName.trim() || isPending}>
                  Create client
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
