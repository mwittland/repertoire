import Image from "next/image";
import type { ShotRange } from "@/lib/discovery/types";

const canvas = { xMin: -15, xMax: 15, yMin: 0, yMax: 30 };

export function ShotRangePreview({
  range,
  embedded = false,
}: {
  range: ShotRange;
  embedded?: boolean;
}) {
  const left = ((range.courtXMin - canvas.xMin) / 30) * 100;
  const right = ((range.courtXMax - canvas.xMin) / 30) * 100;
  const top = 100 - ((range.courtYMax - canvas.yMin) / 30) * 100;
  const bottom = 100 - ((range.courtYMin - canvas.yMin) / 30) * 100;
  const heightTop = 100 - (range.ballHeightMax / 10) * 100;
  const heightBottom = 100 - (range.ballHeightMin / 10) * 100;
  const shotType = range.shotType ?? "Reset";

  return (
    <section
      className={embedded ? "" : "mt-16 border-t border-[var(--line)] pt-8"}
    >
      <p className="text-sm font-bold uppercase tracking-[0.2em] text-[var(--coral)]">
        Shot profile
      </p>
      <h2 className="mt-3 text-3xl">{shotType}</h2>
      <div
        className={
          embedded
            ? "mt-6 grid items-start gap-6 sm:grid-cols-2"
            : "mt-7 grid items-start gap-8 lg:grid-cols-[minmax(0,1.35fr)_minmax(220px,0.65fr)]"
        }
      >
        <div className={embedded ? "order-1" : ""}>
          <h3 className="text-2xl">Court location</h3>
          <div className="relative mx-auto mt-4 aspect-square h-[14rem] w-[14rem] max-w-full overflow-hidden rounded-2xl border-4 border-[#4d8a7a] bg-[#dcebdd]">
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
        </div>
        <div className={embedded ? "order-2" : ""}>
          <h3 className="text-2xl">Ball height</h3>
          <div className="mt-4 flex items-center justify-center gap-3">
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
                  top: `calc(${heightTop}% - 2px)`,
                  height: `calc(${heightBottom - heightTop}% + 4px)`,
                }}
              />
            </div>
          </div>
        </div>
      </div>
      <div className="mt-8 sm:col-span-2">
        <h3 className="text-2xl">Ratings</h3>
        <MetricBar label="Aggression" value={range.aggressionScore ?? 0} />
        <MetricBar label="Difficulty" value={range.difficulty ?? 0} />
      </div>
    </section>
  );
}

function MetricBar({ label, value }: { label: string; value: number }) {
  return (
    <div className="mt-4">
      <div className="mb-2 flex justify-between text-sm text-[var(--muted)]">
        <span>{label}</span>
        <span>{value}</span>
      </div>
      <div className="h-2 rounded-full bg-[#d4e0d6]">
        <div
          className="h-2 rounded-full bg-[var(--coral)]"
          style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
        />
      </div>
    </div>
  );
}
