"use client"

import Image from "next/image"
import Link from "next/link"
import { BookOpen, BriefcaseBusiness, ChevronsRight, FileText, Lightbulb, Search } from "lucide-react"
import { Fragment } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { IntakeForm } from "@/components/IntakeForm"
import { defaultHomeSections, type HomeSectionContent } from "@/lib/marketing/home-content"

const FALLBACK_IMAGE_SRC =
  "https://firebasestorage.googleapis.com/v0/b/readyaimgo-clients-temp.firebasestorage.app/o/paynepros%2FContent%2F593ab9_e77bf4687f5840489d7bd47e7d62582d~mv2.avif?alt=media&token=54def002-cf77-4ce0-b455-e85a3c05a26d"

const CONNECT_IMAGE_SRC =
  "https://firebasestorage.googleapis.com/v0/b/readyaimgo-clients-temp.firebasestorage.app/o/paynepros%2FContent%2F593ab9_549b771892524f1a9466b07c473d4dfc~mv2.avif?alt=media&token=2724bcbd-b196-4616-a2ee-6ea01eb86fd4"

const safeImageSrc = (src?: string) => (src && src.trim() ? src : FALLBACK_IMAGE_SRC)
const sectionShell = "h-full w-full shrink-0 snap-start overflow-hidden"
const sectionFrame = "mx-auto h-full w-full max-w-6xl px-4 py-7 sm:px-6 sm:py-8"

interface HomeSectionsProps {
  sections?: HomeSectionContent[]
}

function renderHero(section: HomeSectionContent) {
  return (
    <section className={`${sectionShell} relative`}>
      <Image
        src={safeImageSrc(section.imageSrc)}
        alt={section.imageAlt}
        width={1920}
        height={1080}
        className="absolute inset-0 h-full w-full object-cover blur-[3px]"
        priority
      />
      <div className="absolute inset-0 bg-[#f5f4ef]/83" />
      <div className={sectionFrame + " relative z-10 flex items-center overflow-y-auto"}>
        <div className="w-full rounded-xl border border-[#d6d0bf] bg-[#f8f6ef]/94 p-5 sm:p-7">
          <p className="text-xs tracking-[0.18em] text-[#5d5547]">PAYNE PROFESSIONAL SERVICES</p>
          <h1 className="mt-3 text-[30px] leading-[1.08] tracking-[0.01em] text-[#111111] sm:text-[42px]">
            {section.title}
          </h1>
          <div className="mt-5 max-w-3xl space-y-3">
            {section.body.slice(0, 3).map((line, index) => (
              <p key={`${section.id}-hero-${index}`} className="text-[15px] leading-[1.55] text-[#4c4639] sm:text-[16px]">
                {line}
              </p>
            ))}
          </div>
          {(section.ctaPrimaryHref || section.ctaSecondaryHref) && (
            <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs tracking-[0.16em]">
              {section.ctaPrimaryHref && section.ctaPrimaryLabel && (
                <Link href={section.ctaPrimaryHref} className="text-[#2f2a22] underline-offset-4 hover:underline">
                  {section.ctaPrimaryLabel}
                </Link>
              )}
              {section.ctaSecondaryHref && section.ctaSecondaryLabel && (
                <Link href={section.ctaSecondaryHref} className="text-[#5d5547] underline-offset-4 hover:text-[#2f2a22] hover:underline">
                  {section.ctaSecondaryLabel}
                </Link>
              )}
            </div>
          )}

          <div className="mt-5 grid gap-2 sm:grid-cols-3">
            <div className="border border-[#d2ccb8] bg-[#fffdf7] px-3 py-2 text-[11px] tracking-[0.12em] text-[#5d5547]">YEAR-ROUND SUPPORT</div>
            <div className="border border-[#d2ccb8] bg-[#fffdf7] px-3 py-2 text-[11px] tracking-[0.12em] text-[#5d5547]">CLEAR NEXT STEPS</div>
            <div className="border border-[#d2ccb8] bg-[#fffdf7] px-3 py-2 text-[11px] tracking-[0.12em] text-[#5d5547]">PRACTICAL GUIDANCE</div>
          </div>
        </div>

      </div>
    </section>
  )
}

function renderSplit(section: HomeSectionContent) {
  return (
    <section className={`${sectionShell} bg-[#efefee]`}>
      <div className={sectionFrame + " grid items-center gap-6 overflow-y-auto lg:grid-cols-[1fr_1fr]"}>
        <div className="rounded-xl border border-[#d2ccb8] bg-[#f8f6ef] p-5 sm:p-7">
          <p className="text-xs tracking-[0.18em] text-[#5d5547]">ABOUT OUR TEAM</p>
          <h2 className="mt-2 text-[30px] leading-none tracking-[0.01em] text-[#151515] sm:text-[40px]">
            {section.title}
          </h2>
          <div className="mt-3 h-[4px] w-[220px] bg-[#a8a37f]" />
          <div className="mt-2 h-[1px] w-[220px] bg-[#bdb89d]" />
          {section.subtitle ? <p className="mt-4 text-[15px] leading-[1.5] text-[#4c4639]">{section.subtitle}</p> : null}
          {section.bullets.length > 0 ? (
            <div className="mt-5 grid gap-3">
              {section.bullets.map((bullet, index) => (
                <div key={`${section.id}-bullet-${index}`} className="border border-[#dcd6c5] bg-[#fffdf7] px-3 py-2 text-[14px] leading-[1.45] text-[#2f2a22]">
                  {bullet}
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-5 space-y-3">
              {section.body.map((line, index) => (
                <p key={`${section.id}-line-${index}`} className="text-[15px] leading-[1.5] text-[#4c4639]">
                  {line}
                </p>
              ))}
            </div>
          )}
        </div>
        <Card className="overflow-hidden border-[#d2ccb8] bg-[#f8f6ef]">
          <CardContent className="p-0">
            <div className="relative h-[280px] w-full sm:h-[360px] lg:h-[430px]">
              <Image src={safeImageSrc(section.imageSrc)} alt={section.imageAlt} fill className="object-cover" />
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}

function renderServices(section: HomeSectionContent) {
  const cards = section.serviceCards ?? []
  const serviceIcons = [FileText, BookOpen, BriefcaseBusiness, Search, Lightbulb]
  return (
    <section className={`${sectionShell} bg-[#efede4]`}>
      <div className={sectionFrame + " flex flex-col overflow-y-auto"}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-3xl">
            <p className="text-xs tracking-[0.18em] text-[#5d5547]">SERVICES</p>
            <h2 className="mt-2 text-[30px] leading-[1.08] text-[#111111] sm:text-[40px]">{section.title}</h2>
            {section.subtitle ? <p className="mt-3 text-[15px] leading-[1.5] text-[#4c4639]">{section.subtitle}</p> : null}
          </div>
          {section.ctaPrimaryHref && section.ctaPrimaryLabel ? (
            <Button asChild className="rounded-none bg-[#2f2a22] px-6 py-4 text-xs tracking-[0.14em] text-[#f8f5ef] hover:bg-[#1f1b15]">
              <Link href={section.ctaPrimaryHref}>{section.ctaPrimaryLabel}</Link>
            </Button>
          ) : null}
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {cards.slice(0, 4).map((card, index) => (
            <Card key={`${section.id}-service-${index}`} className="border-[#d2ccb8] bg-[#f8f6ef]">
              <CardHeader className="pb-2">
                <div className="mb-2 flex items-center gap-2 text-[#7f785c]">
                  {(() => {
                    const Icon = serviceIcons[index] ?? Lightbulb
                    return <Icon className="h-4 w-4" />
                  })()}
                  <span className="text-[11px] tracking-[0.16em]">SERVICE {index + 1}</span>
                </div>
                <CardTitle className="text-[23px] leading-none text-[#1a1a1a]">{card.title}</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-[15px] leading-[1.48] text-[#4c4639]">{card.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

function renderConnect(section: HomeSectionContent) {
  return (
    <section className={`${sectionShell} bg-[#ece9de]`}>
      <div className={sectionFrame + " flex flex-col overflow-y-auto"}>
        <div>
          <p className="text-xs tracking-[0.18em] text-[#5d5547]">CONTACT</p>
          <h2 className="mt-2 text-[30px] leading-none tracking-[0.01em] text-[#151515] sm:text-[40px]">{section.title}</h2>
          {section.subtitle ? (
            <p className="mt-3 max-w-3xl text-[15px] leading-[1.5] text-[#4c4639] sm:text-[16px]">
              {section.subtitle}
            </p>
          ) : null}
        </div>

        <div className="mt-5 grid min-h-0 flex-1 gap-5 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="space-y-4">
            <Card className="border-[#d2ccb8] bg-[#f8f6ef]">
              <CardContent className="p-4">
                <p className="text-xs tracking-[0.16em] text-[#5d5547]">PHONE</p>
                <a href="tel:+18168051433" className="mt-2 block text-[20px] text-[#1f1f1f] hover:text-[#2f2a22]">
                  816-805-1433
                </a>
              </CardContent>
            </Card>
            <Card className="border-[#d2ccb8] bg-[#f8f6ef]">
              <CardContent className="p-4">
                <p className="text-xs tracking-[0.16em] text-[#5d5547]">EMAIL</p>
                <a href="mailto:taxprep@paynepros.com" className="mt-2 block break-words text-[18px] text-[#1f1f1f] hover:text-[#2f2a22]">
                  taxprep@paynepros.com
                </a>
              </CardContent>
            </Card>
            <Card className="overflow-hidden border-[#d2ccb8] bg-[#f8f6ef]">
              <CardContent className="p-0">
                <div className="relative h-[150px] w-full">
                  <Image src={CONNECT_IMAGE_SRC} alt="Consultation call in progress" fill className="object-cover" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="min-h-0 border-[#d2ccb8] bg-[#f9f7f1] shadow-none">
            <CardHeader className="pb-3">
              <CardTitle className="text-[18px] tracking-[0.01em] text-[#1f1f1f]">Send us a message</CardTitle>
            </CardHeader>
            <CardContent className="min-h-0 overflow-y-auto">
              <div className="[&_form]:space-y-4 [&_input]:h-10 [&_input]:text-sm [&_textarea]:min-h-[90px] [&_textarea]:text-sm [&_label]:text-[11px] [&_label]:tracking-[0.12em] [&_[role=combobox]]:h-10 [&_button[type=submit]]:py-3 [&_button[type=submit]]:text-xs [&_button[type=submit]]:tracking-[0.14em]">
                <IntakeForm brand="paynepros" source="website" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}

function renderBenefits(section: HomeSectionContent) {
  const cards = section.benefitCards ?? []
  return (
    <section className={`${sectionShell} relative bg-[#ece9de]`}>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(255,255,255,0.7),rgba(255,255,255,0)_45%),linear-gradient(135deg,#e6e2d3_0%,#dfdbc8_46%,#d3cfbf_46%,#d3cfbf_100%)]" />
      <div className={sectionFrame + " relative grid h-full grid-cols-1 gap-8 overflow-y-auto lg:grid-cols-[1.2fr_0.8fr]"}>
        <div className="flex min-h-0 flex-col">
          <h2 className="max-w-3xl text-[30px] leading-[1.08] tracking-[0.02em] text-[#121212] sm:text-[44px]">
            {section.title}
          </h2>
          <div className="mt-4 h-[4px] w-[340px] max-w-full bg-[#a8a37f]" />
          <div className="mt-2 h-[1px] w-[340px] max-w-full bg-[#bdb89d]" />

          <div className="mt-6 grid gap-4">
            {cards.slice(0, 3).map((card, index) => (
              <Card
                key={`${section.id}-benefit-${index}`}
                className="border-[#d2ccb7] bg-[#f8f6ef] shadow-[0_8px_22px_rgba(35,30,20,0.12)]"
              >
                <CardContent className="p-4 sm:p-5">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 rounded-full bg-[#efebdc] p-1.5">
                      <ChevronsRight className="h-5 w-5 text-[#9f9872]" />
                    </div>
                    <div>
                      <h3 className="text-[24px] font-semibold leading-none text-[#171717] sm:text-[30px]">
                        {card.title}
                      </h3>
                      <p className="mt-2 text-[16px] leading-[1.35] tracking-[0.01em] text-[#2f4376] sm:text-[20px]">
                        {card.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="flex min-h-0 flex-col justify-center">
          <Card className="overflow-hidden border-[#b8b19a] bg-[#fffdf7]">
            <CardContent className="p-0">
              <div className="relative h-[240px] w-full sm:h-[320px]">
                <Image src={safeImageSrc(section.imageSrc)} alt={section.imageAlt} fill className="object-cover" />
              </div>
            </CardContent>
          </Card>
          <p className="mt-4 text-[12px] uppercase tracking-[0.18em] text-[#5c5648]">
            Practical support. Clear process. Reliable outcomes.
          </p>
        </div>
      </div>
    </section>
  )
}

export function HomeSections({ sections = defaultHomeSections }: HomeSectionsProps) {
  const visible = sections.filter((section) => section.enabled)
  const rendered = visible.length > 0 ? visible : defaultHomeSections

  return (
    <div className="h-full w-full overflow-y-auto snap-y snap-mandatory bg-[#f4f4f4]">
      {rendered.map((section) => {
        if (section.variant === "hero") return <Fragment key={section.id}>{renderHero(section)}</Fragment>
        if (section.variant === "services") return <Fragment key={section.id}>{renderServices(section)}</Fragment>
        if (section.variant === "connect") return <Fragment key={section.id}>{renderConnect(section)}</Fragment>
        if (section.variant === "benefits") return <Fragment key={section.id}>{renderBenefits(section)}</Fragment>
        return <Fragment key={section.id}>{renderSplit(section)}</Fragment>
      })}
    </div>
  )
}
