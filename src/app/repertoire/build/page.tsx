import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { repertoirePresets } from "@/lib/repertoire/presets";

export default async function RepertoireBuildPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/repertoire/build");

  return (
    <main className="min-h-screen px-5 py-8 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-6xl">
        <Link href="/repertoire" className="font-bold text-[var(--teal)]">
          ← Back to repertoire
        </Link>
        <header className="max-w-3xl py-16">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-[var(--coral)]">
            Quick start
          </p>
          <h1 className="mt-4 text-5xl leading-none sm:text-6xl">
            Get your repertoire moving.
          </h1>
          <p className="mt-6 text-lg leading-8 text-[var(--muted)]">
            Start with a player profile that sounds like you, or take the deeper quiz for a more tailored mix of shots, mastery, and drills.
          </p>
          <Link
            href="/repertoire/quiz"
            className="mt-8 inline-block rounded-xl bg-[var(--ink)] px-5 py-4 font-bold text-white"
          >
            Take the player profile quiz
          </Link>
        </header>

        <section className="border-t border-[var(--line)] pt-10">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-[var(--coral)]">
                Main presets
              </p>
              <h2 className="mt-3 text-4xl">Choose a starting player profile.</h2>
            </div>
            <p className="max-w-md text-[var(--muted)]">
              Preview any profile before adding it. You can edit your repertoire afterward.
            </p>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {repertoirePresets.map((preset) => (
              <article
                key={preset.id}
                className="rounded-2xl border border-[var(--line)] bg-[var(--card)] p-6 shadow-[var(--shadow)]"
              >
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--coral)]">
                  {preset.bestFor}
                </p>
                <h3 className="mt-3 text-2xl">{preset.name}</h3>
                <p className="mt-2 text-lg text-[var(--muted)]">{preset.tagline}</p>
                <p className="mt-4 leading-7 text-[var(--muted)]">{preset.description}</p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {preset.highlights.map((highlight) => (
                    <span
                      key={highlight}
                      className="rounded-full bg-[#e8eee6] px-3 py-1 text-sm text-[#101714]"
                    >
                      {highlight}
                    </span>
                  ))}
                </div>
                <Link
                  href={`/repertoire/quiz?preset=${preset.id}`}
                  className="mt-6 inline-block font-bold text-[var(--teal)]"
                >
                  Preview this preset →
                </Link>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
