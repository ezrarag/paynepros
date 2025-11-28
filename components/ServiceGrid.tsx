import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Brand } from "@/lib/brands"
import { FileText, Users, AlertCircle, BookOpen, Calendar, Edit } from "lucide-react"

interface ServiceGridProps {
  brand: Brand
}

const services = [
  {
    icon: FileText,
    title: "Individual Tax Preparation",
    description: "Accurate and timely filing for individual taxpayers. We ensure you claim all eligible deductions and credits.",
    href: "/services#individual",
  },
  {
    icon: Users,
    title: "Joint / Family Returns",
    description: "Comprehensive tax preparation for married couples and families, maximizing your tax benefits.",
    href: "/services#joint",
  },
  {
    icon: AlertCircle,
    title: "Past-Due / Cleanup",
    description: "Get caught up on overdue returns. We'll help you resolve back taxes and get back on track.",
    href: "/services#past-due",
  },
  {
    icon: BookOpen,
    title: "Bookkeeping",
    description: "Organized financial records and bookkeeping services to keep your finances in order year-round.",
    href: "/services#bookkeeping",
  },
  {
    icon: Calendar,
    title: "Extensions & Amendments",
    description: "File for extensions when needed, or amend previous returns to correct errors or claim missed deductions.",
    href: "/services#extensions",
  },
  {
    icon: Edit,
    title: "Amendments",
    description: "Correct errors on previously filed returns and ensure you receive all credits and deductions you deserve.",
    href: "/services#amendments",
  },
]

export function ServiceGrid({ brand }: ServiceGridProps) {
  return (
    <section className="py-16 px-4">
      <div className="mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Our Services
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Comprehensive tax and bookkeeping solutions tailored to your needs
          </p>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => {
            const Icon = service.icon
            return (
              <Card key={service.title} className="flex flex-col">
                <CardHeader>
                  <div className="mb-4">
                    <Icon className="h-10 w-10 text-primary" />
                  </div>
                  <CardTitle>{service.title}</CardTitle>
                  <CardDescription>{service.description}</CardDescription>
                </CardHeader>
                <CardContent className="mt-auto">
                  <Button asChild variant="outline" className="w-full">
                    <Link href={service.href}>Learn More</Link>
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}


