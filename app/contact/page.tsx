import { ContactSection } from "@/components/ContactSection"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Mail, Phone, Clock } from "lucide-react"

export default function ContactPage() {
  return (
    <div className="py-16 px-4">
      <div className="mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl mb-4">
            Contact Us
          </h1>
          <p className="text-lg text-muted-foreground">
            Get in touch with our team. We're here to help with all your tax
            and bookkeeping needs.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3 mb-12">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <Mail className="h-5 w-5 text-primary" />
                <CardTitle>Email</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Send us an email and we'll get back to you within 24 hours.
              </p>
              <a
                href="mailto:info@paynepros.com"
                className="text-primary hover:underline mt-2 block"
              >
                info@paynepros.com
              </a>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <Phone className="h-5 w-5 text-primary" />
                <CardTitle>Phone</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Call us during business hours for immediate assistance.
              </p>
              <a
                href="tel:+15551234567"
                className="text-primary hover:underline mt-2 block"
              >
                (555) 123-4567
              </a>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <Clock className="h-5 w-5 text-primary" />
                <CardTitle>Hours</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-1 text-muted-foreground">
                <p>Monday - Friday: 9:00 AM - 5:00 PM</p>
                <p>Saturday: By appointment</p>
                <p>Sunday: Closed</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <ContactSection brand="paynepros" />
      </div>
    </div>
  )
}


