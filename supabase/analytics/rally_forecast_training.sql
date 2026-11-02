-- Build leakage-safe snapshots for Vertex AI binary classifiers.
-- Each row describes what was known after the current_length-th shot.
-- Train separate models with one of the rally_reaches_* columns as target.

CREATE OR REPLACE TABLE `analytics.rally_forecast_training` AS
WITH ordered_shots AS (
  SELECT
    rally_id,
    shot_nbr,
    COALESCE(shot_type, 'Missing') AS shot_type
  FROM `raw.shot`
),
candidate_snapshots AS (
  SELECT
    rally.rally_id,
    rally.game_id,
    game.skill_lvl AS skill_level,
    current_length,
    rally.rally_len AS final_rally_length
  FROM `raw.rally` AS rally
  JOIN `raw.game` AS game USING (game_id)
  CROSS JOIN UNNEST(
    GENERATE_ARRAY(3, LEAST(rally.rally_len, 15))
  ) AS current_length
  WHERE rally.rally_len IS NOT NULL
),
snapshots AS (
  SELECT
    candidate.rally_id,
    candidate.game_id,
    candidate.skill_level,
    candidate.current_length,
    candidate.final_rally_length,
    MAX(IF(shot.shot_nbr = candidate.current_length - 2, shot.shot_type, NULL))
      AS shot_two_ago,
    MAX(IF(shot.shot_nbr = candidate.current_length - 1, shot.shot_type, NULL))
      AS shot_one_ago,
    MAX(IF(shot.shot_nbr = candidate.current_length, shot.shot_type, NULL))
      AS latest_shot,
    COUNTIF(
      shot.shot_nbr BETWEEN candidate.current_length - 2
      AND candidate.current_length
    ) AS annotated_last_three
  FROM candidate_snapshots AS candidate
  JOIN ordered_shots AS shot USING (rally_id)
  GROUP BY
    candidate.rally_id,
    candidate.game_id,
    candidate.skill_level,
    candidate.current_length,
    candidate.final_rally_length
)
SELECT
  rally_id,
  game_id,
  skill_level,
  current_length,
  shot_two_ago,
  shot_one_ago,
  latest_shot,
  final_rally_length >= 7 AS rally_reaches_7,
  final_rally_length >= 9 AS rally_reaches_9,
  final_rally_length >= 11 AS rally_reaches_11,
  final_rally_length >= 15 AS rally_reaches_15,
  CASE
    WHEN MOD(ABS(FARM_FINGERPRINT(game_id)), 10) < 8 THEN 'TRAIN'
    WHEN MOD(ABS(FARM_FINGERPRINT(game_id)), 10) = 8 THEN 'VALIDATE'
    ELSE 'TEST'
  END AS data_split
FROM snapshots
WHERE annotated_last_three = 3;
