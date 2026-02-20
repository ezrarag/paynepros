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
import { motion, AnimatePresence } from "framer-motion"

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
            <p className="text-sm text-muted-foreground">
              Expect a response within <strong className="text-[#2f2a22]">{urgencyHours} hours</strong>.
            </p>
          </motion.div>
        )}
      </motion.div>
    )
  }

  const nameValue = watch("name")
  const emailValue = watch("email")
  const phoneValue = watch("phone")
  const messageValue = watch("message")

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Name Field - Effica Style */}
      <div className="space-y-3">
        <Label htmlFor="name" className="text-[13px] font-medium uppercase tracking-[0.14em] text-[#4f483d]">
          My name is
        </Label>
        <div className="relative">
          <Input
            id="name"
            {...register("name")}
            className="h-12 rounded-none border-[#cec5b7] bg-[#fefcf8] text-[#2f2a22] placeholder:text-[#8a8174] focus:border-[#2f2a22] focus:ring-[#2f2a22]"
            placeholder={nameValue ? "" : "Your name"}
            aria-invalid={errors.name ? "true" : "false"}
          />
          <AnimatePresence>
            {nameValue && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute -top-6 left-0 text-xs text-muted-foreground"
              >
                {nameValue}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        {errors.name && (
          <p className="text-sm text-destructive">{errors.name.message}</p>
        )}
      </div>

      {/* Email Field - Effica Style */}
      <div className="space-y-3">
        <Label htmlFor="email" className="text-[13px] font-medium uppercase tracking-[0.14em] text-[#4f483d]">
          Contact me at
        </Label>
        <div className="relative">
          <Input
            id="email"
            type="email"
            {...register("email")}
            className="h-12 rounded-none border-[#cec5b7] bg-[#fefcf8] text-[#2f2a22] placeholder:text-[#8a8174] focus:border-[#2f2a22] focus:ring-[#2f2a22]"
            placeholder={emailValue ? "" : "taxprep@paynepros.com"}
            aria-invalid={errors.email ? "true" : "false"}
          />
          <AnimatePresence>
            {emailValue && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute -top-6 left-0 text-xs text-muted-foreground"
              >
                {emailValue}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        {errors.email && (
          <p className="text-sm text-destructive">{errors.email.message}</p>
        )}
      </div>

      {/* Phone Field - Effica Style */}
      <div className="space-y-3">
        <Label htmlFor="phone" className="text-[13px] font-medium uppercase tracking-[0.14em] text-[#4f483d]">
          Phone (optional)
        </Label>
        <div className="relative">
          <Input
            id="phone"
            type="tel"
            {...register("phone")}
            className="h-12 rounded-none border-[#cec5b7] bg-[#fefcf8] text-[#2f2a22] placeholder:text-[#8a8174] focus:border-[#2f2a22] focus:ring-[#2f2a22]"
            placeholder={phoneValue ? "" : "816-805-1433"}
            aria-invalid={errors.phone ? "true" : "false"}
          />
          <AnimatePresence>
            {phoneValue && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute -top-6 left-0 text-xs text-muted-foreground"
              >
                {phoneValue}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        {errors.phone && (
          <p className="text-sm text-destructive">{errors.phone.message}</p>
        )}
      </div>

      {/* Preferred Contact Method */}
      <div className="space-y-3">
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
            className="h-12 rounded-none border-[#cec5b7] bg-[#fefcf8] text-[#2f2a22]"
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
          <p className="text-sm text-destructive">
            {errors.preferredContactMethod.message}
          </p>
        )}
      </div>

      {/* Service Type */}
      <div className="space-y-3">
        <Label htmlFor="serviceType" className="text-[13px] font-medium uppercase tracking-[0.14em] text-[#4f483d]">
          I want to improve: <span className="text-destructive">*</span>
        </Label>
        <Select
          value={serviceType}
          onValueChange={(value) => setValue("serviceType", value, { shouldValidate: true })}
        >
          <SelectTrigger id="serviceType" className="h-12 rounded-none border-[#cec5b7] bg-[#fefcf8] text-[#2f2a22]">
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

      {/* Message Field - Effica Style */}
      <div className="space-y-3">
        <Label htmlFor="message" className="text-[13px] font-medium uppercase tracking-[0.14em] text-[#4f483d]">
          Additional Details <span className="text-destructive">*</span>
        </Label>
        <div className="relative">
          <Textarea
            id="message"
            {...register("message")}
            className="min-h-[120px] resize-none rounded-none border-[#cec5b7] bg-[#fefcf8] text-[#2f2a22] placeholder:text-[#8a8174] focus:border-[#2f2a22] focus:ring-[#2f2a22]"
            placeholder={messageValue ? "" : "Describe your tax or bookkeeping needs..."}
            rows={4}
            aria-invalid={errors.message ? "true" : "false"}
          />
          <AnimatePresence>
            {messageValue && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute -top-6 left-0 text-xs text-muted-foreground"
              >
                {messageValue.substring(0, 50)}{messageValue.length > 50 ? "..." : ""}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        {errors.message && (
          <p className="text-sm text-destructive">{errors.message.message}</p>
        )}
      </div>

      {submitStatus === "error" && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-sm text-destructive"
        >
          There was an error submitting your form. Please try again.
        </motion.p>
      )}

      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <Button
          type="submit" 
          className="h-12 w-full rounded-none bg-[#2f2a22] text-[#f8f5ef] hover:bg-[#1f1b15]"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Submitting..." : "Send Request"}
        </Button>
      </motion.div>

      <p className="text-xs text-muted-foreground text-center">
        By submitting, you agree to our Terms and Privacy Policy.
      </p>
    </form>
  )
}
