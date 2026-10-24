import { getDb } from "./db";
import { type DateRange, enumerateBuckets } from "./range";

export type Totals = {
  requests: number;
  input: number;
  output: number;
  reasoning: number;
  cacheRead: number;
  cacheWrite: number;
  tokens: number;
  cost: number;
};

export type SeriesPoint = {
  bucket: string;
  input: number;
  output: number;
  reasoning: number;
  cacheRead: number;
  cacheWrite: number;
  tokens: number;
  cost: number;
  requests: number;
};

export type ModelRow = {
  provider: string;
  model: string;
  requests: number;
  tokens: number;
  cost: number;
};

export type ProviderRow = {
  provider: string;
  requests: number;
  tokens: number;
  cost: number;
};

export type ProjectRow = {
  project: string;
  requests: number;
  tokens: number;
  cost: number;
};

export type RecentUsage = {
  id: string;
  provider: string;
  model: string;
  project: string | null;
  mode: string | null;
  source: string;
  inputTokens: number;
  outputTokens: number;
  reasoningTokens: number;
  cacheReadTokens: number;
  cacheWriteTokens: number;
  tokens: number;
  cost: number;
  eventAt: string;
};

export type Stats = {
  range: {
    key: string;
    label: string;
    from: string;
    to: string;
    bucket: "day" | "month";
  };
  totals: Totals;
  previous: Totals | null;
  series: SeriesPoint[];
  models: ModelRow[];
  providers: ProviderRow[];
  projects: ProjectRow[];
  recent: RecentUsage[];
};

type TotalsRow = {
  requests: number;
  input: number;
  output: number;
  reasoning: number;
  cache_read: number;
  cache_write: number;
  cost: number;
};

function toTotals(row: TotalsRow | undefined): Totals {
  const input = Number(row?.input ?? 0);
  const output = Number(row?.output ?? 0);
  const reasoning = Number(row?.reasoning ?? 0);
  const cacheRead = Number(row?.cache_read ?? 0);
  const cacheWrite = Number(row?.cache_write ?? 0);
  return {
    requests: Number(row?.requests ?? 0),
    input,
    output,
    reasoning,
    cacheRead,
    cacheWrite,
    tokens: input + output + reasoning + cacheRead + cacheWrite,
    cost: Number(row?.cost ?? 0),
  };
}

export async function getStats(workspaceId: string, range: DateRange): Promise<Stats> {
  const db = getDb();
  const { from, to } = range;
  const bucket = range.bucket;
  const bucketFormat = bucket === "month" ? "YYYY-MM" : "YYYY-MM-DD";
  const previous = range.previous;

  const totalsQuery = db<TotalsRow[]>`
    select
      count(*)::int as requests,
      coalesce(sum(input_tokens), 0)::float8 as input,
      coalesce(sum(output_tokens), 0)::float8 as output,
      coalesce(sum(reasoning_tokens), 0)::float8 as reasoning,
      coalesce(sum(cache_read_tokens), 0)::float8 as cache_read,
      coalesce(sum(cache_write_tokens), 0)::float8 as cache_write,
      coalesce(sum(cost_usd), 0)::float8 as cost
    from usage_events
    where workspace_id = ${workspaceId}
      and event_at >= ${from}
      and event_at < ${to}
  `;

  const seriesQuery = db<
    {
      bucket: string;
      input: number;
      output: number;
      reasoning: number;
      cache_read: number;
      cache_write: number;
      cost: number;
      requests: number;
    }[]
  >`
    select
      to_char(date_trunc(${bucket}, event_at at time zone 'UTC'), ${bucketFormat}) as bucket,
      coalesce(sum(input_tokens), 0)::float8 as input,
      coalesce(sum(output_tokens), 0)::float8 as output,
      coalesce(sum(reasoning_tokens), 0)::float8 as reasoning,
      coalesce(sum(cache_read_tokens), 0)::float8 as cache_read,
      coalesce(sum(cache_write_tokens), 0)::float8 as cache_write,
      coalesce(sum(cost_usd), 0)::float8 as cost,
      count(*)::int as requests
    from usage_events
    where workspace_id = ${workspaceId}
      and event_at >= ${from}
      and event_at < ${to}
    group by 1
    order by 1
  `;

  const modelsQuery = db<ModelRow[]>`
    select
      provider,
      model,
      count(*)::int as requests,
      coalesce(sum(input_tokens + output_tokens + reasoning_tokens + cache_read_tokens + cache_write_tokens), 0)::float8 as tokens,
      coalesce(sum(cost_usd), 0)::float8 as cost
    from usage_events
    where workspace_id = ${workspaceId}
      and event_at >= ${from}
      and event_at < ${to}
    group by provider, model
    order by tokens desc
    limit 10
  `;

  const providersQuery = db<ProviderRow[]>`
    select
      provider,
      count(*)::int as requests,
      coalesce(sum(input_tokens + output_tokens + reasoning_tokens + cache_read_tokens + cache_write_tokens), 0)::float8 as tokens,
      coalesce(sum(cost_usd), 0)::float8 as cost
    from usage_events
    where workspace_id = ${workspaceId}
      and event_at >= ${from}
      and event_at < ${to}
    group by provider
    order by tokens desc
    limit 8
  `;

  const projectsQuery = db<ProjectRow[]>`
    select
      coalesce(nullif(project, ''), 'unassigned') as project,
      count(*)::int as requests,
      coalesce(sum(input_tokens + output_tokens + reasoning_tokens + cache_read_tokens + cache_write_tokens), 0)::float8 as tokens,
      coalesce(sum(cost_usd), 0)::float8 as cost
    from usage_events
    where workspace_id = ${workspaceId}
      and event_at >= ${from}
      and event_at < ${to}
    group by 1
    order by tokens desc
    limit 6
  `;

  const recentQuery = db<
    {
      id: string;
      provider: string;
      model: string;
      project: string | null;
      mode: string | null;
      source: string;
      input_tokens: number;
      output_tokens: number;
      reasoning_tokens: number;
      cache_read_tokens: number;
      cache_write_tokens: number;
      cost: number;
      event_at: Date;
    }[]
  >`
    select
      id, provider, model, project, mode, source,
      input_tokens, output_tokens, reasoning_tokens,
      cache_read_tokens, cache_write_tokens,
      cost_usd::float8 as cost,
      event_at
    from usage_events
    where workspace_id = ${workspaceId}
      and event_at >= ${from}
      and event_at < ${to}
    order by event_at desc
    limit 14
  `;

  const previousQuery = previous
    ? db<TotalsRow[]>`
        select
          count(*)::int as requests,
          coalesce(sum(input_tokens), 0)::float8 as input,
          coalesce(sum(output_tokens), 0)::float8 as output,
          coalesce(sum(reasoning_tokens), 0)::float8 as reasoning,
          coalesce(sum(cache_read_tokens), 0)::float8 as cache_read,
          coalesce(sum(cache_write_tokens), 0)::float8 as cache_write,
          coalesce(sum(cost_usd), 0)::float8 as cost
        from usage_events
        where workspace_id = ${workspaceId}
          and event_at >= ${previous.from}
          and event_at < ${previous.to}
      `
    : Promise.resolve([] as TotalsRow[]);

  const [totalsRows, seriesRows, modelRows, providerRows, projectRows, recentRows, previousRows] =
    await Promise.all([
      totalsQuery,
      seriesQuery,
      modelsQuery,
      providersQuery,
      projectsQuery,
      recentQuery,
      previousQuery,
    ]);

  const seriesMap = new Map(
    seriesRows.map((row) => {
      const input = Number(row.input);
      const output = Number(row.output);
      const reasoning = Number(row.reasoning);
      const cacheRead = Number(row.cache_read);
      const cacheWrite = Number(row.cache_write);
      return [
        row.bucket,
        {
          bucket: row.bucket,
          input,
          output,
          reasoning,
          cacheRead,
          cacheWrite,
          tokens: input + output + reasoning + cacheRead + cacheWrite,
          cost: Number(row.cost),
          requests: Number(row.requests),
        } satisfies SeriesPoint,
      ];
    }),
  );

  const firstBucket = seriesRows[0]?.bucket;
  const lastBucket = seriesRows[seriesRows.length - 1]?.bucket;
  const buckets = enumerateBuckets(range, firstBucket, lastBucket);

  const series: SeriesPoint[] = buckets.map(
    (bucketKey) =>
      seriesMap.get(bucketKey) ?? {
        bucket: bucketKey,
        input: 0,
        output: 0,
        reasoning: 0,
        cacheRead: 0,
        cacheWrite: 0,
        tokens: 0,
        cost: 0,
        requests: 0,
      },
  );

  return {
    range: {
      key: range.key,
      label: range.label,
      from: from.toISOString(),
      to: to.toISOString(),
      bucket,
    },
    totals: toTotals(totalsRows[0]),
    previous: previous ? toTotals(previousRows[0]) : null,
    series,
    models: modelRows.map((row) => ({
      provider: row.provider,
      model: row.model,
      requests: Number(row.requests),
      tokens: Number(row.tokens),
      cost: Number(row.cost),
    })),
    providers: providerRows.map((row) => ({
      provider: row.provider,
      requests: Number(row.requests),
      tokens: Number(row.tokens),
      cost: Number(row.cost),
    })),
    projects: projectRows.map((row) => ({
      project: row.project,
      requests: Number(row.requests),
      tokens: Number(row.tokens),
      cost: Number(row.cost),
    })),
    recent: recentRows.map((row) => {
      const inputTokens = Number(row.input_tokens);
      const outputTokens = Number(row.output_tokens);
      const reasoningTokens = Number(row.reasoning_tokens);
      const cacheReadTokens = Number(row.cache_read_tokens);
      const cacheWriteTokens = Number(row.cache_write_tokens);
      return {
        id: row.id,
        provider: row.provider,
        model: row.model,
        project: row.project,
        mode: row.mode,
        source: row.source,
        inputTokens,
        outputTokens,
        reasoningTokens,
        cacheReadTokens,
        cacheWriteTokens,
        tokens: inputTokens + outputTokens + reasoningTokens + cacheReadTokens + cacheWriteTokens,
        cost: Number(row.cost),
        eventAt: new Date(row.event_at).toISOString(),
      };
    }),
  };
}
