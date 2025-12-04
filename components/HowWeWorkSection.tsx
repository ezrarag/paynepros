"use client"

import { motion } from "framer-motion"
import { GridLines } from "./GridLines"

const words = [
  "HOW WE WORK",
  "HOW WE HELP YOU USE AI WITHOUT THE HYPE"
]

export function HowWeWorkSection() {
  return (
    <section className="relative bg-navy text-offwhite min-h-screen flex items-center">
      <GridLines />
      
      {/* Column structure */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
        <div className="grid grid-cols-12 gap-8">
          {/* Left column */}
          <div className="col-span-12 lg:col-span-6 space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-sm uppercase tracking-wider text-gray-400 mb-4">
                {words[0]}
              </h2>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <h3 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-offwhite leading-tight">
                {words[1]}
              </h3>
            </motion.div>
          </div>

          {/* Right column */}
          <div className="col-span-12 lg:col-span-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="space-y-6"
            >
              <p className="text-lg text-gray-300 leading-relaxed">
                We're a hands-on team of AI consultants focused on helping small and mid-size businesses use automation where it matters most. We cut through the noise and implement it with no disruption.
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}




