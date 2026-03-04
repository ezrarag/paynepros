"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

type BeamRequest = {
  id: string
  title: string
  description: string
  status: "pending" | "in_progress" | "completed" | "needs_revision"
  screenshotUrl?: string
  createdAt: string
}

export function BeamRequestsPanel() {
  const [requests, setRequests] = useState<BeamRequest[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const response = await fetch("/api/requests?source=beam")
        const data = await response.json()
        const beamRequests = (Array.isArray(data) ? data : []) as BeamRequest[]
        setRequests(beamRequests.filter((item) => item.status !== "completed"))
      } catch (error) {
        console.error("Error loading BEAM requests for client portal:", error)
        setRequests([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchRequests()
  }, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="leading-tight">BEAM Requests</CardTitle>
        <CardDescription>
          Open platform requests and fixes tracked by the admin team.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading requests...</p>
        ) : requests.length === 0 ? (
          <p className="text-sm text-muted-foreground">No open requests right now.</p>
        ) : (
          <ul className="space-y-3">
            {requests.map((request) => (
              <li key={request.id} className="rounded-lg border p-3">
                <div className="break-words text-sm font-medium leading-6">{request.title}</div>
                <div className="mt-1 break-words text-sm leading-6 text-muted-foreground">
                  {request.description}
                </div>
                {request.screenshotUrl ? (
                  <a
                    className="mt-2 inline-block break-all text-sm underline"
                    href={request.screenshotUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    View screenshot
                  </a>
                ) : null}
                <div className="text-xs text-muted-foreground mt-2">
                  Status: {request.status.replace("_", " ")}
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
