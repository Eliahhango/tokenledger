import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Donut, TokenLegend, TrendChart } from "@/components/charts";
import { CodeBlock } from "@/components/code-block";
import { Kpi } from "@/components/kpi";
import { RangePicker } from "@/components/range-picker";
import { getCurrentWorkspace } from "@/lib/auth";
import {
  compactNumber,
  delta,
  shortModel,
  shortPath,
  timeAgo,
  usd,
} from "@/lib/format";
import { resolveRange } from "@/lib/range";
import { getStats } from "@/lib/stats";

export const dynamic = "force-dynamic";

const palette = [
  "#b8f26a",
  "#66e3ff",
  "#a78bfa",
  "#f5c56b",
  "#ff7a90",
  "#7dd3fc",
  "#fda4af",
  "#c4b5fd",
];

export default async function OverviewPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>;
}) {
  const workspace = await getCurrentWorkspace();
  if (!workspace) redirect("/login");

  const params = await searchParams;
  const range = resolveRange(params.range);
  const stats = await getStats(workspace.id, range);
  const { totals, previous } = stats;

  const header = await headers();
  const baseUrl =
    process.env.APP_URL ??
    `${header.get("x-forwarded-proto") ?? "http"}://${
      header.get("x-forwarded-host") ?? header.get("host") ?? "localhost:3001"
    }`;

  const emptyMcp = `{
  "mcp": {
    "tokenledger": {
      "type": "remote",
      "url": "${baseUrl}/api/mcp",
      "enabled": true,
      "headers": { "Authorization": "Bearer tl_your_key" }
    }
  }
}`;

  const emptyPlugin = `curl -fsSL ${baseUrl}/api/plugin \\
  -o ~/.config/opencode/plugins/tokenledger.js

export TOKENLEDGER_URL=${baseUrl}
export TOKENLEDGER_API_KEY=tl_your_key`;

  const providerData = stats.providers.map((provider, index) => ({
    label: provider.provider,
    value: provider.tokens,
    color: palette[index % palette.length],
  }));

  const maxModelTokens = Math.max(...stats.models.map((model) => model.tokens), 1);

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-[24px] font-semibold tracking-[-0.035em] sm:text-[27px]">
              {workspace.name}
            </h1>
            <span className="chip !text-[10px]">{workspace.key_prefix}…</span>
          </div>
          <p className="mt-1 text-[12px] text-muted">
            Usage overview · {range.label} · amounts in USD · days in UTC
          </p>
        </div>
        <RangePicker current={range.key} />
      </div>

      {totals.requests === 0 ? (
        <div className="mt-7 space-y-3">
          <div className="card p-6 sm:p-8">
            <span className="pill">
              <span className="h-1.5 w-1.5 rounded-full bg-lime" />
              Setup
            </span>
            <h2 className="mt-4 text-[24px] font-semibold tracking-[-0.03em]">
              This ledger is empty.
            </h2>
            <p className="mt-2 max-w-2xl text-[13px] leading-relaxed text-muted">
              Connect a client and the dashboard will fill itself. Pick MCP if you only want to
              query spend from your agent, or install the plugin to record every completed opencode
              message automatically.
            </p>

            <div className="mt-6 grid gap-4 lg:grid-cols-2">
              <div>
                <h3 className="mb-2 text-[12.5px] font-semibold">1 · Add the MCP server</h3>
                <CodeBlock code={emptyMcp} language="opencode.json" />
                <p className="mt-2 text-[11px] leading-relaxed text-dim">
                  Replace <span className="mono text-muted">tl_your_key</span> with your key. Rotate
                  a new one in Settings if you did not save it.
                </p>
              </div>
              <div>
                <h3 className="mb-2 text-[12.5px] font-semibold">2 · Or auto-report opencode</h3>
                <CodeBlock code={emptyPlugin} language="terminal" />
                <p className="mt-2 text-[11px] leading-relaxed text-dim">
                  The plugin records tokens, cost, model, and project for every completed assistant
                  message.
                </p>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-2.5">
              <Link href="/app/settings" className="btn btn-primary">
                Open connection settings →
              </Link>
              <Link href="/app?range=all" className="btn btn-ghost">
                Check all time
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="mt-7 grid grid-cols-2 gap-3 lg:grid-cols-4">
            <Kpi
              label="Total tokens"
              value={compactNumber(totals.tokens)}
              hint={`${compactNumber(totals.input)} input · ${compactNumber(totals.output)} output`}
              change={delta(totals.tokens, previous?.tokens)}
            />
            <Kpi
              label="Estimated spend"
              value={usd(totals.cost)}
              hint={`${usd(totals.cost / Math.max(totals.requests, 1))} avg per run`}
              change={delta(totals.cost, previous?.cost)}
            />
            <Kpi
              label="Runs"
              value={totals.requests.toLocaleString("en-US")}
              hint={`${compactNumber(totals.tokens / Math.max(totals.requests, 1))} tokens per run`}
              change={delta(totals.requests, previous?.requests)}
            />
            <Kpi
              label="Models"
              value={String(stats.models.length)}
              hint={`${stats.providers.length} providers active`}
            />
          </div>

          <div className="mt-3 grid gap-3 lg:grid-cols-3">
            <div className="card p-5 lg:col-span-2">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-[13px] font-semibold">Token volume</h2>
                  <p className="mt-0.5 text-[11px] text-muted">
                    {range.label} · {compactNumber(totals.tokens)} tokens
                  </p>
                </div>
                <TokenLegend />
              </div>
              <div className="mt-3">
                <TrendChart points={stats.series} />
              </div>
            </div>

            <div className="card p-5">
              <h2 className="text-[13px] font-semibold">Tokens by provider</h2>
              <p className="mt-0.5 text-[11px] text-muted">Share of total volume</p>
              <div className="mt-5 flex items-center gap-5">
                <Donut
                  data={providerData}
                  centerLabel="tokens"
                  centerValue={compactNumber(totals.tokens)}
                />
                <div className="min-w-0 flex-1 space-y-2.5">
                  {stats.providers.map((provider, index) => {
                    const share = totals.tokens > 0 ? (provider.tokens / totals.tokens) * 100 : 0;
                    return (
                      <div key={provider.provider} className="min-w-0">
                        <div className="flex items-center gap-2">
                          <i
                            className="h-2 w-2 shrink-0 rounded-[2px]"
                            style={{ background: palette[index % palette.length] }}
                          />
                          <span className="truncate text-[11.5px] text-fg/85">
                            {provider.provider}
                          </span>
                          <span className="tabular ml-auto shrink-0 text-[10.5px] text-muted">
                            {share.toFixed(1)}%
                          </span>
                        </div>
                        <div className="mt-0.5 pl-4 text-[10px] text-dim">
                          {usd(provider.cost)} · {compactNumber(provider.tokens)}
                        </div>
                      </div>
                    );
                  })}
                  {stats.providers.length === 0 && (
                    <p className="text-[11.5px] text-dim">No provider data.</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-3 grid gap-3 lg:grid-cols-3">
            <div className="card p-5 lg:col-span-2">
              <div className="flex items-center justify-between">
                <h2 className="text-[13px] font-semibold">Models</h2>
                <span className="chip !text-[10px]">ranked by tokens</span>
              </div>
              <div className="mt-4 space-y-4">
                {stats.models.map((model) => (
                  <div key={`${model.provider}:${model.model}`}>
                    <div className="flex items-baseline justify-between gap-3">
                      <span className="truncate text-[12.5px] font-medium">
                        {shortModel(model.model)}
                      </span>
                      <div className="flex shrink-0 items-baseline gap-3 text-[11px]">
                        <span className="tabular text-muted">{compactNumber(model.tokens)}</span>
                        <span className="tabular w-[62px] text-right text-fg/80">
                          {usd(model.cost)}
                        </span>
                      </div>
                    </div>
                    <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-white/[0.05]">
                      <div
                        className="h-full rounded-full bg-lime/70"
                        style={{ width: `${(model.tokens / maxModelTokens) * 100}%` }}
                      />
                    </div>
                    <div className="mt-1 flex items-center justify-between text-[10px] text-dim">
                      <span>{model.provider}</span>
                      <span className="tabular">
                        {model.requests.toLocaleString("en-US")} runs
                      </span>
                    </div>
                  </div>
                ))}
                {stats.models.length === 0 && (
                  <p className="text-[12px] text-dim">No model activity in this window.</p>
                )}
              </div>
            </div>

            <div className="card p-5">
              <h2 className="text-[13px] font-semibold">Projects</h2>
              <p className="mt-0.5 text-[11px] text-muted">Attributed by working directory</p>
              <div className="mt-4 space-y-3">
                {stats.projects.map((project, index) => (
                  <div key={project.project} className="flex items-center gap-3">
                    <span className="mono w-4 shrink-0 text-[10px] text-dim">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-[12px] text-fg/85">
                        {shortPath(project.project)}
                      </div>
                      <div className="text-[10px] text-dim">
                        {compactNumber(project.tokens)} tokens · {project.requests} runs
                      </div>
                    </div>
                    <span className="tabular shrink-0 text-[11px] text-muted">
                      {usd(project.cost)}
                    </span>
                  </div>
                ))}
                {stats.projects.length === 0 && (
                  <p className="text-[12px] text-dim">No project attribution yet.</p>
                )}
              </div>
            </div>
          </div>

          <div className="card mt-3 p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-[13px] font-semibold">Recent activity</h2>
              <span className="chip !text-[10px]">{range.label}</span>
            </div>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[620px] text-left text-[11.5px]">
                <thead>
                  <tr className="border-b border-line text-[9.5px] uppercase tracking-[0.13em] text-dim">
                    <th className="py-2 pr-4 font-medium">Time</th>
                    <th className="py-2 pr-4 font-medium">Model</th>
                    <th className="py-2 pr-4 font-medium">Project</th>
                    <th className="py-2 pr-4 text-right font-medium">Tokens</th>
                    <th className="py-2 text-right font-medium">Cost</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recent.map((event) => (
                    <tr key={event.id} className="border-b border-line/60 last:border-0">
                      <td className="whitespace-nowrap py-2.5 pr-4 text-dim">
                        {timeAgo(event.eventAt)}
                      </td>
                      <td className="py-2.5 pr-4">
                        <div className="flex items-center gap-2">
                          <span className="truncate text-fg/90">{shortModel(event.model)}</span>
                          <span className="chip !px-1.5 !py-0.5 !text-[9px]">
                            {event.provider}
                          </span>
                        </div>
                      </td>
                      <td className="py-2.5 pr-4 text-muted">{shortPath(event.project)}</td>
                      <td className="tabular py-2.5 pr-4 text-right text-muted">
                        {compactNumber(event.tokens)}
                      </td>
                      <td className="tabular py-2.5 text-right text-fg/85">{usd(event.cost)}</td>
                    </tr>
                  ))}
                  {stats.recent.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-dim">
                        No events in this window.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
