import { NextRequest, NextResponse } from "next/server"
import { PASSWORD_COOKIE_NAME } from "@/lib/passwords"

export async function GET(request: NextRequest) {
  const cookie = request.cookies.get(PASSWORD_COOKIE_NAME)
  
  if (cookie && cookie.value === "authenticated") {
    return NextResponse.json({ authenticated: true })
  }
  
  return NextResponse.json({ authenticated: false }, { status: 401 })
}

