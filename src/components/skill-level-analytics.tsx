"use client";

import { useState } from "react";
import type { SkillLevelAnalytics } from "@/lib/analytics/bigquery";

const numberFormat = new Intl.NumberFormat("en-US");

type QueryState =
  | { status: "not-configured" }
  | { status: "ready"; data: SkillLevelAnalytics[] }
  | { status: "error"; message?: string };

export function SkillLevelAnalytics({
  initialState,
}: {
  initialState: QueryState;
}) {
  const [state, setState] = useState<QueryState>(initialState);
  const [isLoading, setIsLoading] = useState(false);

  async function rerunQuery() {
    setIsLoading(true);
    try {
      const response = await fetch("/api/analytics/skill-levels", {
        cache: "no-store",
      });
      const body = (await response.json()) as {
        configured?: boolean;
        data?: SkillLevelAnalytics[];
        error?: string;
        message?: string;
      };

      if (!response.ok) {
        setState({ status: "error", message: body.error ?? body.message });
        return;
      }
      setState({ status: "ready", data: body.data ?? [] });
    } catch {
      setState({
        status: "error",
        message: "The analytics request could not reach the server.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-[var(--muted)]">
          {isLoading ? "Running the BigQuery query..." : "Live query status"}
        </p>
        <button
          type="button"
          onClick={rerunQuery}
          disabled={isLoading}
          className="rounded-xl border border-[var(--line)] px-4 py-3 font-bold text-[var(--ink)] disabled:cursor-wait disabled:opacity-60"
        >
          {isLoading ? "Running..." : "Run query again"}
        </button>
      </div>
      <QueryResult state={state} />
    </div>
  );
}

function QueryResult({ state }: { state: QueryState }) {
  if (state.status === "not-configured") {
    return (
      <div className="rounded-xl bg-[rgba(225,122,87,0.1)] p-5">
        <p className="font-bold text-[var(--coral)]">BigQuery is not connected yet.</p>
        <p className="mt-3 leading-7 text-[var(--muted)]">
          Add the server-only variables described in{" "}
          <code className="text-[var(--ink)]">supabase/analytics/README.md</code>,
          load the raw tables, and this query will populate automatically.
        </p>
      </div>
    );
  }

  if (state.status === "error") {
    return (
      <div className="rounded-xl bg-[rgba(225,122,87,0.1)] p-5">
        <p className="font-bold text-[var(--coral)]">
          The BigQuery query could not be completed.
        </p>
        <p className="mt-3 leading-7 text-[var(--muted)]">
          {state.message ??
            "Check the server logs, credentials, permissions, dataset name, and raw table setup."}
        </p>
      </div>
    );
  }

  if (state.data.length === 0) {
    return (
      <p className="text-[var(--muted)]">
        BigQuery is configured, but the query returned no skill-level rows.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[720px] text-left text-sm">
        <thead className="border-b border-[var(--line)] text-[var(--muted)]">
          <tr>
            <th className="px-3 py-3 font-bold">Level</th>
            <th className="px-3 py-3 font-bold">Rallies</th>
            <th className="px-3 py-3 font-bold">Avg. length</th>
            <th className="px-3 py-3 font-bold">Drop</th>
            <th className="px-3 py-3 font-bold">Drive</th>
            <th className="px-3 py-3 font-bold">Winner</th>
            <th className="px-3 py-3 font-bold">Dinks / rally</th>
          </tr>
        </thead>
        <tbody>
          {state.data.map((row) => (
            <tr
              key={row.skillLevel}
              className="border-b border-[var(--line)] last:border-0"
            >
              <td className="px-3 py-4 font-bold">{row.skillLevel}</td>
              <td className="px-3 py-4">{numberFormat.format(row.rallies)}</td>
              <td className="px-3 py-4">{row.averageRallyLength ?? "—"}</td>
              <td className="px-3 py-4">{row.thirdShotDropPercent}%</td>
              <td className="px-3 py-4">{row.thirdShotDrivePercent}%</td>
              <td className="px-3 py-4">{row.winnerPercent}%</td>
              <td className="px-3 py-4">{row.dinksPerRally}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
