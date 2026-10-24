import { formatDelta } from "@/lib/format";

export function Kpi({
  label,
  value,
  hint,
  change,
}: {
  label: string;
  value: string;
  hint: string;
  change?: number | null;
}) {
  const display = formatDelta(change ?? null);
  const positive = change != null && change > 0;

  return (
    <div className="card card-pad">
      <div className="flex items-start justify-between gap-2">
        <span className="text-[11px] text-muted">
          {label}
        </span>
        {change !== undefined && (
          <span className="chip" title="Compared with the previous period">
            {change == null ? (
              display
            ) : (
              <>
                <span className={positive ? "text-emerald" : change < 0 ? "text-rose" : "text-muted"}>
                  {positive ? "↑" : change < 0 ? "↓" : "→"}
                </span>
                {display}
              </>
            )}
          </span>
        )}
      </div>
      <div className="tabular mt-2.5 text-[28px] font-semibold leading-none tracking-[-0.02em]">
        {value}
      </div>
      <div className="mt-1.5 text-[11px] text-dim">{hint}</div>
    </div>
  );
}
