import Link from "next/link";
import { recentMonths } from "@/lib/range";
import { MonthPicker } from "./month-picker";

const presets = [
  { key: "month", label: "This month" },
  { key: "7d", label: "7 days" },
  { key: "30d", label: "30 days" },
  { key: "all", label: "All time" },
];

export function RangePicker({ current }: { current: string }) {
  const isMonth = /^\d{4}-\d{2}$/.test(current);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex items-center rounded-xl border border-line bg-panel p-0.5">
        {presets.map((preset) => {
          const active = current === preset.key;
          return (
            <Link
              key={preset.key}
              href={`/app?range=${preset.key}`}
              className={`rounded-[9px] px-2.5 py-1.5 text-[12px] font-medium transition-colors ${
                active ? "bg-white/[0.07] text-fg" : "text-muted hover:text-fg"
              }`}
            >
              {preset.label}
            </Link>
          );
        })}
      </div>
      <MonthPicker months={recentMonths(6)} value={isMonth ? current : ""} />
    </div>
  );
}
