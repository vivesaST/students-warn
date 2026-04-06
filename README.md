# EarlyWarn — Student Risk Detection System

An early warning platform for software engineering courses that monitors GitHub activity to predict project failure risk and provide actionable recommendations.

## Features

- **15 Behavioral Metrics** — Tracks commit frequency, regularity, code churn, branch usage, merge patterns, and more
- **Risk Scoring** — Computes a 0–100 risk score with Low / Moderate / High classification
- **Student Dashboard** — Personal risk overview, radar chart vs class average, commit timeline, and AI recommendations
- **Instructor Dashboard** — Class-wide KPIs, risk distribution, student table with search/filter/sort, and individual profiles
- **GitHub Sync** — Automated data pipeline via Supabase Edge Functions

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui, Recharts
- **Backend**: Supabase (Auth, PostgreSQL, Edge Functions)
- **State Management**: TanStack React Query

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Set your Supabase credentials in `.env`:

```
VITE_SUPABASE_URL=your-url
VITE_SUPABASE_ANON_KEY=your-key
```

## License

MIT
