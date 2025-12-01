import { ProcessSteps } from "@/components/ProcessSteps"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Section } from "@/components/ui/section"
import { PageTitle, PageDescription } from "@/components/ui/page-title"
import { Button } from "@/components/ui/button"
import Link from "next/link"
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
    <>
      <Section>
        <div className="mb-16">
          <PageTitle>Our Process</PageTitle>
          <PageDescription>
            A simple, straightforward approach to getting your taxes done right
          </PageDescription>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {steps.map((step, index) => {
            const Icon = step.icon
            return (
              <Card key={index} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center gap-4 mb-2">
                    <div className="rounded-lg bg-gold/10 p-3">
                      <Icon className="h-6 w-6 text-gold" />
                    </div>
                    <CardTitle className="text-xl text-navy">{step.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4 leading-relaxed">
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

        <div className="mt-16">
          <Card className="bg-gold/5 border-gold/20 hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="text-navy">Ready to Get Started?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                Contact us today to begin the process. We're here to help make
                tax season stress-free.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button asChild className="bg-gold text-navy hover:bg-gold-dark">
                  <Link href="/contact">Contact Us</Link>
                </Button>
                <Button asChild variant="outline" className="border-gold text-gold hover:bg-gold hover:text-navy">
                  <Link href="/book">Book a Call</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </Section>
      <ProcessSteps brand="paynepros" />
    </>
  )
}



