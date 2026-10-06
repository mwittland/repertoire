import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { HowItWorksMap } from "@/components/how-it-works-map";
import type { DiscoverableShot } from "@/lib/discovery/types";

export default async function SharedRepertoirePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const supabase = await createClient();
  const { data: shared, error } = await supabase
    .from("shared_repertoires")
    .select("profile_name,handedness,shots,expires_at")
    .eq("share_token", token)
    .gt("expires_at", new Date().toISOString())
    .maybeSingle();
  if (error) throw new Error(`Unable to load shared repertoire: ${error.message}`);
  if (!shared) notFound();

  const shots = shared.shots as DiscoverableShot[];
  const bestShot = [...shots].sort((a, b) => (b.confidence ?? 0) - (a.confidence ?? 0))[0];
  const weakestShot = [...shots].sort((a, b) => (a.confidence ?? 0) - (b.confidence ?? 0))[0];
  const bestType = bestShot.shotType ?? "all-court";
  const weakestType = weakestShot.shotType ?? "all-court";
  const phaseByShotType: Record<string, string> = {
    Dink: "kitchen",
    Drop: "transition",
    Drive: "baseline",
    Reset: "transition",
    Attack: "kitchen",
    Putaway: "kitchen",
    Lob: "baseline",
  };
  const profileTitle = `${bestType}-led ${phaseByShotType[bestType] ?? "all-court"} profile`;
  const profileTagline = `A ${bestType.toLowerCase()}-led game with ${weakestType.toLowerCase()} as the next development focus.`;

  return (
    <main className="min-h-screen px-5 py-8 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-5xl py-16">
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-[var(--coral)]">
          Shared repertoire
        </p>
        <h1 className="mt-4 text-5xl leading-none">{shared.profile_name}&apos;s repertoire</h1>
        <p className="mt-5 text-lg text-[var(--muted)]">
          A snapshot shared from Repertoire.
        </p>
        <section className="mt-8 rounded-2xl border border-[var(--teal)] bg-[var(--card)] p-6">
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-[var(--coral)]">
            Player profile
          </p>
          <h2 className="mt-3 text-3xl">{profileTitle}</h2>
          <p className="mt-3 leading-7 text-[var(--muted)]">{profileTagline}</p>
        </section>
        <HowItWorksMap
          shots={shots}
          handedness={shared.handedness as "Right" | "Left"}
          mapModes={["relative"]}
          initialMapMode="relative"
          relativeMasteryNote
          showShotTypeFilter={false}
          showShotTypeColors={false}
          showShotTypeLegend={false}
          showHandednessFilter={false}
          showBallHeightFilter={false}
          hideSidePanel
          heading="Relative coverage"
          description="Stronger areas show where this repertoire is most developed."
        />
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {[
            { label: "Best shot", shot: bestShot },
            { label: "Weakest shot", shot: weakestShot },
          ].map(({ label, shot }) => (
            <section key={label} className="rounded-2xl border border-[var(--line)] bg-[var(--card)] p-6">
              <p className="text-sm font-bold uppercase tracking-[0.16em] text-[var(--muted)]">{label}</p>
              <h2 className="mt-3 text-2xl">{shot.name}</h2>
              <p className="mt-2 text-[var(--muted)]">
                {shot.shotType ?? "All-court"} · {shot.confidence}% mastery
              </p>
            </section>
          ))}
        </div>
        <p className="mt-10 text-center">
          <Link href="/" className="font-bold text-[var(--teal)]">Create your own repertoire on Repertoire →</Link>
        </p>
      </div>
    </main>
  );
}
