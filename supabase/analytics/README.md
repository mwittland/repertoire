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
aggregations. It was used for offline analysis of the raw CSV extracts. The
Next.js app does not connect to BigQuery at runtime: it serves the committed
`src/data/pickleball-analytics.json` snapshot instead. No credentials or raw
dataset files belong in this repository.

To reproduce the offline BigQuery analysis, load the CSV files into the raw
tables described in `schema.sql`, then run `analytics.sql` and export the
resulting aggregates into the generated JSON as needed. The deployed app does
not require Google Cloud credentials or BigQuery environment variables.

The generated snapshot also includes offline skill-level aggregates for rally
length, dinks per rally, and third-shot drop and drive percentages. These are
computed by `scripts/analyze_pickleball.py` and served as static JSON; the app
does not query BigQuery or require the raw dataset at runtime.

## Static rally forecast predictions

The downloaded model export can be run locally with the cached
prediction-server Docker image. Generate the static examples used by the
analytics page with:

```powershell
python scripts\generate_rally_forecast_predictions.py `
  --output src\data\rally-forecast-predictions.json
```

The Docker server must be running locally at `http://localhost:8501/predict`
when this script runs. The generated JSON is the only model output used by the
website; production does not download, host, or query the Vertex model.
The snapshot contains 100 predictions covering five skill levels, current rally
lengths 3 through 7, and length-aware representative three-shot sequences.
Three-shot scenarios use serve, return, and a drop or drive. Four-shot
scenarios begin with the return, five-shot scenarios begin with the third shot,
and six- and seven-shot scenarios use broader continuation patterns, including
consecutive hand battles. Seven-shot scenarios do not include third-shot labels.
The page provides selectors for those precomputed combinations.

## Rally-length Vertex AI training data

The selected first model uses only:

- `current_length`
- `skill_level`
- `shot_two_ago`
- `shot_one_ago`
- `latest_shot`

Run `rally_forecast_training.sql` after loading the raw tables to create
`analytics.rally_forecast_training`. It creates a snapshot after each
annotated shot from rally length 3 through 15 and labels whether the final
rally reaches 7, 9, 11, or 15 shots. Future shots and the final outcome are
never included as input features. The split is by `game_id`, so snapshots from
the same game cannot leak across train, validation, and test sets.

Vertex AI should use one binary classification job per target column:

```text
rally_reaches_7
rally_reaches_9
rally_reaches_11
rally_reaches_15
```

The first recommended target is `rally_reaches_11`. The resulting model
probability is directly interpretable as the odds that the current rally
reaches at least 11 shots. Add the other thresholds after validating the first
model's calibration and test performance.

For each target, filter training rows to snapshots before the target threshold:

```sql
WHERE current_length < 11
  AND data_split IN ('TRAIN', 'VALIDATE', 'TEST')
```

For example, the `rally_reaches_11` model should train only on
`current_length < 11`; rows at 11 or more shots are necessarily positive and
would not teach the model anything.

### Baseline evaluation

Before training the Vertex model, the TEST split was evaluated using
train-split empirical probabilities. The comparison used 17,103 snapshots
with `current_length < 11`:

| Features | Brier score | Log loss |
| --- | ---: | ---: |
| Current length | 0.201 | 0.590 |
| Current length + skill level | 0.190 | 0.563 |
| Current length + last three shots | 0.176 | 0.543 |

The last-three-shot features therefore add measurable signal beyond current
rally length, and outperform the skill-level baseline on this held-out data.
These metrics are a baseline for Vertex model evaluation; the deployed model
should improve on them and should also be checked for calibration.

### First Vertex model

The first bounded AutoML Tabular training run completed in `us-central1`
without deploying an endpoint:

- Model: `rally-forecast-11-model`
- Vertex model ID: `5306111724007456768`
- Target: `rally_reaches_11`
- Training source: `rally_forecast_11_training`
- Budget: 2,500 milli-node-hours
- ROC-AUC: 0.837
- PR-AUC: 0.834
- Log loss: 0.504

The Vertex log loss improved on the empirical-feature baseline of 0.543.
Before production use, query representative predictions, verify probability
calibration, and keep the model behind a server-side prediction route. Do not
expose Vertex credentials or call the endpoint directly from the browser.

The model was exported successfully as a TensorFlow SavedModel, but the
export depends on Google's AutoML Tabular runtime operation
`DecodeProtoSparseV4`. Standard TensorFlow Serving and public Python
`struct2tensor` packages cannot load this export. Therefore, do not deploy
this particular export directly to Cloud Run. Use a Vertex online endpoint for
temporary testing, or retrain a portable custom model if scale-to-zero Cloud
Run serving is a hard requirement.
