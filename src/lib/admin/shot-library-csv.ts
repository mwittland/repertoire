import { z } from "zod";

export const shotLibraryColumns = [
  "name",
  "shot_type",
  "aggression_score",
  "difficulty",
  "court_x_min",
  "court_x_max",
  "court_y_min",
  "court_y_max",
  "ball_height_min",
  "ball_height_max",
  "description",
  "instructions",
  "video_url",
] as const;

const rowSchema = z.object({
  name: z.string().trim().min(2),
  shot_type: z.enum(["Dink", "Drop", "Drive", "Reset", "Attack", "Putaway", "Lob"]),
  aggression_score: z.coerce.number().int().min(0).max(100),
  difficulty: z.coerce.number().int().min(0).max(100),
  court_x_min: z.coerce.number().min(-15).max(15),
  court_x_max: z.coerce.number().min(-15).max(15),
  court_y_min: z.coerce.number().min(0).max(30),
  court_y_max: z.coerce.number().min(0).max(30),
  ball_height_min: z.coerce.number().min(0).max(10),
  ball_height_max: z.coerce.number().min(0).max(10),
  description: z.string().trim().min(1),
  instructions: z.string().trim().min(1),
  video_url: z.union([z.string().url(), z.literal("")]).transform((value) => value || null),
}).refine((row) => row.court_x_min <= row.court_x_max, "court_x_min must be <= court_x_max")
  .refine((row) => row.court_y_min <= row.court_y_max, "court_y_min must be <= court_y_max")
  .refine((row) => row.ball_height_min <= row.ball_height_max, "ball_height_min must be <= ball_height_max");

export type ImportShotRow = z.infer<typeof rowSchema>;

function parseCsvLine(line: string) {
  const cells: string[] = [];
  let cell = "";
  let quoted = false;
  for (let index = 0; index < line.length; index += 1) {
    const character = line[index];
    const next = line[index + 1];
    if (character === '"' && quoted && next === '"') {
      cell += '"';
      index += 1;
    } else if (character === '"') {
      quoted = !quoted;
    } else if (character === "," && !quoted) {
      cells.push(cell);
      cell = "";
    } else {
      cell += character;
    }
  }
  cells.push(cell);
  return cells;
}

function parseCsvRecords(csv: string) {
  const records: string[] = [];
  let record = "";
  let quoted = false;
  for (let index = 0; index < csv.length; index += 1) {
    const character = csv[index];
    const next = csv[index + 1];
    if (character === '"' && next === '"' && quoted) {
      record += '""';
      index += 1;
    } else if (character === '"') {
      quoted = !quoted;
      record += character;
    } else if ((character === "\n" || character === "\r") && !quoted) {
      if (character === "\r" && next === "\n") index += 1;
      if (record.trim()) records.push(record);
      record = "";
    } else {
      record += character;
    }
  }
  if (record.trim()) records.push(record);
  return records;
}

export function parseShotLibraryCsv(csv: string) {
  const lines = parseCsvRecords(csv.replace(/^\uFEFF/, ""));
  if (lines.length < 2) throw new Error("CSV must include a header and at least one shot.");
  const headers = parseCsvLine(lines[0]).map((header) => header.trim());
  const missing = shotLibraryColumns.filter((column) => !headers.includes(column));
  if (missing.length) throw new Error(`Missing CSV columns: ${missing.join(", ")}`);

  return lines.slice(1).map((line, index) => {
    const cells = parseCsvLine(line);
    const raw = Object.fromEntries(headers.map((header, cellIndex) => [header, cells[cellIndex] ?? ""]));
    const result = rowSchema.safeParse(raw);
    if (!result.success) throw new Error(`Row ${index + 2}: ${result.error.issues[0]?.message ?? "Invalid shot"}`);
    return result.data;
  });
}

export function escapeCsv(value: string | number | null | undefined) {
  const text = String(value ?? "");
  return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

export function createShotLibraryCsv(rows: Array<Record<string, string | number | null>>) {
  const header = shotLibraryColumns.join(",");
  const body = rows.map((row) => shotLibraryColumns.map((column) => escapeCsv(row[column])).join(","));
  return [header, ...body].join("\n");
}
