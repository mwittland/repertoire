import Link from "next/link";
import { ExampleProfilesMap } from "@/components/example-profiles-map";
import { listShots } from "@/lib/shots/queries";
import { createClient } from "@/lib/supabase/server";

export default async function HowItWorksPage() {
  const [shots, supabase] = await Promise.all([listShots(), createClient()]);
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
            Build a game you can rely on.
          </h1>
          <p className="mt-7 max-w-2xl text-lg leading-8 text-[var(--muted)]">
            Repertoire turns the shots you are learning into a game you can rely
            on. Discover the right option for each court situation, save the
            shots you want to practice, and build dependable coverage over time.
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

        <section className="mt-8 flex flex-wrap items-center justify-between gap-5 border-t border-[var(--line)] py-10">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-[var(--coral)]">
              Ready to build your starting repertoire?
            </p>
            <p className="mt-2 text-lg text-[var(--muted)]">
              Answer a few questions and get a shot profile built around your
              current game.
            </p>
          </div>
          <Link
            href="/repertoire/quiz"
            className="rounded-xl border border-[var(--line)] px-5 py-4 font-bold text-[var(--ink)]"
          >
            Take the profile quiz
          </Link>
        </section>
      </div>
    </main>
  );
}
