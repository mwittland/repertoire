import Link from "next/link";
import { ExampleProfilesMap } from "@/components/example-profiles-map";
import { listDrills } from "@/lib/drills/queries";
import { listShots } from "@/lib/shots/queries";

export default async function HowItWorksPage() {
  const [shots, drills] = await Promise.all([listShots(), listDrills()]);

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
            Repertoire helps you discover shots and drills, save the options you
            want to own, and track your mastery as you improve.
          </p>
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
          </div>
        </section>

        <div id="examples">
          <ExampleProfilesMap shots={shots} drills={drills} />
        </div>

        <section className="mt-8 flex flex-wrap items-center justify-between gap-5 border-t border-[var(--line)] py-10">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-[var(--coral)]">
              Ready to find your next option?
            </p>
            <p className="mt-2 text-lg text-[var(--muted)]">
              Search the catalog by court position and ball height.
            </p>
          </div>
          <Link
            href="/discover"
            className="rounded-xl border border-[var(--line)] px-5 py-4 font-bold text-[var(--ink)]"
          >
            Discover
          </Link>
        </section>
      </div>
    </main>
  );
}
