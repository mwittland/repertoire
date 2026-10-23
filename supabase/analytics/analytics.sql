CREATE OR REPLACE TABLE `analytics.rally_length_distribution` AS
SELECT
  CASE
    WHEN rally_len <= 3 THEN '1-3'
    WHEN rally_len <= 6 THEN '4-6'
    WHEN rally_len <= 10 THEN '7-10'
    WHEN rally_len <= 20 THEN '11-20'
    ELSE '21+'
  END AS length_bucket,
  COUNT(*) AS rally_count
FROM `raw.rally`
WHERE rally_len IS NOT NULL
GROUP BY length_bucket;

CREATE OR REPLACE TABLE `analytics.shot_type_distribution` AS
SELECT
  COALESCE(shot_type, 'Missing') AS shot_type,
  COUNT(*) AS shot_count,
  ROUND(100 * SAFE_DIVIDE(COUNT(*), SUM(COUNT(*)) OVER ()), 1) AS shot_percent
FROM `raw.shot`
GROUP BY shot_type;

CREATE OR REPLACE TABLE `analytics.rally_ending_distribution` AS
SELECT
  COALESCE(ending_type, 'Missing') AS ending_type,
  COUNT(*) AS rally_count,
  ROUND(100 * SAFE_DIVIDE(COUNT(*), SUM(COUNT(*)) OVER ()), 1) AS rally_percent
FROM `raw.rally`
GROUP BY ending_type;

CREATE OR REPLACE TABLE `analytics.third_shot_outcomes` AS
WITH ordered_shots AS (
  SELECT
    rally_id,
    shot_type,
    ROW_NUMBER() OVER (PARTITION BY rally_id ORDER BY shot_nbr) AS shot_position
  FROM `raw.shot`
),
third_shots AS (
  SELECT rally_id, shot_type
  FROM ordered_shots
  WHERE shot_position = 3
    AND shot_type IN ('tsDrp', 'tsDrv', 'tsLob')
)
SELECT
  third_shots.shot_type,
  COALESCE(rally.ending_type, 'Missing') AS ending_type,
  COUNT(*) AS rally_count,
  ROUND(
    100 * SAFE_DIVIDE(
      COUNT(*),
      SUM(COUNT(*)) OVER (PARTITION BY third_shots.shot_type)
    ),
    1
  ) AS rally_percent
FROM third_shots
JOIN `raw.rally` AS rally USING (rally_id)
GROUP BY third_shots.shot_type, ending_type;
