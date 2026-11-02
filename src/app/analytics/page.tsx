import analytics from "@/data/pickleball-analytics.json";
import { RallyForecast } from "@/components/rally-forecast";
import forecast from "@/data/rally-forecast-predictions.json";

const numberFormat = new Intl.NumberFormat("en-US");

export default function AnalyticsPage() {
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
            description="The four most common shot labels show the dominant patterns in the dataset."
          >
            <div className="space-y-4">
              {analytics.shotTypes.slice(0, 4).map((shot) => (
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
            title="Drop versus drive"
            description="The rally ending is counted after the selected third shot. These results compare the two most common third-shot approaches in the dataset."
          >
            <div className="grid gap-5 md:grid-cols-2">
              {analytics.thirdShotOutcomes
                .filter((shot) => shot.code === "tsDrp" || shot.code === "tsDrv")
                .map((shot) => (
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

        <section className="mt-5">
          <Panel
            eyebrow="04 / Skill-level patterns"
            title="How rally patterns vary by skill level"
            description="These aggregates compare rally length, dink volume, and third-shot drop and drive selection across the skill levels represented in the source data."
          >
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead className="border-b border-[var(--line)] text-[var(--muted)]">
                  <tr>
                    <th className="px-3 py-3 font-bold">Level</th>
                    <th className="px-3 py-3 font-bold">Rallies</th>
                    <th className="px-3 py-3 font-bold">Avg. length</th>
                    <th className="px-3 py-3 font-bold">Dinks / rally</th>
                    <th className="px-3 py-3 font-bold">3rd-shot drop</th>
                    <th className="px-3 py-3 font-bold">3rd-shot drive</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.skillLevelInsights.map((row) => (
                    <tr
                      key={row.code}
                      className="border-b border-[var(--line)] last:border-0"
                    >
                      <td className="px-3 py-4 font-bold">{row.label}</td>
                      <td className="px-3 py-4">{numberFormat.format(row.rallies)}</td>
                      <td className="px-3 py-4">{row.averageRallyLength}</td>
                      <td className="px-3 py-4">{row.dinksPerRally}</td>
                      <td className="px-3 py-4">{row.thirdShotDropPercent}%</td>
                      <td className="px-3 py-4">{row.thirdShotDrivePercent}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>
        </section>

        <section className="mt-5">
          <Panel
            eyebrow="05 / Rally forecast"
            title="The odds of reaching 11 shots"
            description="This machine-learning model estimates the chance that the current rally will reach at least 11 shots based on skill level, rally length, and the most recent shots."
          >
            <RallyForecast predictions={forecast.predictions} />
          </Panel>
        </section>
      </div>
    </main>
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
