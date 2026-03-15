"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useState } from "react"
import { motion } from "framer-motion"
import { LEAD_SERVICE_TYPE_OPTIONS } from "@/lib/lead-service-types"

const intakeFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address").optional().or(z.literal('')),
  phone: z.string().min(10, "Please enter a valid phone number").optional().or(z.literal('')),
  preferredContactMethod: z.enum(["email", "phone", "either"]),
  serviceType: z.string().min(1, "Please select a service type"),
  message: z.string().min(1, "Please provide a message"),
})

type IntakeFormValues = z.infer<typeof intakeFormSchema>

interface IntakeFormProps {
  brand: "paynepros" | "ibms"
  source?: "website" | "whatsapp" | "instagram" | "facebook" | "sms" | "email"
}

const FORM_STEPS = [
  {
    id: "contact",
    label: "Contact",
    fields: ["name", "email", "phone"] as const,
  },
  {
    id: "service",
    label: "Service",
    fields: ["preferredContactMethod", "serviceType"] as const,
  },
  {
    id: "details",
    label: "Details",
    fields: ["message"] as const,
  },
] as const

export function IntakeForm({ brand, source = "website" }: IntakeFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle")
  const [stepIndex, setStepIndex] = useState(0)
  const [classificationSummary, setClassificationSummary] = useState<{
    probableService?: string
    urgency?: string
    suggestedNextAction?: string
  } | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    trigger,
  } = useForm<IntakeFormValues>({
    resolver: zodResolver(intakeFormSchema),
  })

  const preferredContactMethod = watch("preferredContactMethod")
  const serviceType = watch("serviceType")
  const currentStep = FORM_STEPS[stepIndex]

  const goToNextStep = async () => {
    const isValid = await trigger([...currentStep.fields])
    if (!isValid) return
    setStepIndex((current) => Math.min(current + 1, FORM_STEPS.length - 1))
  }

  const goToPreviousStep = () => {
    setStepIndex((current) => Math.max(current - 1, 0))
  }

  const onSubmit = async (data: IntakeFormValues) => {
    setIsSubmitting(true)
    setSubmitStatus("idle")

    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          business: brand,
          source: source,
          name: data.name,
          email: data.email || undefined,
          phone: data.phone || undefined,
          message: data.message || `Service interest: ${data.serviceType}`,
          serviceInterest: data.serviceType,
          meta: {
            preferredContactMethod: data.preferredContactMethod,
          },
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || "Failed to submit form")
      }

      const result = await response.json()
      
      if (result.summary) {
        setClassificationSummary(result.summary)
      }
      
      setSubmitStatus("success")
    } catch (error) {
      console.error("Error submitting form:", error)
      setSubmitStatus("error")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (submitStatus === "success") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center py-12"
      >
        <motion.h3
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="wix-display mb-4 text-3xl tracking-[0.08em] text-[#2f2a22]"
        >
          Thank You!
        </motion.h3>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-muted-foreground mb-6 text-lg"
        >
          We've received your inquiry and will contact you soon.
        </motion.p>
        {classificationSummary && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="mx-auto mt-6 max-w-md border border-[#ddd5c7] bg-[#f8f3e9] p-6 text-left"
          >
            <p className="text-sm text-muted-foreground mb-2">
              <strong className="text-[#2f2a22]">Category:</strong> {classificationSummary.probableService}
            </p>
          </motion.div>
        )}
      </motion.div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="flex items-center justify-between gap-2 border-b border-[#ddd3c3] pb-4">
        {FORM_STEPS.map((step, index) => {
          const isActive = index === stepIndex
          const isComplete = index < stepIndex
          return (
            <div key={step.id} className="flex min-w-0 flex-1 items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  if (index <= stepIndex) setStepIndex(index)
                }}
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-[11px] tracking-[0.12em] ${
                  isActive
                    ? "border-[#2f2a22] bg-[#2f2a22] text-[#f8f5ef]"
                    : isComplete
                      ? "border-[#a8a37f] bg-[#a8a37f] text-[#f8f5ef]"
                      : "border-[#d0c6b7] bg-[#fcfbf7] text-[#7d7568]"
                }`}
              >
                {index + 1}
              </button>
              <div className="min-w-0">
                <p className={`truncate text-[11px] uppercase tracking-[0.14em] ${isActive ? "text-[#2f2a22]" : "text-[#7d7568]"}`}>
                  {step.label}
                </p>
              </div>
            </div>
          )
        })}
      </div>

      {currentStep.id === "contact" ? (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-[13px] font-medium uppercase tracking-[0.14em] text-[#4f483d]">
              My name is
            </Label>
            <Input
              id="name"
              {...register("name")}
              className="h-11 rounded-none border-[#cec5b7] bg-[#fefcf8] text-[#2f2a22] placeholder:text-[#8a8174] focus:border-[#2f2a22] focus:ring-[#2f2a22]"
              placeholder="Your name"
              aria-invalid={errors.name ? "true" : "false"}
            />
            {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-[13px] font-medium uppercase tracking-[0.14em] text-[#4f483d]">
                Contact me at
              </Label>
              <Input
                id="email"
                type="email"
                {...register("email")}
                className="h-11 rounded-none border-[#cec5b7] bg-[#fefcf8] text-[#2f2a22] placeholder:text-[#8a8174] focus:border-[#2f2a22] focus:ring-[#2f2a22]"
                placeholder="Enter email here"
                aria-invalid={errors.email ? "true" : "false"}
              />
              {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="text-[13px] font-medium uppercase tracking-[0.14em] text-[#4f483d]">
                Phone (optional)
              </Label>
              <Input
                id="phone"
                type="tel"
                {...register("phone")}
                className="h-11 rounded-none border-[#cec5b7] bg-[#fefcf8] text-[#2f2a22] placeholder:text-[#8a8174] focus:border-[#2f2a22] focus:ring-[#2f2a22]"
                placeholder="Enter phone here"
                aria-invalid={errors.phone ? "true" : "false"}
              />
              {errors.phone && <p className="text-sm text-destructive">{errors.phone.message}</p>}
            </div>
          </div>
        </div>
      ) : null}

      {currentStep.id === "service" ? (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label
              htmlFor="preferredContactMethod"
              className="text-[13px] font-medium uppercase tracking-[0.14em] text-[#4f483d]"
            >
              Preferred Contact Method <span className="text-destructive">*</span>
            </Label>
            <Select
              value={preferredContactMethod}
              onValueChange={(value) =>
                setValue("preferredContactMethod", value as "email" | "phone" | "either", { shouldValidate: true })
              }
            >
              <SelectTrigger
                id="preferredContactMethod"
                className="h-11 rounded-none border-[#cec5b7] bg-[#fefcf8] text-[#2f2a22]"
              >
                <SelectValue placeholder="Select a method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="phone">Phone</SelectItem>
                <SelectItem value="either">Either</SelectItem>
              </SelectContent>
            </Select>
            {errors.preferredContactMethod && (
              <p className="text-sm text-destructive">{errors.preferredContactMethod.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="serviceType" className="text-[13px] font-medium uppercase tracking-[0.14em] text-[#4f483d]">
              I want to improve <span className="text-destructive">*</span>
            </Label>
            <Select
              value={serviceType}
              onValueChange={(value) => setValue("serviceType", value, { shouldValidate: true })}
            >
              <SelectTrigger id="serviceType" className="h-11 rounded-none border-[#cec5b7] bg-[#fefcf8] text-[#2f2a22]">
                <SelectValue placeholder="Select a service" />
              </SelectTrigger>
              <SelectContent>
                {LEAD_SERVICE_TYPE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.serviceType && <p className="text-sm text-destructive">{errors.serviceType.message}</p>}
          </div>
        </div>
      ) : null}

      {currentStep.id === "details" ? (
        <div className="space-y-4">
          <div className="rounded-lg border border-[#ddd3c3] bg-[#fcfbf7] px-3 py-2 text-[11px] uppercase tracking-[0.14em] text-[#6f6758]">
            {serviceType
              ? LEAD_SERVICE_TYPE_OPTIONS.find((option) => option.value === serviceType)?.label
              : "Select a service in the previous step"}
          </div>
          <div className="space-y-2">
            <Label htmlFor="message" className="text-[13px] font-medium uppercase tracking-[0.14em] text-[#4f483d]">
              Additional Details <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="message"
              {...register("message")}
              className="min-h-[116px] resize-none rounded-none border-[#cec5b7] bg-[#fefcf8] text-[#2f2a22] placeholder:text-[#8a8174] focus:border-[#2f2a22] focus:ring-[#2f2a22]"
              placeholder="Describe your tax or bookkeeping needs..."
              rows={5}
              aria-invalid={errors.message ? "true" : "false"}
            />
            {errors.message && <p className="text-sm text-destructive">{errors.message.message}</p>}
          </div>
        </div>
      ) : null}

      {submitStatus === "error" && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-sm text-destructive"
        >
          There was an error submitting your form. Please try again.
        </motion.p>
      )}

      <div className="flex items-center justify-between gap-3 pt-1">
        <Button
          type="button"
          variant="outline"
          className="h-11 rounded-none border-[#cec5b7] bg-[#fefcf8] px-5 text-[11px] uppercase tracking-[0.14em] text-[#4f483d] hover:bg-[#f4efe5]"
          disabled={stepIndex === 0}
          onClick={goToPreviousStep}
        >
          Back
        </Button>

        {stepIndex < FORM_STEPS.length - 1 ? (
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              type="button"
              className="h-11 rounded-none bg-[#2f2a22] px-5 text-[11px] uppercase tracking-[0.14em] text-[#f8f5ef] hover:bg-[#1f1b15]"
              onClick={goToNextStep}
            >
              Continue
            </Button>
          </motion.div>
        ) : (
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              type="submit"
              className="h-11 rounded-none bg-[#2f2a22] px-5 text-[11px] uppercase tracking-[0.14em] text-[#f8f5ef] hover:bg-[#1f1b15]"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Send Request"}
            </Button>
          </motion.div>
        )}
      </div>

      <p className="text-xs text-muted-foreground text-center">
        By submitting, you agree to our Terms and Privacy Policy.
      </p>
    </form>
  )
}
