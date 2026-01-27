import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function AdminCalculationsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Calculations</h1>
        <p className="text-muted-foreground mt-2">
          Track estimates, projections, and reconciliation work.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Calculation workspace</CardTitle>
          <CardDescription>Tax estimates and scenario planning</CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Calculation tools and exports will appear here.
        </CardContent>
      </Card>
    </div>
  )
}
