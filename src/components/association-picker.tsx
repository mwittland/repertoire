"use client";

export type AssociationOption = { id: string; name: string };

export function AssociationPicker({ name, label, options, selectedIds = [], defaultOpen = false }: { name: string; label: string; options: AssociationOption[]; selectedIds?: string[]; defaultOpen?: boolean }) {
  return <details open={defaultOpen} className="group rounded-xl border border-[var(--line)] bg-[var(--card)]"><summary className="cursor-pointer list-none px-4 py-3 text-sm font-bold text-[var(--ink)]">{label}<span className="float-right text-[var(--muted)]">{selectedIds.length} selected</span></summary><div className="max-h-64 space-y-2 overflow-y-auto border-t border-[var(--line)] p-4">{options.map((option) => <label key={option.id} className="flex items-center gap-3 rounded-lg px-2 py-2 text-sm text-[var(--muted)] hover:bg-[var(--paper)]"><input type="checkbox" name={name} value={option.id} defaultChecked={selectedIds.includes(option.id)} className="h-4 w-4 accent-[var(--coral)]" />{option.name}</label>)}</div></details>;
}
