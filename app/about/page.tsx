import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function AboutPage() {
  return (
    <section className="mx-auto max-w-5xl px-6 py-16 sm:py-20">
      <div className="text-center">
        <h1 className="wix-display text-4xl tracking-[0.11em] text-[#2f2a22] sm:text-5xl">ABOUT US</h1>
        <p className="mx-auto mt-5 max-w-2xl text-[15px] leading-8 text-[#5d5547]">
          Trusted tax preparation and bookkeeping with a practical, client-first process.
        </p>
      </div>

      <div className="mt-14 space-y-4">
        <article className="border border-[#ddd5c7] bg-[#fbf9f4] px-6 py-8 sm:px-8">
          <h2 className="wix-display text-[29px] tracking-[0.06em] text-[#2f2a22]">Our Mission</h2>
          <p className="mt-3 text-[15px] leading-8 text-[#5d5547]">
            Payne Professional Services is committed to helping clients stay compliant and organized with
            accurate tax preparation and dependable bookkeeping support throughout the year.
          </p>
        </article>

        <article className="border border-[#ddd5c7] bg-[#fbf9f4] px-6 py-8 sm:px-8">
          <h2 className="wix-display text-[29px] tracking-[0.06em] text-[#2f2a22]">What We Provide</h2>
          <ul className="mt-4 space-y-2 text-[15px] leading-7 text-[#5d5547]">
            <li>Individual and joint tax return preparation</li>
            <li>Past-due filing and cleanup support</li>
            <li>Extensions and amended return support</li>
            <li>Year-round bookkeeping services</li>
            <li>Ongoing guidance for planning and compliance</li>
          </ul>
        </article>
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
