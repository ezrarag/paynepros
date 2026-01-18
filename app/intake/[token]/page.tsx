import { IntakeFlow } from "@/components/intake/IntakeFlow"

export default function IntakePage({ params }: { params: { token: string } }) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">PaynePros Intake</h1>
          <p className="text-muted-foreground mt-2">
            Complete the intake so we can keep your workspace up to date.
          </p>
        </div>
        <IntakeFlow token={params.token} />
      </div>
    </div>
  )
}
