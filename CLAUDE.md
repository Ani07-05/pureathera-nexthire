# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development
- `pnpm dev` - Start development server
- `pnpm build` - Build production application
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint (currently configured to ignore during builds)

### Package Management
- Uses `pnpm` as the package manager
- Lock file: `pnpm-lock.yaml`

## Architecture Overview

This is a **Next.js 14 App Router** job platform application built with TypeScript and modern React patterns.

### Project Structure
```
app/                    # Next.js App Router pages
├── layout.tsx         # Root layout with font configuration, theme provider
├── page.tsx           # Landing page with component composition
├── auth/              # Authentication pages (login, signup)
├── job-seeker/        # Job seeker dashboard/pages
└── recruiter/         # Recruiter dashboard/pages

components/
├── ui/                # shadcn/ui component library (40+ components)
├── landing/           # Landing page specific components
└── theme-provider.tsx # Theme configuration component

lib/
└── utils.ts          # Utility functions (cn function for className merging)

hooks/                # Custom React hooks
├── use-mobile.ts     # Mobile detection hook
└── use-toast.ts      # Toast notification hook

styles/               # Additional styling files
public/               # Static assets
```

### Key Technologies
- **Next.js 14** with App Router
- **TypeScript** with strict configuration
- **Tailwind CSS** with shadcn/ui component system
- **Radix UI** primitives for accessibility
- **Framer Motion** for animations
- **React Hook Form** with Zod validation
- **Vercel Analytics** for tracking
- **next-themes** for dark/light mode

### Component System
- Uses **shadcn/ui** component library (configured in `components.json`)
- Components follow the "New York" style variant
- Supports CSS variables for theming
- Path aliases configured: `@/components`, `@/lib`, `@/hooks`, `@/ui`

### Styling Approach
- **Tailwind CSS v4** with PostCSS configuration
- Custom fonts: DM Sans (primary), JetBrains Mono (monospace)
- Dark/light theme support via `next-themes`
- CSS variables for consistent theming

### Build Configuration
- ESLint and TypeScript errors are ignored during builds (development convenience)
- Image optimization disabled (`unoptimized: true`)
- Supports both RSC (React Server Components) and client components

### Development Patterns
- Uses React Server Components by default
- Client components marked with "use client" directive
- Compositional landing page structure with dedicated components
- Centralized utility functions in `lib/utils.ts`
- Custom hooks for reusable logic

This is a job platform connecting job seekers with recruiters, featuring authentication flows and role-based dashboards.