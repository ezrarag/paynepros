import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Terms of Service | PaynePros",
  description: "Terms and conditions for using PaynePros LLC services and integrations.",
}

export default function TermsPage() {
  return (
    <section className="mx-auto max-w-4xl px-4 py-14 sm:px-6 sm:py-20">
      <header>
        <h1 className="wix-display text-4xl tracking-[0.08em] text-[#2f2a22] sm:text-5xl">Terms of Service</h1>
        <p className="mt-5 text-[15px] leading-8 text-[#5d5547]">
          These Terms of Service and End User License Agreement govern your use of services provided by PaynePros LLC.
        </p>
      </header>

      <div className="mt-10 space-y-10 text-[15px] leading-8 text-[#5d5547]">
        <article>
          <h2 className="wix-display text-2xl tracking-[0.06em] text-[#2f2a22]">Acceptance of Terms</h2>
          <p className="mt-3">
            By accessing or using our platform, you agree to these terms and any applicable policies referenced within
            this agreement.
          </p>
        </article>

        <article>
          <h2 className="wix-display text-2xl tracking-[0.06em] text-[#2f2a22]">Account Responsibilities</h2>
          <p className="mt-3">
            You are responsible for maintaining the confidentiality of login credentials, ensuring account information
            is accurate, and notifying us of any unauthorized access to your account.
          </p>
        </article>

        <article>
          <h2 className="wix-display text-2xl tracking-[0.06em] text-[#2f2a22]">Use of Financial Integrations</h2>
          <p className="mt-3">
            You authorize PaynePros LLC to process financial records and connected data solely for service delivery,
            reporting support, and bookkeeping workflows requested through your account.
          </p>
        </article>

        <article>
          <h2 className="wix-display text-2xl tracking-[0.06em] text-[#2f2a22]">API Integrations (QuickBooks)</h2>
          <p className="mt-3">
            When enabled, QuickBooks API integrations are used to retrieve and sync permitted accounting data. You are
            responsible for maintaining valid third-party permissions and complying with Intuit platform requirements.
          </p>
        </article>

        <article>
          <h2 className="wix-display text-2xl tracking-[0.06em] text-[#2f2a22]">Limitation of Liability</h2>
          <p className="mt-3">
            To the extent permitted by law, PaynePros LLC is not liable for indirect, incidental, special, or
            consequential damages arising from use of the services, third-party platforms, or interruptions in access.
          </p>
        </article>

        <article>
          <h2 className="wix-display text-2xl tracking-[0.06em] text-[#2f2a22]">Service Availability</h2>
          <p className="mt-3">
            We aim to provide reliable service, but availability may be affected by maintenance, security events,
            provider downtime, or circumstances beyond our control.
          </p>
        </article>

        <article>
          <h2 className="wix-display text-2xl tracking-[0.06em] text-[#2f2a22]">Termination</h2>
          <p className="mt-3">
            We may suspend or terminate access for violations of these terms, misuse of integrations, non-payment, or
            security concerns. You may discontinue use at any time subject to outstanding obligations.
          </p>
        </article>

        <article>
          <h2 className="wix-display text-2xl tracking-[0.06em] text-[#2f2a22]">Governing Law</h2>
          <p className="mt-3">
            These terms are governed by applicable laws in the jurisdiction where PaynePros LLC is organized, without
            regard to conflict of law principles.
          </p>
        </article>

        <article>
          <h2 className="wix-display text-2xl tracking-[0.06em] text-[#2f2a22]">Contact Information</h2>
          <p className="mt-3">
            Questions about these terms may be sent to{" "}
            <a href="mailto:contact@paynepros.com" className="underline decoration-[#c8c0ad] underline-offset-4">
              contact@paynepros.com
            </a>
            .
          </p>
        </article>
      </div>
    </section>
  )
}
