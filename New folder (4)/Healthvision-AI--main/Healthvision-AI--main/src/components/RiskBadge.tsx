import { cn } from "@/lib/utils";

const COLOR: Record<string, string> = {
  low: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  moderate: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  high: "bg-orange-500/15 text-orange-300 border-orange-500/30",
  emergency: "bg-red-500/15 text-red-300 border-red-500/40 animate-pulse",
};

export function RiskBadge({ level }: { level: string }) {
  const cls = COLOR[level] ?? COLOR.low;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide",
        cls,
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {level} risk
    </span>
  );
}
