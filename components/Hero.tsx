import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Brand } from "@/lib/brands"
import { Hero as HeroWrapper, HeroTitle, HeroDescription, HeroActions } from "@/components/ui/hero"

interface HeroProps {
  brand: Brand
}

export function Hero({ brand }: HeroProps) {
  return (
    <HeroWrapper className="bg-navy text-offwhite">
      <HeroTitle className="text-offwhite">
        Expert Tax Preparation & Bookkeeping Services
      </HeroTitle>
      <HeroDescription className="text-gray-300">
        Professional, reliable, and personalized financial services to help you
        stay compliant and organized. From individual returns to past-due
        cleanup, we've got you covered.
      </HeroDescription>
      <HeroActions>
        <Button asChild size="lg" className="bg-gold text-navy hover:bg-gold-dark text-lg px-8">
          <Link href="/book">Book a Consultation</Link>
        </Button>
        <Button asChild variant="outline" size="lg" className="border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-offwhite text-lg px-8">
          <Link href="/services">Explore Services</Link>
        </Button>
      </HeroActions>
    </HeroWrapper>
  )
}



