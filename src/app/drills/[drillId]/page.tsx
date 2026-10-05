import Link from "next/link";
import { notFound } from "next/navigation";
import { getDrillById } from "@/lib/drills/queries";
import { DrillCoveragePreview } from "@/components/drill-coverage-preview";
import { YoutubePlayer } from "@/components/youtube-player";

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
                Work through the court area shown on the map and repeat the drill consistently as you build reliable movement.
              </p>
            </section>
          </div>
          <aside className="rounded-3xl border border-[var(--line)] bg-[var(--card)] p-7">
            <DrillCoveragePreview drill={drill} embedded />
          </aside>
        </div>
        {drill.videoUrl && (
          <section className="mt-12 border-t border-[var(--line)] pt-8">
            <h2 className="mb-4 text-3xl">Watch the drill</h2>
            <YoutubePlayer url={drill.videoUrl} startSeconds={drill.videoStartSeconds} endSeconds={drill.videoEndSeconds} />
          </section>
        )}
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
