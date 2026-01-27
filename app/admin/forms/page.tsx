import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function AdminFormsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Forms</h1>
        <p className="text-muted-foreground mt-2">
          Centralize intake and signature-ready forms for each client.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Form workspace</CardTitle>
          <CardDescription>Templates, signatures, and client requests</CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Form automation will appear here. Add engagement letters, tax organizers, and
          signature requests.
        </CardContent>
      </Card>
    </div>
  )
}
