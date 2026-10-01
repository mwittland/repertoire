import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { listRepertoireEntries } from "@/lib/repertoire/queries";
import { ConfidenceForm } from "@/components/confidence-form";

export default async function RepertoirePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/repertoire");
  const entries = await listRepertoireEntries();

  return (
    <main className="min-h-screen px-5 py-8 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-7xl">
        <section className="py-20">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-[var(--coral)]">
            Your collection
          </p>
          <h1 className="mt-4 text-6xl leading-none">Your repertoire.</h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-[var(--muted)]">
            Build confidence one repeatable shot at a time.
          </p>
          {entries && entries.length > 0 ? (
            <div className="mt-12 grid gap-4 md:grid-cols-2">
              {entries.map((entry) => (
                <article
                  key={entry.shotId}
                  className="rounded-2xl border border-[var(--line)] bg-[var(--card)] p-6"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--coral)]">
                        Difficulty {entry.difficulty} / 100
                      </p>
                      <h2 className="mt-2 text-2xl">{entry.shotName}</h2>
                    </div>
                    <Link
                      href={`/shots/${entry.shotId}`}
                      className="text-sm font-bold text-[var(--teal)]"
                    >
                      View →
                    </Link>
                  </div>
                  <ConfidenceForm
                    shotId={entry.shotId}
                    initialConfidence={entry.confidence}
                    compact
                  />
                </article>
              ))}
            </div>
          ) : (
            <div className="mt-10 rounded-2xl border border-dashed border-[var(--line)] p-8">
              <h2 className="text-2xl">Your collection is waiting.</h2>
              <p className="mt-2 text-[var(--muted)]">
                Find a shot that fits the moment and add it here.
              </p>
              <Link
                href="/discover"
                className="mt-6 inline-block rounded-xl bg-[var(--ink)] px-5 py-4 font-bold text-white"
              >
                Find a shot
              </Link>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
