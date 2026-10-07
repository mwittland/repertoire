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
import { RepertoireProfileSummary } from "@/components/repertoire-profile-summary";
import { summarizeRepertoire } from "@/lib/repertoire/profile-summary";
import { getSiteMetrics } from "@/lib/metrics";

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
              Home
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
  const [shots, recommendedShots, recommendedDrills, metrics] =
    await Promise.all([
      listRepertoireShots(),
      listRecommendedShots(profile?.handedness ?? "Right"),
      listRecommendedDrills(profile?.handedness ?? "Right"),
      getSiteMetrics(),
    ]);

  return (
    <main className="min-h-screen px-5 py-8 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-7xl">
        <section className="py-20">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-[var(--coral)]">
            Home
          </p>
          <h1 className="mt-4 text-6xl leading-none">Your Repertoire</h1>
          <p className="mt-6 text-lg leading-8 text-[var(--muted)]">
            Build and share your Repertoire!
          </p>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {shots.length === 0 && (
              <Link
                href="/repertoire/quiz"
                className="block rounded-2xl border border-[var(--line)] bg-[var(--card)] p-6 text-2xl font-bold transition hover:border-[var(--teal)]"
              >
                Create your repertoire{" "}
                <span className="float-right text-[var(--teal)]">→</span>
              </Link>
            )}
            {shots.length > 0 && (
              <Link
                href="/repertoire/update"
                className="block rounded-2xl border border-[var(--line)] bg-[var(--card)] p-6 text-2xl font-bold transition hover:border-[var(--teal)]"
              >
                Update your repertoire{" "}
                <span className="float-right text-[var(--teal)]">→</span>
              </Link>
            )}
            <ShareRepertoireLink
              shots={shots}
              handedness={profile?.handedness ?? "Right"}
              profileName={profile?.email?.split("@")[0] ?? "Player"}
            />
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
                mapModes={["relative", "confidence"]}
                mapModeLabels={{ confidence: "Total", relative: "Relative" }}
                initialMapMode="relative"
                relativeMasteryNote
                mapSize="small"
                hideSidePanel
                heading={summarizeRepertoire(shots).profileTitle}
                description="This map shows how well you cover the court."
              />
              <RepertoireProfileSummary shots={shots} />
              <RecommendedShots shots={recommendedShots} />
              <RecommendedDrills drills={recommendedDrills} />
              <h2 className="mt-10 text-3xl">Additional repertoire features</h2>
              <div className="mt-5 grid gap-4 md:grid-cols-3">
                <Link
                  href="/repertoire/recommendations"
                  className="block rounded-2xl border border-[var(--line)] bg-[var(--card)] p-6 transition hover:border-[var(--teal)]"
                >
                  <h2 className="text-2xl">
                    View more shots{" "}
                    <span className="float-right text-[var(--teal)]">→</span>
                  </h2>
                </Link>
                <Link
                  href="/repertoire/drill-recommendations"
                  className="block rounded-2xl border border-[var(--line)] bg-[var(--card)] p-6 transition hover:border-[var(--teal)]"
                >
                  <h2 className="text-2xl">
                    View more drills{" "}
                    <span className="float-right text-[var(--teal)]">→</span>
                  </h2>
                </Link>
                <Link
                  href="/discover"
                  className="block rounded-2xl border border-[var(--line)] bg-[var(--card)] p-6 transition hover:border-[var(--teal)]"
                >
                  <h2 className="text-2xl">
                    Discover a shot{" "}
                    <span className="float-right text-[var(--teal)]">→</span>
                  </h2>
                </Link>
              </div>
            </>
          ) : (
            <>
              <HowItWorksMap
                shots={[]}
                handedness={profile?.handedness ?? "Right"}
                showSubjectToggle={false}
                showShotTypeFilter={false}
                showBallHeightFilter={false}
                showShotTypeLegend={false}
                showMasteryLegend={false}
                hideSidePanel
                heading="Your coverage map."
                description="Your court coverage will appear here after you create your repertoire."
              />
              <RepertoireProfileSummary shots={[]} empty />
              <RecommendedShots shots={recommendedShots} />
              <RecommendedDrills drills={recommendedDrills} />
              <h2 className="mt-10 text-3xl">Additional repertoire features</h2>
              <div className="mt-5 grid gap-4 md:grid-cols-3">
                <Link
                  href="/repertoire/recommendations"
                  className="block rounded-2xl border border-[var(--line)] bg-[var(--card)] p-6 transition hover:border-[var(--teal)]"
                >
                  <h2 className="text-2xl">
                    View more shots{" "}
                    <span className="float-right text-[var(--teal)]">→</span>
                  </h2>
                </Link>
                <Link
                  href="/repertoire/drill-recommendations"
                  className="block rounded-2xl border border-[var(--line)] bg-[var(--card)] p-6 transition hover:border-[var(--teal)]"
                >
                  <h2 className="text-2xl">
                    View more drills{" "}
                    <span className="float-right text-[var(--teal)]">→</span>
                  </h2>
                </Link>
                <Link
                  href="/discover"
                  className="block rounded-2xl border border-[var(--line)] bg-[var(--card)] p-6 transition hover:border-[var(--teal)]"
                >
                  <h2 className="text-2xl">
                    Discover a shot{" "}
                    <span className="float-right text-[var(--teal)]">→</span>
                  </h2>
                </Link>
              </div>
            </>
          )}
        </section>
        <section className="border-t border-[var(--line)] py-10">
          <h2 className="text-3xl">Community stats</h2>
          <p className="mt-2 text-[var(--muted)]">
            Site-wide totals from everyone using Repertoire.
          </p>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <SiteMetric
              value={metrics.quizCompletions}
              label="Player profiles generated"
            />
            <SiteMetric
              value={metrics.discoverySearches}
              label="Shot discovery searches"
            />
          </div>
        </section>
      </div>
    </main>
  );
}

function SiteMetric({ value, label }: { value: number; label: string }) {
  return (
    <article className="rounded-2xl border border-[var(--line)] bg-[var(--card)] p-6">
      <p className="text-4xl font-bold text-[var(--ink)]">
        {value.toLocaleString()}
      </p>
      <p className="mt-2 text-sm font-bold uppercase tracking-[0.16em] text-[var(--muted)]">
        {label}
      </p>
    </article>
  );
}
