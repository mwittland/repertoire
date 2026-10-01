export type DiscoveryInput = {
  courtX: number;
  courtY: number;
  ballHeight: number;
  intent: number;
  handedness: "Right" | "Left";
};

export type ShotRange = {
  courtXMin: number;
  courtXMax: number;
  courtXLeftMin: number;
  courtXLeftMax: number;
  courtYMin: number;
  courtYMax: number;
  ballHeightMin: number;
  ballHeightMax: number;
  intentMin: number;
  intentMax: number;
};

export type DiscoverableShot = ShotRange & {
  id: string;
  name: string;
  description?: string;
  difficulty?: number;
  instructions?: string;
  videoUrl?: string | null;
};
