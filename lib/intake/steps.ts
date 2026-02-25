import { IntakeStepId } from "@/lib/types/client-workspace"

export interface IntakeStepField {
  id: string
  label: string
  type: "text" | "email" | "tel" | "select" | "multiselect" | "textarea" | "checkbox"
  placeholder?: string
  options?: string[]
  required?: boolean
}

export interface IntakeStep {
  id: IntakeStepId
  title: string
  description: string
  fields: IntakeStepField[]
}

const currentYear = new Date().getFullYear()
const yearOptions = Array.from({ length: 7 }, (_, index) => String(currentYear - index))

export const intakeSteps: IntakeStep[] = [
  {
    id: "contact",
    title: "Intake",
    description: "Share your name, year, and anything else.",
    fields: [
      { id: "fullName", label: "Name", type: "text", required: true },
      {
        id: "taxYears",
        label: "Year",
        type: "select",
        options: yearOptions,
        required: true,
      },
      {
        id: "notes",
        label: "Anything else?",
        type: "textarea",
        placeholder: "Add any extra details or questions here.",
      },
    ],
  },
]
