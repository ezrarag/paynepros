import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"

interface WixHeroProps {
  title?: string
  paragraphs?: string[]
  imageSrc?: string
}

export function WixHero({
  title = "Your success is our goal",
  paragraphs = [
    "We are dedicated to helping businesses succeed. Our motivation lies in assisting organizations like yours in reaching their goals.",
    "Our mission is to streamline business challenges, allowing you to concentrate on what truly matters-running your business.",
    "With customized solutions and a committed team, we help to ensure your operations run smoothly, efficiently, and confidently. Whether you need help with financial, tax navigation, or expert advice, we're here to simplify your journey.",
    "Reach out to us today to set up a discovery call and discover how Payne professional Services can support your success.",
  ],
  imageSrc = "https://firebasestorage.googleapis.com/v0/b/readyaimgo-clients-temp.firebasestorage.app/o/paynepros%2FContent%2F593ab9_e77bf4687f5840489d7bd47e7d62582d~mv2.avif?alt=media&token=54def002-cf77-4ce0-b455-e85a3c05a26d",
}: WixHeroProps) {
  return (
    <section className="relative min-h-[52vh] overflow-hidden">
      <Image
        src={imageSrc}
        alt="Payne Professional Services office"
        fill
        className="scale-105 object-cover blur-[4px]"
        priority
      />
      <div className="absolute inset-0 bg-[#f5f4ef]/84" />
      <div className="absolute inset-0 bg-[#8c8469]/12" />

      <div className="relative z-10 mx-auto flex min-h-[52vh] max-w-6xl flex-col items-center justify-center px-4 py-12 text-center sm:px-6 sm:py-14">
        <h1 className="text-3xl tracking-[0.01em] text-[#111111] sm:text-6xl">
          {title}
        </h1>

        <div className="mt-8 max-w-5xl space-y-6">
          {paragraphs.slice(0, 3).map((paragraph) => (
            <p key={paragraph} className="text-[15px] leading-[1.65] tracking-[0.01em] text-[#151515] sm:text-[18px]">
              {paragraph}
            </p>
          ))}
        </div>

        <p className="mt-2 max-w-5xl text-[15px] leading-[1.65] tracking-[0.01em] text-[#151515] sm:text-[18px]">
          {paragraphs[3]}
        </p>

        <div className="mt-4 w-full border border-[#d8d5cd] bg-[#f8f8f6]/90 p-3 sm:p-4">
          <div className="mx-auto flex max-w-3xl flex-col items-stretch justify-center gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-4">
            <Button
              asChild
              variant="outline"
              className="h-auto w-full rounded-none border-[#5a5956] bg-white px-8 py-4 text-[12px] tracking-[0.08em] text-[#2d2c2a] hover:bg-[#f7f7f7] sm:w-auto sm:min-w-[170px]"
            >
              <Link href="/services">OUR SERVICES</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="h-auto w-full rounded-none border-[#5a5956] bg-white px-8 py-4 text-[12px] tracking-[0.08em] text-[#2d2c2a] hover:bg-[#f7f7f7] sm:w-auto sm:min-w-[170px]"
            >
              <Link href="/contact">CONTACT US</Link>
            </Button>
          </div>
          <div className="mx-auto mt-3 h-[2px] w-6 bg-[#AAA47F]" />
        </div>
      </div>
    </section>
  )
}
