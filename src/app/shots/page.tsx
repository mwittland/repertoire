import Link from "next/link";
import { ShotCard } from "@/components/shot-card";
import { listShots } from "@/lib/shots/queries";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function numberParam(value: string | string[] | undefined) {
  const parsed = Number(Array.isArray(value) ? value[0] : value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

export default async function ShotsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const filters = {
    courtX: numberParam(params.x),
    courtY: numberParam(params.y),
    ballHeight: numberParam(params.height),
    intent: numberParam(params.intent),
    difficulty: numberParam(params.difficulty),
  };
  const shots = await listShots(filters);

  return (
    <main className="min-h-screen px-5 py-8 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-7xl">
        <Link href="/discover" className="text-sm font-bold text-[var(--teal)]">
          ← Back to discovery
        </Link>
        <header className="mt-12 max-w-2xl">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-[var(--coral)]">
            The library
          </p>
          <h1 className="mt-4 text-6xl leading-none tracking-[-0.04em]">
            Every shot has a moment.
          </h1>
          <p className="mt-6 text-lg leading-8 text-[var(--muted)]">
            Browse the catalog by the situation a shot is built for. These
            filters describe one point on court, just like discovery.
          </p>
        </header>
        <div className="mt-7 flex flex-wrap gap-3">
          <Link
            href="/request-shot"
            className="rounded-xl bg-[var(--coral)] px-4 py-3 text-sm font-bold text-white"
          >
            Request a missing shot
          </Link>
          <Link
            href="/request-drill"
            className="rounded-xl border border-[var(--line)] px-4 py-3 text-sm font-bold text-[var(--teal)]"
          >
            Request a drill
          </Link>
        </div>
        <form
          className="mt-12 grid gap-4 rounded-2xl border border-[var(--line)] bg-[var(--card)] p-5 sm:grid-cols-5"
          method="get"
        >
          <Filter
            label="Court X"
            name="x"
            placeholder="-15 to 15"
            defaultValue={params.x}
          />
          <Filter
            label="Court Y"
            name="y"
            placeholder="0 to 30"
            defaultValue={params.y}
          />
          <Filter
            label="Ball height"
            name="height"
            placeholder="0 to 10"
            defaultValue={params.height}
          />
          <Filter
            label="Intent"
            name="intent"
            placeholder="0 to 100"
            defaultValue={params.intent}
          />
          <label className="text-sm text-[var(--muted)]">
            Difficulty
            <select
              name="difficulty"
              defaultValue={params.difficulty ?? ""}
              className="mt-2 w-full rounded-xl border border-[var(--line)] bg-transparent px-3 py-2 text-[var(--ink)]"
            >
              <option value="">Any</option>
              {[0, 1, 2, 3, 4, 5].map((value) => (
                <option key={value} value={value}>
                  {value} / 5
                </option>
              ))}
            </select>
          </label>
          <button className="rounded-xl bg-[var(--ink)] px-5 py-3 font-bold text-white sm:col-span-5 sm:justify-self-end">
            Apply filters
          </button>
        </form>
        <section className="pb-20 pt-12">
          <div className="flex items-end justify-between">
            <h2 className="text-3xl">{shots.length} shots</h2>
            <Link
              href="/shots"
              className="text-sm font-bold text-[var(--teal)]"
            >
              Clear filters
            </Link>
          </div>
          <div className="mt-7 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {shots.map((shot) => (
              <ShotCard key={shot.id} shot={shot} />
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

function Filter({
  label,
  name,
  placeholder,
  defaultValue,
}: {
  label: string;
  name: string;
  placeholder: string;
  defaultValue: string | string[] | undefined;
}) {
  return (
    <label className="text-sm text-[var(--muted)]">
      {label}
      <input
        name={name}
        type="number"
        placeholder={placeholder}
        defaultValue={defaultValue}
        className="mt-2 w-full rounded-xl border border-[var(--line)] bg-transparent px-3 py-2 text-[var(--ink)]"
      />
    </label>
  );
}
