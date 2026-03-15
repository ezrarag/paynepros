import Link from "next/link"
import { WixHeader } from "@/components/marketing/WixHeader"

export function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="marketing-wix-skin flex h-[100dvh] max-h-[100dvh] flex-col overflow-hidden bg-[#f4f4f4] text-[#2f2a22]">
      <div className="shrink-0">
        <WixHeader />
      </div>
      <main className="min-h-0 flex-1 overflow-y-auto overscroll-contain">{children}</main>
      <footer className="shrink-0 border-t border-[#c8c0ad] bg-[#f4f4f4]">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 text-xs tracking-[0.12em] text-[#5d5547] sm:px-6 sm:py-8 sm:text-left sm:tracking-[0.18em]">
          <p className="min-w-0 flex-1 truncate sm:flex-none">PAYNE PROFESSIONAL SERVICES</p>
          <Link href="/sign-in" className="shrink-0 hover:text-[#2f2a22] sm:hidden">
            SIGN IN
          </Link>
          <div className="hidden items-center gap-5 sm:flex">
            <Link href="/book" className="hover:text-[#2f2a22]">
              BOOK
            </Link>
            <Link href="/contact" className="hover:text-[#2f2a22]">
              CONTACT
            </Link>
            <Link href="/privacy" className="hover:text-[#2f2a22]">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-[#2f2a22]">
              Terms of Service
            </Link>
            <Link href="/sign-in" className="hover:text-[#2f2a22]">
              SIGN IN
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
