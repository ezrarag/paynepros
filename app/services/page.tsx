import Link from "next/link"
import { Button } from "@/components/ui/button"

const services = [
  {
    id: "tax-services",
    title: "Tax Services",
    description:
      "Tax preparation can be daunting, but we're here for you. Our tech-driven process ensures your tax forms are accurately filed and compliant. You can relax knowing your taxes are on time, avoiding penalties while maximizing your tax strategy.",
  },
  {
    id: "accounting-services",
    title: "Accounting Services",
    description:
      "We offer a clear view of your business's financial performance through precise bookkeeping and reporting. Our expert guidance helps you make informed decisions for growth. You'll get accurate records that provide the tools and confidence to plan and allocate resources effectively.",
  },
  {
    id: "consultation",
    title: "Consultation",
    description:
      "We are here to help you overcome challenges and seize opportunities. Through detailed analysis, we offer tailored strategies for your business needs. With your approval, we implement these strategies to achieve your goals. You'll get access to expert guidance and support to manage situations and achieve results.",
  },
  {
    id: "research-special-projects",
    title: "Research & Special Projects",
    description:
      "Need help with a project or insights? We offer tailored research and actionable information for decision-making. From market analysis to operational assessments, we provide reliable data and recommendations to help you make confident business decisions.",
  },
]

export default function ServicesPage() {
  return (
    <section className="mx-auto max-w-5xl px-4 py-14 sm:px-6 sm:py-20">
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
          <Link href="/admin/login">Sign In</Link>
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
