# Gym Management System

A modern gym management app built with Next.js. It covers member onboarding, attendance tracking, subscription plans, billing, reports, settings, and dashboard analytics for a gym workflow.

## Features

- Member registration and directory management
- Attendance check-in and check-out tracking
- Subscription plans with premium tier pricing
- Payments overview and dues tracking
- Attendance insights and activity statistics
- Reports and settings pages for admin workflows
- Local storage fallback when database access is unavailable
- Supabase integration for cloud-backed data sync

## Tech Stack

- Next.js 16
- React 19
- Supabase
- Chart.js
- Lucide React icons
- Electron entry point for desktop packaging

## Prerequisites

- Node.js 18 or newer
- npm
- A Supabase project if you want cloud persistence

## Environment Variables

Create a local `.env.local` file in the project root and add:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

The app still works with local storage fallback, but these values are required for Supabase-backed data.

## Getting Started

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

- `npm run dev` - start the Next.js development server
- `npm run build` - build the app for production
- `npm run start` - start the production server
- `npm run lint` - run ESLint
- `npm run electron` - launch the Electron shell
- `npm run desktop` - run Next.js and Electron together

## Project Structure

```text
src/
  app/
    attendance/
    attendance-insights/
    login/
    members/
    payments/
    plans/
    reports/
    settings/
  components/
  context/
  lib/
public/
main.js
```

## Deployment

### Vercel

The simplest deployment path is Vercel:

1. Push this repository to GitHub.
2. Import the repo into Vercel.
3. Add the Supabase environment variables in the Vercel dashboard.
4. Deploy using the default Next.js build settings.

### Manual Production Run

```bash
npm install
npm run build
npm run start
```

## Notes

- Some pages fall back to local storage if Supabase is not configured.
- If you change plan pricing, update the plan constants and billing helpers together so member, payment, and report views stay in sync.

## License

No license has been specified yet.
