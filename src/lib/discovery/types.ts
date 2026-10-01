export type DiscoveryInput = {
  courtX: number;
  courtY: number;
  ballHeight: number;
  handedness: "Right" | "Left";
  shotType?: ShotType;
};

export type ShotType =
  | "Dink"
  | "Drop"
  | "Drive"
  | "Reset"
  | "Attack"
  | "Putaway"
  | "Lob";

export type ShotRange = {
  courtXMin: number;
  courtXMax: number;
  courtXLeftMin: number;
  courtXLeftMax: number;
  courtYMin: number;
  courtYMax: number;
  ballHeightMin: number;
  ballHeightMax: number;
  shotType?: ShotType;
  aggressionScore?: number;
  difficulty?: number;
};

export type DiscoverableShot = ShotRange & {
  id: string;
  name: string;
  description?: string;
  instructions?: string;
  videoUrl?: string | null;
};
