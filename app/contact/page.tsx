import { IntakeForm } from "@/components/IntakeForm"

export default function ContactPage() {
  return (
    <section className="mx-auto max-w-5xl px-6 py-16 sm:py-20">
      <div className="text-center">
        <h1 className="wix-display text-4xl tracking-[0.11em] text-[#2f2a22] sm:text-5xl">CONTACT US</h1>
        <p className="mx-auto mt-5 max-w-2xl text-[15px] leading-8 text-[#5d5547]">
          Reach out anytime. Share your goals and we will follow up with clear next steps.
        </p>
      </div>

      <div className="mt-12 grid gap-4 sm:grid-cols-3">
        <div className="border border-[#ddd5c7] bg-[#fbf9f4] p-6">
          <h2 className="wix-display text-2xl tracking-[0.08em] text-[#2f2a22]">Phone</h2>
          <a href="tel:+18168051433" className="mt-2 block text-[15px] text-[#5d5547] hover:text-[#2f2a22]">
            816-805-1433
          </a>
        </div>
        <div className="border border-[#ddd5c7] bg-[#fbf9f4] p-6">
          <h2 className="wix-display text-2xl tracking-[0.08em] text-[#2f2a22]">Email</h2>
          <a
            href="mailto:taxprep@paynepros.com"
            className="mt-2 block break-words text-[15px] text-[#5d5547] hover:text-[#2f2a22]"
          >
            taxprep@paynepros.com
          </a>
        </div>
        <div className="border border-[#ddd5c7] bg-[#fbf9f4] p-6">
          <h2 className="wix-display text-2xl tracking-[0.08em] text-[#2f2a22]">Hours</h2>
          <p className="mt-2 text-[15px] leading-7 text-[#5d5547]">
            Monday to Friday
            <br />
            9:00 AM - 5:00 PM
          </p>
        </div>
      </div>

      <div className="mt-10 border border-[#ddd5c7] bg-[#fbf9f4] p-6 sm:p-8">
        <IntakeForm brand="paynepros" />
      </div>
    </section>
  )
}
