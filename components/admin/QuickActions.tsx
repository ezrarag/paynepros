"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { UserPlus, Link2, MessageSquare, ClipboardList } from "lucide-react"
import { GenerateIntakeLinkDialog } from "./GenerateIntakeLinkDialog"
import type { ClientWorkspace } from "@/lib/types/client-workspace"

interface QuickActionsProps {
  workspaces: ClientWorkspace[]
}

export function QuickActions({ workspaces }: QuickActionsProps) {
  const [intakeDialogOpen, setIntakeDialogOpen] = useState(false)

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <Button variant="outline" asChild className="h-auto py-3 sm:py-4 flex flex-col gap-2">
          <Link href="/admin/clients">
            <UserPlus className="h-5 w-5" />
            <span className="text-xs sm:text-sm">New Client</span>
          </Link>
        </Button>
        <Button
          variant="outline"
          onClick={() => setIntakeDialogOpen(true)}
          className="h-auto py-3 sm:py-4 flex flex-col gap-2"
        >
          <Link2 className="h-5 w-5" />
          <span className="text-xs sm:text-sm">Generate Intake Link</span>
        </Button>
        <Button variant="outline" asChild className="h-auto py-3 sm:py-4 flex flex-col gap-2">
          <Link href="/admin/messaging">
            <MessageSquare className="h-5 w-5" />
            <span className="text-xs sm:text-sm">Open Messaging</span>
          </Link>
        </Button>
        <Button variant="outline" asChild className="h-auto py-3 sm:py-4 flex flex-col gap-2">
          <Link href="/admin/forms">
            <ClipboardList className="h-5 w-5" />
            <span className="text-xs sm:text-sm">Open Forms</span>
          </Link>
        </Button>
      </div>

      <GenerateIntakeLinkDialog
        open={intakeDialogOpen}
        onOpenChange={setIntakeDialogOpen}
        workspaces={workspaces}
      />
    </>
  )
}
