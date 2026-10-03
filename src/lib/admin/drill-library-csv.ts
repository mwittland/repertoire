import { z } from "zod";
import { escapeCsv } from "./shot-library-csv";

export const drillLibraryColumns = [
  "name",
  "type",
  "court_x_min",
  "court_x_max",
  "court_y_min",
  "court_y_max",
  "ball_height_min",
  "ball_height_max",
  "description",
  "video_url",
  "shots",
] as const;

const rowSchema = z.object({
  name: z.string().trim().min(2),
  type: z.enum(["Solo", "Wall", "Ball Machine", "Partner+"]),
  court_x_min: z.coerce.number().min(-15).max(15),
  court_x_max: z.coerce.number().min(-15).max(15),
  court_y_min: z.coerce.number().min(0).max(30),
  court_y_max: z.coerce.number().min(0).max(30),
  ball_height_min: z.coerce.number().min(0).max(10),
  ball_height_max: z.coerce.number().min(0).max(10),
  description: z.string().trim().min(1),
  video_url: z.union([z.string().url(), z.literal("")]).transform((value) => value || null),
  shots: z.string().transform((value) => value.split("|").map((shot) => shot.trim()).filter(Boolean)),
}).refine((row) => row.court_x_min <= row.court_x_max, "court_x_min must be <= court_x_max")
  .refine((row) => row.court_y_min <= row.court_y_max, "court_y_min must be <= court_y_max")
  .refine((row) => row.ball_height_min <= row.ball_height_max, "ball_height_min must be <= ball_height_max");

function parseLine(line: string) {
  const cells: string[] = [];
  let cell = "";
  let quoted = false;
  for (let index = 0; index < line.length; index += 1) {
    const character = line[index];
    if (character === '"' && quoted && line[index + 1] === '"') {
      cell += '"';
      index += 1;
    } else if (character === '"') quoted = !quoted;
    else if (character === "," && !quoted) {
      cells.push(cell);
      cell = "";
    } else cell += character;
  }
  cells.push(cell);
  return cells;
}

function parseRecords(csv: string) {
  return csv.replace(/^\uFEFF/, "").split(/\r?\n/).filter((line) => line.trim());
}

export function parseDrillLibraryCsv(csv: string) {
  const lines = parseRecords(csv);
  if (lines.length < 2) throw new Error("CSV must include a header and at least one drill.");
  const headers = parseLine(lines[0]).map((header) => header.trim());
  const missing = drillLibraryColumns.filter((column) => !headers.includes(column));
  if (missing.length) throw new Error(`Missing CSV columns: ${missing.join(", ")}`);
  return lines.slice(1).map((line, index) => {
    const cells = parseLine(line);
    const raw = Object.fromEntries(headers.map((header, cellIndex) => [header, cells[cellIndex] ?? ""]));
    const result = rowSchema.safeParse(raw);
    if (!result.success) throw new Error(`Row ${index + 2}: ${result.error.issues[0]?.message ?? "Invalid drill"}`);
    return result.data;
  });
}

export function createDrillLibraryCsv(rows: Array<Record<string, string | number | null>>) {
  const header = drillLibraryColumns.join(",");
  const body = rows.map((row) => drillLibraryColumns.map((column) => escapeCsv(row[column])).join(","));
  return [header, ...body].join("\n");
}
