"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import type { DocumentRequest } from "@/lib/types/command-center"

interface DocRequestModalProps {
  workspaceId: string
  clientName: string
  existingRequest?: DocumentRequest
  open: boolean
  onOpenChange: (open: boolean) => void
}

const commonDocs = [
  "W-2 Forms",
  "1099-INT (Interest)",
  "1099-DIV (Dividends)",
  "1099-MISC",
  "1099-NEC",
  "Bank Statements (Q4)",
  "Receipts",
  "Mortgage Interest Statement",
  "Property Tax Records",
  "Charitable Contribution Receipts",
  "Business Expense Receipts",
  "Medical Expense Records",
]

export function DocRequestModal({
  workspaceId,
  clientName,
  existingRequest,
  open,
  onOpenChange,
}: DocRequestModalProps) {
  const [selectedDocs, setSelectedDocs] = useState<string[]>(
    existingRequest?.missingDocs || []
  )
  const [customDoc, setCustomDoc] = useState("")

  const toggleDoc = (doc: string) => {
    setSelectedDocs((prev) =>
      prev.includes(doc) ? prev.filter((d) => d !== doc) : [...prev, doc]
    )
  }

  const addCustomDoc = () => {
    if (customDoc.trim() && !selectedDocs.includes(customDoc.trim())) {
      setSelectedDocs((prev) => [...prev, customDoc.trim()])
      setCustomDoc("")
    }
  }

  const handleRequest = () => {
    // TODO: Save document request to backend
    console.log("Requesting documents:", {
      workspaceId,
      missingDocs: selectedDocs,
    })
    // Placeholder: Generate secure upload link
    alert(
      `Document request created for ${clientName}. Secure upload link: [Future: Generate link]`
    )
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Request Documents from {clientName}</DialogTitle>
          <DialogDescription>
            Select the documents you need. A secure upload link will be generated.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Common Documents</Label>
            <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto border rounded-lg p-4">
              {commonDocs.map((doc) => (
                <div key={doc} className="flex items-center space-x-2">
                  <Checkbox
                    id={`doc-${doc}`}
                    checked={selectedDocs.includes(doc)}
                    onCheckedChange={() => toggleDoc(doc)}
                  />
                  <label
                    htmlFor={`doc-${doc}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    {doc}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Custom Document</Label>
            <div className="flex gap-2">
              <Input
                value={customDoc}
                onChange={(e) => setCustomDoc(e.target.value)}
                placeholder="Enter custom document name"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    addCustomDoc()
                  }
                }}
              />
              <Button type="button" onClick={addCustomDoc} variant="outline">
                Add
              </Button>
            </div>
          </div>

          {selectedDocs.length > 0 && (
            <div className="space-y-2">
              <Label>Selected Documents ({selectedDocs.length})</Label>
              <div className="flex flex-wrap gap-2">
                {selectedDocs.map((doc) => (
                  <div
                    key={doc}
                    className="flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded-md text-sm"
                  >
                    {doc}
                    <button
                      onClick={() => toggleDoc(doc)}
                      className="ml-1 hover:text-destructive"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleRequest} disabled={selectedDocs.length === 0}>
            Create Request & Generate Link
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
