import Link from "next/link";
import { redirect } from "next/navigation";
import { RecommendedDrills } from "@/components/recommended-drills";
import { listRecommendedDrills } from "@/lib/repertoire/queries";
import { createClient } from "@/lib/supabase/server";

export default async function RecommendedDrillsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/repertoire/drill-recommendations");

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("handedness")
    .eq("id", user.id)
    .maybeSingle();
  if (error) throw new Error(`Unable to load profile: ${error.message}`);

  const drills = await listRecommendedDrills(profile?.handedness ?? "Right", 0);

  return (
    <main className="min-h-screen px-5 py-8 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-7xl">
        <section className="py-16">
          <Link href="/repertoire" className="font-bold text-[var(--teal)]">
            ← Back to repertoire
          </Link>
          <div className="mt-12">
            <RecommendedDrills drills={drills} showDrillTypeFilter />
          </div>
        </section>
      </div>
    </main>
  );
}
