import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function AboutPage() {
  return (
    <div className="py-16 px-4">
      <div className="mx-auto max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl mb-4">
            About Payne Professional Services
          </h1>
          <p className="text-lg text-muted-foreground">
            Your trusted partner for tax preparation and bookkeeping
          </p>
        </div>

        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Our Mission</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                At Payne Professional Services, we're dedicated to providing
                expert tax preparation and bookkeeping services that help our
                clients stay compliant, organized, and confident in their
                financial affairs.
              </p>
              <p className="text-muted-foreground">
                We understand that tax season can be stressful, and we're here
                to make the process as smooth and worry-free as possible. Our
                team brings years of experience and a commitment to accuracy,
                professionalism, and personalized service.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>What We Do</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
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

          <Card>
            <CardHeader>
              <CardTitle>Why Choose Us</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div>
                  <h3 className="font-semibold mb-1">Expertise</h3>
                  <p className="text-sm text-muted-foreground">
                    Our team stays up-to-date with the latest tax laws and
                    regulations to ensure accurate filing.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Personalized Service</h3>
                  <p className="text-sm text-muted-foreground">
                    We take the time to understand your unique situation and
                    provide tailored solutions.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Reliability</h3>
                  <p className="text-sm text-muted-foreground">
                    You can count on us to meet deadlines and keep your
                    information secure and confidential.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Ongoing Support</h3>
                  <p className="text-sm text-muted-foreground">
                    We're here for you year-round, not just during tax season.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}


