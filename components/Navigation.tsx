import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Brand } from "@/lib/brands"

interface NavigationProps {
  brand: Brand
}

const navItems = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/services", label: "Services" },
  { href: "/process", label: "Process" },
  { href: "/contact", label: "Contact" },
]

export function Navigation({ brand }: NavigationProps) {
  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-xl font-bold">Payne Professional Services</span>
          </Link>
          <div className="hidden md:flex md:items-center md:space-x-6">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm font-medium transition-colors hover:text-primary"
              >
                {item.label}
              </Link>
            ))}
            <Button asChild>
              <Link href="/book">Book a Call</Link>
            </Button>
          </div>
          <div className="md:hidden">
            <Button asChild size="sm">
              <Link href="/book">Book</Link>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  )
}


