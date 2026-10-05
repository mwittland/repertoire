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
- Personal shot repertoire with court coverage tracking
- Shot and drill requests with reversible admin moderation
- Admin creation, editing, and deletion for shots and drills
- GitHub Actions CI for pull requests and pushes to `main`

## Local setup

1. Install Node.js 20+ and the Supabase CLI.
2. Install dependencies with `npm install`.
3. Copy `.env.example` to `.env.local`.
4. Start local Supabase with `supabase start`.
5. Apply pending migrations without removing local users or profiles with `npm run db:migrate:local`.
6. Start Next.js with `npm run dev` and open `http://localhost:3000`.

Local Supabase Studio is available at [http://127.0.0.1:54323/](http://127.0.0.1:54323/). Use it to inspect the local database, view tables, manage local Auth users, and run SQL queries. This URL only accesses the local Supabase project.

Useful checks:

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

Local variables must point to local Supabase. Production variables belong in Vercel and must point to the separate production project. Never expose a service-role key in browser code or commit secrets.

Create migrations locally, validate with `npm run db:migrate:local`, and review them in pull requests. This migration workflow preserves local `auth.users` and `profiles` rows. Apply approved production migrations deliberately with the Supabase CLI after CI passes.

`supabase db reset` is destructive: it rebuilds the local database and removes local Auth users, profiles, and other local data. Use it only when a fresh disposable database is intended. Future migrations should not delete or recreate `auth.users` or `profiles`; migrations that change profile structure should use `alter table` and data-preserving updates.

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

## Production database workflow

The production database is updated from version-controlled Supabase migrations. Vercel deploys the application code, but it does not automatically apply database changes.

### Schema changes

Create a migration locally:

```powershell
supabase migration new describe_the_change
```

Edit the new file under `supabase/migrations/`. Include tables, columns, constraints, indexes, RLS policies, or functions required by the change. Do not edit a migration that has already been applied to production; create a new migration instead.

Apply the pending local migrations and run the application checks:

```powershell
npm run db:migrate:local
npm run lint
npm run typecheck
npm test
npm run build
```

Use `supabase db reset` only when intentionally rebuilding a disposable local database. It wipes local Auth users and profiles by design.

Commit the migration and open a pull request. GitHub Actions must pass before merging to `main`. After the change is approved, apply it to production from a trusted machine:

```powershell
supabase link --project-ref YOUR_PRODUCTION_PROJECT_REF
supabase db push
```

The CLI link is local configuration; it does not move local data into production. Review the migration output carefully before confirming. Keep the production Supabase project separate from the local project.

### Adding shots and managing drills

For normal editorial content, sign in as an admin in the production app and use:

- `/admin/shots/new` to add a shot
- `/admin/drills/new` to add a drill
- `/admin/shots` and `/admin/drills` to edit or delete existing catalog content
- `/admin/requests` to review submitted shot and drill requests

These actions use the database RLS policies and admin checks. Rejected requests can be moved back to `pending` if they need another review.

### Bulk content

For many records, create a dedicated data migration instead of editing production tables manually:

```powershell
supabase migration new add_new_shot_catalog
```

Put validated `insert` or idempotent `upsert` statements in that migration, test with `supabase db reset`, commit it, and apply it with `supabase db push` after review. Use `supabase/seed.sql` only for local development data; `supabase db push` does not apply the seed file.

Never commit passwords, service-role keys, or production environment files. Take a production backup before destructive changes, and prefer archiving over deletion when content may need to be restored.

## Current gaps

- End-to-end browser tests and RLS integration tests are not yet included.
- Supabase TypeScript types are currently partial and should eventually be generated from the production schema.
- Drill recommendations use weak court coverage in a player’s shot repertoire.
- Video playback and invalid-video handling need a dedicated reusable component.
- Pagination, search, archiving, and production backup/rollback procedures should be added before broad launch.
