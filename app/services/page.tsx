import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { FileText, Users, AlertCircle, BookOpen, Calendar, Edit } from "lucide-react"

const services = [
  {
    id: "individual",
    icon: FileText,
    title: "Individual Tax Preparation",
    description:
      "Comprehensive tax preparation services for individual taxpayers. We ensure accurate filing while maximizing your eligible deductions and credits.",
    details: [
      "W-2 and 1099 processing",
      "Itemized and standard deduction analysis",
      "Deduction maximization",
      "Credit identification and claiming",
      "Electronic filing for faster refunds",
    ],
  },
  {
    id: "joint",
    icon: Users,
    title: "Joint / Family Returns",
    description:
      "Expert handling of married filing jointly and family tax returns. We help you navigate the complexities of family tax situations.",
    details: [
      "Married filing jointly optimization",
      "Dependent and child tax credits",
      "Education credits and deductions",
      "Family tax planning",
      "Multi-state filing assistance",
    ],
  },
  {
    id: "past-due",
    icon: AlertCircle,
    title: "Past-Due / Cleanup",
    description:
      "Get caught up on overdue returns without the stress. We'll help you resolve back taxes and get back on track with the IRS.",
    details: [
      "Multiple year catch-up filing",
      "IRS communication and negotiation",
      "Payment plan assistance",
      "Penalty and interest minimization",
      "Peace of mind restoration",
    ],
  },
  {
    id: "bookkeeping",
    icon: BookOpen,
    title: "Bookkeeping",
    description:
      "Year-round bookkeeping services to keep your financial records organized and ready for tax season.",
    details: [
      "Monthly financial record keeping",
      "Expense categorization",
      "Income tracking",
      "Receipt organization",
      "Quarterly reporting",
    ],
  },
  {
    id: "extensions",
    icon: Calendar,
    title: "Extensions & Amendments",
    description:
      "File for extensions when you need more time, or amend previous returns to correct errors or claim missed benefits.",
    details: [
      "Extension filing (Form 4868)",
      "Amended return preparation (Form 1040-X)",
      "Error correction",
      "Missed deduction recovery",
      "Refund claim assistance",
    ],
  },
  {
    id: "amendments",
    icon: Edit,
    title: "Amendments",
    description:
      "Correct errors on previously filed returns and ensure you receive all credits and deductions you deserve.",
    details: [
      "Form 1040-X preparation",
      "Error identification and correction",
      "Refund claim processing",
      "IRS correspondence handling",
      "Timeline and status tracking",
    ],
  },
]

import { Section } from "@/components/ui/section"
import { PageTitle, PageDescription } from "@/components/ui/page-title"

export default function ServicesPage() {
  return (
    <Section>
      <div className="mb-16">
        <PageTitle>Our Services</PageTitle>
        <PageDescription>
          Comprehensive tax and bookkeeping solutions tailored to your needs
        </PageDescription>
      </div>

      <div className="space-y-12">
        {services.map((service) => {
          const Icon = service.icon
          return (
            <Card key={service.id} id={service.id} className="scroll-mt-16 hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start gap-4">
                  <div className="rounded-lg bg-gold/10 p-3">
                    <Icon className="h-8 w-8 text-gold" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-2xl mb-2 text-navy">
                      {service.title}
                    </CardTitle>
                    <CardDescription className="text-base">
                      {service.description}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
                    What's Included:
                  </h3>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                    {service.details.map((detail, index) => (
                      <li key={index}>{detail}</li>
                    ))}
                  </ul>
                </div>
                <div className="mt-6">
                  <Button asChild className="bg-gold text-navy hover:bg-gold-dark">
                    <Link href="/contact">Get Started</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </Section>
  )
}



