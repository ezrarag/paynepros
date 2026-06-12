"use client"

import { signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"

function GoogleIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.49 12.27c0-.79-.07-1.54-.2-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v2.97h3.86c2.26-2.09 3.56-5.17 3.56-8.79z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-2.97c-1.07.72-2.45 1.15-4.07 1.15-3.13 0-5.78-2.11-6.73-4.96H1.27v3.07A11.997 11.997 0 0012 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.27 14.31a7.18 7.18 0 010-4.62V6.62H1.27a12 12 0 000 10.76l4-3.07z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.94 1.19 15.24 0 12 0 7.31 0 3.26 2.69 1.27 6.62l4 3.07C6.22 6.86 8.87 4.75 12 4.75z"
      />
    </svg>
  )
}

interface GoogleSignInButtonProps {
  callbackUrl: string
  label?: string
}

export default function GoogleSignInButton({ callbackUrl, label }: GoogleSignInButtonProps) {
  return (
    <Button
      type="button"
      variant="outline"
      className="w-full gap-2"
      onClick={() => signIn("google", { callbackUrl })}
    >
      <GoogleIcon />
      {label ?? "Continue with Google"}
    </Button>
  )
}
