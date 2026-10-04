import Link from "next/link";
import { redirect } from "next/navigation";
import {
  updateDrillRequestStatus,
  updateShotRequestStatus,
} from "@/app/actions/admin";
import { createClient } from "@/lib/supabase/server";
import {
  RequestStatusForm,
  type RequestStatus,
} from "@/components/request-status-form";

export default async function AdminRequestsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/admin/requests");
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .maybeSingle();
  if (!profile?.is_admin) redirect("/");
  const { data: requests, error } = await supabase
    .from("shot_requests")
    .select("id,requested_name,video_url,status,created_at")
    .order("created_at", { ascending: false });
  if (error) throw new Error(`Unable to load requests: ${error.message}`);
  const { data: drillRequests, error: drillError } = await supabase
    .from("drill_requests")
    .select("id,requested_name,video_url,status,created_at")
    .order("created_at", { ascending: false });
  if (drillError)
    throw new Error(`Unable to load drill requests: ${drillError.message}`);
  const normalizeStatus = (status: string): RequestStatus =>
    status.toLowerCase() as RequestStatus;

  return (
    <main className="min-h-screen px-5 py-8 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-5xl">
        <Link href="/" className="text-sm font-bold text-[var(--teal)]">
          ← Back to app
        </Link>
        <header className="mt-12">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-[var(--coral)]">
            Admin
          </p>
          <h1 className="mt-4 text-5xl">Shot requests.</h1>
        </header>
        <section className="mt-10 space-y-4 pb-20">
          {requests?.length ? (
            requests.map((request) => (
              <article
                key={request.id}
                className="rounded-2xl border border-[var(--line)] bg-[var(--card)] p-6"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h2 className="text-2xl">{request.requested_name}</h2>
                    <a
                      href={request.video_url}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-2 inline-block text-sm font-bold text-[var(--teal)]"
                    >
                      Open video →
                    </a>
                  </div>
                  <span className="rounded-full bg-[#e5f0e9] px-3 py-1 text-xs font-bold uppercase tracking-[0.12em]">
                    {request.status}
                  </span>
                </div>
                <RequestStatusForm
                  requestId={request.id}
                  status={normalizeStatus(request.status)}
                  action={updateShotRequestStatus}
                />
              </article>
            ))
          ) : (
            <p className="rounded-2xl border border-dashed border-[var(--line)] p-8 text-[var(--muted)]">
              No shot requests yet.
            </p>
          )}
          <header className="border-t border-[var(--line)] pt-12">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-[var(--coral)]">
              Drill requests
            </p>
            <h2 className="mt-2 text-3xl">Practice ideas to review.</h2>
          </header>
          {drillRequests?.length ? (
            drillRequests.map((request) => (
              <article
                key={request.id}
                className="rounded-2xl border border-[var(--line)] bg-[var(--card)] p-6"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h3 className="text-2xl">{request.requested_name}</h3>
                    <a
                      href={request.video_url}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-2 inline-block text-sm font-bold text-[var(--teal)]"
                    >
                      Open video →
                    </a>
                  </div>
                  <span className="rounded-full bg-[#e5f0e9] px-3 py-1 text-xs font-bold uppercase tracking-[0.12em]">
                    {request.status}
                  </span>
                </div>
                <RequestStatusForm
                  requestId={request.id}
                  status={normalizeStatus(request.status)}
                  action={updateDrillRequestStatus}
                />
              </article>
            ))
          ) : (
            <p className="rounded-2xl border border-dashed border-[var(--line)] p-8 text-[var(--muted)]">
              No drill requests yet.
            </p>
          )}
        </section>
      </div>
    </main>
  );
}
