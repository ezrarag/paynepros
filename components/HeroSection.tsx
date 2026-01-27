"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"

export function HeroSection() {
  return (
    <section className="relative w-full h-screen overflow-hidden flex items-center">
      {/* Full width background image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="https://firebasestorage.googleapis.com/v0/b/readyaimgo-clients-temp.firebasestorage.app/o/paynepros%2FContent%2Fpaynepros.png?alt=media&token=f088adf0-e08a-41e4-8b24-adaee3b813ff"
          alt="Background"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-navy/80 via-navy/60 to-transparent z-10" />
      </div>


      {/* Content with Effica-style two-column structure */}
      <div className="relative z-20 w-full max-w-7xl mx-auto px-6 md:px-12 pt-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
          {/* LEFT COLUMN - Text Content */}
          <div className="flex flex-col justify-center space-y-4 md:space-y-6">
            <motion.h1
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-semibold leading-tight text-offwhite w-full"
            >
              Expert Tax Preparation<br />& Bookkeeping Services
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
              className="text-base md:text-lg text-gray-300 w-full leading-relaxed"
            >
              Professional, reliable, and personalized financial services to help you
              stay compliant and organized. From individual returns to past-due
              cleanup, we've got you covered.
            </motion.p>

            {/* Buttons horizontal */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6, ease: "easeOut" }}
              className="pt-2 md:pt-4 w-full flex flex-col sm:flex-row gap-3 md:gap-4"
            >
              <Button asChild size="lg" className="w-full sm:w-auto bg-navy text-offwhite hover:bg-navy-light text-sm md:text-base tracking-wide px-6 md:px-8 py-5 md:py-6 rounded-full">
                <Link href="/book">Book a Consult</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="w-full sm:w-auto bg-offwhite text-navy hover:bg-gray-100 border-gray-300 text-sm md:text-base tracking-wide px-6 md:px-8 py-5 md:py-6 rounded-full">
                <Link href="/services">Explore</Link>
              </Button>
            </motion.div>
          </div>

          {/* RIGHT COLUMN - Empty for spacing */}
          <div className="hidden md:flex flex-col justify-center">
            {/* Empty space to maintain column structure */}
          </div>
        </div>
      </div>
    </section>
  )
}
