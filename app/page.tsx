import { HeroSection } from "@/components/HeroSection"
// import { HowWeWorkSection } from "@/components/HowWeWorkSection"
// import { QuickHighlights } from "@/components/QuickHighlights"
// import { ServiceGrid } from "@/components/ServiceGrid"
// import { ProcessSteps } from "@/components/ProcessSteps"
// import { Testimonials } from "@/components/Testimonials"
// import { ContactSection } from "@/components/ContactSection"

export default function Home() {
  // const brand = "paynepros" as const

  return (
    <div className="relative">
      {/* Hero Section with full-width background */}
      <HeroSection />
      
      {/* Commented out sections - will come back to these */}
      {/* How We Work Section with grid lines */}
      {/* <HowWeWorkSection /> */}
      
      {/* Rest of the sections */}
      {/* <QuickHighlights brand={brand} /> */}
      {/* <ServiceGrid brand={brand} /> */}
      {/* <ProcessSteps brand={brand} /> */}
      {/* <Testimonials brand={brand} /> */}
      {/* <ContactSection brand={brand} /> */}
    </div>
  )
}



