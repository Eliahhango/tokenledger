export type Bucket = "day" | "month";

export type DateRange = {
  key: string;
  label: string;
  from: Date;
  to: Date;
  previous: { from: Date; to: Date } | null;
  bucket: Bucket;
};

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const MONTH_KEY = /^\d{4}-(0[1-9]|1[0-2])$/;

function startOfUtcDay(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

function startOfUtcMonth(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
}

function addMonths(date: Date, amount: number): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + amount, 1));
}

function addDays(date: Date, amount: number): Date {
  return new Date(date.getTime() + amount * 24 * 60 * 60 * 1000);
}

export function monthLabel(date: Date): string {
  return `${MONTH_NAMES[date.getUTCMonth()]} ${date.getUTCFullYear()}`;
}

export function monthKey(date: Date): string {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}

export function recentMonths(count = 6): { key: string; label: string }[] {
  const now = new Date();
  const months: { key: string; label: string }[] = [];
  for (let i = 0; i < count; i += 1) {
    const date = addMonths(startOfUtcMonth(now), -i);
    months.push({ key: monthKey(date), label: monthLabel(date) });
  }
  return months;
}

export function resolveRange(raw?: string | null): DateRange {
  const now = new Date();

  if (raw && MONTH_KEY.test(raw)) {
    const [year, month] = raw.split("-").map(Number);
    const from = new Date(Date.UTC(year, month - 1, 1));
    const to = new Date(Date.UTC(year, month, 1));
    return {
      key: raw,
      label: monthLabel(from),
      from,
      to,
      previous: { from: addMonths(from, -1), to: from },
      bucket: "day",
    };
  }

  if (raw === "7d" || raw === "30d") {
    const days = raw === "7d" ? 7 : 30;
    const to = now;
    const from = startOfUtcDay(addDays(now, -(days - 1)));
    return {
      key: raw,
      label: `Last ${days} days`,
      from,
      to,
      previous: { from: addDays(from, -days), to: from },
      bucket: "day",
    };
  }

  if (raw === "today") {
    const from = startOfUtcDay(now);
    const to = now;
    return {
      key: "today",
      label: "Today",
      from,
      to,
      previous: { from: addDays(from, -1), to: from },
      bucket: "day",
    };
  }

  if (raw === "all") {
    return {
      key: "all",
      label: "All time",
      from: new Date(0),
      to: now,
      previous: null,
      bucket: "month",
    };
  }

  const from = startOfUtcMonth(now);
  const to = addMonths(from, 1);
  return {
    key: "month",
    label: monthLabel(from),
    from,
    to,
    previous: { from: addMonths(from, -1), to: from },
    bucket: "day",
  };
}

export function enumerateBuckets(range: DateRange, first?: string, last?: string): string[] {
  const keys: string[] = [];
  const step = range.bucket;

  let cursor: Date;
  let end: Date;

  if (range.key === "all" && first && last) {
    const [fy, fm] = first.split("-").map(Number);
    const [ly, lm] = last.split("-").map(Number);
    cursor = new Date(Date.UTC(fy, fm - 1, 1));
    end = new Date(Date.UTC(ly, lm - 1, 1));
  } else {
    cursor = step === "month" ? startOfUtcMonth(range.from) : startOfUtcDay(range.from);
    end = new Date(range.to.getTime() - 1);
  }

  if (step === "month") {
    while (cursor <= end && keys.length < 400) {
      keys.push(monthKey(cursor));
      cursor = addMonths(cursor, 1);
    }
  } else {
    const endDay = startOfUtcDay(end);
    while (cursor <= endDay && keys.length < 400) {
      keys.push(cursor.toISOString().slice(0, 10));
      cursor = addDays(cursor, 1);
    }
  }

  return keys;
}
