import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { EditDrillForm } from "@/components/admin-edit-forms";
import { createClient } from "@/lib/supabase/server";
import { getDrillById } from "@/lib/drills/queries";
import { listShots } from "@/lib/shots/queries";

export default async function EditDrillPage({
  params,
}: {
  params: Promise<{ drillId: string }>;
}) {
  await requireAdmin();
  const { drillId } = await params;
  const drill = await getDrillById(drillId);
  if (!drill) notFound();
  const shots = await listShots();
  return (
    <main className="min-h-screen px-5 py-8 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/admin/drills"
          className="text-sm font-bold text-[var(--teal)]"
        >
          ← Back to drills
        </Link>
        <h1 className="mt-12 text-5xl">Edit drill.</h1>
        <EditDrillForm drill={drill} shots={shots.map((shot) => ({ id: shot.id, name: shot.name }))} />
      </div>
    </main>
  );
}

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/admin/drills");
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .maybeSingle();
  if (!profile?.is_admin) redirect("/discover");
}
