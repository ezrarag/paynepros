"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Bell, ChevronDown } from "lucide-react"
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
    <header className="border-b border-[#c8c0ad] bg-[#f4f4f4]">
      <div className="relative text-[#f5f4ee]">
        <div data-testid="colorUnderlay" className="LWbAav Kv1aVt" />
        <div className="relative mx-auto grid max-w-7xl grid-cols-2 items-center gap-3 px-4 py-3 sm:grid-cols-3 sm:px-6">
          <div className="justify-self-start text-[12px] leading-5 tracking-[0.01em] sm:text-[15px] sm:leading-6">
            <a href="tel:+18168051433" className="block hover:text-white">
              ▶ 816-805-1433
            </a>
            <a href="mailto:taxprep@paynepros.com" className="block hover:text-white">
              ▶ taxprep@paynepros.com
            </a>
          </div>

          <p className="col-span-2 justify-self-end text-right text-[18px] leading-none tracking-[0.01em] text-[#111111] sm:col-span-1 sm:justify-self-center sm:text-center sm:text-[58px]">
            A PARTNER IN YOUR SUCCESS
          </p>

          <div className="hidden justify-self-end sm:block">
            <div className="flex h-16 items-center gap-4 rounded-2xl border border-[#2f2f2f] px-6">
              <ChevronDown className="h-5 w-5 text-[#f0efe8]" />
              <Image
                src="https://firebasestorage.googleapis.com/v0/b/readyaimgo-clients-temp.firebasestorage.app/o/paynepros%2FContent%2Fheadshot%20-%20detania%20payne.jpeg?alt=media&token=a537d359-f445-4603-bf84-2615d39eb2f5"
                alt="Profile"
                width={34}
                height={34}
                className="h-[34px] w-[34px] rounded-full object-cover"
              />
              <Bell className="h-5 w-5 text-[#f0efe8]" />
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto flex max-w-7xl flex-col items-center px-4 pb-10 pt-8 sm:px-6">
        <Link href="/" className="flex flex-col items-center text-center">
          <Image
            src="https://firebasestorage.googleapis.com/v0/b/readyaimgo-clients-temp.firebasestorage.app/o/paynepros%2FContent%2F593ab9_549b771892524f1a9466b07c473d4dfc~mv2.avif?alt=media&token=2724bcbd-b196-4616-a2ee-6ea01eb86fd4"
            alt="Payne Professional Services logo"
            width={960}
            height={320}
            className="h-auto w-[min(860px,92vw)]"
            priority
          />
        </Link>

        <nav className="mt-6 w-full border-t border-[#c8c0ad] pt-5">
          <ul className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-y-4">
            {navItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <li key={item.href} className="w-[46%] text-center sm:w-[260px] lg:w-[300px]">
                  <Link
                    href={item.href}
                    className={cn(
                      "relative inline-block w-full px-3 py-2 text-[16px] leading-none tracking-[0.01em] text-[#151515] transition-colors hover:text-[#000000] sm:text-[20px] lg:text-[52px]",
                      isActive &&
                        "before:absolute before:left-0 before:right-0 before:top-0 before:h-[1.5px] before:bg-[#aa9f71] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[1.5px] after:bg-[#aa9f71]"
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
    </header>
  )
}
