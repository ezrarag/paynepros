import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Privacy Policy | PaynePros",
  description: "Learn how PaynePros LLC collects, uses, and protects your information.",
}

export default function PrivacyPage() {
  return (
    <section className="mx-auto max-w-4xl px-4 py-14 sm:px-6 sm:py-20">
      <header>
        <h1 className="wix-display text-4xl tracking-[0.08em] text-[#2f2a22] sm:text-5xl">Privacy Policy</h1>
        <p className="mt-5 text-[15px] leading-8 text-[#5d5547]">
          This Privacy Policy explains how PaynePros LLC collects, uses, stores, and protects personal and financial
          information when you use our services.
        </p>
      </header>

      <div className="mt-10 space-y-10 text-[15px] leading-8 text-[#5d5547]">
        <article>
          <h2 className="wix-display text-2xl tracking-[0.06em] text-[#2f2a22]">Information We Collect</h2>
          <p className="mt-3">
            We may collect account details, contact information, billing information, and financial records you provide
            through our platform, including data made available through connected accounting tools.
          </p>
        </article>

        <article>
          <h2 className="wix-display text-2xl tracking-[0.06em] text-[#2f2a22]">How We Use Information</h2>
          <p className="mt-3">
            Information is used to deliver bookkeeping and financial operations support, maintain your account, respond
            to service requests, improve platform performance, and comply with legal and regulatory requirements.
          </p>
        </article>

        <article>
          <h2 className="wix-display text-2xl tracking-[0.06em] text-[#2f2a22]">
            QuickBooks and Third-Party Integrations
          </h2>
          <p className="mt-3">
            If you connect QuickBooks or other third-party services, we access only the data needed to provide agreed
            services. Integration data is processed under each provider&apos;s permissions framework and your authorized
            connection settings.
          </p>
        </article>

        <article>
          <h2 className="wix-display text-2xl tracking-[0.06em] text-[#2f2a22]">Data Security</h2>
          <p className="mt-3">
            We use administrative, technical, and physical safeguards designed to protect sensitive financial and
            personal data from unauthorized access, loss, misuse, or disclosure.
          </p>
        </article>

        <article>
          <h2 className="wix-display text-2xl tracking-[0.06em] text-[#2f2a22]">Cookies</h2>
          <p className="mt-3">
            We use cookies and similar technologies to support authentication, improve site performance, and understand
            usage patterns. You may control cookie preferences through your browser settings.
          </p>
        </article>

        <article>
          <h2 className="wix-display text-2xl tracking-[0.06em] text-[#2f2a22]">User Rights</h2>
          <p className="mt-3">
            Subject to applicable law, users may request access, correction, or deletion of personal data and may
            request information about how data is processed within our services.
          </p>
        </article>

        <article>
          <h2 className="wix-display text-2xl tracking-[0.06em] text-[#2f2a22]">Contact Information</h2>
          <p className="mt-3">
            For privacy questions or requests, contact PaynePros LLC at{" "}
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
