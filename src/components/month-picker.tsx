"use client";

import { useRouter } from "next/navigation";

export function MonthPicker({
  months,
  value,
}: {
  months: { key: string; label: string }[];
  value: string;
}) {
  const router = useRouter();

  return (
    <select
      aria-label="Choose a month"
      className="h-9 rounded-xl border border-line bg-panel px-2.5 text-[12.5px] text-muted outline-none transition-colors hover:border-line2 focus:border-line2"
      value={value}
      onChange={(event) => {
        if (event.target.value) router.push(`/app?range=${event.target.value}`);
      }}
    >
      <option value="">Month…</option>
      {months.map((month) => (
        <option key={month.key} value={month.key}>
          {month.label}
        </option>
      ))}
    </select>
  );
}
