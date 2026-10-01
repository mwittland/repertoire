import Link from "next/link";
import { ShotCard } from "@/components/shot-card";
import { searchDrills } from "@/lib/drills/queries";
import { searchShots } from "@/lib/shots/queries";
import { LibrarySearch } from "@/components/library-search";

type SearchParams = Promise<{ q?: string; kind?: string }>;

export default async function LibraryPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const query = typeof params.q === "string" ? params.q : "";
  const kind = params.kind === "drills" ? "drills" : "shots";
  const [shots, drills] = await Promise.all([searchShots(query), searchDrills(query)]);
  const showShots = kind === "shots";
  const showDrills = kind === "drills";

  return <main className="min-h-screen px-5 py-8 sm:px-8 lg:px-12"><div className="mx-auto max-w-7xl"><header className="max-w-3xl"><p className="text-sm font-bold uppercase tracking-[0.2em] text-[var(--coral)]">The library</p><h1 className="mt-4 text-6xl leading-none">Find your next practice idea.</h1><p className="mt-6 text-lg leading-8 text-[var(--muted)]">Search the shot and drill libraries from one place.</p></header><LibrarySearch key={query} initialValue={query} /><nav className="mt-6 flex gap-2 text-sm"><Tab href={query ? `/library?q=${encodeURIComponent(query)}&kind=shots` : "/library?kind=shots"} active={kind === "shots"}>Shots</Tab><Tab href={query ? `/library?q=${encodeURIComponent(query)}&kind=drills` : "/library?kind=drills"} active={kind === "drills"}>Drills</Tab></nav>{showShots && <section className="mt-12"><div className="flex items-end justify-between"><h2 className="text-3xl">Shots <span className="text-base font-normal text-[var(--muted)]">{shots.length}</span></h2></div><div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">{shots.map((shot) => <ShotCard key={shot.id} shot={shot} />)}</div>{shots.length === 0 && <EmptySearch />}</section>}{showDrills && <section className="mt-12"><div className="flex items-end justify-between"><h2 className="text-3xl">Drills <span className="text-base font-normal text-[var(--muted)]">{drills.length}</span></h2></div><div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">{drills.map((drill) => <article key={drill.id} className="rounded-2xl border border-[var(--line)] bg-[var(--card)] p-6 shadow-[var(--shadow)]"><p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--coral)]">Practice drill</p><h3 className="mt-3 text-2xl">{drill.name}</h3><p className="mt-3 leading-6 text-[var(--muted)]">{drill.description}</p><Link href={`/drills/${drill.id}`} className="mt-6 inline-block font-bold text-[var(--teal)]">Open drill →</Link></article>)}</div>{drills.length === 0 && <EmptySearch />}</section>}</div></main>;
}

function Tab({ href, active, children }: { href: string; active: boolean; children: string }) { return <Link href={href} className={`rounded-full px-4 py-2 font-bold ${active ? "bg-[var(--ink)] text-[var(--paper)]" : "text-[var(--muted)] hover:bg-[var(--card)] hover:text-[var(--ink)]"}`}>{children}</Link>; }
function EmptySearch() { return <p className="mt-6 rounded-2xl border border-dashed border-[var(--line)] p-6 text-[var(--muted)]">No matches found. Try another search.</p>; }