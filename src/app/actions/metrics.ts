"use server";

import { incrementSiteMetric } from "@/lib/metrics";

export async function recordQuizCompletion() {
  await incrementSiteMetric("quiz_completions");
}
