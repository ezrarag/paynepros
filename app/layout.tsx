import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Navigation } from "@/components/Navigation"

const inter = Inter({ subsets: ["latin"] })

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
      <body className={inter.className}>
        <Navigation brand="paynepros" />
        <main>{children}</main>
        <footer className="border-t py-8 px-4 mt-16">
          <div className="mx-auto max-w-6xl text-center text-sm text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} Payne Professional Services. All rights reserved.</p>
          </div>
        </footer>
      </body>
    </html>
  )
}


