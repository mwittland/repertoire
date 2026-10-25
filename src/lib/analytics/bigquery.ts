import { BigQuery } from "@google-cloud/bigquery";

const identifierPattern = /^[A-Za-z0-9_.-]+$/;
const datasetPattern = /^[A-Za-z0-9_]+$/;

export type SkillLevelAnalytics = {
  skillLevel: string;
  rallies: number;
  averageRallyLength: number | null;
  thirdShotDropPercent: number;
  thirdShotDrivePercent: number;
  thirdShotLobPercent: number;
  winnerPercent: number;
  errorPercent: number;
  dinksPerRally: number;
  handBattlesPerRally: number;
};

export class BigQueryConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "BigQueryConfigurationError";
  }
}

export class BigQueryQueryError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "BigQueryQueryError";
  }
}

function getConfig() {
  const values = {
    projectId: process.env.GOOGLE_CLOUD_PROJECT,
    dataset: process.env.BIGQUERY_DATASET,
    clientEmail: process.env.BIGQUERY_CLIENT_EMAIL,
    privateKey: process.env.BIGQUERY_PRIVATE_KEY,
  };
  if (!values.projectId && !values.dataset) return null;
  if (!values.projectId || !values.dataset) {
    throw new BigQueryConfigurationError(
      "Set GOOGLE_CLOUD_PROJECT and BIGQUERY_DATASET together.",
    );
  }
  if (Boolean(values.clientEmail) !== Boolean(values.privateKey)) {
    throw new BigQueryConfigurationError(
      "Set BIGQUERY_CLIENT_EMAIL and BIGQUERY_PRIVATE_KEY together, or omit both to use local Google credentials.",
    );
  }
  if (
    !identifierPattern.test(values.projectId!) ||
    !datasetPattern.test(values.dataset!)
  ) {
    throw new BigQueryConfigurationError(
      "GOOGLE_CLOUD_PROJECT or BIGQUERY_DATASET contains an invalid identifier.",
    );
  }

  return {
    projectId: values.projectId!,
    dataset: values.dataset!,
    clientEmail: values.clientEmail,
    privateKey: values.privateKey?.replace(/\\n/g, "\n"),
  };
}

export function isBigQueryConfigured() {
  return getConfig() !== null;
}

export async function getSkillLevelAnalytics(): Promise<SkillLevelAnalytics[]> {
  const config = getConfig();
  if (!config) return [];

  const bigQuery = new BigQuery(
    config.clientEmail && config.privateKey
      ? {
          projectId: config.projectId,
          credentials: {
            client_email: config.clientEmail,
            private_key: config.privateKey,
          },
        }
      : { projectId: config.projectId },
  );
  const table = (name: string) => `\`${config.projectId}.${config.dataset}.${name}\``;
  const query = `
    WITH third_shots AS (
      SELECT rally_id, shot_type
      FROM ${table("shot")}
      WHERE shot_nbr = 3
    ),
    rally_features AS (
      SELECT
        game.skill_lvl AS skill_level,
        rally.rally_id,
        rally.rally_len,
        rally.ending_type,
        third_shots.shot_type AS third_shot_type,
        COUNTIF(shot.shot_type = 'D') AS dink_count,
        COUNTIF(shot.shot_type = 'HB') AS hand_battle_count
      FROM ${table("rally")} AS rally
      JOIN ${table("game")} AS game USING (game_id)
      LEFT JOIN ${table("shot")} AS shot USING (rally_id)
      LEFT JOIN third_shots USING (rally_id)
      GROUP BY 1, 2, 3, 4, 5
    )
    SELECT
      skill_level AS skillLevel,
      COUNT(*) AS rallies,
      ROUND(AVG(rally_len), 2) AS averageRallyLength,
      ROUND(100 * SAFE_DIVIDE(COUNTIF(third_shot_type = 'tsDrp'), COUNT(*)), 1)
        AS thirdShotDropPercent,
      ROUND(100 * SAFE_DIVIDE(COUNTIF(third_shot_type = 'tsDrv'), COUNT(*)), 1)
        AS thirdShotDrivePercent,
      ROUND(100 * SAFE_DIVIDE(COUNTIF(third_shot_type = 'tsLob'), COUNT(*)), 1)
        AS thirdShotLobPercent,
      ROUND(100 * SAFE_DIVIDE(COUNTIF(ending_type = 'Winner'), COUNT(*)), 1)
        AS winnerPercent,
      ROUND(100 * SAFE_DIVIDE(COUNTIF(ending_type = 'Error'), COUNT(*)), 1)
        AS errorPercent,
      ROUND(AVG(dink_count), 2) AS dinksPerRally,
      ROUND(AVG(hand_battle_count), 2) AS handBattlesPerRally
    FROM rally_features
    GROUP BY skill_level
    ORDER BY
      CASE
        WHEN skill_level = 'Senior Pro' THEN 7
        WHEN skill_level = 'Pro' THEN 6
        ELSE SAFE_CAST(skill_level AS FLOAT64)
      END
  `;

  try {
    const [rows] = await bigQuery.query({ query });
    return rows.map((row) => ({
      skillLevel: String(row.skillLevel),
      rallies: Number(row.rallies),
      averageRallyLength:
        row.averageRallyLength === null ? null : Number(row.averageRallyLength),
      thirdShotDropPercent: Number(row.thirdShotDropPercent),
      thirdShotDrivePercent: Number(row.thirdShotDrivePercent),
      thirdShotLobPercent: Number(row.thirdShotLobPercent),
      winnerPercent: Number(row.winnerPercent),
      errorPercent: Number(row.errorPercent),
      dinksPerRally: Number(row.dinksPerRally),
      handBattlesPerRally: Number(row.handBattlesPerRally),
    }));
  } catch (error) {
    console.error("BigQuery skill-level analytics query failed.", error);
    throw new BigQueryQueryError(
      "BigQuery could not run the skill-level analytics query.",
      { cause: error },
    );
  }
}
