import { LibraryTabs } from "@/components/library-tabs";
import { listDrills } from "@/lib/drills/queries";
import { listShots } from "@/lib/shots/queries";

type SearchParams = Promise<{ kind?: string }>;

export default async function LibraryPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const kind = params.kind === "drills" ? "drills" : "shots";
  const [shots, drills] = await Promise.all([listShots(), listDrills()]);

  return (
    <main className="min-h-screen px-5 py-8 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-7xl">
        <header className="max-w-3xl">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-[var(--coral)]">
            The library
          </p>
          <h1 className="mt-4 text-6xl leading-none">The practice system.</h1>
          <p className="mt-6 text-lg leading-8 text-[var(--muted)]">
            Browse shots and drills by type, ratings, and court coverage. Add drills to your repertoire to edit and save mastery.
          </p>
        </header>
        <LibraryTabs shots={shots} drills={drills} initialKind={kind} />
      </div>
    </main>
  );
}
