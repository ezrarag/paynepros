"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

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
  } = useForm<BookFormValues>({
    resolver: zodResolver(bookFormSchema),
  })

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

  return (
    <section className="mx-auto max-w-5xl px-6 py-16 sm:py-20">
      <div className="text-center">
        <h1 className="wix-display text-4xl tracking-[0.11em] text-[#2f2a22] sm:text-5xl">
          BOOK A CONSULTATION
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-[15px] leading-8 text-[#5d5547]">
          Share your details and we will contact you with available times and next steps.
        </p>
      </div>

      {submitStatus === "success" ? (
        <div className="mx-auto mt-10 max-w-3xl border border-[#ddd5c7] bg-[#fbf9f4] px-6 py-12 text-center sm:px-8">
          <h2 className="wix-display text-3xl tracking-[0.08em] text-[#2f2a22]">Thank You</h2>
          <p className="mt-4 text-[15px] leading-8 text-[#5d5547]">
            We have received your request and will reach out soon.
          </p>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="mx-auto mt-10 max-w-3xl space-y-6 border border-[#ddd5c7] bg-[#fbf9f4] px-6 py-8 sm:px-8"
        >
          <div className="space-y-2">
            <Label htmlFor="name" className="text-[13px] tracking-[0.14em] text-[#4f483d]">
              NAME
            </Label>
            <Input id="name" {...register("name")} className="h-11 rounded-none border-[#cec5b7] bg-[#fefcf8]" />
            {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="company" className="text-[13px] tracking-[0.14em] text-[#4f483d]">
              COMPANY OR LOCATION
            </Label>
            <Input
              id="company"
              {...register("company")}
              className="h-11 rounded-none border-[#cec5b7] bg-[#fefcf8]"
            />
            {errors.company && <p className="text-sm text-destructive">{errors.company.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="improvement" className="text-[13px] tracking-[0.14em] text-[#4f483d]">
              WHAT DO YOU NEED HELP WITH
            </Label>
            <Input
              id="improvement"
              {...register("improvement")}
              className="h-11 rounded-none border-[#cec5b7] bg-[#fefcf8]"
            />
            {errors.improvement && <p className="text-sm text-destructive">{errors.improvement.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="budget" className="text-[13px] tracking-[0.14em] text-[#4f483d]">
              BUDGET (OPTIONAL)
            </Label>
            <Input id="budget" {...register("budget")} className="h-11 rounded-none border-[#cec5b7] bg-[#fefcf8]" />
            {errors.budget && <p className="text-sm text-destructive">{errors.budget.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-[13px] tracking-[0.14em] text-[#4f483d]">
              EMAIL
            </Label>
            <Input
              id="email"
              type="email"
              {...register("email")}
              className="h-11 rounded-none border-[#cec5b7] bg-[#fefcf8]"
            />
            {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
          </div>

          {submitStatus === "error" && (
            <p className="text-sm text-destructive">There was an error submitting your form. Please try again.</p>
          )}

          <Button
            type="submit"
            className="h-12 w-full rounded-none bg-[#2f2a22] text-[#f8f5ef] hover:bg-[#1f1b15]"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Submitting..." : "Send Request"}
          </Button>
        </form>
      )}
    </section>
  )
}
