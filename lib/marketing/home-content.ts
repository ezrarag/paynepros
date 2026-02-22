export type HomeSectionVariant = "hero" | "split" | "services" | "connect" | "benefits"

export interface HomeServiceCard {
  title: string
  description: string
}

export interface HomeBenefitCard {
  title: string
  description: string
}

export interface HomeSectionContent {
  id: string
  variant: HomeSectionVariant
  title: string
  subtitle?: string
  body: string[]
  bullets: string[]
  imageSrc: string
  imageAlt: string
  ctaPrimaryLabel?: string
  ctaPrimaryHref?: string
  ctaSecondaryLabel?: string
  ctaSecondaryHref?: string
  serviceCards?: HomeServiceCard[]
  benefitCards?: HomeBenefitCard[]
  formFields?: string[]
  enabled: boolean
}

export interface HomeContentDocument {
  page: "home"
  sections: HomeSectionContent[]
  updatedAt: string
  updatedBy: string
}

const nowIso = () => new Date().toISOString()

export const defaultHomeSections: HomeSectionContent[] = [
  {
    id: "home-intro",
    variant: "hero",
    title: "Your success is our goal",
    body: [
      "We are dedicated to helping businesses succeed. Our motivation lies in assisting organizations like yours in reaching their goals.",
      "Our mission is to streamline business challenges, allowing you to concentrate on what truly matters-running your business.",
      "With customized solutions and a committed team, we help ensure your operations run smoothly and confidently.",
    ],
    bullets: [],
    imageSrc:
      "https://firebasestorage.googleapis.com/v0/b/readyaimgo-clients-temp.firebasestorage.app/o/paynepros%2FContent%2F593ab9_e77bf4687f5840489d7bd47e7d62582d~mv2.avif?alt=media&token=54def002-cf77-4ce0-b455-e85a3c05a26d",
    imageAlt: "Payne Professional Services office",
    ctaPrimaryLabel: "OUR SERVICES",
    ctaPrimaryHref: "/services",
    ctaSecondaryLabel: "CONTACT US",
    ctaSecondaryHref: "/contact",
    enabled: true,
  },
  {
    id: "home-we-are",
    variant: "split",
    title: "We Are ...",
    body: [],
    bullets: [
      "A GOAL-DRIVEN TEAM WITH A STRONG EMPHASIS ON CUSTOMER SERVICE",
      "PASSIONATE ABOUT EDUCATING AND EMPOWERING SMALL BUSINESS OWNERS",
      "COMMITTED TO TRANSPARENCY AND CONFIDENTIALITY",
      "EXCITED TO DISCUSSING HOW WE CAN HELP YOU ACHIEVE YOUR BUSINESS OBJECTIVES",
    ],
    imageSrc:
      "https://firebasestorage.googleapis.com/v0/b/readyaimgo-clients-temp.firebasestorage.app/o/paynepros%2FContent%2Fpaynepros.png?alt=media&token=f088adf0-e08a-41e4-8b24-adaee3b813ff",
    imageAlt: "Office planning tools",
    enabled: true,
  },
  {
    id: "home-what-we-deliver",
    variant: "services",
    title: "We Can Help You ...",
    subtitle: "WITH A VARIETY OF SERVICES TAILORED TO FULFILL YOUR BUSINESS REQUIREMENTS.",
    body: [],
    bullets: [],
    serviceCards: [
      {
        title: "Tax",
        description:
          "Streamline your tax responsibilities with our professional preparation and filing services for both business and personal tax forms.",
      },
      {
        title: "Accounting",
        description:
          "Achieve a comprehensive insight into your financial performance through our trustworthy and transparent accounting services.",
      },
      {
        title: "Consultation",
        description:
          "Utilize our insights to make well-informed choices. We examine data, offer practical guidance, and implement with your consent.",
      },
      {
        title: "Custom",
        description:
          "Looking for assistance with a unique challenge or project? We provide comprehensive research and in-depth insights.",
      },
    ],
    imageSrc:
      "https://firebasestorage.googleapis.com/v0/b/readyaimgo-clients-temp.firebasestorage.app/o/paynepros%2FContent%2F593ab9_e77bf4687f5840489d7bd47e7d62582d~mv2.avif?alt=media&token=54def002-cf77-4ce0-b455-e85a3c05a26d",
    imageAlt: "Services background image",
    ctaPrimaryLabel: "OUR SERVICES",
    ctaPrimaryHref: "/services",
    enabled: true,
  },
  {
    id: "home-how-we-work",
    variant: "connect",
    title: "Let's Connect ...",
    subtitle: "Ready to take your business to the next level? Let's start the conversation.",
    body: ["FIRST NAME *", "LAST NAME *", "EMAIL *", "MESSAGES *"],
    bullets: [],
    formFields: ["FIRST NAME *", "LAST NAME *", "EMAIL *", "MESSAGES *"],
    imageSrc:
      "https://firebasestorage.googleapis.com/v0/b/readyaimgo-clients-temp.firebasestorage.app/o/paynepros%2FContent%2Fheadshot%20-%20detania%20payne.jpeg?alt=media&token=a537d359-f445-4603-bf84-2615d39eb2f5",
    imageAlt: "Woman smiling while working on laptop",
    ctaPrimaryLabel: "SUBMIT",
    enabled: true,
  },
  {
    id: "home-start-here",
    variant: "benefits",
    title: "WITH PAYNE PROFESSIONAL SERVICES YOU GET:",
    subtitle: "",
    body: [],
    bullets: [],
    benefitCards: [
      {
        title: "Understanding",
        description: "WE INVEST TIME TO COMPREHEND YOUR BUSINESS AND OBJECTIVES.",
      },
      {
        title: "Tailored Solutions",
        description: "WE DON'T BELIEVE IN ONE-SIZE-FITS ALL SOLUTIONS. OUR SUPPORT IS TAILORED TO YOUR SPECIFIC GOALS.",
      },
      {
        title: "Commitment to Excellence",
        description: "OUR TEAM IS COMMITTED TO PROVIDING TOP-NOTCH RESULTS WITH PROFESSIONALISM AND ACCURACY.",
      },
    ],
    imageSrc:
      "https://firebasestorage.googleapis.com/v0/b/readyaimgo-clients-temp.firebasestorage.app/o/paynepros%2FContent%2Fpaynepros.png?alt=media&token=f088adf0-e08a-41e4-8b24-adaee3b813ff",
    imageAlt: "Dream big motivational sign",
    enabled: true,
  },
]

export const defaultHomeContentDocument: HomeContentDocument = {
  page: "home",
  sections: defaultHomeSections,
  updatedAt: nowIso(),
  updatedBy: "system-default",
}
