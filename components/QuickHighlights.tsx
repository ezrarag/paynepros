import { FileText, Calculator, Calendar, BookOpen } from "lucide-react"
import { Brand } from "@/lib/brands"

interface QuickHighlightsProps {
  brand: Brand
}

const highlights = [
  {
    icon: FileText,
    title: "Tax Preparation",
    description: "Individual & joint returns",
  },
  {
    icon: Calculator,
    title: "Bookkeeping",
    description: "Organized financial records",
  },
  {
    icon: Calendar,
    title: "Past-Due Returns",
    description: "Get caught up quickly",
  },
  {
    icon: BookOpen,
    title: "Extensions & Amendments",
    description: "File corrections easily",
  },
]

import { Section } from "@/components/ui/section"

export function QuickHighlights({ brand }: QuickHighlightsProps) {
  return (
    <Section className="py-16">
      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {highlights.map((highlight) => {
          const Icon = highlight.icon
          return (
            <div
              key={highlight.title}
              className="flex flex-col items-start text-left"
            >
              <div className="rounded-full bg-gold/10 p-4 mb-4">
                <Icon className="h-8 w-8 text-gold" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-navy">
                {highlight.title}
              </h3>
              <p className="text-sm text-muted-foreground">
                {highlight.description}
              </p>
            </div>
          )
        })}
      </div>
    </Section>
  )
}



