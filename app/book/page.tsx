import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Section } from "@/components/ui/section"
import { PageTitle, PageDescription } from "@/components/ui/page-title"
import Link from "next/link"
import { Calendar, Clock, Video, Mail, Phone } from "lucide-react"

export default function BookPage() {
  return (
    <Section>
      <div className="mb-16">
        <PageTitle>Book a Consultation</PageTitle>
        <PageDescription>
          Schedule a call with our team to discuss your tax and bookkeeping
          needs
        </PageDescription>
      </div>

      <Card className="mb-12 hover:shadow-md transition-shadow">
        <CardHeader>
          <div className="flex items-center gap-3 mb-2">
            <Calendar className="h-6 w-6 text-gold" />
            <CardTitle className="text-navy">Schedule Your Call</CardTitle>
          </div>
          <CardDescription className="text-base">
            Choose a time that works for you. We'll discuss your needs and
            answer any questions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="rounded-lg border border-gray-200/50 p-6 bg-gold/5">
              <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                Calendly integration coming soon. For now, please use the
                contact form below or call us directly.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button asChild className="bg-gold text-navy hover:bg-gold-dark">
                  <Link href="/contact">Contact Form</Link>
                </Button>
                <Button asChild variant="outline" className="border-gold text-gold hover:bg-gold hover:text-navy">
                  <a href="tel:+15551234567">Call Us</a>
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 mb-12">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <Video className="h-5 w-5 text-gold" />
              <CardTitle className="text-navy">Video Call</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Meet with us via video call for a face-to-face consultation
              from the comfort of your home or office.
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <Phone className="h-5 w-5 text-gold" />
              <CardTitle className="text-navy">Phone Call</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Prefer a phone call? We can schedule a convenient time to
              discuss your needs over the phone.
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <Clock className="h-5 w-5 text-gold" />
              <CardTitle className="text-navy">Duration</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Initial consultations typically last 30-45 minutes, giving us
              time to understand your situation.
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <Mail className="h-5 w-5 text-gold" />
              <CardTitle className="text-navy">Follow-Up</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground leading-relaxed">
              After your consultation, we'll send a summary and next steps
              via email.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="text-left">
        <p className="text-muted-foreground mb-6 leading-relaxed">
          Ready to get started? Fill out our contact form and we'll get back
          to you to schedule your consultation.
        </p>
        <Button asChild size="lg" className="bg-gold text-navy hover:bg-gold-dark">
          <Link href="/contact">Go to Contact Form</Link>
        </Button>
      </div>
    </Section>
  )
}

