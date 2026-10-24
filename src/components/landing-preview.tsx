import { compactNumber, usd } from "@/lib/format";

const volumes = [
  1.9, 2.4, 1.6, 2.9, 3.4, 2.7, 3.8, 2.2, 3.1, 4.2, 3.6, 4.8, 3.9, 2.8, 4.4, 5.1, 4.3, 5.6,
  4.9, 3.7, 5.2, 6.1, 5.4, 6.8,
];

const models = [
  { name: "claude-sonnet-4-5", provider: "anthropic", tokens: 18_400_000, cost: 241.8, color: "#b8f26a" },
  { name: "gpt-5.2", provider: "openai", tokens: 12_100_000, cost: 168.4, color: "#66e3ff" },
  { name: "gemini-3-pro", provider: "google", tokens: 8_700_000, cost: 112.2, color: "#a78bfa" },
];

const totalTokens = 48_200_000;
const totalCost = 612.4;

export function LandingPreview() {
  const maxModelTokens = Math.max(...models.map((model) => model.tokens));

  return (
    <div className="card overflow-hidden shadow-[0_40px_120px_-50px_rgba(0,0,0,0.9)]">
      <div className="flex items-center gap-2 border-b border-line bg-white/[0.015] px-4 py-2.5">
        <span className="flex gap-1.5">
          <i className="h-2 w-2 rounded-full bg-[#2a3040]" />
          <i className="h-2 w-2 rounded-full bg-[#2a3040]" />
          <i className="h-2 w-2 rounded-full bg-[#2a3040]" />
        </span>
        <span className="mono ml-2 text-[10.5px] text-dim">tokenledger / overview</span>
        <span className="pill ml-auto !h-6 !gap-1.5 !px-2 !text-[10px] !text-lime">
          <span className="h-1.5 w-1.5 rounded-full bg-lime" />
          Live
        </span>
      </div>

      <div className="p-4 sm:p-5">
        <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-4">
          {[
            { label: "Total tokens", value: compactNumber(totalTokens), hint: "+18.4% vs last month" },
            { label: "Spend", value: usd(totalCost), hint: "+11.2% vs last month" },
            { label: "Runs", value: "3,184", hint: "across 5 models" },
            { label: "Projects", value: "4", hint: "attributed this month" },
          ].map((kpi) => (
            <div key={kpi.label} className="rounded-xl border border-line bg-white/[0.015] p-3">
              <div className="text-[9.5px] font-semibold uppercase tracking-[0.13em] text-dim">
                {kpi.label}
              </div>
              <div className="tabular mt-2 text-[19px] font-semibold leading-none tracking-[-0.02em]">
                {kpi.value}
              </div>
              <div className="mt-1.5 text-[10px] text-muted">{kpi.hint}</div>
            </div>
          ))}
        </div>

        <div className="mt-2.5 rounded-xl border border-line bg-[#080809] p-3">
          <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
            <span className="text-[11px] font-medium text-muted">Token volume</span>
            <span className="chip !text-[9px]">Live</span>
          </div>
          <div className="flex h-[160px] items-end gap-1.5">
            {volumes.map((value, index) => (
              <div key={index} className="flex-1">
                <div
                  className="w-full rounded-t-sm bg-gradient-to-t from-white/10 to-white/60"
                  style={{ height: `${Math.max(12, (value / 6.8) * 100)}%` }}
                />
              </div>
            ))}
          </div>
          <div className="mt-2 flex items-center justify-between text-[10px] text-dim">
            <span>Oct 1</span>
            <span>Oct 24</span>
          </div>
        </div>

        <div className="mt-2.5 grid gap-2.5 sm:grid-cols-2">
          <div className="rounded-xl border border-line bg-white/[0.015] p-3">
            <div className="mb-2.5 text-[10px] font-semibold uppercase tracking-[0.13em] text-dim">
              Top models
            </div>
            <div className="space-y-2.5">
              {models.map((model) => (
                <div key={model.name}>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="truncate text-fg/90">{model.name}</span>
                    <span className="mono tabular ml-2 shrink-0 text-[10px] text-muted">
                      {compactNumber(model.tokens)}
                    </span>
                  </div>
                  <div className="mt-1 h-1 overflow-hidden rounded-full bg-white/[0.05]">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${(model.tokens / maxModelTokens) * 100}%`,
                        background: model.color,
                        opacity: 0.8,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-line bg-white/[0.015] p-3">
            <div className="mb-2.5 text-[10px] font-semibold uppercase tracking-[0.13em] text-dim">
              Recent activity
            </div>
            <div className="space-y-2">
              {[
                ["claude-sonnet-4-5", "tokenledger", "2m ago", "$0.42"],
                ["gpt-5.2", "eliflix-app", "8m ago", "$0.18"],
                ["big-pickle", "khamiar", "14m ago", "$0.06"],
              ].map(([model, project, time, cost]) => (
                <div key={model + time} className="flex items-center justify-between text-[10.5px]">
                  <span className="truncate text-fg/80">{model}</span>
                  <span className="mono ml-2 shrink-0 text-dim">{project}</span>
                  <span className="mono ml-2 shrink-0 text-muted">{time}</span>
                  <span className="mono tabular ml-2 shrink-0 text-fg/80">{cost}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
