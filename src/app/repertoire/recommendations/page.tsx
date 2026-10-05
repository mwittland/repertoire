import Link from "next/link";
import { redirect } from "next/navigation";
import { RecommendedShots } from "@/components/recommended-shots";
import { listRecommendedShots } from "@/lib/repertoire/queries";
import { createClient } from "@/lib/supabase/server";

export default async function RecommendedShotsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/repertoire/recommendations");

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("handedness")
    .eq("id", user.id)
    .maybeSingle();
  if (error) throw new Error(`Unable to load profile: ${error.message}`);

  const shots = await listRecommendedShots(profile?.handedness ?? "Right", 0);

  return (
    <main className="min-h-screen px-5 py-8 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-7xl">
        <section className="py-16">
          <Link href="/repertoire" className="font-bold text-[var(--teal)]">
            ← Back to repertoire
          </Link>
          <div className="mt-12">
            <RecommendedShots shots={shots} showShotTypeFilter />
          </div>
        </section>
      </div>
    </main>
  );
}
