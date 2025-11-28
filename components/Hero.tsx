import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Brand } from "@/lib/brands"

interface HeroProps {
  brand: Brand
}

export function Hero({ brand }: HeroProps) {
  return (
    <section className="relative py-20 px-4 sm:py-24 lg:py-32">
      <div className="mx-auto max-w-4xl text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
          Expert Tax Preparation & Bookkeeping Services
        </h1>
        <p className="mt-6 text-lg leading-8 text-muted-foreground sm:text-xl">
          Professional, reliable, and personalized financial services to help you
          stay compliant and organized. From individual returns to past-due
          cleanup, we've got you covered.
        </p>
        <div className="mt-10 flex items-center justify-center gap-4">
          <Button asChild size="lg" className="text-lg px-8">
            <Link href="/book">Book a Consultation</Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="text-lg px-8">
            <Link href="/services">Explore Services</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}


