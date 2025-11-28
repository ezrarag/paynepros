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

export function IntakeForm({ brand, source = "website" }: IntakeFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle")
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
  } = useForm<IntakeFormValues>({
    resolver: zodResolver(intakeFormSchema),
  })

  const preferredContactMethod = watch("preferredContactMethod")
  const serviceType = watch("serviceType")

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
    const urgencyHours = classificationSummary?.urgency === 'high' ? '2' : 
                         classificationSummary?.urgency === 'medium' ? '12' : '24'
    
    return (
      <div className="rounded-lg border bg-card p-8 text-center">
        <h3 className="text-xl font-semibold mb-2">Thank You!</h3>
        <p className="text-muted-foreground mb-4">
          We've received your inquiry and will contact you soon.
        </p>
        {classificationSummary && (
          <div className="mt-4 p-4 bg-muted/50 rounded-lg text-left">
            <p className="text-sm text-muted-foreground">
              <strong>Category:</strong> {classificationSummary.probableService}
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Expect a response within {urgencyHours} hours.
            </p>
          </div>
        )}
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">
          Name <span className="text-destructive">*</span>
        </Label>
        <Input
          id="name"
          {...register("name")}
          placeholder="John Doe"
          aria-invalid={errors.name ? "true" : "false"}
        />
        {errors.name && (
          <p className="text-sm text-destructive">{errors.name.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">
          Email
        </Label>
        <Input
          id="email"
          type="email"
          {...register("email")}
          placeholder="john@example.com"
          aria-invalid={errors.email ? "true" : "false"}
        />
        {errors.email && (
          <p className="text-sm text-destructive">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">
          Phone
        </Label>
        <Input
          id="phone"
          type="tel"
          {...register("phone")}
          placeholder="(555) 123-4567"
          aria-invalid={errors.phone ? "true" : "false"}
        />
        {errors.phone && (
          <p className="text-sm text-destructive">{errors.phone.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="preferredContactMethod">
          Preferred Contact Method <span className="text-destructive">*</span>
        </Label>
        <Select
          value={preferredContactMethod}
          onValueChange={(value) =>
            setValue("preferredContactMethod", value as "email" | "phone" | "either", { shouldValidate: true })
          }
        >
          <SelectTrigger id="preferredContactMethod">
            <SelectValue placeholder="Select a method" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="email">Email</SelectItem>
            <SelectItem value="phone">Phone</SelectItem>
            <SelectItem value="either">Either</SelectItem>
          </SelectContent>
        </Select>
        {errors.preferredContactMethod && (
          <p className="text-sm text-destructive">
            {errors.preferredContactMethod.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="serviceType">
          What do you need help with? <span className="text-destructive">*</span>
        </Label>
        <Select
          value={serviceType}
          onValueChange={(value) => setValue("serviceType", value, { shouldValidate: true })}
        >
          <SelectTrigger id="serviceType">
            <SelectValue placeholder="Select a service" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="individual-tax">Individual Tax Preparation</SelectItem>
            <SelectItem value="joint-tax">Joint / Family Returns</SelectItem>
            <SelectItem value="past-due">Past-Due / Cleanup</SelectItem>
            <SelectItem value="bookkeeping">Bookkeeping</SelectItem>
            <SelectItem value="extensions">Extensions</SelectItem>
            <SelectItem value="amendments">Amendments</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
        {errors.serviceType && (
          <p className="text-sm text-destructive">{errors.serviceType.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="message">
          Additional Details <span className="text-destructive">*</span>
        </Label>
        <Textarea
          id="message"
          {...register("message")}
          placeholder="Tell us more about your situation..."
          rows={4}
          aria-invalid={errors.message ? "true" : "false"}
        />
        {errors.message && (
          <p className="text-sm text-destructive">{errors.message.message}</p>
        )}
      </div>

      {submitStatus === "error" && (
        <p className="text-sm text-destructive">
          There was an error submitting your form. Please try again.
        </p>
      )}

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Submitting..." : "Submit Inquiry"}
      </Button>
    </form>
  )
}

