import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { listShots } from "@/lib/shots/queries";
import { listRepertoireShots } from "@/lib/repertoire/queries";
import { MasteryUpdate } from "@/components/mastery-update";

export default async function UpdateRepertoirePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/repertoire/update");
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("handedness")
    .eq("id", user.id)
    .maybeSingle();
  if (profileError) throw new Error(`Unable to load profile: ${profileError.message}`);

  const [catalogShots, repertoireShots] = await Promise.all([
    listShots(),
    listRepertoireShots(),
  ]);
  const confidenceById = new Map(repertoireShots.map((shot) => [shot.id, shot.confidence]));
  const shots = catalogShots.map((shot) => ({
    ...shot,
    confidence: confidenceById.get(shot.id) ?? null,
  }));

  return (
    <main className="min-h-screen px-5 py-8 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-3xl">
        <section className="py-16">
          <Link href="/repertoire" className="font-bold text-[var(--teal)]">
            ← Back to repertoire
          </Link>
          <p className="mt-12 text-sm font-bold uppercase tracking-[0.2em] text-[var(--coral)]">
            Update your mastery
          </p>
          <h1 className="mt-4 text-5xl leading-none sm:text-6xl">
            Keep your profile current.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-[var(--muted)]">
            Short, focused check-ins will help Repertoire understand how your
            game is developing and update your mastery recommendations.
          </p>
          <div className="mt-10">
            <MasteryUpdate
              shots={shots}
              handedness={profile?.handedness ?? "Right"}
            />
          </div>
        </section>
      </div>
    </main>
  );
}
