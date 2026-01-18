"use client"

import { useEffect, useMemo, useState } from "react"
import { intakeSteps, IntakeStepField } from "@/lib/intake/steps"
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

interface IntakeFlowProps {
  token: string
}

type IntakeFormState = Record<string, any>

export function IntakeFlow({ token }: IntakeFlowProps) {
  const [stepIndex, setStepIndex] = useState(0)
  const [formState, setFormState] = useState<IntakeFormState>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)

  const currentStep = intakeSteps[stepIndex]
  const isLastStep = stepIndex === intakeSteps.length - 1

  useEffect(() => {
    const validateLink = async () => {
      try {
        const response = await fetch(`/api/intake-links/${token}`)
        if (!response.ok) {
          const data = await response.json()
          setError(data?.error || "This intake link is no longer active.")
          return
        }
      } catch (err) {
        setError("Unable to load intake form. Please try again.")
      } finally {
        setLoading(false)
      }
    }
    validateLink()
  }, [token])

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
        body: JSON.stringify({ responses: formState }),
      })
      if (!response.ok) {
        const data = await response.json()
        setError(data?.error || "Unable to submit intake.")
        return
      }
      setSubmitted(true)
    } catch (err) {
      setError("Unable to submit intake.")
    }
  }

  const progressLabel = useMemo(
    () => `Step ${stepIndex + 1} of ${intakeSteps.length}`,
    [stepIndex]
  )

  if (loading) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          Loading intake form...
        </CardContent>
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
            Your intake has been received. We will follow up if we need anything else.
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
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-sm text-muted-foreground">{progressLabel}</div>
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
        <div className="flex items-center justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={() => setStepIndex((prev) => Math.max(0, prev - 1))}
            disabled={stepIndex === 0}
          >
            Back
          </Button>
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
