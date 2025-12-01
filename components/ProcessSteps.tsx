import { Brand } from "@/lib/brands"
import { MessageSquare, FileCheck, Send, Headphones } from "lucide-react"

interface ProcessStepsProps {
  brand: Brand
}

const steps = [
  {
    number: "01",
    icon: MessageSquare,
    title: "Inquiry",
    description: "Reach out through our contact form or book a consultation call. We'll discuss your needs and answer any questions.",
  },
  {
    number: "02",
    icon: FileCheck,
    title: "Review",
    description: "We'll review your documents and financial situation to understand your specific requirements and create a plan.",
  },
  {
    number: "03",
    icon: Send,
    title: "Filing",
    description: "We prepare and file your returns accurately and on time, ensuring compliance and maximizing your benefits.",
  },
  {
    number: "04",
    icon: Headphones,
    title: "Ongoing Support",
    description: "We're here for you year-round. Get answers to questions, help with amendments, or ongoing bookkeeping support.",
  },
]

import { Section } from "@/components/ui/section"

export function ProcessSteps({ brand }: ProcessStepsProps) {
  return (
    <Section className="bg-navy text-offwhite">
      <div className="text-left mb-16">
        <h2 className="text-4xl sm:text-5xl font-bold tracking-tight text-offwhite mb-4">
          Our Process
        </h2>
        <p className="text-lg sm:text-xl text-gray-300 max-w-2xl">
          A simple, straightforward approach to getting your taxes done right
        </p>
      </div>
      <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-4">
        {steps.map((step) => {
          const Icon = step.icon
          return (
            <div key={step.number} className="relative">
              <div className="flex flex-col items-start text-left">
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-gold text-navy text-2xl font-bold">
                  {step.number}
                </div>
                <div className="mb-4">
                  <Icon className="h-8 w-8 text-gold" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-offwhite">{step.title}</h3>
                <p className="text-sm text-gray-300 leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </Section>
  )
}



