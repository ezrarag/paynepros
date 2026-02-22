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
        <div className="relative mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-4 py-2 sm:px-6 sm:py-3">
          <Link href="/" className="shrink-0">
            <Image
              src="https://firebasestorage.googleapis.com/v0/b/readyaimgo-clients-temp.firebasestorage.app/o/paynepros%2FContent%2Flogo%20for%20left.png?alt=media&token=e1b4c284-7b7d-49f3-8f5c-7a11fa2b2592"
              alt="Payne Professional Services logo mark"
              width={84}
              height={32}
              className="h-8 w-auto object-contain"
              priority
            />
          </Link>

          <nav className="hidden sm:block sm:flex-1 sm:px-3">
            <ul className="flex items-center justify-center gap-5">
              {navItems.map((item) => {
                const isActive = pathname === item.href
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        "relative inline-block px-1 py-1 text-xs leading-none tracking-[0.18em] text-[#5d5547] transition-colors hover:text-[#2f2a22]",
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

          <div className="relative">
            <details className="group relative">
              <summary className="flex cursor-pointer list-none items-center gap-2 rounded-xl border border-[#2f2f2f] bg-[#f4f4f4]/90 px-3 py-1.5 text-xs tracking-[0.12em] text-[#2f2a22] sm:px-4 sm:py-2 sm:tracking-[0.14em]">
                <UserCircle2 className="h-4 w-4 sm:h-5 sm:w-5" />
                <span>MENU</span>
                <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" />
              </summary>
              <div className="absolute right-0 z-20 mt-2 w-[min(86vw,320px)] border border-[#c8c0ad] bg-[#fbf9f4] p-4 shadow-[0_8px_20px_rgba(35,30,20,0.18)] sm:w-[260px]">
                <nav className="sm:hidden">
                  <ul className="space-y-1">
                    {navItems.map((item) => {
                      const isActive = pathname === item.href
                      return (
                        <li key={item.href}>
                          <Link
                            href={item.href}
                            className={cn(
                              "block py-1.5 text-xs tracking-[0.14em] text-[#5d5547] transition-colors hover:text-[#2f2a22]",
                              isActive && "text-[#2f2a22]"
                            )}
                          >
                            {item.label}
                          </Link>
                        </li>
                      )
                    })}
                  </ul>
                </nav>
                <div className="space-y-2">
                  <Link
                    href="/admin/login"
                    className="block text-xs tracking-[0.16em] text-[#5d5547] transition-colors hover:text-[#2f2a22] sm:pt-0 pt-3"
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
