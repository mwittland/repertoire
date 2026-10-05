import Link from "next/link";
import { redirect } from "next/navigation";
import { RepertoireDrillQuiz } from "@/components/repertoire-drill-quiz";
import { listDrills } from "@/lib/drills/queries";
import { createClient } from "@/lib/supabase/server";

export default async function DrillQuizPage({ searchParams }: { searchParams: Promise<{ preset?: string }> }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/repertoire/drills/quiz");
  const drills = await listDrills();
  const { preset } = await searchParams;
  return (
    <main className="min-h-screen px-5 py-8 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-4xl">
        <Link href="/repertoire/drills/build" className="font-bold text-[var(--teal)]">← Back to drill quick start</Link>
        <section className="py-16">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-[var(--coral)]">Personalized drills</p>
          <h1 className="mt-4 text-5xl leading-none sm:text-6xl">Find a routine that fits.</h1>
          <div className="mt-8"><RepertoireDrillQuiz drills={drills} initialPresetId={preset} /></div>
        </section>
      </div>
    </main>
  );
}
