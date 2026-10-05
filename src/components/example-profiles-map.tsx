"use client";

import { useMemo, useState } from "react";
import { HowItWorksMap } from "@/components/how-it-works-map";
import type { DiscoverableShot } from "@/lib/discovery/types";

type ExampleProfile = {
  id: string;
  name: string;
  description: string;
  coverage: number;
  mastery: number;
  shotTypes: DiscoverableShot["shotType"][];
};

const profiles: ExampleProfile[] = [
  { id: "new-player", name: "New to pickleball", description: "Building the basics.", coverage: 0.45, mastery: 38, shotTypes: ["Dink", "Drop", "Drive"] },
  { id: "rec-player", name: "Recreational regular", description: "Growing consistency.", coverage: 0.62, mastery: 55, shotTypes: ["Dink", "Drop", "Drive", "Lob"] },
  { id: "club-competitor", name: "3.5 club competitor", description: "Balanced and developing.", coverage: 0.76, mastery: 68, shotTypes: ["Dink", "Drop", "Drive", "Reset", "Lob"] },
  { id: "tournament-player", name: "4.0 tournament player", description: "Pressure-ready options.", coverage: 0.9, mastery: 82, shotTypes: ["Dink", "Drop", "Drive", "Reset", "Attack", "Putaway", "Lob"] },
  { id: "elite-player", name: "5.0 all-court player", description: "Complete and reliable.", coverage: 1, mastery: 94, shotTypes: ["Dink", "Drop", "Drive", "Reset", "Attack", "Putaway", "Lob"] },
];

function profileShots(shots: DiscoverableShot[], profile: ExampleProfile) {
  const matchingShots = shots.filter((shot) => shot.shotType && profile.shotTypes.includes(shot.shotType));
  const count = Math.max(1, Math.round(matchingShots.length * profile.coverage));
  return matchingShots.slice(0, count).map((shot, index) => ({
    ...shot,
    id: `${profile.id}-${shot.id}`,
    confidence: Math.max(0, Math.min(100, profile.mastery - (index % 4) * 6)),
  }));
}

export function ExampleProfilesMap({
  shots,
}: {
  shots: DiscoverableShot[];
}) {
  const [selectedProfiles, setSelectedProfiles] = useState(["club-competitor"]);
  const selected = profiles.filter((profile) => selectedProfiles.includes(profile.id));
  const combinedShots = useMemo(
    () => selected.flatMap((profile) => profileShots(shots, profile)),
    [selected, shots],
  );

  function toggleProfile(id: string) {
    setSelectedProfiles([id]);
  }

  const profileControls = (
    <fieldset className="w-full max-w-3xl justify-self-center">
      <legend className="text-sm font-bold uppercase tracking-[0.16em] text-[var(--coral)]">Example players</legend>
      <p className="mt-2 text-sm leading-6 text-[var(--muted)]">Choose a profile to see its repertoire.</p>
      <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
        {profiles.map((profile) => {
          const active = selectedProfiles.includes(profile.id);
          return (
            <button
              key={profile.id}
              type="button"
              onClick={() => toggleProfile(profile.id)}
              className={`rounded-xl border p-3 text-left text-sm transition ${active ? "border-[var(--teal)] bg-[var(--paper)] shadow-[var(--shadow)]" : "border-[var(--line)]"}`}
              aria-pressed={active}
            >
              <span className="font-bold">{profile.name}</span>
              <span className="mt-1 block leading-5 text-[var(--muted)]">{profile.description}</span>
            </button>
          );
        })}
      </div>
    </fieldset>
  );

  return (
      <HowItWorksMap
        shots={combinedShots}
        showConfidenceToggle
        confidenceToggleAtTop
        mapModes={["confidence", "relative"]}
        mapModeLabels={{ confidence: "Total", relative: "Relative" }}
        initialMapMode="confidence"
        relativeMasteryNote
        showShotTypeFilter={false}
        showShotTypeColors={false}
        showShotTypeLegend={false}
        showHandednessFilter={false}
        showBallHeightFilter={false}
        extraControls={profileControls}
        hideSidePanel
        heading="Compare example players."
        description="Coverage shows where each player has options across the court."
      />
  );
}
