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

export const intakeSteps: IntakeStep[] = [
  {
    id: "contact",
    title: "Contact Info",
    description: "Share your basic contact details.",
    fields: [
      { id: "fullName", label: "Name", type: "text", required: true },
      { id: "address", label: "Address", type: "text", required: true },
      { id: "email", label: "Email address", type: "email", required: true },
      { id: "phone", label: "Phone number", type: "tel", required: true },
    ],
  },
  {
    id: "tax_year",
    title: "Year",
    description: "Tell us which tax year this intake is for.",
    fields: [
      {
        id: "taxYears",
        label: "Year",
        type: "select",
        options: ["2020","2021","2022", "2023", "2024", "2025"],
        required: true,
      },
    ],
  },
  {
    id: "consent",
    title: "Anything Else",
    description: "Share anything else you'd like us to know.",
    fields: [
      {
        id: "notes",
        label: "Anything else?",
        type: "textarea",
        placeholder: "Add any extra details or questions here.",
      },
    ],
  },
]
