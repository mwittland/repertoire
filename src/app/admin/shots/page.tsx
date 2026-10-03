import Link from "next/link";
import { redirect } from "next/navigation";
import { deleteShot } from "@/app/actions/admin";
import { searchShots } from "@/lib/shots/queries";
import { createClient } from "@/lib/supabase/server";

export default async function AdminShotsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; type?: string; sort?: string }>;
}) {
  await requireAdmin();
  const params = await searchParams;
  const allShots = await searchShots(params.q ?? "");
  const shots = allShots
    .filter((shot) => !params.type || shot.shotType === params.type)
    .sort((left, right) =>
      params.sort === "aggression"
        ? (right.aggressionScore ?? 0) - (left.aggressionScore ?? 0)
        : params.sort === "difficulty"
          ? (right.difficulty ?? 0) - (left.difficulty ?? 0)
          : left.name.localeCompare(right.name),
    );
  return (
    <main className="min-h-screen px-5 py-8 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-6xl">
        <Link href="/admin" className="text-sm font-bold text-[var(--teal)]">
          ← Back to admin
        </Link>
        <div className="mt-12 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-[var(--coral)]">
              Admin library
            </p>
            <h1 className="mt-3 text-5xl">Shots.</h1>
          </div>
          <Link
            href="/admin/shots/new"
            className="rounded-xl bg-[var(--ink)] px-4 py-3 text-sm font-bold text-white"
          >
            Add shot
          </Link>
        </div>
        <form
          method="get"
          className="mt-8 grid gap-3 rounded-2xl border border-[var(--line)] bg-[var(--card)] p-4 sm:grid-cols-[1fr_auto_auto]"
        >
          <input
            name="q"
            defaultValue={params.q}
            placeholder="Search shots"
            className="rounded-xl border border-[var(--line)] bg-transparent px-3 py-2 text-[var(--ink)]"
          />
          <select
            name="type"
            defaultValue={params.type ?? ""}
            className="rounded-xl border border-[var(--line)] bg-transparent px-3 py-2 text-[var(--ink)]"
          >
            <option value="">All types</option>
            {["Dink", "Drop", "Drive", "Reset", "Attack", "Putaway", "Lob"].map(
              (type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ),
            )}
          </select>
          <select
            name="sort"
            defaultValue={params.sort ?? "name"}
            className="rounded-xl border border-[var(--line)] bg-transparent px-3 py-2 text-[var(--ink)]"
          >
            <option value="name">Sort by name</option>
            <option value="aggression">Sort by aggression</option>
            <option value="difficulty">Sort by difficulty</option>
          </select>
        </form>
        <section className="mt-10 space-y-3 pb-20">
          {shots.map((shot) => (
            <article
              key={shot.id}
              className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[var(--line)] bg-[var(--card)] p-5"
            >
              <div>
                <h2 className="text-2xl">{shot.name}</h2>
                <p className="mt-1 text-sm text-[var(--muted)]">
                  {shot.shotType} · Difficulty {shot.difficulty} / 100
                </p>
              </div>
              <div className="flex items-center gap-4">
                <Link
                  href={`/admin/shots/${shot.id}/edit`}
                  className="text-sm font-bold text-[var(--teal)]"
                >
                  Edit
                </Link>
                <form action={deleteShot}>
                  <input type="hidden" name="id" value={shot.id} />
                  <button className="text-sm font-bold text-[var(--coral)]">
                    Delete
                  </button>
                </form>
              </div>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/admin/shots");
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .maybeSingle();
  if (!profile?.is_admin) redirect("/discover");
}
