export const LEAD_SERVICE_TYPE_OPTIONS = [
  { value: "individual-tax", label: "Individual Tax Preparation" },
  { value: "joint-tax", label: "Joint / Family Returns" },
  { value: "past-due", label: "Past-Due / Cleanup" },
  { value: "bookkeeping", label: "Bookkeeping" },
  { value: "extensions", label: "Extensions" },
  { value: "amendments", label: "Amendments" },
  { value: "other", label: "Other" },
] as const

export type LeadServiceType = (typeof LEAD_SERVICE_TYPE_OPTIONS)[number]["value"]

export const LEAD_AUTO_RESPONSE_KEYS = [
  "default",
  ...LEAD_SERVICE_TYPE_OPTIONS.map((option) => option.value),
] as const

export type LeadAutoResponseKey = (typeof LEAD_AUTO_RESPONSE_KEYS)[number]

export function getLeadServiceTypeLabel(value?: string | null) {
  if (!value) return "General inquiry"
  return LEAD_SERVICE_TYPE_OPTIONS.find((option) => option.value === value)?.label ?? "General inquiry"
}
