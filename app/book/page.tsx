"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AnimatedButton } from "@/components/ui/animated-button"
import { Section } from "@/components/ui/section"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

const bookFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  company: z.string().min(1, "Please enter your company or location"),
  improvement: z.string().min(1, "Please describe what you want to improve"),
  budget: z.string().optional(),
  email: z.string().email("Please enter a valid email address"),
})

type BookFormValues = z.infer<typeof bookFormSchema>

export default function BookPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle")

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<BookFormValues>({
    resolver: zodResolver(bookFormSchema),
  })

  const nameValue = watch("name")
  const companyValue = watch("company")
  const improvementValue = watch("improvement")
  const budgetValue = watch("budget")
  const emailValue = watch("email")

  const onSubmit = async (data: BookFormValues) => {
    setIsSubmitting(true)
    setSubmitStatus("idle")

    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          business: "paynepros",
          source: "website",
          name: data.name,
          email: data.email,
          message: `Company: ${data.company}\nWant to improve: ${data.improvement}\nBudget: ${data.budget || "Not specified"}`,
          serviceInterest: data.improvement,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to submit form")
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
      <Section>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center py-12 max-w-2xl mx-auto"
        >
          <motion.h2
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-4xl font-bold text-navy mb-4"
          >
            Thank You!
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="text-muted-foreground mb-6 text-lg"
          >
            We've received your request and will contact you soon.
          </motion.p>
        </motion.div>
      </Section>
    )
  }

  return (
    <Section>
      <div className="max-w-3xl mx-auto">
        {/* Header Section */}
        <div className="mb-16 text-center">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-sm uppercase tracking-wider text-muted-foreground mb-4"
          >
            A 30-minute call to clarify your next steps. Zero obligations
          </motion.p>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-sm uppercase tracking-wider text-muted-foreground mb-8"
          >
            START WITH A SIMPLE STEP
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-5xl md:text-6xl font-bold text-navy mb-4 tracking-tight"
          >
            LET'S START YOUR TAX PROJECT
          </motion.h1>
        </div>

        {/* Form Section */}
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-8 mb-12"
        >
          {/* Name Field */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-base font-normal text-navy">
              Hi, Payne Pros team!
            </Label>
            <div className="relative">
              <Label htmlFor="name" className="absolute -top-6 left-0 text-sm text-muted-foreground">
                My name is
              </Label>
              <Input
                id="name"
                {...register("name")}
                className="border-gray-300 bg-transparent text-navy placeholder:text-gray-400 focus:border-navy focus:ring-navy h-14 text-lg border-b-2 border-t-0 border-l-0 border-r-0 rounded-none px-0"
                placeholder={nameValue ? "" : "Your name"}
                aria-invalid={errors.name ? "true" : "false"}
              />
              <AnimatePresence>
                {nameValue && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute -top-6 left-0 text-sm text-muted-foreground"
                  >
                    {nameValue}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            {errors.name && (
              <p className="text-sm text-destructive mt-2">{errors.name.message}</p>
            )}
          </div>

          {/* Company/Location Field */}
          <div className="space-y-2">
            <div className="relative">
              <Label htmlFor="company" className="absolute -top-6 left-0 text-sm text-muted-foreground">
                from
              </Label>
              <Input
                id="company"
                {...register("company")}
                className="border-gray-300 bg-transparent text-navy placeholder:text-gray-400 focus:border-navy focus:ring-navy h-14 text-lg border-b-2 border-t-0 border-l-0 border-r-0 rounded-none px-0"
                placeholder={companyValue ? "" : "Your company or location"}
                aria-invalid={errors.company ? "true" : "false"}
              />
              <AnimatePresence>
                {companyValue && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute -top-6 left-0 text-sm text-muted-foreground"
                  >
                    {companyValue}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            {errors.company && (
              <p className="text-sm text-destructive mt-2">{errors.company.message}</p>
            )}
          </div>

          {/* Improvement Field */}
          <div className="space-y-2">
            <div className="relative">
              <Label htmlFor="improvement" className="absolute -top-6 left-0 text-sm text-muted-foreground">
                I want to improve:
              </Label>
              <Input
                id="improvement"
                {...register("improvement")}
                className="border-gray-300 bg-transparent text-navy placeholder:text-gray-400 focus:border-navy focus:ring-navy h-14 text-lg border-b-2 border-t-0 border-l-0 border-r-0 rounded-none px-0"
                placeholder={improvementValue ? "" : "Tax preparation, bookkeeping, etc."}
                aria-invalid={errors.improvement ? "true" : "false"}
              />
              <AnimatePresence>
                {improvementValue && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute -top-6 left-0 text-sm text-muted-foreground"
                  >
                    {improvementValue}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            {errors.improvement && (
              <p className="text-sm text-destructive mt-2">{errors.improvement.message}</p>
            )}
          </div>

          {/* Budget Field */}
          <div className="space-y-2">
            <div className="relative">
              <Label htmlFor="budget" className="absolute -top-6 left-0 text-sm text-muted-foreground">
                Budget:
              </Label>
              <div className="flex items-center">
                <span className="text-lg text-navy mr-2">$</span>
                <Input
                  id="budget"
                  {...register("budget")}
                  className="border-gray-300 bg-transparent text-navy placeholder:text-gray-400 focus:border-navy focus:ring-navy h-14 text-lg border-b-2 border-t-0 border-l-0 border-r-0 rounded-none px-0 flex-1"
                  placeholder={budgetValue ? "" : "Your budget"}
                  aria-invalid={errors.budget ? "true" : "false"}
                />
              </div>
              <AnimatePresence>
                {budgetValue && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute -top-6 left-0 text-sm text-muted-foreground"
                  >
                    ${budgetValue}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            {errors.budget && (
              <p className="text-sm text-destructive mt-2">{errors.budget.message}</p>
            )}
          </div>

          {/* Email Field */}
          <div className="space-y-2">
            <div className="relative">
              <Label htmlFor="email" className="absolute -top-6 left-0 text-sm text-muted-foreground">
                Contact me at:
              </Label>
              <Input
                id="email"
                type="email"
                {...register("email")}
                className="border-gray-300 bg-transparent text-navy placeholder:text-gray-400 focus:border-navy focus:ring-navy h-14 text-lg border-b-2 border-t-0 border-l-0 border-r-0 rounded-none px-0"
                placeholder={emailValue ? "" : "your.email@example.com"}
                aria-invalid={errors.email ? "true" : "false"}
              />
              <AnimatePresence>
                {emailValue && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute -top-6 left-0 text-sm text-muted-foreground"
                  >
                    {emailValue}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            {errors.email && (
              <p className="text-sm text-destructive mt-2">{errors.email.message}</p>
            )}
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <AnimatedButton
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Send Request"}
            </AnimatedButton>
          </div>

          {submitStatus === "error" && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-sm text-destructive text-center"
            >
              There was an error submitting your form. Please try again.
            </motion.p>
          )}

          <p className="text-xs text-muted-foreground text-center pt-4">
            By submitting, you agree to our Terms and Privacy Policy.
          </p>
        </motion.form>

        {/* Descriptive Text Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="space-y-8 mb-16"
        >
          <div>
            <h2 className="text-2xl font-semibold text-navy mb-4">Let's keep it simple</h2>
            <p className="text-muted-foreground leading-relaxed text-lg">
              You don't need to prepare slides or technical notes — just share what's on your mind. 
              Whether it's a quick question or a bigger project idea, we'll get back to you with a clear next step.
            </p>
          </div>

          <div>
            <p className="text-muted-foreground leading-relaxed text-lg">
              Every message that comes through this form is read by a real person on our team. 
              No chatbots, no outsourced support. Most of the time, it's our team who will see it first 
              and make sure it reaches the right consultant.
            </p>
          </div>
        </motion.div>
      </div>
    </Section>
  )
}
