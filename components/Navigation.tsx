"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Brand } from "@/lib/brands"
import { Plus, User, Menu, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"

interface NavigationProps {
  brand: Brand
}

const navItems = [
  { href: "/", label: "Home" },
  { href: "/about-us", label: "About" },
  { href: "/services", label: "Services" },
  { href: "/process", label: "Process" },
  { href: "/contact", label: "Contact" },
]

export function Navigation({ brand }: NavigationProps) {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isLoginOpen, setIsLoginOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        isScrolled
          ? "bg-offwhite/95 border-b border-gray-200/50 shadow-sm"
          : "bg-transparent"
      )}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          {/* Left: Logo */}
          <Link
            href="/"
            className="flex items-center"
          >
            <div className="relative w-auto h-12">
              <Image
                src="https://firebasestorage.googleapis.com/v0/b/readyaimgo-clients-temp.firebasestorage.app/o/paynepros%2FContent%2Flogo%20-%20payne%20professional%20services.png?alt=media&token=adda4211-7289-487f-9bc7-0436ea033ea6"
                alt="PaynePros Logo"
                width={200}
                height={48}
                className="h-12 w-auto object-contain"
              />
            </div>
          </Link>

          {/* Middle: Menu Dropdown */}
          <div className="hidden md:flex md:items-center">
            <Popover open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <PopoverTrigger asChild>
                <button
                  className={cn(
                    "text-sm font-medium transition-colors px-4 py-2 flex items-center gap-2",
                    isScrolled ? "text-navy hover:text-gold" : "text-offwhite hover:text-gold"
                  )}
                >
                  <motion.span
                    animate={{ rotate: isMenuOpen ? 45 : 0 }}
                    transition={{ duration: 0.3 }}
                    className="text-lg"
                  >
                    +
                  </motion.span>
                  <span className="flex">
                    {["M", "E", "N", "U"].map((letter, index) => (
                      <motion.span
                        key={`${letter}-${isMenuOpen}`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{
                          opacity: 1,
                          y: 0,
                        }}
                        transition={{
                          delay: isMenuOpen ? index * 0.08 : 0,
                          duration: 0.25,
                          ease: "easeOut",
                        }}
                      >
                        {letter}
                      </motion.span>
                    ))}
                  </span>
                </button>
              </PopoverTrigger>
              <PopoverContent 
                className="w-64 p-8 bg-offwhite border border-gray-200/50 shadow-lg"
                align="center"
                sideOffset={8}
              >
                <div className="space-y-4">
                  {navItems.map((item, index) => (
                    <motion.div
                      key={item.href}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Link
                        href={item.href}
                        onClick={() => setIsMenuOpen(false)}
                        className="block text-base font-medium text-navy hover:text-gold transition-colors uppercase tracking-wide"
                      >
                        {item.label}
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={cn(
                "p-2 transition-colors",
                isScrolled ? "text-navy hover:text-gold" : "text-offwhite hover:text-gold"
              )}
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>

          {/* Right: Text + Avatar + Plus Button */}
          <div className="flex items-center gap-2 md:gap-4">
            {/* Text on the left */}
            <div className="hidden lg:block">
              <p className={cn(
                "text-[11px] tracking-tight uppercase leading-tight max-w-[180px]",
                isScrolled ? "text-navy" : "text-gray-300"
              )}>
                A 30-MINUTE CALL TO CLARIFY YOUR<br />
                <span className="font-semibold text-offwhite">NEXT STEPS. ZERO OBLIGATIONS.</span>
              </p>
            </div>

            {/* Left Circle - Picture (FaceTime call) */}
            <div className="relative">
              <a
                href="facetime://8168051433"
                className="w-12 h-12 md:w-16 md:h-16 rounded-full border-2 md:border-4 border-offwhite shadow-md overflow-hidden relative block cursor-pointer hover:opacity-90 transition-opacity"
              >
                <Image
                  src="https://firebasestorage.googleapis.com/v0/b/readyaimgo-clients-temp.firebasestorage.app/o/paynepros%2FContent%2Fheadshot%20-%20detania%20payne.jpeg?alt=media&token=a537d359-f445-4603-bf84-2615d39eb2f5"
                  alt="Detania Payne - Click to call"
                  fill
                  className="object-cover rounded-full"
                />
              </a>
            </div>

            {/* Right Circle - Plus Button with Login Dropdown */}
            <Popover open={isLoginOpen} onOpenChange={setIsLoginOpen}>
              <PopoverTrigger asChild>
                <button className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-navy border-2 md:border-4 border-offwhite shadow-md flex items-center justify-center transition-all hover:bg-navy-light">
                  <Plus className="w-4 h-4 md:w-6 md:h-6 text-offwhite" />
                </button>
              </PopoverTrigger>
              <PopoverContent 
                className="w-64 p-4"
                align="end"
                sideOffset={8}
              >
                <div className="space-y-3">
                  <div className="pb-3 border-b border-gray-200">
                    <p className="text-sm font-semibold text-navy mb-1">Account</p>
                    <p className="text-xs text-muted-foreground">Sign in to access your account</p>
                  </div>
                  <div className="space-y-2">
                    <Link 
                      href="/admin/login"
                      onClick={() => setIsLoginOpen(false)}
                      className="inline-flex w-full items-center justify-center rounded-md bg-gold px-4 py-2 text-sm font-medium text-navy hover:bg-gold-dark transition-colors"
                    >
                      Sign In
                    </Link>
                    <Link 
                      href="/book"
                      onClick={() => setIsLoginOpen(false)}
                      className="inline-flex w-full items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
                    >
                      Book a Consultation
                    </Link>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className={cn(
          "md:hidden border-t",
          isScrolled 
            ? "border-gray-200/50 bg-offwhite" 
            : "border-gray-700/50 bg-navy/95"
        )}>
          <div className="px-4 py-4 space-y-4">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={cn(
                  "block text-base font-medium transition-colors py-2",
                  isScrolled ? "text-navy hover:text-gold" : "text-offwhite hover:text-gold"
                )}
              >
                {item.label}
              </Link>
            ))}
            <div className="pt-4 border-t border-gray-200/50">
              <Button 
                asChild 
                className="w-full bg-gold text-navy hover:bg-gold-dark"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Link href="/admin/login">Sign In</Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
