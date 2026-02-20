import Link from "next/link"
import { WixHeader } from "@/components/marketing/WixHeader"

export function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="marketing-wix-skin min-h-screen bg-[#f4f4f4] text-[#2f2a22]">
      <WixHeader />
      <main>{children}</main>
      <footer className="border-t border-[#c8c0ad] bg-[#f4f4f4]">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-5 px-4 py-8 text-center text-xs tracking-[0.18em] text-[#5d5547] sm:flex-row sm:text-left">
          <p>PAYNE PROFESSIONAL SERVICES</p>
          <div className="flex items-center gap-5">
            <Link href="/book" className="hover:text-[#2f2a22]">
              BOOK
            </Link>
            <Link href="/contact" className="hover:text-[#2f2a22]">
              CONTACT
            </Link>
            <Link href="/admin/login" className="hover:text-[#2f2a22]">
              SIGN IN
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
