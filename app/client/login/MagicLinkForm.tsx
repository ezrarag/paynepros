"use client"

import { useActionState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  initialState,
  requestClientMagicLink,
  type RequestMagicLinkState,
} from "./actions"

export default function MagicLinkForm() {
  const [state, formAction, isPending] = useActionState<RequestMagicLinkState, FormData>(
    requestClientMagicLink,
    initialState
  )

  return (
    <form action={formAction} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="client-email">Email</Label>
        <Input
          id="client-email"
          name="email"
          type="email"
          placeholder="ezra@readyaimgo.biz"
          required
        />
      </div>

      {state.message && (
        <p className={`text-sm ${state.status === "error" ? "text-destructive" : "text-emerald-700"}`}>
          {state.message}
        </p>
      )}

      {state.magicLink && (
        <div className="space-y-2 rounded-md border p-3">
          <p className="text-xs text-muted-foreground">Test magic link</p>
          <a
            className="text-sm text-blue-700 underline break-all"
            href={state.magicLink}
          >
            {state.magicLink}
          </a>
        </div>
      )}

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "Generating link..." : "Email me a sign-in link"}
      </Button>
    </form>
  )
}
