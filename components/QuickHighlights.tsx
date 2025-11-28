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

export function QuickHighlights({ brand }: QuickHighlightsProps) {
  return (
    <section className="py-12 px-4 bg-muted/30">
      <div className="mx-auto max-w-6xl">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {highlights.map((highlight) => {
            const Icon = highlight.icon
            return (
              <div
                key={highlight.title}
                className="flex flex-col items-center text-center"
              >
                <div className="rounded-full bg-primary/10 p-4 mb-4">
                  <Icon className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">
                  {highlight.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {highlight.description}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}


