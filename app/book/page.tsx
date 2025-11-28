import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Calendar, Clock, Video, Mail, Phone } from "lucide-react"

export default function BookPage() {
  return (
    <div className="py-16 px-4">
      <div className="mx-auto max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl mb-4">
            Book a Consultation
          </h1>
          <p className="text-lg text-muted-foreground">
            Schedule a call with our team to discuss your tax and bookkeeping
            needs
          </p>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <Calendar className="h-6 w-6 text-primary" />
              <CardTitle>Schedule Your Call</CardTitle>
            </div>
            <CardDescription>
              Choose a time that works for you. We'll discuss your needs and
              answer any questions.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="rounded-lg border p-6 bg-muted/30">
                <p className="text-sm text-muted-foreground mb-4">
                  Calendly integration coming soon. For now, please use the
                  contact form below or call us directly.
                </p>
                <div className="flex gap-4">
                  <Button asChild>
                    <Link href="/contact">Contact Form</Link>
                  </Button>
                  <Button asChild variant="outline">
                    <a href="tel:+15551234567">Call Us</a>
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <Video className="h-5 w-5 text-primary" />
                <CardTitle>Video Call</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Meet with us via video call for a face-to-face consultation
                from the comfort of your home or office.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <Phone className="h-5 w-5 text-primary" />
                <CardTitle>Phone Call</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Prefer a phone call? We can schedule a convenient time to
                discuss your needs over the phone.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <Clock className="h-5 w-5 text-primary" />
                <CardTitle>Duration</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Initial consultations typically last 30-45 minutes, giving us
                time to understand your situation.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <Mail className="h-5 w-5 text-primary" />
                <CardTitle>Follow-Up</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                After your consultation, we'll send a summary and next steps
                via email.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 text-center">
          <p className="text-muted-foreground mb-4">
            Ready to get started? Fill out our contact form and we'll get back
            to you to schedule your consultation.
          </p>
          <Button asChild size="lg">
            <Link href="/contact">Go to Contact Form</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}

