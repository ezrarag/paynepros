import { Card, CardContent } from "@/components/ui/card"
import { Brand } from "@/lib/brands"
import { Star } from "lucide-react"

interface TestimonialsProps {
  brand: Brand
}

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "Small Business Owner",
    content:
      "Payne Professional Services made tax season stress-free. They handled everything professionally and found deductions I didn't know about.",
    rating: 5,
  },
  {
    name: "Michael Chen",
    role: "Individual Taxpayer",
    content:
      "I had several years of past-due returns, and they helped me get caught up quickly. Very knowledgeable and patient with all my questions.",
    rating: 5,
  },
  {
    name: "Emily Rodriguez",
    role: "Family Taxpayer",
    content:
      "Excellent service for our family returns. They're thorough, responsive, and make sure everything is filed correctly. Highly recommend!",
    rating: 5,
  },
]

import { Section } from "@/components/ui/section"

export function Testimonials({ brand }: TestimonialsProps) {
  return (
    <Section>
      <div className="text-left mb-16">
        <h2 className="text-4xl sm:text-5xl font-bold tracking-tight text-navy mb-4">
          What Our Clients Say
        </h2>
        <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl">
          Trusted by individuals and families for reliable tax services
        </p>
      </div>
      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        {testimonials.map((testimonial) => (
          <Card key={testimonial.name} className="hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star
                    key={i}
                    className="h-5 w-5 fill-gold text-gold"
                  />
                ))}
              </div>
              <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                "{testimonial.content}"
              </p>
              <div>
                <p className="font-semibold text-navy">{testimonial.name}</p>
                <p className="text-sm text-muted-foreground">
                  {testimonial.role}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </Section>
  )
}



