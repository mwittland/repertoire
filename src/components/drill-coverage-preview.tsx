import Image from "next/image";
import type { Drill } from "@/lib/drills/types";

const canvas = { xMin: -15, xMax: 15, yMin: 0, yMax: 30 };

export function DrillCoveragePreview({
  drill,
  embedded = false,
}: {
  drill: Drill;
  embedded?: boolean;
}) {
  const left = ((drill.courtXMin - canvas.xMin) / 30) * 100;
  const right = ((drill.courtXMax - canvas.xMin) / 30) * 100;
  const top = 100 - ((drill.courtYMax - canvas.yMin) / 30) * 100;
  const bottom = 100 - ((drill.courtYMin - canvas.yMin) / 30) * 100;

  return (
    <section className={embedded ? "" : "mt-16 border-t border-[var(--line)] pt-8"}>
      <p className="text-sm font-bold uppercase tracking-[0.2em] text-[var(--coral)]">
        Drill profile
      </p>
      <h2 className="mt-3 text-3xl">Court coverage</h2>
      <div className="mt-6 grid items-center gap-6 sm:grid-cols-[minmax(0,1fr)_minmax(10rem,0.7fr)]">
        <div className="relative mx-auto aspect-square w-full max-w-[22rem] overflow-hidden rounded-2xl border-4 border-[#4d8a7a] bg-[#dcebdd]">
          <div className="pointer-events-none absolute inset-x-[16.67%] bottom-[26.67%] top-0 overflow-hidden border-x-4 border-[#f9fff8] bg-[#dcebdd]">
            <div className="absolute inset-x-0 top-0 h-[31.82%] bg-[#c8e5d3]" />
            <div className="absolute inset-x-0 top-0 border-t-4 border-white/90" />
            <div className="absolute inset-x-0 top-[31.82%] border-t-2 border-white/90" />
            <div className="absolute inset-x-0 bottom-0 border-b-4 border-white/90" />
            <div className="absolute bottom-0 left-1/2 top-[31.82%] border-l-2 border-white/90" />
          </div>
          <div
            className="pointer-events-none absolute border-2 border-[var(--coral)] bg-[var(--coral)]/15"
            style={{
              left: `${left}%`,
              top: `${top}%`,
              width: `${right - left}%`,
              height: `${bottom - top}%`,
            }}
          />
        </div>
        <div className="flex items-center justify-center gap-3">
          <div className="relative h-[14rem] w-[8.8rem] overflow-hidden rounded-xl border border-[#c7d9c8] bg-[#f8fbf5]">
            <Image
              src="/ballHeight.jpg"
              alt="Six-foot pickleball player standing beside a regulation-height net"
              fill
              sizes="150px"
              className="object-cover"
            />
          </div>
          <div className="relative h-[14rem] w-10">
            <div className="absolute left-1/2 top-0 h-full w-1 -translate-x-1/2 bg-[#d4e0d6]" />
            <div
              className="absolute left-1/2 w-3 -translate-x-1/2 rounded-full bg-[var(--coral)]"
              style={{
                top: `${100 - drill.ballHeightMax * 10}%`,
                height: `${(drill.ballHeightMax - drill.ballHeightMin) * 10}%`,
              }}
            />
          </div>
        </div>
      </div>
      <p className="mt-4 text-sm leading-6 text-[var(--muted)]">
        The highlighted area shows where to work the drill.
      </p>
    </section>
  );
}
