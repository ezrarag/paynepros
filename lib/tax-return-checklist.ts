import type { TaxReturnChecklist, TaxReturnChecklistStatus } from "@/lib/types/client-workspace"

export const checklistDefaults: TaxReturnChecklist = {
  documentsComplete: "not_started",
  expensesCategorized: "not_started",
  readyForTaxHawk: "not_started",
  incomeReviewed: "not_started",
  bankInfoCollected: "not_started",
  otherCompleted: "not_started",
  filed: "not_started",
  accepted: "not_started",
}

export const checklistItems = [
  { key: "documentsComplete", label: "Documents" },
  { key: "expensesCategorized", label: "Expenses" },
  { key: "readyForTaxHawk", label: "Entered" },
  { key: "incomeReviewed", label: "Identification" },
  { key: "bankInfoCollected", label: "Bank Info" },
  { key: "otherCompleted", label: "Anything Else Follow-up" },
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

export type LifecycleBadgeLabel =
  | "Waiting on Documents"
  | "Reviewing"
  | "Ready to File"
  | "Filed"
  | "Accepted"

export const isChecklistItemComplete = (
  checklist: TaxReturnChecklist,
  itemKey: ChecklistKey
) => checklist[itemKey] === "complete"

export const getLifecycleBadgeLabel = (checklistInput?: TaxReturnChecklist): LifecycleBadgeLabel => {
  const checklist = normalizeChecklist(checklistInput)
  const hasAnyComplete = checklistItems.some((item) => isChecklistItemComplete(checklist, item.key))
  const documentsComplete = isChecklistItemComplete(checklist, "documentsComplete")
  const returnEntered = isChecklistItemComplete(checklist, "readyForTaxHawk")
  const filed = isChecklistItemComplete(checklist, "filed")
  const accepted = isChecklistItemComplete(checklist, "accepted")

  if (accepted) {
    return "Accepted"
  }
  if (filed) {
    return "Filed"
  }
  if (returnEntered && !filed) {
    return "Ready to File"
  }
  if (!hasAnyComplete) {
    return "Waiting on Documents"
  }
  if (documentsComplete) {
    return "Reviewing"
  }
  return "Waiting on Documents"
}
