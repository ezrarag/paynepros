"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { intakeSteps, IntakeStepField } from "@/lib/intake/steps"
import {
  checklistItems,
  checklistStatusLabels,
  isChecklistStatus,
  type ChecklistKey,
} from "@/lib/tax-return-checklist"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { TaxReturnChecklistStatus } from "@/lib/types/client-workspace"

interface IntakeFlowProps {
  token: string
  workspaceId?: string | null
  kind?: "existing_workspace" | "new_client"
}

type IntakeFormState = Record<string, any>

export function IntakeFlow({ token, workspaceId: initialWorkspaceId, kind: initialKind }: IntakeFlowProps) {
  const router = useRouter()
  const [stepIndex, setStepIndex] = useState(0)
  const [formState, setFormState] = useState<IntakeFormState>({})
  const [error, setError] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(true)
  const [workspaceId, setWorkspaceId] = useState<string | null | undefined>(initialWorkspaceId)
  const [kind, setKind] = useState<"existing_workspace" | "new_client" | undefined>(initialKind)
  const [checklistStatuses, setChecklistStatuses] = useState<
    Partial<Record<ChecklistKey, TaxReturnChecklistStatus>>
  >({})
  const [savingChecklistKeys, setSavingChecklistKeys] = useState<ChecklistKey[]>([])

  // Fetch intake link data on mount
  useEffect(() => {
    const fetchIntakeLink = async () => {
      try {
        const response = await fetch(`/api/intake-links/${token}`)
        if (!response.ok) {
          const data = await response.json()
          setError(data?.error || "Invalid or expired intake link")
          setLoading(false)
          return
        }
        const data = await response.json()
        if (data.valid) {
          setKind(data.kind)
          setWorkspaceId(data.clientWorkspaceId)
          const prefill = data.prefill && typeof data.prefill === "object" ? data.prefill : {}
          setFormState((prev) => {
            const next = { ...prev }
            Object.entries(prefill).forEach(([fieldId, fieldValue]) => {
              if ((next[fieldId] === undefined || next[fieldId] === "") && typeof fieldValue === "string") {
                next[fieldId] = fieldValue
              }
            })
            return next
          })
          if (data.checklistStatuses && typeof data.checklistStatuses === "object") {
            const sanitized = checklistItems.reduce<Partial<Record<ChecklistKey, TaxReturnChecklistStatus>>>(
              (acc, item) => {
                const rawStatus = data.checklistStatuses[item.key]
                if (typeof rawStatus === "string" && isChecklistStatus(rawStatus)) {
                  acc[item.key] = rawStatus
                }
                return acc
              },
              {}
            )
            setChecklistStatuses(sanitized)
          }
        } else {
          setError("Invalid intake link")
        }
      } catch (err) {
        setError("Failed to load intake link")
      } finally {
        setLoading(false)
      }
    }
    fetchIntakeLink()
  }, [token])

  const currentStep = intakeSteps[stepIndex]
  const isSingleStep = intakeSteps.length === 1
  const isLastStep = stepIndex === intakeSteps.length - 1

  const handleInputChange = (fieldId: string, value: any) => {
    setFormState((prev) => ({ ...prev, [fieldId]: value }))
  }

  const handleToggleMulti = (fieldId: string, option: string) => {
    const existing = Array.isArray(formState[fieldId]) ? formState[fieldId] : []
    const nextValue = existing.includes(option)
      ? existing.filter((item: string) => item !== option)
      : [...existing, option]
    handleInputChange(fieldId, nextValue)
  }

  const handleSubmit = async () => {
    setError(null)
    try {
      const response = await fetch(`/api/intake-links/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          responses: formState,
          checklistUpdates: checklistStatuses,
          ...(workspaceId != null && { clientWorkspaceId: workspaceId }),
        }),
      })
      if (!response.ok) {
        const data = await response.json()
        setError(data?.error || "Unable to submit intake.")
        return
      }
      setSubmitted(true)
      setTimeout(() => {
        router.push("/client")
      }, 900)
    } catch (err) {
      setError("Unable to submit intake.")
    }
  }

  const progressLabel = `Step ${stepIndex + 1} of ${intakeSteps.length}`
  const pendingChecklistItems = checklistItems.filter((item) => {
    const status = checklistStatuses[item.key]
    return status !== "complete"
  })

  const cycleChecklistStatus = (itemKey: ChecklistKey) => {
    const previousStatus = checklistStatuses[itemKey] ?? "not_started"
    const nextStatus: TaxReturnChecklistStatus =
      previousStatus === "not_started"
        ? "in_progress"
        : previousStatus === "in_progress"
          ? "complete"
          : "not_started"

    setChecklistStatuses((prev) => ({
      ...prev,
      [itemKey]: nextStatus,
    }))
    setSavingChecklistKeys((prev) => (prev.includes(itemKey) ? prev : [...prev, itemKey]))

    void (async () => {
      try {
        const response = await fetch(`/api/intake-links/${token}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            checklistUpdates: {
              [itemKey]: nextStatus,
            },
            ...(workspaceId != null && { clientWorkspaceId: workspaceId }),
          }),
        })
        if (!response.ok) {
          const data = await response.json().catch(() => ({}))
          setChecklistStatuses((prev) => ({
            ...prev,
            [itemKey]: previousStatus,
          }))
          setError(data?.error || "Unable to update checklist status.")
        }
      } catch {
        setChecklistStatuses((prev) => ({
          ...prev,
          [itemKey]: previousStatus,
        }))
        setError("Unable to update checklist status.")
      } finally {
        setSavingChecklistKeys((prev) => prev.filter((key) => key !== itemKey))
      }
    })()
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading...</CardTitle>
          <CardDescription>Validating intake link</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Intake link unavailable</CardTitle>
          <CardDescription>{error}</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  if (submitted) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Thank you!</CardTitle>
          <CardDescription>
            Your intake has been received. Taking you to your dashboard...
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{currentStep.title}</CardTitle>
        <CardDescription>{currentStep.description}</CardDescription>
        {kind === "existing_workspace" && pendingChecklistItems.length > 0 && (
          <div className="space-y-2 pt-2">
            <p className="text-xs text-muted-foreground">
              Checklist breadcrumb: click an item to update status.
            </p>
            <div className="flex flex-wrap items-center gap-2 text-xs">
              {pendingChecklistItems.map((item, index) => {
                const status = checklistStatuses[item.key] ?? "not_started"
                return (
                  <div key={item.key} className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => cycleChecklistStatus(item.key)}
                      disabled={savingChecklistKeys.includes(item.key)}
                      className="rounded-full border px-2.5 py-1 text-left hover:bg-muted disabled:opacity-60"
                    >
                      {item.label}: {checklistStatusLabels[status]}
                    </button>
                    {index < pendingChecklistItems.length - 1 && (
                      <span className="text-muted-foreground">{">"}</span>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-6">
        {!isSingleStep && (
          <div className="text-sm text-muted-foreground">{progressLabel}</div>
        )}
        <div className="space-y-4">
          {currentStep.fields.map((field) => (
            <FieldRenderer
              key={field.id}
              field={field}
              value={formState[field.id]}
              onChange={handleInputChange}
              onToggleMulti={handleToggleMulti}
            />
          ))}
        </div>
        <div className="flex items-center justify-end">
          {!isSingleStep && (
            <Button
              type="button"
              variant="outline"
              onClick={() => setStepIndex((prev) => Math.max(0, prev - 1))}
              disabled={stepIndex === 0}
            >
              Back
            </Button>
          )}
          {isLastStep ? (
            <Button type="button" onClick={handleSubmit}>
              Submit Intake
            </Button>
          ) : (
            <Button type="button" onClick={() => setStepIndex((prev) => prev + 1)}>
              Continue
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function FieldRenderer({
  field,
  value,
  onChange,
  onToggleMulti,
}: {
  field: IntakeStepField
  value: any
  onChange: (id: string, value: any) => void
  onToggleMulti: (id: string, option: string) => void
}) {
  if (field.type === "textarea") {
    return (
      <div className="space-y-2">
        <label className="text-sm font-medium">{field.label}</label>
        <Textarea
          value={value || ""}
          onChange={(event) => onChange(field.id, event.target.value)}
          placeholder={field.placeholder}
        />
      </div>
    )
  }

  if (field.type === "select") {
    return (
      <div className="space-y-2">
        <label className="text-sm font-medium">{field.label}</label>
        <Select
          value={value || ""}
          onValueChange={(nextValue) => onChange(field.id, nextValue)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select an option" />
          </SelectTrigger>
          <SelectContent>
            {field.options?.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    )
  }

  if (field.type === "multiselect") {
    const selected = Array.isArray(value) ? value : []
    return (
      <div className="space-y-2">
        <label className="text-sm font-medium">{field.label}</label>
        <div className="grid gap-2 md:grid-cols-2">
          {field.options?.map((option) => (
            <label key={option} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={selected.includes(option)}
                onChange={() => onToggleMulti(field.id, option)}
                className="h-4 w-4 rounded border-muted"
              />
              {option}
            </label>
          ))}
        </div>
      </div>
    )
  }

  if (field.type === "checkbox") {
    return (
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={Boolean(value)}
          onChange={(event) => onChange(field.id, event.target.checked)}
          className="h-4 w-4 rounded border-muted"
        />
        {field.label}
      </label>
    )
  }

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">{field.label}</label>
      <Input
        type={field.type}
        value={value || ""}
        onChange={(event) => onChange(field.id, event.target.value)}
        placeholder={field.placeholder}
      />
    </div>
  )
}
