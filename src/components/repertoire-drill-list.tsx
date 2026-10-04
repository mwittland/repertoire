"use client";

import { useState } from "react";
import { DrillCard } from "@/components/drill-card";
import { drillTypes, type DrillType, type Drill } from "@/lib/drills/types";

export function RepertoireDrillList({ drills }: { drills: Drill[] }) {
  const [type, setType] = useState<DrillType | "All">("All");
  const visibleDrills = type === "All" ? drills : drills.filter((drill) => drill.type === type);

  return (
    <>
      <div className="mt-8 flex items-center justify-between gap-4">
        <p className="text-sm text-[var(--muted)]">{visibleDrills.length} drills</p>
        <label className="text-sm font-bold text-[var(--muted)]">
          Filter by type
          <select
            value={type}
            onChange={(event) => setType(event.target.value as DrillType | "All")}
            className="ml-3 rounded-xl border border-[var(--line)] bg-[var(--card)] px-3 py-2 font-normal text-[var(--ink)]"
          >
            <option value="All">All types</option>
            {drillTypes.map((drillType) => <option key={drillType} value={drillType}>{drillType}</option>)}
          </select>
        </label>
      </div>
      {visibleDrills.length > 0 ? (
        <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {visibleDrills.map((drill) => <DrillCard key={drill.id} drill={drill} />)}
        </div>
      ) : (
        <p className="mt-4 rounded-2xl border border-dashed border-[var(--line)] p-8 text-[var(--muted)]">
          No repertoire drills match this type.
        </p>
      )}
    </>
  );
}
