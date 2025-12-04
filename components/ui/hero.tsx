import * as React from "react"
import { cn } from "@/lib/utils"

interface HeroProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode
  className?: string
}

export function Hero({ children, className, ...props }: HeroProps) {
  return (
    <section
      className={cn(
        "relative py-32 px-4 sm:px-6 lg:px-8",
        className
      )}
      {...props}
    >
      <div className="mx-auto max-w-6xl">
        <div className="max-w-3xl">{children}</div>
      </div>
    </section>
  )
}

interface HeroTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  children: React.ReactNode
  className?: string
}

export function HeroTitle({ children, className, ...props }: HeroTitleProps) {
  return (
    <h1
      className={cn(
        "text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-left",
        "leading-[1.1]",
        className
      )}
      {...props}
    >
      {children}
    </h1>
  )
}

interface HeroDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {
  children: React.ReactNode
  className?: string
}

export function HeroDescription({
  children,
  className,
  ...props
}: HeroDescriptionProps) {
  return (
    <p
      className={cn(
        "mt-6 text-lg sm:text-xl leading-relaxed text-muted-foreground text-left max-w-2xl",
        className
      )}
      {...props}
    >
      {children}
    </p>
  )
}

interface HeroActionsProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  className?: string
}

export function HeroActions({ children, className, ...props }: HeroActionsProps) {
  return (
    <div
      className={cn("mt-10 flex flex-wrap items-center gap-4", className)}
      {...props}
    >
      {children}
    </div>
  )
}




