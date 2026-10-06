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
import { ShareRepertoireLink } from "@/components/share-repertoire-link";

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
            <h1 className="mt-4 text-6xl leading-none">
              Build your repertoire.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-[var(--muted)]">
              Create an account to take the player profile quiz and view your
              personalized repertoire.
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
    .select("email,handedness")
    .eq("id", user.id)
    .maybeSingle();
  if (profileError)
    throw new Error(`Unable to load profile: ${profileError.message}`);
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
            Your quiz-driven repertoire maps the moments you encounter on court.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/repertoire/build"
              className="inline-block rounded-xl bg-[var(--ink)] px-5 py-4 font-bold text-white"
            >
              Just getting started? Click here
            </Link>
            <Link
              href="/repertoire/update"
              className="inline-block rounded-xl bg-[var(--coral)] px-5 py-4 font-bold text-white"
            >
              Been practicing? Update your repertoire here
            </Link>
            {shots.length > 0 && (
              <ShareRepertoireLink
                shots={shots}
                handedness={profile?.handedness ?? "Right"}
                profileName={profile?.email?.split("@")[0] ?? "Player"}
              />
            )}
          </div>
          {shots.length > 0 ? (
            <>
              <HowItWorksMap
                shots={shots}
                handedness={profile?.handedness ?? "Right"}
                showSubjectToggle={false}
                showConfidenceToggle
                confidenceToggleAtTop
                showShotTypeFilter={false}
                showBallHeightFilter={false}
                showShotTypeColors={false}
                showShotTypeLegend={false}
                mapModes={["confidence", "relative"]}
                mapModeLabels={{ confidence: "Total", relative: "Relative" }}
                initialMapMode="confidence"
                relativeMasteryNote
                mapSize="small"
                hideSidePanel
                heading="See your repertoire at a glance."
                description="This map shows where the shots in your repertoire cover the court."
              />
              <RecommendedShots shots={recommendedShots} />
              <RecommendedDrills drills={recommendedDrills} />
              <h2 className="mt-10 text-3xl">Additional repertoire features</h2>
              <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <Link
                  href="/repertoire/shots"
                  className="block rounded-2xl border border-[var(--line)] bg-[var(--card)] p-6 transition hover:border-[var(--teal)]"
                >
                  <h2 className="text-2xl">
                    Browse your shots{" "}
                    <span className="float-right text-[var(--teal)]">→</span>
                  </h2>
                  <p className="mt-3 leading-6 text-[var(--muted)]">
                    Review and open the shots in your repertoire.
                  </p>
                </Link>
                <Link
                  href="/repertoire/recommendations"
                  className="block rounded-2xl border border-[var(--line)] bg-[var(--card)] p-6 transition hover:border-[var(--teal)]"
                >
                  <h2 className="text-2xl">
                    View recommended shots{" "}
                    <span className="float-right text-[var(--teal)]">→</span>
                  </h2>
                  <p className="mt-3 leading-6 text-[var(--muted)]">
                    See the full ranked list of shots to work on.
                  </p>
                </Link>
                <Link
                  href="/repertoire/drill-recommendations"
                  className="block rounded-2xl border border-[var(--line)] bg-[var(--card)] p-6 transition hover:border-[var(--teal)]"
                >
                  <h2 className="text-2xl">
                    View recommended drills{" "}
                    <span className="float-right text-[var(--teal)]">→</span>
                  </h2>
                  <p className="mt-3 leading-6 text-[var(--muted)]">
                    See the full ranked list of drills to work on.
                  </p>
                </Link>
                <Link
                  href="/discover"
                  className="block rounded-2xl border border-[var(--line)] bg-[var(--card)] p-6 transition hover:border-[var(--teal)]"
                >
                  <h2 className="text-2xl">
                    Discover a shot{" "}
                    <span className="float-right text-[var(--teal)]">→</span>
                  </h2>
                  <p className="mt-3 leading-6 text-[var(--muted)]">
                    Find a catalog shot to learn more about.
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
              </div>
              <h2 className="mt-10 text-3xl">Additional repertoire features</h2>
              <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <Link
                  href="/repertoire/shots"
                  className="block rounded-2xl border border-[var(--line)] bg-[var(--card)] p-6 transition hover:border-[var(--teal)]"
                >
                  <h2 className="text-2xl">
                    Browse your shots{" "}
                    <span className="float-right text-[var(--teal)]">→</span>
                  </h2>
                  <p className="mt-3 leading-6 text-[var(--muted)]">
                    Review shots available in the catalog.
                  </p>
                </Link>
                <Link
                  href="/repertoire/recommendations"
                  className="block rounded-2xl border border-[var(--line)] bg-[var(--card)] p-6 transition hover:border-[var(--teal)]"
                >
                  <h2 className="text-2xl">
                    View recommended shots{" "}
                    <span className="float-right text-[var(--teal)]">→</span>
                  </h2>
                  <p className="mt-3 leading-6 text-[var(--muted)]">
                    See the full ranked list of shots to work on.
                  </p>
                </Link>
                <Link
                  href="/repertoire/drill-recommendations"
                  className="block rounded-2xl border border-[var(--line)] bg-[var(--card)] p-6 transition hover:border-[var(--teal)]"
                >
                  <h2 className="text-2xl">
                    View recommended drills{" "}
                    <span className="float-right text-[var(--teal)]">→</span>
                  </h2>
                  <p className="mt-3 leading-6 text-[var(--muted)]">
                    See the full ranked list of drills to work on.
                  </p>
                </Link>
                <Link
                  href="/discover"
                  className="block rounded-2xl border border-[var(--line)] bg-[var(--card)] p-6 transition hover:border-[var(--teal)]"
                >
                  <h2 className="text-2xl">
                    Discover a shot{" "}
                    <span className="float-right text-[var(--teal)]">→</span>
                  </h2>
                  <p className="mt-3 leading-6 text-[var(--muted)]">
                    Find a catalog shot to start building your repertoire.
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
