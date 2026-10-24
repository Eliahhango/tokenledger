import type { SeriesPoint } from "@/lib/stats";
import { compactNumber, usd } from "@/lib/format";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function niceMax(value: number): number {
  if (value <= 0) return 1;
  const exponent = Math.floor(Math.log10(value));
  const base = Math.pow(10, exponent);
  const normalized = value / base;
  const step = normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 5 ? 5 : 10;
  return step * base;
}

function bucketLabel(bucket: string): string {
  if (bucket.length === 7) {
    const month = Number(bucket.slice(5, 7));
    return MONTHS[month - 1] ?? bucket;
  }
  const month = Number(bucket.slice(5, 7));
  const day = Number(bucket.slice(8, 10));
  return `${MONTHS[month - 1] ?? ""} ${day}`;
}

export function TokenLegend() {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px] text-muted">
      <span className="inline-flex items-center gap-1.5">
        <i className="h-2 w-2 rounded-[2px] bg-cyan" /> Input
      </span>
      <span className="inline-flex items-center gap-1.5">
        <i className="h-2 w-2 rounded-[2px] bg-lime" /> Output
      </span>
      <span className="inline-flex items-center gap-1.5">
        <i className="h-2 w-2 rounded-[2px] bg-violet" /> Cache
      </span>
      <span className="inline-flex items-center gap-1.5">
        <i className="h-2 w-2 rounded-[2px] bg-amber" /> Reasoning
      </span>
    </div>
  );
}

export function TrendChart({ points }: { points: SeriesPoint[] }) {
  const data = points.slice(-92);
  const W = 880;
  const H = 300;
  const PL = 52;
  const PR = 14;
  const PT = 18;
  const PB = 32;
  const innerW = W - PL - PR;
  const innerH = H - PT - PB;
  const max = niceMax(Math.max(...data.map((point) => point.tokens), 0));
  const slot = innerW / Math.max(data.length, 1);
  const barW = Math.max(2, Math.min(28, slot * 0.62));
  const labelEvery = Math.max(1, Math.ceil(data.length / 7));
  const ticks = [0, 0.25, 0.5, 0.75, 1];

  const segments: { key: keyof SeriesPoint; color: string }[] = [
    { key: "input", color: "#66e3ff" },
    { key: "output", color: "#b8f26a" },
    { key: "cacheRead", color: "#a78bfa" },
    { key: "cacheWrite", color: "#8b6ee8" },
    { key: "reasoning", color: "#f5c56b" },
  ];

  if (data.length === 0 || max <= 1) {
    return (
      <div className="flex h-[300px] items-center justify-center text-sm text-dim">
        No usage recorded in this window.
      </div>
    );
  }

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Token usage over time">
      {ticks.map((fraction) => {
        const y = PT + innerH * (1 - fraction);
        return (
          <g key={fraction}>
            <line
              x1={PL}
              x2={W - PR}
              y1={y}
              y2={y}
              stroke="rgba(255,255,255,0.04)"
              strokeDasharray={fraction === 0 ? undefined : "3 5"}
            />
            <text x={PL - 10} y={y + 3.5} textAnchor="end" fontSize="10" fill="#71717a">
              {compactNumber(max * fraction)}
            </text>
          </g>
        );
      })}

      {data.map((point, index) => {
        const x = PL + index * slot + (slot - barW) / 2;
        let y = PT + innerH;
        return (
          <g key={point.bucket}>
            <title>
              {bucketLabel(point.bucket)} — {point.tokens.toLocaleString("en-US")} tokens ·{" "}
              {usd(point.cost)} · {point.requests} runs
            </title>
            {segments.map((segment) => {
              const value = Number(point[segment.key]);
              const height = (value / max) * innerH;
              if (height <= 0) return null;
              y -= height;
              return (
                <rect
                  key={segment.key}
                  x={x}
                  y={y}
                  width={barW}
                  height={Math.max(height, 0.6)}
                  rx={1}
                  fill={segment.color}
                  opacity={0.9}
                />
              );
            })}
            {index % labelEvery === 0 && (
              <text
                x={x + barW / 2}
                y={H - 10}
                textAnchor="middle"
                fontSize="10"
                fill="#71717a"
              >
                {bucketLabel(point.bucket)}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

export function Donut({
  data,
  centerLabel,
  centerValue,
}: {
  data: { label: string; value: number; color: string }[];
  centerLabel: string;
  centerValue: string;
}) {
  const size = 156;
  const stroke = 14;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const total = data.reduce((sum, item) => sum + item.value, 0);

  let offset = 0;

  return (
    <div className="relative h-[156px] w-[156px] shrink-0">
      <svg viewBox={`0 0 ${size} ${size}`} className="h-full w-full -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.04)"
          strokeWidth={stroke}
        />
        {total > 0 &&
          data.map((item) => {
            const length = (item.value / total) * circumference;
            const dash = `${Math.max(length - 2, 0)} ${circumference - Math.max(length - 2, 0)}`;
            const element = (
              <circle
                key={item.label}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke={item.color}
                strokeWidth={stroke}
                strokeDasharray={dash}
                strokeDashoffset={-offset}
                strokeLinecap="butt"
              >
                <title>
                  {item.label}: {((item.value / total) * 100).toFixed(1)}%
                </title>
              </circle>
            );
            offset += length;
            return element;
          })}
      </svg>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-[10px] uppercase tracking-[0.12em] text-dim">{centerLabel}</span>
        <span className="tabular mt-0.5 text-lg font-semibold tracking-tight">{centerValue}</span>
      </div>
    </div>
  );
}
