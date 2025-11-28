import { Hero } from "@/components/Hero"
import { QuickHighlights } from "@/components/QuickHighlights"
import { ServiceGrid } from "@/components/ServiceGrid"
import { ProcessSteps } from "@/components/ProcessSteps"
import { Testimonials } from "@/components/Testimonials"
import { ContactSection } from "@/components/ContactSection"

export default function Home() {
  const brand = "paynepros" as const

  return (
    <>
      <Hero brand={brand} />
      <QuickHighlights brand={brand} />
      <ServiceGrid brand={brand} />
      <ProcessSteps brand={brand} />
      <Testimonials brand={brand} />
      <ContactSection brand={brand} />
    </>
  )
}


