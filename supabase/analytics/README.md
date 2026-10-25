# Pickleball analytics pipeline

The public analytics page uses the generated file at
[`src/data/pickleball-analytics.json`](../../src/data/pickleball-analytics.json).
Regenerate it from the Kaggle extract with:

```powershell
python scripts/analyze_pickleball.py `
  --input C:\path\to\pklmarts-competitive-pickleball-extracts `
  --output src\data\pickleball-analytics.json
```

The SQL in this directory is BigQuery-compatible and mirrors the Python
aggregations. Load the CSV files into the raw tables described in
`schema.sql`, then run `analytics.sql` to produce the aggregate tables used by
the page. No credentials or raw dataset files belong in this repository.

## Dynamic Next.js query setup

The `/analytics` page dynamically queries the raw BigQuery tables for the
skill-level comparison when the project and dataset are configured.
The API response is also available at `/api/analytics/skill-levels`.
The live section includes a **Run query again** button, which calls that API
without reloading the rest of the page. Responses are explicitly marked
`no-store`, so the button requests fresh BigQuery results.

For local development, authenticate with Google Application Default
Credentials:

```powershell
gcloud auth application-default login
```

Then add only these values to `.env.local` (which is gitignored):

```text
GOOGLE_CLOUD_PROJECT=your-gcp-project-id
BIGQUERY_DATASET=your_dataset_name
```

For deployment, use a service account and add all four values:

```text
GOOGLE_CLOUD_PROJECT=your-gcp-project-id
BIGQUERY_DATASET=your_dataset_name
BIGQUERY_CLIENT_EMAIL=analytics-reader@your-gcp-project-id.iam.gserviceaccount.com
BIGQUERY_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_KEY\n-----END PRIVATE KEY-----\n"
```

Do not use the `NEXT_PUBLIC_` prefix. These values are read only by the server.
Do not paste the private key into chat, commit it, or expose it to the browser.

### Google Cloud setup

1. Create or select a Google Cloud project and enable the BigQuery API.
2. Create a dataset, such as `pickleball_analytics`.
3. Create a service account for the application.
4. Grant it `BigQuery Job User` on the project and `BigQuery Data Viewer` on
   the dataset. It only needs write permissions if you later automate loads.
5. Create the raw tables using `schema.sql`.
6. Upload `game.csv`, `rally.csv`, and `shot.csv` into the matching raw tables.
   Confirm that IDs are strings, numeric fields are numeric, and
   `dt_played` is a `DATE`.
7. Run `analytics.sql` if you want persisted aggregate tables.
8. Start Next.js after setting `.env.local`; the page query uses the raw tables
   directly and does not read from the shot library or Supabase.

### Production troubleshooting

The live route is pinned to the Node.js runtime because the BigQuery SDK is a
server-side Node dependency. In Vercel, set the four deployment variables for
the same environment as the deployment, then redeploy; changing an environment
variable does not update an existing deployment.

If the page shows a query error, inspect the Vercel function logs for the
underlying BigQuery error. Common causes are a missing variable, a private key
with incorrect newline formatting, a service account without `BigQuery Job
User` or dataset `BigQuery Data Viewer`, a dataset in a different project, or
raw tables with names/types that differ from `game`, `rally`, and `shot`.

The query is intentionally server-side and parameter-free for now: the SQL
uses fixed table identifiers from validated environment values, while shot
types and aggregate definitions remain in source control. If you later add
user-selected filters, validate them and pass values as BigQuery query
parameters rather than interpolating them into SQL.
