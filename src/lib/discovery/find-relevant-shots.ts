import type { DiscoverableShot, DiscoveryInput } from "./types";

function isWithinRange(value: number, minimum: number, maximum: number) {
  return minimum <= value && value <= maximum;
}

export function isShotRelevant(
  shot: DiscoverableShot,
  situation: DiscoveryInput,
) {
  const courtXMin =
    situation.handedness === "Left" ? shot.courtXLeftMin : shot.courtXMin;
  const courtXMax =
    situation.handedness === "Left" ? shot.courtXLeftMax : shot.courtXMax;
  return (
    isWithinRange(situation.courtX, courtXMin, courtXMax) &&
    isWithinRange(situation.courtY, shot.courtYMin, shot.courtYMax) &&
    isWithinRange(situation.ballHeight, shot.ballHeightMin, shot.ballHeightMax)
  );
}

export function findRelevantShots(
  shots: DiscoverableShot[],
  situation: DiscoveryInput,
) {
  return shots
    .filter((shot) => isShotRelevant(shot, situation))
    .sort((left, right) => left.name.localeCompare(right.name));
}
