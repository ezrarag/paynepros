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

export function ProcessSteps({ brand }: ProcessStepsProps) {
  return (
    <section className="py-16 px-4 bg-muted/30">
      <div className="mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Our Process
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            A simple, straightforward approach to getting your taxes done right
          </p>
        </div>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((step) => {
            const Icon = step.icon
            return (
              <div key={step.number} className="relative">
                <div className="flex flex-col items-center text-center">
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground text-2xl font-bold">
                    {step.number}
                  </div>
                  <div className="mb-4">
                    <Icon className="h-8 w-8 text-primary mx-auto" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {step.description}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}


