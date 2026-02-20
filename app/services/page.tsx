import Link from "next/link"
import { Button } from "@/components/ui/button"

const services = [
  {
    id: "individual",
    title: "Individual Tax Preparation",
    description:
      "Comprehensive preparation for W-2 and 1099 income, with careful review of deductions and credits.",
  },
  {
    id: "joint",
    title: "Joint / Family Returns",
    description:
      "Strategic filing for married couples and families, including dependents, credits, and education tax items.",
  },
  {
    id: "past-due",
    title: "Past-Due / Cleanup",
    description:
      "Catch-up filing for previous years with practical support to resolve outstanding tax issues.",
  },
  {
    id: "bookkeeping",
    title: "Bookkeeping",
    description:
      "Year-round bookkeeping services to keep records organized and ready for tax season.",
  },
  {
    id: "extensions",
    title: "Extensions & Amendments",
    description:
      "Extension filing and amended returns for corrections, missed deductions, and compliance updates.",
  },
]

export default function ServicesPage() {
  return (
    <section className="mx-auto max-w-5xl px-6 py-16 sm:py-20">
      <div className="text-center">
        <h1 className="wix-display text-4xl tracking-[0.11em] text-[#2f2a22] sm:text-5xl">
          SERVICES
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-[15px] leading-8 text-[#5d5547]">
          Tax preparation and bookkeeping solutions designed for clarity, compliance, and confidence.
        </p>
      </div>

      <div className="mt-14 space-y-4">
        {services.map((service) => (
          <article
            id={service.id}
            key={service.id}
            className="border border-[#ddd5c7] bg-[#fbf9f4] px-6 py-8 sm:px-8"
          >
            <h2 className="wix-display text-[29px] tracking-[0.06em] text-[#2f2a22]">{service.title}</h2>
            <p className="mt-3 max-w-3xl text-[15px] leading-7 text-[#5d5547]">{service.description}</p>
          </article>
        ))}
      </div>

      <div className="mt-12 flex flex-wrap items-center justify-center gap-3">
        <Button asChild className="rounded-none bg-[#2f2a22] px-7 py-6 text-[#f8f5ef] hover:bg-[#1f1b15]">
          <Link href="/book">Book Consultation</Link>
        </Button>
        <Button
          asChild
          variant="outline"
          className="rounded-none border-[#2f2a22] bg-transparent px-7 py-6 text-[#2f2a22] hover:bg-[#2f2a22] hover:text-[#f8f5ef]"
        >
          <Link href="/contact">Contact Us</Link>
        </Button>
      </div>
    </section>
  )
}
