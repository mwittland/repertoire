import Link from "next/link";
import { notFound } from "next/navigation";
import { getDrillById } from "@/lib/drills/queries";

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
          ← Back to drills
        </Link>
        <div className="mt-12 max-w-3xl">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-[var(--coral)]">
            Practice drill
          </p>
          <h1 className="mt-4 text-6xl leading-none tracking-[-0.04em]">
            {drill.name}
          </h1>
          <p className="mt-7 text-lg leading-8 text-[var(--muted)]">
            {drill.description}
          </p>
        </div>
        <section className="mt-12 border-t border-[var(--line)] pt-8">
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
