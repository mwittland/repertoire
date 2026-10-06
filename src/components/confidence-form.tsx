export function ConfidenceBar({
  confidence,
  large = false,
}: {
  confidence: number | null;
  large?: boolean;
}) {
  const value = confidence ?? 0;
  return (
    <div className={large ? "text-sm text-[var(--muted)]" : "text-xs text-[var(--muted)]"}>
      <div className={large ? "mb-2 flex justify-between" : "mb-1 flex justify-between"}>
        <span>Mastery</span>
        <span>{confidence === null ? "?" : confidence}</span>
      </div>
      <div className={`relative rounded-full bg-[#d4e0d6] ${large ? "h-2" : "h-1.5"}`}>
        <div className="absolute inset-y-0 left-0 rounded-full bg-[#d8a43f] transition-[width]" style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}
