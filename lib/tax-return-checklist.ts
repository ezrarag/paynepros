import type { TaxReturnChecklist, TaxReturnChecklistStatus } from "@/lib/types/client-workspace"

export const checklistDefaults: TaxReturnChecklist = {
  documentsComplete: "not_started",
  incomeReviewed: "not_started",
  expensesCategorized: "not_started",
  readyForTaxHawk: "not_started",
  filed: "not_started",
  accepted: "not_started",
}

export const checklistItems = [
  { key: "documentsComplete", label: "Documents complete" },
  { key: "incomeReviewed", label: "Income reviewed" },
  { key: "expensesCategorized", label: "Expenses categorized" },
  { key: "readyForTaxHawk", label: "Ready to enter TaxHawk" },
  { key: "filed", label: "Filed" },
  { key: "accepted", label: "Accepted" },
] as const

export type ChecklistKey = (typeof checklistItems)[number]["key"]

export const checklistStatusLabels: Record<TaxReturnChecklistStatus, string> = {
  not_started: "Not started",
  in_progress: "In progress",
  complete: "Complete",
}

export const checklistStatusStyles: Record<TaxReturnChecklistStatus, string> = {
  not_started: "bg-muted text-muted-foreground",
  in_progress: "bg-amber-100 text-amber-800",
  complete: "bg-emerald-100 text-emerald-800",
}

export const isChecklistStatus = (value: string): value is TaxReturnChecklistStatus =>
  value === "not_started" || value === "in_progress" || value === "complete"

export const normalizeChecklist = (checklist?: TaxReturnChecklist): TaxReturnChecklist => ({
  ...checklistDefaults,
  ...(checklist ?? {}),
})
