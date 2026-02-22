import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"

const differentiators = [
  {
    title: "Customized Solutions",
    description:
      "We understand each business is distinct, so we adapt our services to meet your individual needs.",
  },
  {
    title: "Extensive Knowledge",
    description:
      "With expertise in accounting, tax, business strategy, and research, we provide practical insight and experience.",
  },
  {
    title: "Commitment to Collaboration",
    description:
      "We are more than a service provider. We work as part of your team and stay focused on your success.",
  },
]

export default function AboutUsPage() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <header className="border border-[#d7d0c0] bg-[#f7f5ee] px-6 py-10 text-center sm:px-12">
        <p className="text-xs tracking-[0.24em] text-[#7a705f]">A PARTNER IN YOUR SUCCESS</p>
        <h1 className="wix-display mt-3 text-4xl tracking-[0.11em] text-[#2f2a22] sm:text-5xl">ABOUT US</h1>
        <p className="mx-auto mt-6 max-w-3xl text-[15px] leading-8 text-[#5d5547] sm:text-[16px]">
          We are committed to empowering businesses to achieve their objectives and unlock their full
          potential with tools, insights, and expert support.
        </p>
      </header>

      <div className="mt-4 grid gap-4 lg:grid-cols-[1.15fr_1fr]">
        <article className="border border-[#ddd5c7] bg-[#fbf9f4] px-6 py-8 sm:px-8">
          <h2 className="wix-display text-[30px] tracking-[0.06em] text-[#2f2a22]">WE&apos;RE HERE BECAUSE...</h2>
          <div className="mt-4 space-y-4 text-[15px] leading-8 text-[#5d5547]">
            <p>
              We are committed to empowering businesses to achieve their objectives and unlock their full
              potential. Our goal is to provide you with the essential tools, insights, and expert support
              needed for success.
            </p>
            <p>
              With decades of accumulated expertise, we understand the complexities of managing a business in
              today&apos;s dynamic landscape and offer solutions tailored to your unique requirements.
            </p>
            <p>
              Our expertise includes accounting, tax preparation, business consulting, and specialized research
              services, ensuring support at every stage of your journey.
            </p>
          </div>
        </article>

        <div className="relative min-h-[290px] overflow-hidden border border-[#ddd5c7]">
          <Image
            src="https://firebasestorage.googleapis.com/v0/b/readyaimgo-clients-temp.firebasestorage.app/o/paynepros%2FContent%2F593ab9_e77bf4687f5840489d7bd47e7d62582d~mv2.avif?alt=media&token=54def002-cf77-4ce0-b455-e85a3c05a26d"
            alt="Payne Professional Services team"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-[#8c8469]/15" />
        </div>
      </div>

      <article className="mt-4 border border-[#ddd5c7] bg-[#fbf9f4] px-6 py-8 sm:px-8">
        <h2 className="wix-display text-[29px] tracking-[0.06em] text-[#2f2a22]">WE&apos;RE DIFFERENT BECAUSE...</h2>

        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {differentiators.map((item) => (
            <article key={item.title} className="border border-[#ddd5c7] bg-[#f8f6f1] px-6 py-7">
              <h3 className="wix-display text-[24px] tracking-[0.05em] text-[#2f2a22]">{item.title}</h3>
              <p className="mt-3 text-[15px] leading-7 text-[#5d5547]">{item.description}</p>
            </article>
          ))}
        </div>

        <p className="mt-5 text-[15px] leading-7 text-[#5d5547]">
          <span className="font-semibold text-[#3f372d]">Responsive Assistance:</span> Whether for ongoing
          support or a specific project, we deliver prompt, dependable, and professional help.
        </p>
      </article>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <article className="border border-[#ddd5c7] bg-[#fbf9f4] px-6 py-7 sm:px-8">
          <h2 className="wix-display text-[29px] tracking-[0.06em] text-[#2f2a22]">OUR WAY</h2>
          <p className="mt-4 text-[15px] leading-8 text-[#5d5547]">
            Our business is centered around dedication to simplicity, clarity, and results. We focus on
            understanding your goals, evaluating your challenges, and providing practical recommendations that
            foster success.
          </p>
          <p className="mt-3 text-[15px] leading-8 text-[#5d5547]">
            As your reliable partner, we empower you to make confident decisions.
          </p>
        </article>

        <article className="border border-[#ddd5c7] bg-[#fbf9f4] px-6 py-7 sm:px-8">
          <h2 className="wix-display text-[29px] tracking-[0.06em] text-[#2f2a22]">OUR PLEDGE</h2>
          <p className="mt-4 text-[15px] leading-8 text-[#5d5547]">
            Our mission is to fuel your success. We aim to be more than a service provider by being a reliable
            partner in your growth.
          </p>
          <p className="mt-3 text-[15px] leading-8 text-[#5d5547]">
            This allows you to concentrate on what you do best while we support the financial clarity behind it.
          </p>
        </article>
      </div>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Button
          asChild
          className="h-auto rounded-none bg-[#2f2a22] px-7 py-4 text-[12px] tracking-[0.09em] text-[#f8f5ef] hover:bg-[#1f1b15]"
        >
          <Link href="/book">BOOK CONSULTATION</Link>
        </Button>
        <Button
          asChild
          variant="outline"
          className="h-auto rounded-none border-[#2f2a22] bg-transparent px-7 py-4 text-[12px] tracking-[0.09em] text-[#2f2a22] hover:bg-[#2f2a22] hover:text-[#f8f5ef]"
        >
          <Link href="/contact">CONTACT US</Link>
        </Button>
      </div>
    </section>
  )
}
