# Payne Professional Services Website

A Next.js website for Payne Professional Services, built with the App Router and a shared UI library with brand kit configuration.

## Features

- **Home Page** - Hero section, service highlights, service grid, process steps, testimonials, and contact form
- **About Page** - Company information and mission
- **Services Page** - Detailed service descriptions
- **Process Page** - Step-by-step process overview
- **Contact Page** - Contact information and intake form
- **Book a Call Page** - Consultation booking (Calendly integration ready)

## Tech Stack

- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS
- React Hook Form + Zod
- Radix UI components
- Lucide React icons

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
paynepros/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   │   └── leads/        # Lead submission endpoint
│   ├── about/             # About page
│   ├── services/          # Services page
│   ├── process/           # Process page
│   ├── contact/           # Contact page
│   ├── book/              # Book a call page
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── ui/               # Shared UI components
│   ├── Hero.tsx          # Hero section
│   ├── ServiceGrid.tsx   # Service cards grid
│   ├── ProcessSteps.tsx  # Process steps component
│   ├── IntakeForm.tsx    # Contact/intake form
│   └── Navigation.tsx    # Site navigation
└── lib/                  # Utilities and configurations
    ├── brands.ts        # Brand kit configuration
    └── utils.ts         # Utility functions
```

## Brand Configuration

The site uses a brand kit system located in `lib/brands.ts`. All components accept a `brand` prop set to `"paynepros"` to ensure consistent styling.

## API Routes

### POST `/api/leads`

Submits a lead/inquiry form. Expects:
- `business`: "paynepros"
- `name`: string
- `email`: string
- `phone`: string
- `preferredContactMethod`: "email" | "phone" | "either"
- `serviceType`: string
- `message`: string (optional)

Currently logs to console. Integrate with your CRM or database as needed.

## Building for Production

```bash
npm run build
npm start
```



