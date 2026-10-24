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
    <div className="card card-pad card-hover">
      <div className="flex items-start justify-between gap-2">
        <span className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-dim">
          {label}
        </span>
        {change !== undefined && (
          <span className="chip !py-1" title="Compared with the previous period">
            {change == null ? (
              display
            ) : (
              <>
                <span className={positive ? "text-lime" : "text-muted"}>
                  {positive ? "↑" : change < 0 ? "↓" : "→"}
                </span>
                {display}
              </>
            )}
          </span>
        )}
      </div>
      <div className="tabular mt-3.5 text-[30px] font-semibold leading-none tracking-[-0.03em]">
        {value}
      </div>
      <div className="mt-2 text-[11.5px] text-muted">{hint}</div>
    </div>
  );
}
