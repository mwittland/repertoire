import Link from "next/link";
import { notFound } from "next/navigation";
import { getDrillById } from "@/lib/drills/queries";
import { MasteryForm } from "@/components/mastery-form";
import { DrillCoveragePreview } from "@/components/drill-coverage-preview";
import { removeFromRoutine } from "@/app/actions/drills";
import { RoutineAddButton } from "@/components/routine-add-button";

export default async function DrillPage({
  params,
}: {
  params: Promise<{ drillId: string }>;
}) {
  const { drillId } = await params;
  const drill = await getDrillById(drillId);
  if (!drill) notFound();

  return (
    <main className="min-h-screen px-5 py-8 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-5xl">
        <Link href="/drills" className="text-sm font-bold text-[var(--teal)]">
          ← View all drills
        </Link>
        <div className="mt-12 grid gap-12 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-[var(--coral)]">
              {drill.type} drill
            </p>
            <h1 className="mt-4 text-6xl leading-none">{drill.name}</h1>
            <p className="mt-7 max-w-xl text-lg leading-8 text-[var(--muted)]">
              {drill.description}
            </p>
            <section className="mt-12 border-t border-[var(--line)] pt-7">
              <h2 className="text-2xl">How to practice it</h2>
              <p className="mt-4 leading-7 text-[var(--muted)]">
                Work through the court area shown on the map, repeat the drill consistently, and raise your mastery as the movement becomes reliable.
              </p>
            </section>
          </div>
          <aside className="rounded-3xl border border-[var(--line)] bg-[var(--card)] p-7">
            <DrillCoveragePreview drill={drill} embedded />
            {drill.mastery !== undefined ? (
              <>
                <MasteryForm drillId={drill.id} initialMastery={drill.mastery ?? 0} />
                <form action={removeFromRoutine} className="mt-3">
                  <input type="hidden" name="drillId" value={drill.id} />
                  <button
                    type="submit"
                    className="w-full rounded-xl border border-[var(--coral)] px-5 py-3 font-bold text-[var(--coral)] transition hover:bg-[var(--coral)] hover:text-white"
                  >
                    Remove from repertoire
                  </button>
                </form>
              </>
            ) : (
              <RoutineAddButton drillId={drill.id} />
            )}
          </aside>
        </div>
        <section className="mt-16 border-t border-[var(--line)] pt-8">
          <h2 className="text-3xl">Shots in this drill</h2>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {drill.shots.map((shot) => (
              <Link
                key={shot.id}
                href={`/shots/${shot.id}`}
                className="rounded-xl border border-[var(--line)] bg-[var(--card)] p-5 font-bold transition hover:border-[var(--teal)]"
              >
                {shot.name}
                <span className="float-right text-[var(--teal)]">→</span>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
