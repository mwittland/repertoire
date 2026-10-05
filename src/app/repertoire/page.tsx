import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import {
  listRecommendedDrills,
  listRecommendedShots,
  listRepertoireShots,
} from "@/lib/repertoire/queries";
import { HowItWorksMap } from "@/components/how-it-works-map";
import { RecommendedShots } from "@/components/recommended-shots";
import { RecommendedDrills } from "@/components/recommended-drills";

export default async function RepertoirePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return (
      <main className="min-h-screen px-5 py-8 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-3xl">
          <section className="py-24">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-[var(--coral)]">
              Your collection
            </p>
            <h1 className="mt-4 text-6xl leading-none">Build your repertoire.</h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-[var(--muted)]">
              Create an account to take the player profile quiz, save your shots, and view your repertoire.
            </p>
            <Link
              href="/signup"
              className="mt-8 inline-block rounded-xl bg-[var(--ink)] px-5 py-4 font-bold text-white"
            >
              Create an account
            </Link>
          </section>
        </div>
      </main>
    );
  }
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("handedness")
    .eq("id", user.id)
    .maybeSingle();
  if (profileError) throw new Error(`Unable to load profile: ${profileError.message}`);
  const shots = await listRepertoireShots();
  const recommendedShots = await listRecommendedShots(
    profile?.handedness ?? "Right",
  );
  const recommendedDrills = await listRecommendedDrills(
    profile?.handedness ?? "Right",
  );

  return (
    <main className="min-h-screen px-5 py-8 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-7xl">
        <section className="py-20">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-[var(--coral)]">
            Your collection
          </p>
          <h1 className="mt-4 text-6xl leading-none">Your repertoire.</h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-[var(--muted)]">
            Build a collection of shots that covers the moments you encounter on court.
          </p>
          <Link
            href="/repertoire/build"
            className="mt-6 inline-block rounded-xl bg-[var(--ink)] px-5 py-4 font-bold text-white"
          >
            Just getting started? Quick-fill your shot repertoire
          </Link>
          {shots.length > 0 ? (
            <>
              <HowItWorksMap
                shots={shots}
                handedness={profile?.handedness ?? "Right"}
                showSubjectToggle={false}
                showConfidenceToggle
                showShotTypeFilter
                showBallHeightFilter={false}
                showShotTypeColors={false}
                showShotTypeLegend={false}
                mapModes={["confidence", "relative"]}
                mapModeLabels={{ confidence: "Total", relative: "Relative" }}
                initialMapMode="confidence"
                relativeMasteryNote
                mapSize="small"
                heading="See your repertoire at a glance."
                description="This map shows where the shots in your repertoire cover the court."
              />
              <RecommendedShots shots={recommendedShots} />
              <RecommendedDrills drills={recommendedDrills} />
              <div className="mt-8 grid gap-4 md:grid-cols-3">
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
                  href="/repertoire/recommendations"
                  className="block rounded-2xl border border-[var(--line)] bg-[var(--card)] p-6 transition hover:border-[var(--teal)]"
                >
                  <h2 className="text-2xl">
                    View recommended shots <span className="float-right text-[var(--teal)]">→</span>
                  </h2>
                  <p className="mt-3 leading-6 text-[var(--muted)]">
                    See the full ranked list of shots to add or improve.
                  </p>
                </Link>
                <Link
                  href="/repertoire/drill-recommendations"
                  className="block rounded-2xl border border-[var(--line)] bg-[var(--card)] p-6 transition hover:border-[var(--teal)]"
                >
                  <h2 className="text-2xl">
                    View recommended drills <span className="float-right text-[var(--teal)]">→</span>
                  </h2>
                  <p className="mt-3 leading-6 text-[var(--muted)]">
                    See the full ranked list of drills to work on.
                  </p>
                </Link>
              </div>
            </>
          ) : (
            <>
              <RecommendedShots shots={recommendedShots} />
              <RecommendedDrills drills={recommendedDrills} />
              <div className="mt-10 rounded-2xl border border-dashed border-[var(--line)] p-8">
                <h2 className="text-2xl">Your collection is waiting.</h2>
                <p className="mt-2 text-[var(--muted)]">
                  Find a shot that fits the moment and add it here.
                </p>
                <Link
                  href="/"
                  className="mt-6 inline-block rounded-xl bg-[var(--ink)] px-5 py-4 font-bold text-white"
                >
                  Open discovery
                </Link>
              </div>
              <div className="mt-8 grid gap-4 md:grid-cols-3">
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
                  href="/repertoire/recommendations"
                  className="block rounded-2xl border border-[var(--line)] bg-[var(--card)] p-6 transition hover:border-[var(--teal)]"
                >
                  <h2 className="text-2xl">
                    View recommended shots <span className="float-right text-[var(--teal)]">→</span>
                  </h2>
                  <p className="mt-3 leading-6 text-[var(--muted)]">
                    See the full ranked list of shots to add or improve.
                  </p>
                </Link>
                <Link
                  href="/repertoire/drill-recommendations"
                  className="block rounded-2xl border border-[var(--line)] bg-[var(--card)] p-6 transition hover:border-[var(--teal)]"
                >
                  <h2 className="text-2xl">
                    View recommended drills <span className="float-right text-[var(--teal)]">→</span>
                  </h2>
                  <p className="mt-3 leading-6 text-[var(--muted)]">
                    See the full ranked list of drills to work on.
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
