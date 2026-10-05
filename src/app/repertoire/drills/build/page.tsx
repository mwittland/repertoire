import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { drillPresets } from "@/lib/drills/presets";

export default async function DrillBuildPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/repertoire/drills/build");

  return (
    <main className="min-h-screen px-5 py-8 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-6xl">
        <Link href="/repertoire/build" className="font-bold text-[var(--teal)]">← Back to quick start</Link>
        <header className="max-w-3xl py-16">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-[var(--coral)]">Drill quick start</p>
          <h1 className="mt-4 text-5xl leading-none sm:text-6xl">See the routine you currently use.</h1>
          <p className="mt-6 text-lg leading-8 text-[var(--muted)]">
            Choose a profile that matches your current practice or answer a few questions about your time, access, and usual session style.
          </p>
          <Link href="/repertoire/drills/quiz" className="mt-8 inline-block rounded-xl bg-[var(--ink)] px-5 py-4 font-bold text-white">
            Create a personalized drill profile
          </Link>
        </header>
        <section className="border-t border-[var(--line)] pt-10">
          <h2 className="text-4xl">Browse current-practice profiles.</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {drillPresets.map((preset) => (
              <article key={preset.id} className="rounded-2xl border border-[var(--line)] bg-[var(--card)] p-6 shadow-[var(--shadow)]">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--coral)]">{preset.bestFor}</p>
                <h3 className="mt-3 text-2xl">{preset.name}</h3>
                <p className="mt-2 text-lg text-[var(--muted)]">{preset.tagline}</p>
                <p className="mt-4 leading-7 text-[var(--muted)]">{preset.description}</p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {preset.highlights.map((highlight) => <span key={highlight} className="rounded-full bg-[#e8eee6] px-3 py-1 text-sm text-[#101714]">{highlight}</span>)}
                </div>
                <Link href={`/repertoire/drills/quiz?preset=${preset.id}`} className="mt-6 inline-block font-bold text-[var(--teal)]">Preview this profile →</Link>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
