"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Upload, FileText, Calendar } from "lucide-react"

export default function BookkeepingPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Bookkeeping</h1>
        <p className="text-muted-foreground mt-2">
          Upload receipts and manage financial records
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Upload Receipt
            </CardTitle>
            <CardDescription>
              Upload receipts for bookkeeping team
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="receipt-file">Receipt File</Label>
              <Input id="receipt-file" type="file" accept="image/*,.pdf" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="receipt-description">Description</Label>
              <Input
                id="receipt-description"
                placeholder="What is this receipt for?"
              />
            </div>
            <Button className="w-full">Upload</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Monthly Reports
            </CardTitle>
            <CardDescription>
              View and request monthly financial reports
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Request Report</Label>
              <div className="flex gap-2">
                <Input type="month" />
                <Button>Request</Button>
              </div>
            </div>
            <div className="pt-4 border-t">
              <h3 className="font-semibold mb-2">Available Reports</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 border rounded">
                  <span className="text-sm">January 2024</span>
                  <Button variant="outline" size="sm">
                    Download
                  </Button>
                </div>
                <div className="flex items-center justify-between p-2 border rounded">
                  <span className="text-sm">December 2023</span>
                  <Button variant="outline" size="sm">
                    Download
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Ask Bookkeeping Team
          </CardTitle>
          <CardDescription>
            Send a message or request to your bookkeeping team
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="bookkeeping-message">Message</Label>
              <textarea
                id="bookkeeping-message"
                className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm"
                placeholder="What do you need help with?"
              />
            </div>
            <Button>Send Message</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

