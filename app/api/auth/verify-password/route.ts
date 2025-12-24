import { NextRequest, NextResponse } from "next/server"
import { isValidPassword, PASSWORD_COOKIE_NAME } from "@/lib/passwords"

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json()

    if (!password) {
      return NextResponse.json(
        { success: false, error: "Password is required" },
        { status: 400 }
      )
    }

    if (isValidPassword(password)) {
      // Set cookie that expires in 30 days
      const response = NextResponse.json({ success: true })
      response.cookies.set(PASSWORD_COOKIE_NAME, "authenticated", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: "/",
      })
      return response
    }

    return NextResponse.json(
      { success: false, error: "Invalid password" },
      { status: 401 }
    )
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "An error occurred" },
      { status: 500 }
    )
  }
}

