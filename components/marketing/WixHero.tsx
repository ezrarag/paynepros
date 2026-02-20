import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"

interface WixHeroProps {
  title?: string
  paragraphs?: string[]
  imageSrc?: string
}

export function WixHero({
  title = "YOUR SUCCESS IS OUR GOAL",
  paragraphs = [
    "WE ARE DEDICATED TO HELPING BUSINESSES SUCCEED. OUR MOTIVATION LIES IN ASSISTING ORGANIZATIONS LIKE YOURS IN REACHING THEIR GOALS.",
    "OUR MISSION IS TO STREAMLINE BUSINESS CHALLENGES, ALLOWING YOU TO CONCENTRATE ON WHAT TRULY MATTERS-RUNNING YOUR BUSINESS.",
    "WITH CUSTOMIZED SOLUTIONS AND A COMMITTED TEAM, WE HELP TO ENSURE YOUR OPERATIONS RUN SMOOTHLY, EFFICIENTLY, AND CONFIDENTLY. WHETHER YOU NEED HELP WITH FINANCIAL, TAX NAVIGATION, OR EXPERT ADVICE, WE'RE HERE TO SIMPLIFY YOUR JOURNEY.",
    "REACH OUT TO US TODAY TO SET UP A DISCOVERY CALL AND DISCOVER HOW PAYNE PROFESSIONAL SERVICES CAN SUPPORT YOUR SUCCESS.",
  ],
  imageSrc = "https://firebasestorage.googleapis.com/v0/b/readyaimgo-clients-temp.firebasestorage.app/o/paynepros%2FContent%2Fpaynepros.png?alt=media&token=f088adf0-e08a-41e4-8b24-adaee3b813ff",
}: WixHeroProps) {
  return (
    <section className="relative min-h-[52vh] overflow-hidden border-t border-[#c8c0ad]">
      <Image
        src={imageSrc}
        alt="Payne Professional Services office"
        fill
        className="object-cover"
        priority
      />
      <div className="absolute inset-0 bg-[#f5f4ef]/73" />

      <div className="relative z-10 mx-auto flex min-h-[52vh] max-w-6xl flex-col items-center justify-center px-6 py-14 text-center">
        <h1 className="text-4xl tracking-[0.02em] text-[#111111] sm:text-6xl">
          {title}
        </h1>

        <div className="mt-8 max-w-5xl space-y-6">
          {paragraphs.slice(0, 3).map((paragraph) => (
            <p key={paragraph} className="text-[15px] leading-[1.7] tracking-[0.01em] text-[#151515] sm:text-[18px]">
              {paragraph}
            </p>
          ))}
        </div>

        <p className="mt-3 text-3xl text-[#6f6a58]">+</p>

        <p className="mt-2 max-w-5xl text-[15px] leading-[1.7] tracking-[0.01em] text-[#151515] sm:text-[18px]">
          {paragraphs[3]}
        </p>

        <div className="mt-4 w-full border border-[#d8d5cd] bg-[#f8f8f6]/90 p-3 sm:p-4">
          <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-center gap-4 sm:justify-between">
            <Button
              asChild
              variant="outline"
              className="h-auto min-w-[170px] rounded-none border-[#5a5956] bg-white px-8 py-4 text-[12px] tracking-[0.08em] text-[#2d2c2a] hover:bg-[#f7f7f7]"
            >
              <Link href="/services">OUR SERVICES</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="h-auto min-w-[170px] rounded-none border-[#5a5956] bg-white px-8 py-4 text-[12px] tracking-[0.08em] text-[#2d2c2a] hover:bg-[#f7f7f7]"
            >
              <Link href="/contact">CONTACT US</Link>
            </Button>
          </div>
          <div className="mx-auto mt-3 h-[2px] w-6 bg-[#b0a46e]" />
        </div>
      </div>
    </section>
  )
}
