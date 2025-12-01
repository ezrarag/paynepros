import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Section } from "@/components/ui/section"
import { PageTitle, PageDescription } from "@/components/ui/page-title"

export default function AboutPage() {
  return (
    <Section>
      <div className="mb-16">
        <PageTitle>About Payne Professional Services</PageTitle>
        <PageDescription>
          Your trusted partner for tax preparation and bookkeeping
        </PageDescription>
      </div>

      <div className="space-y-8">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="text-navy">Our Mission</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground leading-relaxed">
              At Payne Professional Services, we're dedicated to providing
              expert tax preparation and bookkeeping services that help our
              clients stay compliant, organized, and confident in their
              financial affairs.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              We understand that tax season can be stressful, and we're here
              to make the process as smooth and worry-free as possible. Our
              team brings years of experience and a commitment to accuracy,
              professionalism, and personalized service.
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="text-navy">What We Do</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground leading-relaxed">
              We specialize in comprehensive tax preparation services for
              individuals and families, including:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
              <li>Individual and joint tax returns</li>
              <li>Past-due return preparation and cleanup</li>
              <li>Tax extensions and amendments</li>
              <li>Year-round bookkeeping services</li>
              <li>Tax planning and consultation</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="text-navy">Why Choose Us</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-semibold mb-2 text-navy">Expertise</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Our team stays up-to-date with the latest tax laws and
                regulations to ensure accurate filing.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2 text-navy">Personalized Service</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                We take the time to understand your unique situation and
                provide tailored solutions.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2 text-navy">Reliability</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                You can count on us to meet deadlines and keep your
                information secure and confidential.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2 text-navy">Ongoing Support</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                We're here for you year-round, not just during tax season.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </Section>
  )
}



