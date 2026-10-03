import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { listRoutineDrills } from "@/lib/drills/queries";
import { DrillCard } from "@/components/drill-card";

export default async function RepertoireDrillsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/repertoire/drills");
  const drills = await listRoutineDrills();

  return (
    <main className="min-h-screen px-5 py-8 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-7xl">
        <Link href="/repertoire" className="text-sm font-bold text-[var(--teal)]">
          ← Back to repertoire
        </Link>
        <header className="mt-12 max-w-3xl">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-[var(--coral)]">
            Your routine
          </p>
          <h1 className="mt-4 text-6xl leading-none">Your practice drills.</h1>
          <p className="mt-6 text-lg leading-8 text-[var(--muted)]">
            Review your routine, open a drill, and update mastery as you practice.
          </p>
        </header>
        {drills.length > 0 ? (
          <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {drills.map((drill) => (
              <DrillCard key={drill.id} drill={drill} />
            ))}
          </div>
        ) : (
          <div className="mt-12 rounded-2xl border border-dashed border-[var(--line)] p-8">
            <h2 className="text-2xl">Your routine is empty.</h2>
            <p className="mt-2 text-[var(--muted)]">
              Browse the drill library to choose a practice drill.
            </p>
            <Link
              href="/library?kind=drills"
              className="mt-6 inline-block rounded-xl bg-[var(--ink)] px-5 py-4 font-bold text-white"
            >
              Browse drills
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
