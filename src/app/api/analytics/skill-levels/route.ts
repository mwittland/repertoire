import { NextResponse } from "next/server";
import {
  BigQueryConfigurationError,
  BigQueryQueryError,
  getSkillLevelAnalytics,
  isBigQueryConfigured,
} from "@/lib/analytics/bigquery";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  try {
    if (!isBigQueryConfigured()) {
      return NextResponse.json(
        { configured: false, data: [], message: "BigQuery is not configured." },
        { status: 503 },
      );
    }

    return NextResponse.json(
      {
        configured: true,
        data: await getSkillLevelAnalytics(),
      },
      {
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      },
    );
  } catch (error) {
    if (
      error instanceof BigQueryConfigurationError ||
      error instanceof BigQueryQueryError
    ) {
      console.error("BigQuery analytics endpoint failed.", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    throw error;
  }
}
