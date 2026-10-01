import Link from "next/link";
import { DrillRequestForm } from "@/components/drill-request-form";

export default function RequestDrillPage() {
  return (
    <main className="min-h-screen px-5 py-8 sm:px-8">
      <div className="mx-auto max-w-xl">
        <Link href="/drills" className="text-sm font-bold text-[var(--teal)]">
          ← Back to drills
        </Link>
        <section className="mt-16 rounded-3xl border border-[var(--line)] bg-[var(--card)] p-7 sm:p-9">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-[var(--coral)]">
            Expand the practice room
          </p>
          <h1 className="mt-4 text-5xl leading-none">
            Need a new drill?
          </h1>
          <p className="mt-6 leading-7 text-[var(--muted)]">
            Send us a video and a name. We&apos;ll review the drill and connect
            it to the shots it develops.
          </p>
          <DrillRequestForm />
        </section>
      </div>
    </main>
  );
}
