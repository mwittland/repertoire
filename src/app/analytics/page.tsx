import Link from "next/link";
import analytics from "@/data/pickleball-analytics.json";
import {
  BigQueryConfigurationError,
  BigQueryQueryError,
  getSkillLevelAnalytics,
  isBigQueryConfigured,
  type SkillLevelAnalytics,
} from "@/lib/analytics/bigquery";

export const dynamic = "force-dynamic";

const numberFormat = new Intl.NumberFormat("en-US");

export default async function AnalyticsPage() {
  const skillLevelQuery = await loadSkillLevelQuery();
  const maxShotCount = analytics.shotTypes[0].count;
  const maxRallyBucket = Math.max(
    ...analytics.rallyLengths.map((bucket) => bucket.count),
  );

  return (
    <main className="min-h-screen px-5 py-8 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-7xl">
        <header className="max-w-4xl py-16">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-[var(--coral)]">
            Match analytics
          </p>
          <h1 className="mt-4 text-6xl leading-none sm:text-7xl">
            What the rally data says.
          </h1>
          <p className="mt-7 max-w-3xl text-lg leading-8 text-[var(--muted)]">
            An exploratory view of {numberFormat.format(analytics.overview.shots)}{" "}
            annotated shots from competitive pickleball games. These are
            descriptive patterns in the dataset, not prescriptions for how
            every player should play.
          </p>
          <p className="mt-4 text-sm text-[var(--muted)]">
            Source: {analytics.source.dataset}, version {analytics.source.version}{" "}
            · {analytics.source.dateRange.start} to{" "}
            {analytics.source.dateRange.end}
          </p>
        </header>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Metric label="Games" value={analytics.overview.games} />
          <Metric label="Rallies" value={analytics.overview.rallies} />
          <Metric label="Median rally" value={`${analytics.overview.medianRallyLength} shots`} />
          <Metric label="Longest rally" value={`${analytics.overview.longestRally} shots`} />
        </section>

        <section className="mt-12 grid gap-5 lg:grid-cols-2">
          <Panel
            eyebrow="01 / Rally shape"
            title="Most rallies finish early"
            description={`The average rally is ${analytics.overview.averageRallyLength} shots, while the 90th percentile reaches ${analytics.overview.p90RallyLength} shots.`}
          >
            <div className="space-y-4">
              {analytics.rallyLengths.map((bucket) => (
                <Bar
                  key={bucket.label}
                  label={`${bucket.label} shots`}
                  value={bucket.count}
                  max={maxRallyBucket}
                  suffix={`${numberFormat.format(bucket.count)} rallies`}
                />
              ))}
            </div>
          </Panel>

          <Panel
            eyebrow="02 / Shot mix"
            title="Dinks lead the shot mix"
            description="The ten most common shot labels show how much of the dataset is played at and around the non-volley zone."
          >
            <div className="space-y-4">
              {analytics.shotTypes.slice(0, 10).map((shot) => (
                <Bar
                  key={shot.code}
                  label={shot.label}
                  value={shot.count}
                  max={maxShotCount}
                  suffix={`${shot.percent}%`}
                />
              ))}
            </div>
          </Panel>
        </section>

        <section className="mt-5">
          <Panel
            eyebrow="03 / Third-shot comparison"
            title="Drop, drive, or lob?"
            description="The rally ending is counted after the selected third shot. Small samples, especially the lob, should be interpreted carefully."
          >
            <div className="grid gap-5 md:grid-cols-3">
              {analytics.thirdShotOutcomes.map((shot) => (
                <article
                  key={shot.code}
                  className="rounded-xl border border-[var(--line)] p-5"
                >
                  <p className="text-lg font-bold">{shot.label}</p>
                  <p className="mt-1 text-sm text-[var(--muted)]">
                    {numberFormat.format(shot.rallies)} rallies
                  </p>
                  <div className="mt-5 space-y-3">
                    {shot.outcomes.map((outcome) => (
                      <div key={outcome.label} className="flex items-center justify-between gap-3 text-sm">
                        <span className="text-[var(--muted)]">{outcome.label}</span>
                        <span className="font-bold">{outcome.percent}%</span>
                      </div>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </Panel>
        </section>

        <section className="mt-5 grid gap-5 lg:grid-cols-2">
          <Panel
            eyebrow="04 / Common sequence"
            title="The opening is remarkably consistent"
            description="Every top-three sequence begins with a serve and return; the third shot is where the paths separate."
          >
            <div className="space-y-3">
              {analytics.topSequences.map((sequence) => (
                <div
                  key={sequence.sequence}
                  className="flex items-center justify-between gap-4 rounded-xl border border-[var(--line)] px-4 py-3"
                >
                  <span className="text-sm text-[var(--muted)]">{sequence.sequence}</span>
                  <span className="shrink-0 font-bold">
                    {numberFormat.format(sequence.count)}
                  </span>
                </div>
              ))}
            </div>
          </Panel>

          <Panel
            eyebrow="05 / How to read this"
            title="A foundation for the next layer"
            description="This first pass makes the raw match data legible. The next useful layer is player- and context-aware analysis, rather than treating aggregate outcomes as universal strategy."
          >
            <div className="rounded-xl bg-[rgba(93,184,167,0.1)] p-5">
              <p className="font-bold text-[var(--teal)]">
                {analytics.overview.annotationCoveragePercent}% of rallies have
                ordered shot annotations.
              </p>
              <p className="mt-3 leading-7 text-[var(--muted)]">
                The Python generator and BigQuery transformations preserve the
                same definitions so this page can be refreshed from a future
                dataset version without hand-editing the numbers.
              </p>
              <Link
                href="/help"
                className="mt-5 inline-block rounded-xl border border-[var(--line)] px-4 py-3 font-bold"
              >
                Explore the shot system →
              </Link>
            </div>
          </Panel>
        </section>

        <section className="mt-5">
          <Panel
            eyebrow="06 / BigQuery live query"
            title="How strategy changes by skill level"
            description="This section is designed to read directly from the BigQuery raw tables. It remains explicit about setup status until those tables and credentials are configured."
          >
            <SkillLevelQueryState state={skillLevelQuery} />
          </Panel>
        </section>
      </div>
    </main>
  );
}

type SkillLevelQueryState =
  | { status: "not-configured" }
  | { status: "ready"; data: SkillLevelAnalytics[] }
  | { status: "error" };

async function loadSkillLevelQuery(): Promise<SkillLevelQueryState> {
  try {
    if (!isBigQueryConfigured()) return { status: "not-configured" };
    return { status: "ready", data: await getSkillLevelAnalytics() };
  } catch (error) {
    if (
      error instanceof BigQueryConfigurationError ||
      error instanceof BigQueryQueryError
    ) {
      console.error(error.message);
      return { status: "error" };
    }
    throw error;
  }
}

function SkillLevelQueryState({ state }: { state: SkillLevelQueryState }) {
  if (state.status === "not-configured") {
    return (
      <div className="rounded-xl bg-[rgba(225,122,87,0.1)] p-5">
        <p className="font-bold text-[var(--coral)]">BigQuery is not connected yet.</p>
        <p className="mt-3 leading-7 text-[var(--muted)]">
          Add the server-only variables described in{" "}
          <code className="text-[var(--ink)]">supabase/analytics/README.md</code>,
          load the raw tables, and this query will populate automatically.
        </p>
      </div>
    );
  }

  if (state.status === "error") {
    return (
      <div className="rounded-xl bg-[rgba(225,122,87,0.1)] p-5">
        <p className="font-bold text-[var(--coral)]">
          The BigQuery query could not be completed.
        </p>
        <p className="mt-3 leading-7 text-[var(--muted)]">
          Check the server logs, service-account permissions, dataset name, and
          raw table setup. The local summary above is still available.
        </p>
      </div>
    );
  }

  if (state.data.length === 0) {
    return (
      <p className="text-[var(--muted)]">
        BigQuery is configured, but the query returned no skill-level rows.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[720px] text-left text-sm">
        <thead className="border-b border-[var(--line)] text-[var(--muted)]">
          <tr>
            <th className="px-3 py-3 font-bold">Level</th>
            <th className="px-3 py-3 font-bold">Rallies</th>
            <th className="px-3 py-3 font-bold">Avg. length</th>
            <th className="px-3 py-3 font-bold">Drop</th>
            <th className="px-3 py-3 font-bold">Drive</th>
            <th className="px-3 py-3 font-bold">Winner</th>
            <th className="px-3 py-3 font-bold">Dinks / rally</th>
          </tr>
        </thead>
        <tbody>
          {state.data.map((row) => (
            <tr key={row.skillLevel} className="border-b border-[var(--line)] last:border-0">
              <td className="px-3 py-4 font-bold">{row.skillLevel}</td>
              <td className="px-3 py-4">{numberFormat.format(row.rallies)}</td>
              <td className="px-3 py-4">{row.averageRallyLength ?? "—"}</td>
              <td className="px-3 py-4">{row.thirdShotDropPercent}%</td>
              <td className="px-3 py-4">{row.thirdShotDrivePercent}%</td>
              <td className="px-3 py-4">{row.winnerPercent}%</td>
              <td className="px-3 py-4">{row.dinksPerRally}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: number | string }) {
  return (
    <article className="rounded-2xl border border-[var(--line)] bg-[var(--card)] p-6">
      <p className="text-3xl font-bold">{typeof value === "number" ? numberFormat.format(value) : value}</p>
      <p className="mt-2 text-sm font-bold uppercase tracking-[0.16em] text-[var(--muted)]">
        {label}
      </p>
    </article>
  );
}

function Panel({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-[var(--line)] bg-[var(--card)] p-6 sm:p-8">
      <p className="text-sm font-bold uppercase tracking-[0.16em] text-[var(--coral)]">
        {eyebrow}
      </p>
      <h2 className="mt-3 text-3xl">{title}</h2>
      <p className="mt-3 max-w-2xl leading-7 text-[var(--muted)]">{description}</p>
      <div className="mt-7">{children}</div>
    </section>
  );
}

function Bar({
  label,
  value,
  max,
  suffix,
}: {
  label: string;
  value: number;
  max: number;
  suffix: string;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-3 text-sm">
        <span className="font-bold">{label}</span>
        <span className="text-[var(--muted)]">{suffix}</span>
      </div>
      <div className="h-2 rounded-full bg-[var(--line)]">
        <div
          className="h-2 rounded-full bg-[var(--teal)]"
          style={{ width: `${Math.max(3, (value / max) * 100)}%` }}
        />
      </div>
    </div>
  );
}
