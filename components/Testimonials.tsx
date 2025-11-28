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

export function Testimonials({ brand }: TestimonialsProps) {
  return (
    <section className="py-16 px-4">
      <div className="mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            What Our Clients Say
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Trusted by individuals and families for reliable tax services
          </p>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {testimonials.map((testimonial) => (
            <Card key={testimonial.name}>
              <CardContent className="pt-6">
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star
                      key={i}
                      className="h-5 w-5 fill-yellow-400 text-yellow-400"
                    />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  "{testimonial.content}"
                </p>
                <div>
                  <p className="font-semibold">{testimonial.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {testimonial.role}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}


