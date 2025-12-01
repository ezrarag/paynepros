"use client"

import { signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Chrome, Facebook, Instagram, Apple, MessageCircle } from "lucide-react"

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">PaynePros Admin</CardTitle>
          <CardDescription>
            Sign in to access your admin dashboard
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            className="w-full"
            onClick={() => signIn("google", { callbackUrl: "/admin" })}
          >
            <Chrome className="h-5 w-5 mr-2" />
            Continue with Google
          </Button>
          
          <Button
            variant="outline"
            className="w-full"
            onClick={() => signIn("facebook", { callbackUrl: "/admin" })}
          >
            <Facebook className="h-5 w-5 mr-2" />
            Continue with Facebook
          </Button>
          
          <Button
            variant="outline"
            className="w-full"
            onClick={() => signIn("instagram", { callbackUrl: "/admin" })}
          >
            <Instagram className="h-5 w-5 mr-2" />
            Continue with Instagram
          </Button>
          
          <Button
            variant="outline"
            className="w-full"
            onClick={() => signIn("apple", { callbackUrl: "/admin" })}
          >
            <Apple className="h-5 w-5 mr-2" />
            Continue with Apple
          </Button>
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">Or</span>
            </div>
          </div>
          
          <Button
            variant="outline"
            className="w-full"
            onClick={() => signIn("whatsapp", { callbackUrl: "/admin" })}
          >
            <MessageCircle className="h-5 w-5 mr-2" />
            Continue with WhatsApp
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

