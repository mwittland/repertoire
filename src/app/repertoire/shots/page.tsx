import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { listRepertoireShots } from "@/lib/repertoire/queries";
import { RepertoireShotsList } from "@/components/repertoire-shots-list";

export default async function RepertoireShotsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/repertoire/shots");
  const shots = await listRepertoireShots();

  return (
    <main className="min-h-screen px-5 py-8 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-7xl">
        <Link href="/repertoire" className="text-sm font-bold text-[var(--teal)]">
          ← Back to repertoire
        </Link>
        <header className="mt-12 max-w-3xl">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-[var(--coral)]">
            Your collection
          </p>
          <h1 className="mt-4 text-6xl leading-none">Your repertoire shots.</h1>
          <p className="mt-6 text-lg leading-8 text-[var(--muted)]">
            Review, sort, and open the shots you have chosen to practice.
          </p>
        </header>
        <RepertoireShotsList shots={shots} />
      </div>
    </main>
  );
}
