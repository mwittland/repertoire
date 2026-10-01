import Link from "next/link";
import { redirect } from "next/navigation";
import { deleteShot } from "@/app/actions/admin";
import { listShots } from "@/lib/shots/queries";
import { createClient } from "@/lib/supabase/server";

export default async function AdminShotsPage() {
  await requireAdmin();
  const shots = await listShots();
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
        <section className="mt-10 space-y-3 pb-20">
          {shots.map((shot) => (
            <article
              key={shot.id}
              className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[var(--line)] bg-[var(--card)] p-5"
            >
              <div>
                <h2 className="text-2xl">{shot.name}</h2>
                <p className="mt-1 text-sm text-[var(--muted)]">
                  Difficulty {shot.difficulty} / 5
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
