import Link from "next/link";
import { redirect } from "next/navigation";
import { RepertoireQuiz } from "@/components/repertoire-quiz";
import { listShots } from "@/lib/shots/queries";
import { listRepertoireShots } from "@/lib/repertoire/queries";
import { createClient } from "@/lib/supabase/server";

export default async function RepertoireQuizPage({
  searchParams,
}: {
  searchParams: Promise<{ preset?: string; mode?: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/repertoire/quiz");
  const [{ data: profile, error: profileError }, shots, currentShots] = await Promise.all([
    user
      ? supabase.from("profiles").select("handedness").eq("id", user.id).maybeSingle()
      : Promise.resolve({ data: null, error: null }),
    listShots(),
    listRepertoireShots(),
  ]);
  if (profileError) throw new Error(`Unable to load profile: ${profileError.message}`);
  const { preset, mode } = await searchParams;

  return (
    <main className="min-h-screen px-5 py-8 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-4xl">
        <Link href="/repertoire" className="font-bold text-[var(--teal)]">← Back to repertoire</Link>
        <section className="py-16">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-[var(--coral)]">Build your repertoire</p>
          <h1 className="mt-4 text-5xl leading-none sm:text-6xl">Find a starting point that fits.</h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-[var(--muted)]">
            {mode === "reassessment"
              ? "Retake the full assessment to update your current mastery. Your existing scores will count for 70% and this assessment will count for 30%."
              : "Answer a few questions and we will recommend a shot profile that fits your game. Review it first, then replace your shot repertoire and make it your own."}
          </p>
          <div className="mt-8">
            <RepertoireQuiz
              shots={shots}
              handedness={profile?.handedness ?? "Right"}
              initialPresetId={preset}
              reassessment={mode === "reassessment"}
              currentShots={currentShots}
            />
          </div>
        </section>
      </div>
    </main>
  );
}
