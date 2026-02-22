"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronDown, UserCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/", label: "HOME" },
  { href: "/services", label: "SERVICES" },
  { href: "/about", label: "ABOUT US" },
  { href: "/contact", label: "CONTACT US" },
]

export function WixHeader() {
  const pathname = usePathname()

  return (
    <header className="w-full border-b border-[#c8c0ad] bg-[#f4f4f4]">
      <div className="relative text-[#f5f4ee]">
        <div data-testid="colorUnderlay" className="LWbAav Kv1aVt" />
        <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
            <Link href="/" className="self-start sm:self-auto">
              <Image
                src="https://firebasestorage.googleapis.com/v0/b/readyaimgo-clients-temp.firebasestorage.app/o/paynepros%2FContent%2Flogo%20for%20left.png?alt=media&token=e1b4c284-7b7d-49f3-8f5c-7a11fa2b2592"
                alt="Payne Professional Services logo mark"
                width={84}
                height={32}
                className="h-8 w-auto object-contain"
                priority
              />
            </Link>

            <nav className="w-full border-y border-[#c8c0ad] py-3 sm:w-auto sm:flex-1 sm:border-none sm:py-0">
              <ul className="grid w-full grid-cols-2 gap-y-3 sm:flex sm:items-center sm:justify-start sm:gap-5 sm:gap-y-0">
                {navItems.map((item) => {
                  const isActive = pathname === item.href
                  return (
                    <li key={item.href} className="px-2 text-left sm:px-0">
                      <Link
                        href={item.href}
                        className={cn(
                          "relative inline-block w-full px-2 py-2 text-[11px] leading-none tracking-[0.12em] text-[#5d5547] transition-colors hover:text-[#2f2a22] sm:w-auto sm:px-1 sm:py-1 sm:text-xs sm:tracking-[0.18em]",
                          isActive &&
                            "before:absolute before:left-0 before:right-0 before:top-0 before:h-[1.5px] before:bg-[#AAA47F] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[1.5px] after:bg-[#AAA47F]"
                        )}
                      >
                        {item.label}
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </nav>
          </div>

          <div className="relative w-full sm:w-auto">
            <details className="group relative">
              <summary className="flex w-full cursor-pointer list-none items-center justify-between gap-2 rounded-xl border border-[#2f2f2f] bg-[#f4f4f4]/90 px-3 py-1.5 text-xs tracking-[0.12em] text-[#2f2a22] sm:w-auto sm:tracking-[0.14em]">
                <UserCircle2 className="h-5 w-5" />
                <span>MENU</span>
                <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" />
              </summary>
              <div className="absolute left-0 right-0 z-20 mt-2 border border-[#c8c0ad] bg-[#fbf9f4] p-4 shadow-[0_8px_20px_rgba(35,30,20,0.18)] sm:left-auto sm:right-0 sm:w-[260px]">
                <div className="space-y-2">
                  <Link
                    href="/admin/login"
                    className="block text-xs tracking-[0.16em] text-[#5d5547] transition-colors hover:text-[#2f2a22]"
                  >
                    ADMIN LOGIN
                  </Link>
                  <Link
                    href="/password"
                    className="block text-xs tracking-[0.16em] text-[#5d5547] transition-colors hover:text-[#2f2a22]"
                  >
                    CLIENT LOGIN
                  </Link>
                </div>
                <div className="mt-3 border-t border-[#d5cebe] pt-3 text-[12px] leading-5 tracking-[0.01em] text-[#5d5547]">
                  <a href="tel:+18168051433" className="block hover:text-[#2f2a22]">
                    816-805-1433
                  </a>
                  <a href="mailto:taxprep@paynepros.com" className="block hover:text-[#2f2a22]">
                    taxprep@paynepros.com
                  </a>
                </div>
              </div>
            </details>
          </div>
        </div>
      </div>
    </header>
  )
}
