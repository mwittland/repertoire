import Link from "next/link";
import { redirect } from "next/navigation";
import { CreateDrillForm } from "@/components/admin-create-forms";
import { createClient } from "@/lib/supabase/server";

export default async function NewDrillPage() {
  await requireAdmin();
  return (
    <main className="min-h-screen px-5 py-8 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-3xl">
        <Link href="/admin" className="text-sm font-bold text-[var(--teal)]">
          ← Back to admin
        </Link>
        <h1 className="mt-12 text-5xl">Add a drill.</h1>
        <p className="mt-4 text-[var(--muted)]">
          Create the practice exercise first; shot associations can follow.
        </p>
        <CreateDrillForm />
      </div>
    </main>
  );
}

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/admin/drills/new");
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .maybeSingle();
  if (!profile?.is_admin) redirect("/discover");
}
