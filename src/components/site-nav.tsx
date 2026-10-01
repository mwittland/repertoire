import Link from "next/link";
import { AdminLink } from "@/components/admin-link";
import { AuthNav } from "@/components/auth-nav";

export function SiteNav() {
  return (
    <nav className="site-nav sticky top-0 z-50 border-b border-[var(--line)]">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-5 py-5 sm:px-8 lg:px-12">
        <Link href="/" className="text-xl font-bold tracking-tight text-[var(--ink)]">
          repertoire<span className="text-[var(--coral)]">pb</span>
        </Link>
        <div className="flex items-center gap-4 text-sm text-[var(--muted)] sm:gap-6">
          <Link href="/discover" className="nav-link">
            Discover
          </Link>
          <details className="library-menu">
            <summary className="nav-link cursor-pointer list-none">Library</summary>
            <div className="library-menu-panel">
              <Link href="/shots" className="nav-link">Shots</Link>
              <Link href="/drills" className="nav-link">Drills</Link>
            </div>
          </details>
          <Link href="/repertoire" className="nav-link">
            Repertoire
          </Link>
          <AdminLink />
          <AuthNav />
        </div>
      </div>
    </nav>
  );
}
