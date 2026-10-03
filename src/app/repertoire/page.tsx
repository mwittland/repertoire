import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { listRepertoireShots } from "@/lib/repertoire/queries";
import { HowItWorksMap } from "@/components/how-it-works-map";

export default async function RepertoirePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/repertoire");
  const shots = await listRepertoireShots();

  return (
    <main className="min-h-screen px-5 py-8 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-7xl">
        <section className="py-20">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-[var(--coral)]">
            Your collection
          </p>
          <h1 className="mt-4 text-6xl leading-none">Your repertoire.</h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-[var(--muted)]">
            Build confidence one repeatable shot at a time.
          </p>
          {shots.length > 0 ? (
            <>
              <HowItWorksMap
                shots={shots}
                heading="See your repertoire at a glance."
                description="This map shows only the court coverage of shots you have saved. Adjust the controls to see how your repertoire fits different moments."
              />
              <Link
                href="/repertoire/shots"
                className="mt-8 block rounded-2xl border border-[var(--line)] bg-[var(--card)] p-6 transition hover:border-[var(--teal)]"
              >
                <h2 className="text-2xl">
                  Browse your shots <span className="float-right text-[var(--teal)]">→</span>
                </h2>
                <p className="mt-3 leading-6 text-[var(--muted)]">
                  Sort, review, and open the shots you are practicing.
                </p>
              </Link>
            </>
          ) : (
            <div className="mt-10 rounded-2xl border border-dashed border-[var(--line)] p-8">
              <h2 className="text-2xl">Your collection is waiting.</h2>
              <p className="mt-2 text-[var(--muted)]">
                Find a shot that fits the moment and add it here.
              </p>
              <Link
                href="/discover"
                className="mt-6 inline-block rounded-xl bg-[var(--ink)] px-5 py-4 font-bold text-white"
              >
                Find a shot
              </Link>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
