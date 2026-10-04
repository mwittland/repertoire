import Link from "next/link";
import { ShotRequestForm } from "@/components/shot-request-form";

export default function RequestShotPage() {
  return (
    <main className="min-h-screen px-5 py-8 sm:px-8">
      <div className="mx-auto max-w-xl">
        <Link href="/" className="text-sm font-bold text-[var(--teal)]">
          ← Back to home
        </Link>
        <section className="mt-16 rounded-3xl border border-[var(--line)] bg-[var(--card)] p-7 sm:p-9">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-[var(--coral)]">
            Expand the library
          </p>
          <h1 className="mt-4 text-5xl leading-none">
            Can&apos;t find your shot?
          </h1>
          <p className="mt-6 leading-7 text-[var(--muted)]">
            Send us a video and a name. We&apos;ll review it and shape the range
            information around the situation where it belongs.
          </p>
          <ShotRequestForm />
          <p className="mt-6 text-center text-sm text-[var(--muted)]">
            Looking for a practice exercise?{" "}
            <Link
              href="/request-drill"
              className="font-bold text-[var(--teal)]"
            >
              Request a drill →
            </Link>
          </p>
        </section>
      </div>
    </main>
  );
}
