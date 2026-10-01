# Repertoire

Repertoire is a pickleball shot-learning app. Its central workflow is point-based discovery: users enter one court position, ball height, and intent; shots store ranges and match when that point falls inside every range.

## MVP capabilities

- Next.js App Router, TypeScript, Tailwind CSS, and npm
- Supabase SSR client factories for browser and server usage
- Relational Supabase migration for profiles, shots, drills, shot-drill links, repertoire, and requests
- Supabase Auth with protected routes and persistent sessions
- RLS policies for published content, user-owned data, and admin operations
- Seed shots and drills
- Independently tested discovery service with inclusive range boundaries
- Point-based `/discover` experience backed by Supabase
- Shot and drill catalogs with detail pages and related drills
- Personal repertoire with confidence tracking
- Shot and drill requests with reversible admin moderation
- Admin creation, editing, and deletion for shots and drills
- GitHub Actions CI for pull requests and pushes to `main`

## Local setup

1. Install Node.js 20+ and the Supabase CLI.
2. Install dependencies with `npm install`.
3. Copy `.env.example` to `.env.local`.
4. Start local Supabase with `supabase start`.
5. Apply migrations and seed data with `supabase db reset`.
6. Start Next.js with `npm run dev` and open `http://localhost:3000`.

Useful checks:

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

Local variables must point to local Supabase. Production variables belong in Vercel and must point to the separate production project. Never expose a service-role key in browser code or commit secrets.

Create migrations locally, validate with `supabase db reset`, and review them in pull requests. Apply approved production migrations deliberately with the Supabase CLI after CI passes.

## Production setup

1. Create a separate production Supabase project.
2. Configure Supabase Auth Site URL and redirect URLs for the Vercel deployment.
3. Link the local CLI to production only when you are ready to deploy migrations:

```bash
supabase link --project-ref YOUR_PROJECT_REF
supabase db push
```

4. Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` to Vercel. Never add a service-role key to browser or Vercel client environment variables.
5. Create the first production user, then set `profiles.is_admin = true` through the production Supabase SQL editor.
6. Deploy through GitHub to Vercel after CI passes.

## Current gaps

- End-to-end browser tests and RLS integration tests are not yet included.
- Supabase TypeScript types are currently partial and should eventually be generated from the production schema.
- Admin shot-to-drill association editing is still a follow-up.
- Video playback and invalid-video handling need a dedicated reusable component.
- Pagination, search, archiving, and production backup/rollback procedures should be added before broad launch.
