"use client"

import { IntakeForm } from "./IntakeForm"
import { Brand } from "@/lib/brands"
import { Section } from "@/components/ui/section"
import { motion } from "framer-motion"

interface ContactSectionProps {
  brand: Brand
}

export function ContactSection({ brand }: ContactSectionProps) {
  return (
    <Section className="pb-32">
      <div className="max-w-4xl mx-auto">
        {/* Effica-inspired form greeting */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <h2 className="text-2xl font-semibold text-navy mb-2">
            Hi, PaynePros team!
          </h2>
        </motion.div>

        {/* Form Container with Effica styling */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="bg-card border border-gray-200/50 rounded-lg p-8 md:p-12 shadow-sm"
        >
          <IntakeForm brand={brand} />
        </motion.div>

        {/* Additional info section */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-12 text-center max-w-2xl mx-auto"
        >
          <p className="text-muted-foreground text-sm leading-relaxed">
            Let's keep it simple. You don't need to prepare slides or technical notes — just share what's on your mind. 
            Whether it's a quick question or a bigger project idea, we'll get back to you with a clear next step.
          </p>
        </motion.div>
      </div>
    </Section>
  )
}



