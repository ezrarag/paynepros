import * as React from "react"
import { cn } from "@/lib/utils"

interface PageTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  children: React.ReactNode
  className?: string
}

export function PageTitle({ children, className, ...props }: PageTitleProps) {
  return (
    <h1
      className={cn(
        "text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-left mb-6",
        className
      )}
      {...props}
    >
      {children}
    </h1>
  )
}

interface PageDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {
  children: React.ReactNode
  className?: string
}

export function PageDescription({
  children,
  className,
  ...props
}: PageDescriptionProps) {
  return (
    <p
      className={cn(
        "text-lg sm:text-xl text-muted-foreground text-left max-w-3xl",
        className
      )}
      {...props}
    >
      {children}
    </p>
  )
}


