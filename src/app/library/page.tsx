import { LibrarySearch } from "@/components/library-search";
import { LibraryTabs } from "@/components/library-tabs";
import { searchDrills } from "@/lib/drills/queries";
import { searchShots } from "@/lib/shots/queries";

type SearchParams = Promise<{ q?: string; kind?: string }>;

export default async function LibraryPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const query = typeof params.q === "string" ? params.q : "";
  const kind = params.kind === "drills" ? "drills" : "shots";
  const [shots, drills] = await Promise.all([
    searchShots(query),
    searchDrills(query),
  ]);

  return (
    <main className="min-h-screen px-5 py-8 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-7xl">
        <header className="max-w-3xl">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-[var(--coral)]">
            The library
          </p>
          <h1 className="mt-4 text-6xl leading-none">
            Find your next practice idea.
          </h1>
          <p className="mt-6 text-lg leading-8 text-[var(--muted)]">
            Search the shot and drill libraries from one place.
          </p>
        </header>
        <LibrarySearch key={query} initialValue={query} />
        <LibraryTabs shots={shots} drills={drills} initialKind={kind} />
      </div>
    </main>
  );
}
