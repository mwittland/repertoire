import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ShotVideoRequestForm } from "@/components/shot-video-request-form";
import { createClient } from "@/lib/supabase/server";
import { getShotById } from "@/lib/shots/queries";

export default async function RequestShotVideoPage({
  params,
}: {
  params: Promise<{ shotId: string }>;
}) {
  const { shotId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=/shots/${shotId}/request-video`);
  const shot = await getShotById(shotId);
  if (!shot) notFound();

  return (
    <main className="min-h-screen px-5 py-8 sm:px-8">
      <div className="mx-auto max-w-xl">
        <Link href={`/shots/${shot.id}`} className="text-sm font-bold text-[var(--teal)]">
          ← Back to {shot.name}
        </Link>
        <section className="mt-16 rounded-3xl border border-[var(--line)] bg-[var(--card)] p-7 sm:p-9">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-[var(--coral)]">
            Improve the library
          </p>
          <h1 className="mt-4 text-5xl leading-none">Suggest a video</h1>
          <p className="mt-6 leading-7 text-[var(--muted)]">
            Share a YouTube video that demonstrates <strong>{shot.name}</strong>,
            including the start and end seconds we should show. We&apos;ll review
            your suggestion before publishing it.
          </p>
          <ShotVideoRequestForm shotId={shot.id} />
        </section>
      </div>
    </main>
  );
}
