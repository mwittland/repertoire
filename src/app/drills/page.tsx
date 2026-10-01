import Link from "next/link";
import { listDrills } from "@/lib/drills/queries";

export default async function DrillsPage() {
  const drills = await listDrills();
  return (
    <main className="min-h-screen px-5 py-8 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-7xl">
        <Link href="/discover" className="text-sm font-bold text-[var(--teal)]">
          ← Back to discovery
        </Link>
        <header className="mt-12 max-w-2xl">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-[var(--coral)]">
            Practice room
          </p>
          <h1 className="mt-4 text-6xl leading-none tracking-[-0.04em]">
            Turn good ideas into muscle memory.
          </h1>
          <p className="mt-6 text-lg leading-8 text-[var(--muted)]">
            Drills connect the shots you are learning to a repeatable practice
            plan.
          </p>
        </header>
        <div className="mt-7">
          <Link
            href="/request-drill"
            className="rounded-xl bg-[var(--teal)] px-4 py-3 text-sm font-bold text-white"
          >
            Request a missing drill
          </Link>
        </div>
        <section className="mt-12 grid gap-5 pb-20 md:grid-cols-2">
          <div className="rounded-2xl border border-dashed border-[var(--line)] p-6">
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-[var(--coral)]">
              {drills.length} drills
            </p>
            <h2 className="mt-3 text-3xl">Choose a focus</h2>
            <p className="mt-3 text-[var(--muted)]">
              Each drill is linked to the shots it develops.
            </p>
            <Link
              href="/request-drill"
              className="mt-5 inline-block font-bold text-[var(--teal)]"
            >
              Request a drill →
            </Link>
          </div>
          {drills.map((drill) => (
            <article
              key={drill.id}
              className="rounded-2xl border border-[var(--line)] bg-[var(--card)] p-6"
            >
              <h2 className="text-2xl">{drill.name}</h2>
              <p className="mt-3 leading-7 text-[var(--muted)]">
                {drill.description}
              </p>
              <Link
                href={`/drills/${drill.id}`}
                className="mt-6 inline-block font-bold text-[var(--teal)]"
              >
                Open drill →
              </Link>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}
