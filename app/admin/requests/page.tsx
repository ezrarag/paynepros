"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { FileText, CheckCircle2, Clock, XCircle } from "lucide-react"

interface ContentRequest {
  id: string
  title: string
  description: string
  priority: "low" | "medium" | "high"
  category: string
  status: "pending" | "in_progress" | "completed" | "needs_revision"
  createdAt: string
}

export default function RequestsPage() {
  const [requests, setRequests] = useState<ContentRequest[]>([])
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "medium" as "low" | "medium" | "high",
    category: "other" as string,
    sendToBeamParticipants: false,
  })

  useEffect(() => {
    fetchRequests()
  }, [])

  const fetchRequests = async () => {
    try {
      const response = await fetch("/api/requests")
      const data = await response.json()
      // Ensure data is always an array
      setRequests(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error("Error fetching requests:", error)
      setRequests([]) // Set empty array on error
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setShowForm(false)
        setFormData({
          title: "",
          description: "",
          priority: "medium",
          category: "other",
          sendToBeamParticipants: false,
        })
        fetchRequests()
      }
    } catch (error) {
      console.error("Error creating request:", error)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />
      case "in_progress":
        return <Clock className="h-4 w-4 text-blue-500" />
      case "needs_revision":
        return <XCircle className="h-4 w-4 text-yellow-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Content Requests</h1>
          <p className="text-muted-foreground mt-2">
            Request content, reports, and support from your teams
          </p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <FileText className="h-4 w-4 mr-2" />
          New Request
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Request</CardTitle>
            <CardDescription>
              Submit a request for content, reports, or support
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) =>
                    setFormData({ ...formData, category: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="social">Social Media</SelectItem>
                    <SelectItem value="bookkeeping">Bookkeeping</SelectItem>
                    <SelectItem value="marketing">Marketing</SelectItem>
                    <SelectItem value="strategic">Strategic Planning</SelectItem>
                    <SelectItem value="system">System/Dashboard</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value: any) =>
                    setFormData({ ...formData, priority: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  required
                  rows={4}
                />
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="send-to-beam"
                  checked={formData.sendToBeamParticipants}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      sendToBeamParticipants: e.target.checked,
                    })
                  }
                  className="rounded"
                />
                <Label htmlFor="send-to-beam">
                  Send to BEAM Participants
                </Label>
              </div>
              <div className="flex gap-2">
                <Button type="submit">Submit Request</Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {requests.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground">No requests yet</p>
            </CardContent>
          </Card>
        ) : (
          requests.map((request) => (
            <Card key={request.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {getStatusIcon(request.status)}
                      {request.title}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      {request.category} • {request.priority} priority
                    </CardDescription>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(request.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{request.description}</p>
                <div className="mt-4">
                  <span className="text-xs px-2 py-1 bg-muted rounded">
                    {request.status}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}

