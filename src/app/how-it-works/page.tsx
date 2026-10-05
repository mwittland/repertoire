import Link from "next/link";
import { ExampleProfilesMap } from "@/components/example-profiles-map";
import { listShots } from "@/lib/shots/queries";
import { createClient } from "@/lib/supabase/server";
import { getSiteMetrics } from "@/lib/metrics";

export default async function HowItWorksPage() {
  const [shots, supabase, metrics] = await Promise.all([
    listShots(),
    createClient(),
    getSiteMetrics(),
  ]);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <main className="min-h-screen px-5 py-8 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-7xl">
        <section className="py-16 lg:py-24">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-[var(--coral)]">
            Your pickleball repertoire
          </p>
          <h1 className="mt-4 max-w-4xl text-6xl leading-none sm:text-7xl">
            Turn your weaknesses into strengths.
          </h1>
          <p className="mt-7 max-w-2xl text-lg leading-8 text-[var(--muted)]">
            Repertoire stores your mastery of every shot in pickleball,
            generating a map of your court coverage and identifying the shots
            you need to work on to up your game.
          </p>
          {!user && (
            <p className="mt-4 max-w-2xl text-[var(--muted)]">
              Sign in to take the profile quiz, save your shots, and build your
              repertoire.
            </p>
          )}
          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href="#examples"
              className="rounded-xl border border-[var(--line)] px-5 py-4 font-bold text-[var(--ink)]"
            >
              View examples
            </a>
            <Link
              href="/help"
              className="rounded-xl border border-[var(--line)] px-5 py-4 font-bold text-[var(--ink)]"
            >
              Learn more
            </Link>
            {!user && (
              <Link
                href="/login"
                className="rounded-xl bg-[var(--ink)] px-5 py-4 font-bold text-white"
              >
                Sign in
              </Link>
            )}
          </div>
        </section>

        <div id="examples">
          <ExampleProfilesMap shots={shots} />
        </div>

        <section className="grid gap-4 border-t border-[var(--line)] py-10 sm:grid-cols-2">
          <FeatureMetric
            value={metrics.quizCompletions}
            label="Player profiles generated"
            description="Take a quick quiz to see your personal repertoire."
            actionLabel="Take the profile quiz"
            href="/repertoire/quiz"
            accountRequired
          />
          <FeatureMetric
            value={metrics.discoverySearches}
            label="Shot discovery searches"
            description="Search by court position and ball height to find shots that fit the moment."
            actionLabel="Discover a shot"
            href="/discover"
          />
        </section>

      </div>
    </main>
  );
}

function FeatureMetric({
  value,
  label,
  description,
  actionLabel,
  href,
  accountRequired = false,
}: {
  value: number;
  label: string;
  description: string;
  actionLabel: string;
  href: string;
  accountRequired?: boolean;
}) {
  return (
    <article className="rounded-2xl border border-[var(--line)] bg-[var(--card)] p-6">
      <p className="text-4xl font-bold text-[var(--ink)]">
        {value.toLocaleString()}
      </p>
      <p className="mt-2 text-sm font-bold uppercase tracking-[0.16em] text-[var(--muted)]">
        {label}
      </p>
      <p className="mt-4 leading-7 text-[var(--muted)]">{description}</p>
      {accountRequired && (
        <p className="mt-3 text-sm font-bold text-[var(--coral)]">
          Account required
        </p>
      )}
      <Link
        href={href}
        className="mt-5 inline-block rounded-xl border border-[var(--line)] px-4 py-3 font-bold text-[var(--ink)]"
      >
        {actionLabel} →
      </Link>
    </article>
  );
}
