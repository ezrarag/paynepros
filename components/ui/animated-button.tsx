"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface AnimatedButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode
  className?: string
}

export function AnimatedButton({ children, className, ...props }: AnimatedButtonProps) {
  const [isHovered, setIsHovered] = React.useState(false)

  return (
    <button
      {...props}
      className={cn(
        "relative overflow-hidden w-full h-14 text-base font-medium rounded-md transition-colors",
        "bg-navy text-offwhite hover:bg-navy-light",
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative h-full flex items-center justify-center">
        {/* Original text - slides down on hover */}
        <motion.span
          className="block"
          animate={{
            y: isHovered ? "100%" : 0,
            opacity: isHovered ? 0 : 1,
          }}
          transition={{
            duration: 0.35,
            ease: [0.4, 0, 0.2, 1],
          }}
        >
          {children}
        </motion.span>
        
        {/* Duplicate text that slides down from above on hover */}
        <motion.span
          className="absolute block"
          initial={{ y: "-100%", opacity: 0 }}
          animate={{
            y: isHovered ? 0 : "-100%",
            opacity: isHovered ? 1 : 0,
          }}
          transition={{
            duration: 0.35,
            ease: [0.4, 0, 0.2, 1],
          }}
        >
          {children}
        </motion.span>
      </div>
    </button>
  )
}

