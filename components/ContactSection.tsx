import { IntakeForm } from "./IntakeForm"
import { Brand } from "@/lib/brands"

interface ContactSectionProps {
  brand: Brand
}

export function ContactSection({ brand }: ContactSectionProps) {
  return (
    <section className="py-16 px-4 bg-muted/30">
      <div className="mx-auto max-w-4xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Get in Touch
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Ready to get started? Fill out the form below and we'll get back to
            you soon.
          </p>
        </div>
        <div className="rounded-lg border bg-card p-8 shadow-sm">
          <IntakeForm brand={brand} />
        </div>
      </div>
    </section>
  )
}


