"use client"

import { useMemo, useState, useTransition } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
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
import { ClientWorkspace } from "@/lib/types/client-workspace"

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
  createClient: (input: CreateClientInput) => Promise<ActionResult<{ id: string }>>
  bulkUpdate: (input: BulkUpdateInput) => Promise<ActionResult>
  bulkGenerateIntakeLinks: (workspaceIds: string[]) => Promise<ActionResult<BulkIntakeLinkResult[]>>
}

export function ClientWorkspaceList({
  workspaces,
  createClient,
  bulkUpdate,
  bulkGenerateIntakeLinks,
}: ClientWorkspaceListProps) {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [tagFilter, setTagFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [taxYearFilter, setTaxYearFilter] = useState("all")
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [newClientOpen, setNewClientOpen] = useState(false)
  const [bulkTagAction, setBulkTagAction] = useState<"add_tag" | "remove_tag">(
    "add_tag"
  )
  const [bulkTagValue, setBulkTagValue] = useState(TAG_OPTIONS[0])
  const [bulkStatusValue, setBulkStatusValue] = useState<"active" | "inactive">("active")
  const [generatedLinks, setGeneratedLinks] = useState<BulkIntakeLinkResult[]>([])
  const [isPending, startTransition] = useTransition()

  const [newClientName, setNewClientName] = useState("")
  const [newClientEmail, setNewClientEmail] = useState("")
  const [newClientPhone, setNewClientPhone] = useState("")
  const [newClientTags, setNewClientTags] = useState<string[]>([])
  const [newClientTaxYears, setNewClientTaxYears] = useState<number[]>([])

  const filteredWorkspaces = useMemo(() => {
    const lowered = searchTerm.trim().toLowerCase()
    return workspaces.filter((workspace) => {
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
      const matchesStatus =
        statusFilter === "all" ? true : workspace.status === statusFilter
      const matchesTaxYear =
        taxYearFilter === "all"
          ? true
          : workspace.taxYears.includes(Number(taxYearFilter))
      return matchesSearch && matchesTag && matchesStatus && matchesTaxYear
    })
  }, [searchTerm, statusFilter, tagFilter, taxYearFilter, workspaces])

  const allSelected =
    filteredWorkspaces.length > 0 &&
    filteredWorkspaces.every((workspace) => selectedIds.includes(workspace.id))

  const toggleSelected = (workspaceId: string) => {
    setSelectedIds((prev) =>
      prev.includes(workspaceId) ? prev.filter((id) => id !== workspaceId) : [...prev, workspaceId]
    )
  }

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds([])
      return
    }
    setSelectedIds(filteredWorkspaces.map((workspace) => workspace.id))
  }

  const resetNewClientForm = () => {
    setNewClientName("")
    setNewClientEmail("")
    setNewClientPhone("")
    setNewClientTags([])
    setNewClientTaxYears([])
  }

  const [error, setError] = useState<string | null>(null)

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
      const result = await bulkGenerateIntakeLinks(selectedIds)
      if (!result.success) {
        setError(result.error)
        return
      }
      setGeneratedLinks(result.data)
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
          <p className="text-muted-foreground mt-2">
            Central source of truth for documents, tasks, messages, and payments.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button onClick={() => setNewClientOpen(true)}>New Client</Button>
          <NewClientIntakeLinkButton />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Client utilities</CardTitle>
          <CardDescription>Search, filter, and bulk actions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-4">
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
              <Label>Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  {STATUS_OPTIONS.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
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
              Select all ({filteredWorkspaces.length})
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
      </Card>

      <div className="grid gap-4">
        {filteredWorkspaces.length === 0 ? (
          <Card>
            <CardContent className="py-10 text-center text-muted-foreground">
              No client workspaces yet.
            </CardContent>
          </Card>
        ) : (
          filteredWorkspaces.map((workspace) => (
            <Card key={workspace.id}>
              <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(workspace.id)}
                    onChange={() => toggleSelected(workspace.id)}
                    className="mt-1 h-4 w-4 rounded border-muted"
                  />
                  <div>
                    <CardTitle>{workspace.displayName}</CardTitle>
                    <CardDescription>
                      {workspace.primaryContact?.email || "No contact email"} •{" "}
                      {workspace.status.toUpperCase()}
                    </CardDescription>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Button asChild size="sm" variant="outline">
                    <Link href={`/admin/clients/${workspace.id}`}>Open workspace</Link>
                  </Button>
                  <CreateIntakeLinkButton workspaceId={workspace.id} />
                </div>
              </CardHeader>
              <CardContent>
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
          ))
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
