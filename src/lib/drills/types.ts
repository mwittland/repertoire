export const drillTypes = ["Solo", "Wall", "Ball Machine", "Partner+"] as const;
export type DrillType = (typeof drillTypes)[number];

export type Drill = {
  id: string;
  name: string;
  type: DrillType;
  description: string;
  videoUrl: string | null;
  courtXMin: number;
  courtXMax: number;
  courtXLeftMin: number;
  courtXLeftMax: number;
  courtYMin: number;
  courtYMax: number;
  ballHeightMin: number;
  ballHeightMax: number;
  mastery?: number | null;
  shots: { id: string; name: string }[];
};
