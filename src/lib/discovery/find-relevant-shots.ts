import type { DiscoverableShot, DiscoveryInput } from "./types";

function isWithinRange(value: number, minimum: number, maximum: number) {
  return minimum <= value && value <= maximum;
}

export function isShotRelevant(
  shot: DiscoverableShot,
  situation: DiscoveryInput,
) {
  return (
    isWithinRange(situation.courtX, shot.courtXMin, shot.courtXMax) &&
    isWithinRange(situation.courtY, shot.courtYMin, shot.courtYMax) &&
    isWithinRange(
      situation.ballHeight,
      shot.ballHeightMin,
      shot.ballHeightMax,
    ) &&
    isWithinRange(situation.intent, shot.intentMin, shot.intentMax)
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
