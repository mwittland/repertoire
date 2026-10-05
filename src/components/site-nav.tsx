import Link from "next/link";
import { AdminLink } from "@/components/admin-link";
import { AuthNav } from "@/components/auth-nav";

export function SiteNav() {
  return (
    <nav className="site-nav sticky top-0 z-50 border-b border-[var(--line)]">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-5 py-5 sm:px-8 lg:px-12">
        <Link
          href="/"
          className="text-xl font-bold tracking-tight text-[var(--ink)]"
        >
          repertoire<span className="text-[var(--coral)]">pb</span>
        </Link>
        <div className="flex items-center gap-4 text-sm text-[var(--muted)] sm:gap-6">
          <Link href="/repertoire" className="nav-link">
            Repertoire
          </Link>
          <Link href="/discover" className="nav-link">
            Discover
          </Link>
          <Link href="/library" className="nav-link">
            Library
          </Link>
          <Link href="/help" className="nav-link">
            Help
          </Link>
          <AdminLink />
          <AuthNav />
        </div>
      </div>
    </nav>
  );
}
