import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { HowItWorksMap } from "@/components/how-it-works-map";
import { RepertoireProfileSummary } from "@/components/repertoire-profile-summary";
import { summarizeRepertoire } from "@/lib/repertoire/profile-summary";
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
  const profileTitle = summarizeRepertoire(shots).profileTitle;

  return (
    <main className="min-h-screen px-5 py-8 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-5xl py-16">
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-[var(--coral)]">
          Shared profile
        </p>
        <h1 className="mt-4 text-5xl leading-none">{shared.profile_name}</h1>
        <p className="mt-5 text-lg text-[var(--muted)]">
          A snapshot shared from Repertoire.
        </p>
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
          heading={profileTitle}
          description="Stronger areas show where this player is most developed."
        />
        <RepertoireProfileSummary shots={shots} />
        <p className="mt-10 text-center">
          <Link href="/" className="font-bold text-[var(--teal)]">Create your own Repertoire</Link>
        </p>
      </div>
    </main>
  );
}
