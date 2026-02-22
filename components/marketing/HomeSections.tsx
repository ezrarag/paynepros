"use client"

import Image from "next/image"
import Link from "next/link"
import { Fragment } from "react"
import { ChevronsRight, Gem } from "lucide-react"
import { Button } from "@/components/ui/button"
import { defaultHomeSections, type HomeSectionContent } from "@/lib/marketing/home-content"

const FALLBACK_IMAGE_SRC =
  "https://firebasestorage.googleapis.com/v0/b/readyaimgo-clients-temp.firebasestorage.app/o/paynepros%2FContent%2F593ab9_e77bf4687f5840489d7bd47e7d62582d~mv2.avif?alt=media&token=54def002-cf77-4ce0-b455-e85a3c05a26d"

const safeImageSrc = (src?: string) => (src && src.trim() ? src : FALLBACK_IMAGE_SRC)

interface HomeSectionsProps {
  sections?: HomeSectionContent[]
}

function renderHeroSection(section: HomeSectionContent) {
  return (
    <section className="relative h-full w-full shrink-0 snap-start overflow-hidden">
      <Image
        src={safeImageSrc(section.imageSrc)}
        alt={section.imageAlt}
        width={1920}
        height={1080}
        className="absolute inset-0 h-full w-full scale-105 object-cover blur-[4px]"
        priority
      />
      <div className="absolute inset-0 bg-[#f5f4ef]/86" />
      <div className="absolute inset-0 bg-[#8c8469]/12" />

      <div className="relative z-10 mx-auto flex h-full w-full max-w-6xl flex-col items-center justify-center px-6 py-8 text-center">
        <h1 className="wix-heading text-[35px] leading-[1.15] tracking-[0.02em] text-[#111111] sm:text-[52px]">
          {section.title}
        </h1>

        <div className="mt-8 max-w-5xl space-y-5">
          {section.body.map((line, index) => (
            <p
              key={`${section.id}-hero-${index}`}
              className="text-[17px] leading-[1.65] tracking-[0.01em] text-[#151515] sm:text-[18px]"
            >
              {line}
            </p>
          ))}
        </div>

        {(section.ctaPrimaryHref || section.ctaSecondaryHref) && (
          <div className="mt-8 w-full max-w-3xl border border-[#d8d5cd] bg-[#f8f8f6]/92 p-3 sm:p-4">
            <div className="mx-auto flex flex-wrap items-center justify-center gap-4 sm:justify-between">
              {section.ctaPrimaryHref && section.ctaPrimaryLabel && (
                <Button
                  asChild
                  variant="outline"
                  className="h-auto min-w-[170px] rounded-none border-[#5a5956] bg-white px-8 py-4 text-[12px] tracking-[0.08em] text-[#2d2c2a] hover:bg-[#f7f7f7]"
                >
                  <Link href={section.ctaPrimaryHref}>{section.ctaPrimaryLabel}</Link>
                </Button>
              )}
              {section.ctaSecondaryHref && section.ctaSecondaryLabel && (
                <Button
                  asChild
                  variant="outline"
                  className="h-auto min-w-[170px] rounded-none border-[#5a5956] bg-white px-8 py-4 text-[12px] tracking-[0.08em] text-[#2d2c2a] hover:bg-[#f7f7f7]"
                >
                  <Link href={section.ctaSecondaryHref}>{section.ctaSecondaryLabel}</Link>
                </Button>
              )}
            </div>
            <div className="mx-auto mt-3 h-[2px] w-6 bg-[#AAA47F]" />
          </div>
        )}
      </div>
    </section>
  )
}

function renderSplitSection(section: HomeSectionContent) {
  return (
    <section className="relative h-full w-full shrink-0 snap-start overflow-hidden bg-[#efefee]">
      <div className="mx-auto grid h-full w-full max-w-6xl items-center gap-10 px-6 py-10 lg:grid-cols-[1.05fr_1fr]">
        <div>
          <h2 className="wix-heading text-[35px] leading-none tracking-[0.02em] text-[#0d0d0d] sm:text-[48px]">
            {section.title}
          </h2>
          <div className="mt-4 h-[3px] w-[140px] bg-[#a7a178]" />
          <div className="mt-2 h-[1px] w-[140px] bg-[#bfb79a]" />
          {section.subtitle ? (
            <p className="mt-5 text-[16px] tracking-[0.08em] text-[#5e5a4d]">{section.subtitle}</p>
          ) : null}

          {section.bullets.length > 0 ? (
            <ul className="mt-12 space-y-8 text-[18px] leading-[1.35] tracking-[0.02em] text-[#141414] sm:text-[24px]">
              {section.bullets.map((bullet, index) => (
                <li key={`${section.id}-bullet-${index}`} className="list-disc">
                  {bullet}
                </li>
              ))}
            </ul>
          ) : (
            <div className="mt-12 space-y-5 text-[18px] leading-[1.45] tracking-[0.02em] text-[#141414] sm:text-[24px]">
              {section.body.map((line, index) => (
                <p key={`${section.id}-body-${index}`}>{line}</p>
              ))}
            </div>
          )}

          {(section.ctaPrimaryHref || section.ctaSecondaryHref) && (
            <div className="mt-10 flex flex-wrap gap-3">
              {section.ctaPrimaryHref && section.ctaPrimaryLabel ? (
                <Button asChild className="rounded-none bg-[#2f2a22] px-7 py-5 text-[#f8f5ef] hover:bg-[#1f1b15]">
                  <Link href={section.ctaPrimaryHref}>{section.ctaPrimaryLabel}</Link>
                </Button>
              ) : null}
              {section.ctaSecondaryHref && section.ctaSecondaryLabel ? (
                <Button
                  asChild
                  variant="outline"
                  className="rounded-none border-[#2f2a22] bg-transparent px-7 py-5 text-[#2f2a22] hover:bg-[#2f2a22] hover:text-[#f8f5ef]"
                >
                  <Link href={section.ctaSecondaryHref}>{section.ctaSecondaryLabel}</Link>
                </Button>
              ) : null}
            </div>
          )}
        </div>

        <div className="relative mx-auto h-[65vh] max-h-[600px] w-full max-w-[680px] overflow-hidden rounded-[48%]">
          <Image src={safeImageSrc(section.imageSrc)} alt={section.imageAlt} fill className="object-cover" />
        </div>
      </div>
    </section>
  )
}

function renderServicesSection(section: HomeSectionContent) {
  const cards = section.serviceCards?.length
    ? section.serviceCards
    : section.bullets.map((bullet) => ({ title: bullet, description: "" }))

  return (
    <section className="relative h-full w-full shrink-0 snap-start overflow-hidden bg-[#f0f0f0]">
      <div className="mx-auto flex h-full w-full max-w-[1500px] flex-col px-6 py-10">
        <div className="mx-auto w-full max-w-5xl">
          <h2 className="wix-heading text-[44px] leading-[1.05] tracking-[0.01em] text-[#060606] sm:text-[72px]">
            {section.title}
          </h2>
          <div className="mt-4 h-[6px] w-[620px] max-w-full bg-[#a8a37f]" />
          <div className="mt-2 h-[2px] w-[620px] max-w-full bg-[#bdb89d]" />
          {section.subtitle ? (
            <p className="mt-10 text-[28px] tracking-[0.01em] text-[#1d2f67] sm:text-[52px]">
              {section.subtitle}
            </p>
          ) : null}
        </div>

        <div className="mt-10 grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-4">
          {cards.slice(0, 4).map((card, index) => (
            <div
              key={`${section.id}-service-${index}`}
              className="relative flex h-[430px] flex-col items-center justify-center rounded-[50%] bg-gradient-to-b from-[#040404] via-[#bdb9a6] to-[#9f9869] px-8 text-center"
            >
              <Gem className="mb-8 h-9 w-9 text-[#b7b082]" />
              <h3 className="text-[44px] font-semibold leading-none text-[#000000]">{card.title}</h3>
              <p className="mt-8 text-[20px] leading-[1.35] text-[#0d0d0d]">{card.description}</p>
            </div>
          ))}
        </div>

        {section.ctaPrimaryHref && section.ctaPrimaryLabel ? (
          <div className="mt-10 flex justify-center">
            <Button
              asChild
              variant="outline"
              className="h-auto min-w-[340px] rounded-[10px] border-[#262626] bg-[#a7a27e] px-12 py-7 text-[22px] tracking-[0.2em] text-[#111111] shadow-[0_4px_12px_rgba(0,0,0,0.2)] hover:bg-[#9d9772]"
            >
              <Link href={section.ctaPrimaryHref}>{section.ctaPrimaryLabel}</Link>
            </Button>
          </div>
        ) : null}
      </div>
    </section>
  )
}

function renderConnectSection(section: HomeSectionContent) {
  const fields = section.formFields?.length ? section.formFields : section.body

  return (
    <section className="relative h-full w-full shrink-0 snap-start overflow-hidden bg-[#c7c4ad]">
      <div className="mx-auto grid h-full w-full max-w-6xl items-center gap-10 px-6 py-10 lg:grid-cols-2">
        <div>
          <h2 className="wix-heading text-[52px] leading-none tracking-[0.01em] text-[#050505]">{section.title}</h2>
          <div className="mt-3 h-[6px] w-[350px] max-w-full bg-[#a8a37f]" />
          <div className="mt-2 h-[2px] w-[350px] max-w-full bg-[#bdb89d]" />

          <div className="mt-8 border-[4px] border-[#101010] bg-[#d7d3c1] p-3">
            <div className="relative h-[420px] w-full">
              <Image src={safeImageSrc(section.imageSrc)} alt={section.imageAlt} fill className="object-cover" />
            </div>
          </div>
        </div>

        <div className="relative bg-[#000000] p-5 shadow-[20px_-16px_0_0_rgba(179,173,137,0.55)]">
          <div className="border border-[#0f0f0f] bg-[#030303] p-6">
            {section.subtitle ? (
              <p className="mb-6 text-[21px] leading-[1.35] text-[#f2f2f2]">{section.subtitle}</p>
            ) : null}
            <div className="space-y-5">
              {fields.map((field, index) => (
                <div key={`${section.id}-field-${index}`} className="space-y-2">
                  <p className="text-[14px] tracking-[0.08em] text-[#cfc7a5]">{field}</p>
                  <div className={index === fields.length - 1 ? "h-[110px] border border-[#d7d7d7]" : "h-[48px] border border-[#d7d7d7]"} />
                </div>
              ))}
            </div>
            <Button
              type="button"
              className="mt-6 w-full rounded-none border border-[#a8a37f] bg-[#040404] py-6 text-[34px] tracking-[0.16em] text-[#a8a37f] hover:bg-[#101010]"
            >
              {section.ctaPrimaryLabel || "SUBMIT"}
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}

function renderBenefitsSection(section: HomeSectionContent) {
  const cards = section.benefitCards?.length
    ? section.benefitCards
    : section.body.map((line) => ({ title: line, description: "" }))

  return (
    <section className="relative h-full w-full shrink-0 snap-start overflow-hidden bg-[#ecece8]">
      <div className="absolute inset-0 bg-[linear-gradient(140deg,#676767_0%,#6b6b6b_52%,#d7d4bf_52%,#d7d4bf_100%)]" />
      <div className="relative mx-auto h-full w-full max-w-6xl px-6 py-10">
        <div className="grid h-full grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
          <div>
            <h2 className="wix-heading max-w-3xl text-[52px] leading-[1.02] tracking-[0.01em] text-[#0f0f0f]">
              {section.title}
            </h2>
            <div className="mt-4 h-[6px] w-[560px] max-w-full bg-[#a8a37f]" />
            <div className="mt-2 h-[2px] w-[560px] max-w-full bg-[#bdb89d]" />

            <div className="mt-12 space-y-6">
              {cards.slice(0, 3).map((card, index) => (
                <div
                  key={`${section.id}-benefit-${index}`}
                  className={`max-w-[860px] rounded-[8px] bg-[#f2f2f2] p-6 shadow-[0_18px_40px_rgba(0,0,0,0.28)] ${
                    index === 0 ? "ml-0" : index === 1 ? "ml-10" : "ml-20"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <ChevronsRight className="mt-1 h-11 w-11 text-[#aaa47d]" />
                    <div>
                      <h3 className="text-[50px] font-semibold leading-none text-[#0e0e0e]">{card.title}</h3>
                      <p className="mt-4 max-w-2xl text-[40px] leading-[1.26] tracking-[0.01em] text-[#2f4376]">
                        {card.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-start justify-center pt-8 lg:justify-end">
            <div className="relative h-[250px] w-[320px] overflow-hidden">
              <Image src={safeImageSrc(section.imageSrc)} alt={section.imageAlt} fill className="object-cover" />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export function HomeSections({ sections = defaultHomeSections }: HomeSectionsProps) {
  const visibleSections = sections.filter((section) => section.enabled)
  const renderedSections = visibleSections.length > 0 ? visibleSections : defaultHomeSections

  return (
    <div className="h-full w-full overflow-y-auto snap-y snap-mandatory bg-[#f4f4f4]">
      {renderedSections.map((section) =>
        <Fragment key={section.id}>
          {section.variant === "hero"
            ? renderHeroSection(section)
            : section.variant === "services"
              ? renderServicesSection(section)
              : section.variant === "connect"
                ? renderConnectSection(section)
                : section.variant === "benefits"
                  ? renderBenefitsSection(section)
                  : renderSplitSection(section)}
        </Fragment>
      )}
    </div>
  )
}
