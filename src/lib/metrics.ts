import { createClient } from "@/lib/supabase/server";

export type SiteMetrics = {
  quizCompletions: number;
  discoverySearches: number;
};

export async function incrementSiteMetric(
  metric: "quiz_completions" | "discovery_searches",
) {
  const supabase = await createClient();
  const { error } = await supabase.rpc("increment_site_metric", {
    metric_name: metric,
  });
  if (error) {
    console.error(`Unable to record site metric "${metric}".`, error);
  }
}

export async function getSiteMetrics(): Promise<SiteMetrics> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("site_metrics")
    .select("metric,total");
  if (error) throw new Error(`Unable to load site metrics: ${error.message}`);

  const totals = new Map(
    (data ?? []).map((row) => [String(row.metric), Number(row.total)]),
  );
  return {
    quizCompletions: totals.get("quiz_completions") ?? 0,
    discoverySearches: totals.get("discovery_searches") ?? 0,
  };
}
