import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { EditShotForm } from "@/components/admin-edit-forms";
import { createClient } from "@/lib/supabase/server";
import { getShotById } from "@/lib/shots/queries";
import { listDrillIdsForShot, listDrills } from "@/lib/drills/queries";

export default async function EditShotPage({
  params,
}: {
  params: Promise<{ shotId: string }>;
}) {
  await requireAdmin();
  const { shotId } = await params;
  const shot = await getShotById(shotId);
  if (!shot) notFound();
  const [drills, selectedDrillIds] = await Promise.all([listDrills(), listDrillIdsForShot(shotId)]);
  return (
    <main className="min-h-screen px-5 py-8 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/admin/shots"
          className="text-sm font-bold text-[var(--teal)]"
        >
          ← Back to shots
        </Link>
        <h1 className="mt-12 text-5xl">Edit shot.</h1>
        <EditShotForm shot={shot} drills={drills.map((drill) => ({ id: drill.id, name: drill.name }))} selectedDrillIds={selectedDrillIds} />
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
