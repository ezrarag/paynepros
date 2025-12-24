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

## Site Access Protection

The site is password-protected. Visitors must enter a password to access any content.

### Passwords

**Admin Password:** `admin123` (change this in production!)

**Temporary Passwords:** `temp123`, `temp456` (comma-separated list)

### Configuration

Passwords are configured in `lib/passwords.ts` and can be overridden with environment variables:

- `SITE_ADMIN_PASSWORD` - Admin password
- `SITE_TEMP_PASSWORDS` - Comma-separated temporary passwords (e.g., "temp123,temp456")

### How It Works

1. All visitors are redirected to `/password` page if not authenticated
2. Users enter a password (admin or temporary)
3. Upon successful authentication, a cookie is set (valid for 30 days)
4. Users without access can click a link to redirect to `https://readyaimgo.biz`

### Changing Passwords

To change passwords:

1. **For development:** Edit `lib/passwords.ts` directly
2. **For production:** Set environment variables:
   ```bash
   SITE_ADMIN_PASSWORD=your_admin_password
   SITE_TEMP_PASSWORDS=temp1,temp2,temp3
   ```

**IMPORTANT:** Change default passwords before deploying to production!

## Building for Production

```bash
npm run build
npm start
```



