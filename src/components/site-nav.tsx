import Link from "next/link";
import { AdminLink } from "@/components/admin-link";
import { AuthNav } from "@/components/auth-nav";

export function SiteNav() {
  return (
    <nav className="border-b border-[var(--line)]">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-5 py-5 sm:px-8 lg:px-12">
        <Link href="/" className="text-xl font-bold tracking-tight">
          repertoire<span className="text-[var(--coral)]">.</span>
        </Link>
        <div className="flex items-center gap-4 text-sm text-[var(--muted)] sm:gap-6">
          <Link href="/discover" className="hover:text-[var(--ink)]">
            Discover
          </Link>
          <Link
            href="/shots"
            className="hidden hover:text-[var(--ink)] sm:inline"
          >
            Shot library
          </Link>
          <Link
            href="/drills"
            className="hidden hover:text-[var(--ink)] sm:inline"
          >
            Drills
          </Link>
          <Link
            href="/repertoire"
            className="hidden hover:text-[var(--ink)] sm:inline"
          >
            My repertoire
          </Link>
          <Link
            href="/request-shot"
            className="hidden rounded-full border border-[var(--coral)] px-3 py-1.5 text-[var(--coral)] sm:inline"
          >
            Request a shot
          </Link>
          <Link
            href="/request-drill"
            className="hidden rounded-full border border-[var(--teal)] px-3 py-1.5 text-[var(--teal)] sm:inline"
          >
            Request a drill
          </Link>
          <AdminLink />
          <AuthNav />
        </div>
      </div>
    </nav>
  );
}
