"use client"

import { ContactSection } from "@/components/ContactSection"
import { Card, CardContent } from "@/components/ui/card"
import { Section } from "@/components/ui/section"
import { Mail, Phone, Clock } from "lucide-react"
import { motion } from "framer-motion"
import Link from "next/link"

export default function ContactPage() {
  return (
    <>
      <Section className="pt-32 pb-16">
        {/* Effica-inspired header section */}
        <div className="mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-6"
          >
            <span className="text-sm text-muted-foreground uppercase tracking-wider">
              Start with a simple step
            </span>
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-5xl md:text-7xl font-bold tracking-tight text-navy mb-8 leading-tight"
          >
            LET'S START YOUR<br />TAX PROJECT
          </motion.h1>
        </div>

        {/* Contact Cards - Clickable Email and Phone */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3 mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Link href="mailto:taxprep@paynepros.com" className="block">
              <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer h-full border-gray-200/50 bg-card hover:bg-gray-50/50">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <Mail className="h-5 w-5 text-gold" />
                    <h3 className="text-lg font-semibold text-navy">Email</h3>
                  </div>
                  <p className="text-muted-foreground leading-relaxed text-sm mb-3">
                    Send us an email and we'll get back to you within 24 hours.
                  </p>
                  <p className="text-gold hover:text-gold-dark font-medium">
                    taxprep@paynepros.com
                  </p>
                </CardContent>
              </Card>
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <a href="facetime://8168051433" className="block">
              <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer h-full border-gray-200/50 bg-card hover:bg-gray-50/50">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <Phone className="h-5 w-5 text-gold" />
                    <h3 className="text-lg font-semibold text-navy">Phone</h3>
                  </div>
                  <p className="text-muted-foreground leading-relaxed text-sm mb-3">
                    Call us during business hours for immediate assistance.
                  </p>
                  <p className="text-gold hover:text-gold-dark font-medium">
                    816-805-1433
                  </p>
                </CardContent>
              </Card>
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Card className="h-full border-gray-200/50 bg-card">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <Clock className="h-5 w-5 text-gold" />
                  <h3 className="text-lg font-semibold text-navy">Hours</h3>
                </div>
                <div className="space-y-1 text-muted-foreground text-sm">
                  <p>Monday - Friday: 9:00 AM - 5:00 PM</p>
                  <p>Saturday: By appointment</p>
                  <p>Sunday: Closed</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </Section>
      
      {/* Form Section with Effica-inspired styling */}
      <ContactSection brand="paynepros" />
    </>
  )
}



