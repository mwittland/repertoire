import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { listRepertoireShots } from "@/lib/repertoire/queries";
import { listRoutineDrills } from "@/lib/drills/queries";
import { HowItWorksMap } from "@/components/how-it-works-map";

export default async function RepertoirePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/repertoire");
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("handedness")
    .eq("id", user.id)
    .maybeSingle();
  if (profileError) throw new Error(`Unable to load profile: ${profileError.message}`);
  const shots = await listRepertoireShots();
  const routineDrills = await listRoutineDrills();

  return (
    <main className="min-h-screen px-5 py-8 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-7xl">
        <section className="py-20">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-[var(--coral)]">
            Your collection
          </p>
          <h1 className="mt-4 text-6xl leading-none">Your repertoire.</h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-[var(--muted)]">
            Build mastery across the shots and drills in your repertoire.
          </p>
          <Link
            href="/repertoire/build"
            className="mt-6 inline-block rounded-xl bg-[var(--ink)] px-5 py-4 font-bold text-white"
          >
            Just getting started? Quick-fill your repertoire
          </Link>
          {shots.length > 0 || routineDrills.length > 0 ? (
            <>
              <HowItWorksMap
                shots={shots}
                drills={routineDrills}
                handedness={profile?.handedness ?? "Right"}
                showSubjectToggle
                showConfidenceToggle
                mapModes={["confidence", "relative"]}
                mapModeLabels={{ confidence: "Coverage", relative: "Mastery" }}
                initialMapMode="confidence"
                relativeMasteryNote
                heading="See your repertoire at a glance."
                description="This map shows the mastery of the shots and drills in your repertoire. Switch between Shots and Drills, then compare your absolute and relative mastery."
              />
              <div className="mt-8 grid gap-4 md:grid-cols-2">
                <Link
                  href="/repertoire/shots"
                  className="block rounded-2xl border border-[var(--line)] bg-[var(--card)] p-6 transition hover:border-[var(--teal)]"
                >
                  <h2 className="text-2xl">
                    Browse your shots <span className="float-right text-[var(--teal)]">→</span>
                  </h2>
                  <p className="mt-3 leading-6 text-[var(--muted)]">
                    Sort, review, and open the shots you are practicing.
                  </p>
                </Link>
                <Link
                  href="/repertoire/drills"
                  className="block rounded-2xl border border-[var(--line)] bg-[var(--card)] p-6 transition hover:border-[var(--teal)]"
                >
                  <h2 className="text-2xl">
                    Browse your drills <span className="float-right text-[var(--teal)]">→</span>
                  </h2>
                  <p className="mt-3 leading-6 text-[var(--muted)]">
                    Review your drills and update mastery.
                  </p>
                </Link>
              </div>
            </>
          ) : (
            <>
              <div className="mt-10 rounded-2xl border border-dashed border-[var(--line)] p-8">
                <h2 className="text-2xl">Your collection is waiting.</h2>
                <p className="mt-2 text-[var(--muted)]">
                  Find a shot or drill that fits the moment and add it here.
                </p>
                <Link
                  href="/"
                  className="mt-6 inline-block rounded-xl bg-[var(--ink)] px-5 py-4 font-bold text-white"
                >
                  Open discovery
                </Link>
              </div>
              <div className="mt-8 grid gap-4 md:grid-cols-2">
                <Link
                  href="/repertoire/shots"
                  className="block rounded-2xl border border-[var(--line)] bg-[var(--card)] p-6 transition hover:border-[var(--teal)]"
                >
                  <h2 className="text-2xl">
                    Browse your shots <span className="float-right text-[var(--teal)]">→</span>
                  </h2>
                  <p className="mt-3 leading-6 text-[var(--muted)]">
                    Find shots to add to your repertoire.
                  </p>
                </Link>
                <Link
                  href="/repertoire/drills"
                  className="block rounded-2xl border border-[var(--line)] bg-[var(--card)] p-6 transition hover:border-[var(--teal)]"
                >
                  <h2 className="text-2xl">
                    Browse your drills <span className="float-right text-[var(--teal)]">→</span>
                  </h2>
                  <p className="mt-3 leading-6 text-[var(--muted)]">
                    Find drills to add to your repertoire.
                  </p>
                </Link>
              </div>
            </>
          )}
        </section>
      </div>
    </main>
  );
}
