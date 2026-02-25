"use client"

import { useEffect, useMemo, useState, useTransition } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CreateIntakeLinkButton } from "@/components/admin/CreateIntakeLinkButton"
import { NewClientIntakeLinkButton } from "@/components/admin/NewClientIntakeLinkButton"
import {
  checklistItems,
  getLifecycleBadgeLabel,
  normalizeChecklist,
  type LifecycleBadgeLabel,
} from "@/lib/tax-return-checklist"
import type { ChecklistKey } from "@/lib/tax-return-checklist"
import type { ClientWorkspace, TaxReturnChecklistStatus } from "@/lib/types/client-workspace"

type BulkIntakeLinkResult = { workspaceId: string; url: string }

type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string }

type ChecklistEntry = {
  workspace: ClientWorkspace
  intakeSubmittedAt: string
}

interface OpenClientChecklistListProps {
  entries: ChecklistEntry[]
  bulkGenerateIntakeLinks: (
    workspaceIds: string[],
    baseUrl?: string
  ) => Promise<ActionResult<BulkIntakeLinkResult[]>>
  updateClientChecklistStatus: (input: {
    workspaceId: string
    itemKey: ChecklistKey
    status: TaxReturnChecklistStatus
  }) => Promise<ActionResult>
}

export function OpenClientChecklistList({
  entries,
  bulkGenerateIntakeLinks,
  updateClientChecklistStatus,
}: OpenClientChecklistListProps) {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [generatedLinks, setGeneratedLinks] = useState<BulkIntakeLinkResult[]>([])
  const [error, setError] = useState<string | null>(null)
  const [queueControlsOpen, setQueueControlsOpen] = useState(false)
  const [checklistOverrides, setChecklistOverrides] = useState<
    Record<string, Record<ChecklistKey, TaxReturnChecklistStatus>>
  >({})
  const [isPending, startTransition] = useTransition()

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
    }, 10000)

    window.addEventListener("focus", refreshOnFocus)
    document.addEventListener("visibilitychange", refreshOnVisible)

    return () => {
      window.clearInterval(interval)
      window.removeEventListener("focus", refreshOnFocus)
      document.removeEventListener("visibilitychange", refreshOnVisible)
    }
  }, [router])

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
    "Waiting on Documents": "bg-slate-100 text-slate-700 dark:bg-slate-700/40 dark:text-slate-200",
    Reviewing: "bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300",
    "Ready to File": "bg-blue-100 text-blue-800 dark:bg-blue-500/15 dark:text-blue-300",
    Filed: "bg-indigo-100 text-indigo-800 dark:bg-indigo-500/15 dark:text-indigo-300",
    Accepted: "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300",
  }

  const checklistRowStyles: Record<ChecklistKey, { container: string; action: string }> = {
    documentsComplete: {
      container: "bg-slate-100/90 border-slate-200 dark:bg-slate-900/60 dark:border-slate-700",
      action: "border-sky-300 text-sky-700 dark:border-sky-700/70 dark:text-sky-300",
    },
    expensesCategorized: {
      container: "bg-emerald-100/80 border-emerald-200 dark:bg-emerald-950/35 dark:border-emerald-800/70",
      action: "border-emerald-300 text-emerald-700 dark:border-emerald-700/70 dark:text-emerald-300",
    },
    readyForTaxHawk: {
      container: "bg-blue-100/80 border-blue-200 dark:bg-blue-950/35 dark:border-blue-800/70",
      action: "border-blue-300 text-blue-700 dark:border-blue-700/70 dark:text-blue-300",
    },
    incomeReviewed: {
      container: "bg-violet-100/80 border-violet-200 dark:bg-violet-950/35 dark:border-violet-800/70",
      action: "border-violet-300 text-violet-700 dark:border-violet-700/70 dark:text-violet-300",
    },
    bankInfoCollected: {
      container: "bg-amber-100/80 border-amber-200 dark:bg-amber-950/30 dark:border-amber-800/70",
      action: "border-amber-300 text-amber-700 dark:border-amber-700/70 dark:text-amber-300",
    },
    otherCompleted: {
      container: "bg-cyan-100/80 border-cyan-200 dark:bg-cyan-950/30 dark:border-cyan-800/70",
      action: "border-cyan-300 text-cyan-700 dark:border-cyan-700/70 dark:text-cyan-300",
    },
    filed: {
      container: "bg-indigo-100/80 border-indigo-200 dark:bg-indigo-950/35 dark:border-indigo-800/70",
      action: "border-indigo-300 text-indigo-700 dark:border-indigo-700/70 dark:text-indigo-300",
    },
    accepted: {
      container: "bg-teal-100/80 border-teal-200 dark:bg-teal-950/30 dark:border-teal-800/70",
      action: "border-teal-300 text-teal-700 dark:border-teal-700/70 dark:text-teal-300",
    },
  }

  const visibleEntries = useMemo(() => {
    const lowered = searchTerm.trim().toLowerCase()
    return entries
      .filter(({ workspace }) => {
        if (!lowered.length) return true
        return [workspace.displayName, workspace.primaryContact?.email, workspace.primaryContact?.phone]
          .filter(Boolean)
          .some((value) => value?.toLowerCase().includes(lowered))
      })
      .sort((a, b) => new Date(b.intakeSubmittedAt).getTime() - new Date(a.intakeSubmittedAt).getTime())
  }, [entries, searchTerm])

  const allSelected =
    visibleEntries.length > 0 &&
    visibleEntries.every(({ workspace }) => selectedIds.includes(workspace.id))

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds([])
      return
    }
    setSelectedIds(visibleEntries.map(({ workspace }) => workspace.id))
  }

  const runBulkIntakeLinks = () => {
    if (selectedIds.length === 0) return
    setError(null)
    startTransition(async () => {
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

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/30 dark:text-red-200">
          {error}
        </div>
      )}

      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Open Client Checklists</h1>
          <p className="text-muted-foreground mt-2">
            Intake-driven checklist queue across all clients.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <NewClientIntakeLinkButton />
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-3">
          <div>
            <CardTitle>Queue controls</CardTitle>
            <CardDescription>Filter entries and generate intake links in bulk.</CardDescription>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setQueueControlsOpen((prev) => !prev)}
          >
            {queueControlsOpen ? "Hide" : "Show"}
          </Button>
        </CardHeader>
        {queueControlsOpen && (
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="checklist-search">Search</Label>
              <Input
                id="checklist-search"
                placeholder="Name, email, or phone"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
              />
            </div>

            <div className="flex flex-wrap items-center gap-3 rounded-lg border border-dashed p-3">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={toggleSelectAll}
                  className="h-4 w-4 rounded border-muted"
                />
                Select all ({visibleEntries.length})
              </label>
              <span className="text-sm text-muted-foreground">{selectedIds.length} selected</span>
              <Button
                variant="outline"
                onClick={runBulkIntakeLinks}
                disabled={isPending || selectedIds.length === 0}
              >
                Generate intake links
              </Button>
            </div>

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
          </CardContent>
        )}
      </Card>

      <div className="grid gap-4">
        {visibleEntries.length === 0 ? (
          <Card>
            <CardContent className="py-10 text-center text-muted-foreground">
              No intake submissions found for the open checklist queue.
            </CardContent>
          </Card>
        ) : (
          visibleEntries.map(({ workspace, intakeSubmittedAt }) => {
            const checklist = getChecklistForWorkspace(workspace)
            const lifecycleBadge = getLifecycleBadgeLabel(checklist)
            const pendingItems = checklistItems.filter((item) => checklist[item.key] !== "complete")

            return (
              <Card key={workspace.id}>
                <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <div>
                    <CardTitle>{workspace.displayName}</CardTitle>
                    <CardDescription>
                      {workspace.primaryContact?.email || "No contact email"}
                    </CardDescription>
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                      <span
                        className={`inline-flex rounded px-2 py-1 font-medium ${badgeClassNameByStatus[lifecycleBadge]}`}
                      >
                        {lifecycleBadge}
                      </span>
                      <span className="text-muted-foreground">
                        Intake: {new Date(intakeSubmittedAt).toLocaleString()}
                      </span>
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
                </CardContent>
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
}
