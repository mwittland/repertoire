import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AdminShotLibraryTools } from "@/components/admin-shot-library-tools";

export default async function AdminPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/admin");
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .maybeSingle();
  if (!profile?.is_admin) redirect("/discover");
  return (
    <main className="min-h-screen px-5 py-8 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-5xl">
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-[var(--coral)]">
          Admin workspace
        </p>
        <h1 className="mt-4 text-5xl">Shape the library.</h1>
        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          <AdminCard
            href="/admin/shots"
            title="Manage shots"
            description="Add, edit, or delete shots and their situation ranges."
          />
          <AdminCard
            href="/admin/drills"
            title="Manage drills"
            description="Add, edit, or delete practice exercises."
          />
          <AdminCard
            href="/admin/requests"
            title="Review requests"
            description="Moderate shot and drill ideas submitted by players."
          />
        </div>
        <AdminShotLibraryTools />
      </div>
    </main>
  );
}

function AdminCard({
  href,
  title,
  description,
}: {
  href: string;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="rounded-2xl border border-[var(--line)] bg-[var(--card)] p-6 transition hover:border-[var(--teal)]"
    >
      <h2 className="text-2xl">
        {title} <span className="float-right text-[var(--teal)]">→</span>
      </h2>
      <p className="mt-3 leading-6 text-[var(--muted)]">{description}</p>
    </Link>
  );
}
