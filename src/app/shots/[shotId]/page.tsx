import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { getShotById } from "@/lib/shots/queries";
import { getRepertoireEntry } from "@/lib/repertoire/queries";
import {
  addToRepertoire,
  removeFromRepertoire,
} from "@/app/actions/repertoire";
import { ConfidenceBar, ConfidenceForm } from "@/components/confidence-form";
import { listDrillsForShot } from "@/lib/drills/queries";
import { ShotRangePreview } from "@/components/shot-range-preview";
import { createClient } from "@/lib/supabase/server";

export default async function ShotPage({
  params,
}: {
  params: Promise<{ shotId: string }>;
}) {
  const { shotId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=/shots/${shotId}`);
  const { data: profile } = await supabase
    .from("profiles")
    .select("handedness")
    .eq("id", user.id)
    .maybeSingle();
  const shot = await getShotById(shotId);
  if (!shot) notFound();
  const viewerShot =
    profile?.handedness === "Left"
      ? {
          ...shot,
          courtXMin: shot.courtXLeftMin,
          courtXMax: shot.courtXLeftMax,
        }
      : shot;
  const repertoireEntry = await getRepertoireEntry(shotId);
  const relatedDrills = await listDrillsForShot(shotId);

  return (
    <main className="min-h-screen px-5 py-8 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-6xl">
        <Link href="/" className="text-sm font-bold text-[var(--teal)]">
          ← Back to home
        </Link>
        <div className="mt-12 grid gap-12 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-[var(--coral)]">
              Shot lesson
            </p>
            <h1 className="mt-4 text-6xl leading-none">{shot.name}</h1>
            <p className="mt-7 max-w-xl text-lg leading-8 text-[var(--muted)]">
              {shot.description}
            </p>
            <section className="mt-12 border-t border-[var(--line)] pt-7">
              <h2 className="text-2xl">How to play it</h2>
              <p className="mt-4 leading-7 text-[var(--muted)]">
                {shot.instructions}
              </p>
            </section>
          </div>
          <aside className="rounded-3xl border border-[var(--line)] bg-[var(--card)] p-7">
            <ShotRangePreview range={viewerShot} embedded />
            {!repertoireEntry && (
              <div className="mt-4">
                <ConfidenceBar confidence={null} large />
              </div>
            )}
            {repertoireEntry ? (
              <>
                <ConfidenceForm
                  shotId={shotId}
                  initialConfidence={repertoireEntry.confidence}
                />
                <form action={removeFromRepertoire} className="mt-3">
                  <input type="hidden" name="shotId" value={shotId} />
                  <button
                    type="submit"
                    className="w-full rounded-xl border border-[var(--coral)] px-5 py-3 font-bold text-[var(--coral)] transition hover:bg-[var(--coral)] hover:text-white"
                  >
                    Remove from repertoire
                  </button>
                </form>
              </>
            ) : (
              <form action={addToRepertoire}>
                <input type="hidden" name="shotId" value={shotId} />
                <button className="mt-9 w-full rounded-xl bg-[var(--ink)] px-5 py-4 font-bold text-white">
                  Add to repertoire
                </button>
              </form>
            )}
          </aside>
        </div>
        <section className="mt-16 border-t border-[var(--line)] pt-8">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-[var(--coral)]">
                Keep practicing
              </p>
              <h2 className="mt-3 text-3xl">Related drills</h2>
            </div>
            <Link
              href="/drills"
              className="text-sm font-bold text-[var(--teal)]"
            >
              All drills →
            </Link>
          </div>
          {relatedDrills.length > 0 ? (
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {relatedDrills.map((drill) => (
                <Link
                  key={drill.id}
                  href={`/drills/${drill.id}`}
                  className="rounded-2xl border border-[var(--line)] bg-[var(--card)] p-5 transition hover:border-[var(--teal)]"
                >
                  <h3 className="text-xl">{drill.name}</h3>
                  <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                    {drill.description}
                  </p>
                  <span className="mt-4 inline-block text-sm font-bold text-[var(--teal)]">
                    Open drill →
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <div className="mt-6 rounded-2xl border border-dashed border-[var(--line)] p-6 text-[var(--muted)]">
              No drills are linked to this shot yet.
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
