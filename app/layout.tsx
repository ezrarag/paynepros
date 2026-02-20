import type { Metadata } from "next"
import { Inter, Cormorant_Garamond } from "next/font/google"
import "./globals.css"
import { LayoutWrapper } from "@/components/LayoutWrapper"

const inter = Inter({ subsets: ["latin"] })
const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-wix-display",
  weight: ["500", "600", "700"],
})

export const metadata: Metadata = {
  title: "Payne Professional Services | Tax Preparation & Bookkeeping",
  description:
    "Professional tax preparation and bookkeeping services. Individual returns, joint filings, past-due cleanup, extensions, and amendments.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} ${cormorant.variable}`}>
        <LayoutWrapper>{children}</LayoutWrapper>
      </body>
    </html>
  )
}


