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
    description: "Confirm the best way to reach you.",
    fields: [
      { id: "fullName", label: "Full name", type: "text", required: true },
      { id: "email", label: "Email address", type: "email", required: true },
      { id: "phone", label: "Phone number", type: "tel" },
      { id: "preferredChannel", label: "Preferred channel", type: "select", options: ["Email", "SMS", "WhatsApp"] },
    ],
  },
  {
    id: "tax_year",
    title: "Tax Year",
    description: "Select the tax years you want help with.",
    fields: [
      {
        id: "taxYears",
        label: "Tax year(s)",
        type: "multiselect",
        options: ["2022", "2023", "2024"],
        required: true,
      },
    ],
  },
  {
    id: "income",
    title: "Income Types",
    description: "Let us know which income sources apply.",
    fields: [
      {
        id: "incomeTypes",
        label: "Income sources",
        type: "multiselect",
        options: ["W-2", "1099", "Self-employed", "Rental", "Investments", "Other"],
      },
    ],
  },
  {
    id: "expenses",
    title: "Expense Categories",
    description: "Pick any expense categories you want us to review.",
    fields: [
      {
        id: "expenseCategories",
        label: "Expense categories",
        type: "multiselect",
        options: ["Mileage", "Supplies", "Travel", "Home office", "Meals", "Other"],
      },
    ],
  },
  {
    id: "consent",
    title: "Consent & Authorization",
    description: "Confirm that we can work on your filing.",
    fields: [
      {
        id: "consentSignature",
        label: "I authorize PaynePros to prepare my tax filing.",
        type: "checkbox",
        required: true,
      },
      {
        id: "notes",
        label: "Anything else we should know?",
        type: "textarea",
        placeholder: "Add any extra details or questions here.",
      },
    ],
  },
]
