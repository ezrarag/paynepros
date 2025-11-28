import { ProcessSteps } from "@/components/ProcessSteps"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MessageSquare, FileCheck, Send, Headphones } from "lucide-react"

const steps = [
  {
    icon: MessageSquare,
    title: "Inquiry",
    description:
      "Reach out through our contact form or book a consultation call. We'll discuss your needs and answer any questions you have about our services.",
    details: [
      "Fill out our intake form",
      "Schedule a consultation call",
      "Discuss your specific needs",
      "Get answers to your questions",
    ],
  },
  {
    icon: FileCheck,
    title: "Review",
    description:
      "We'll review your documents and financial situation to understand your specific requirements and create a customized plan.",
    details: [
      "Document collection and review",
      "Financial situation analysis",
      "Service plan creation",
      "Timeline and pricing discussion",
    ],
  },
  {
    icon: Send,
    title: "Filing",
    description:
      "We prepare and file your returns accurately and on time, ensuring compliance and maximizing your benefits.",
    details: [
      "Thorough preparation and review",
      "Deduction and credit maximization",
      "Electronic filing submission",
      "Confirmation and documentation",
    ],
  },
  {
    icon: Headphones,
    title: "Ongoing Support",
    description:
      "We're here for you year-round. Get answers to questions, help with amendments, or ongoing bookkeeping support.",
    details: [
      "Year-round availability",
      "Amendment assistance",
      "Ongoing bookkeeping services",
      "Tax planning consultations",
    ],
  },
]

export default function ProcessPage() {
  return (
    <div className="py-16 px-4">
      <div className="mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl mb-4">
            Our Process
          </h1>
          <p className="text-lg text-muted-foreground">
            A simple, straightforward approach to getting your taxes done right
          </p>
        </div>

        <ProcessSteps brand="paynepros" />

        <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-2">
          {steps.map((step, index) => {
            const Icon = step.icon
            return (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-center gap-4 mb-2">
                    <div className="rounded-lg bg-primary/10 p-3">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-xl">{step.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    {step.description}
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-4">
                    {step.details.map((detail, idx) => (
                      <li key={idx}>{detail}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )
          })}
        </div>

        <div className="mt-16 text-center">
          <Card className="bg-primary/5 border-primary/20">
            <CardHeader>
              <CardTitle>Ready to Get Started?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-6">
                Contact us today to begin the process. We're here to help make
                tax season stress-free.
              </p>
              <div className="flex gap-4 justify-center">
                <a
                  href="/contact"
                  className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                >
                  Contact Us
                </a>
                <a
                  href="/book"
                  className="inline-flex items-center justify-center rounded-md border border-input bg-background px-6 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
                >
                  Book a Call
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}


