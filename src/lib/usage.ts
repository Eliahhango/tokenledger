import { z } from "zod";
import { getDb } from "./db";

const tokenCount = z.coerce.number().int().min(0).max(1_000_000_000_000).default(0);
const money = z.coerce.number().min(0).max(1_000_000).default(0);

const eventSchema = z.object({
  messageId: z.string().trim().min(1).max(300).optional(),
  sessionId: z.string().trim().max(300).optional(),
  provider: z.string().trim().min(1).max(120).default("unknown"),
  model: z.string().trim().min(1).max(200),
  inputTokens: tokenCount,
  outputTokens: tokenCount,
  reasoningTokens: tokenCount,
  cacheReadTokens: tokenCount,
  cacheWriteTokens: tokenCount,
  costUsd: money,
  project: z.string().trim().max(500).optional(),
  mode: z.string().trim().max(120).optional(),
  source: z.string().trim().min(1).max(60).default("api"),
  eventAt: z.coerce.date().default(() => new Date()),
});

export type UsageEvent = z.infer<typeof eventSchema>;

function pickScalar(...values: unknown[]): string | number | undefined {
  for (const value of values) {
    if (typeof value === "string" && value.length > 0) return value;
    if (typeof value === "number" && Number.isFinite(value)) return value;
  }
  return undefined;
}

function pickString(...values: unknown[]): string | undefined {
  const value = pickScalar(...values);
  return typeof value === "string" ? value : value === undefined ? undefined : String(value);
}

function normalizeRaw(raw: Record<string, unknown>): Record<string, unknown> {
  return {
    messageId: pickString(raw.messageId, raw.message_id, raw.messageID),
    sessionId: pickString(raw.sessionId, raw.session_id, raw.sessionID),
    provider: pickString(raw.provider, raw.providerID, raw.provider_id, raw.providerId),
    model: pickString(raw.model, raw.modelID, raw.model_id, raw.modelId),
    inputTokens: pickScalar(raw.inputTokens, raw.input_tokens, raw.input, raw.promptTokens, raw.prompt_tokens),
    outputTokens: pickScalar(raw.outputTokens, raw.output_tokens, raw.output, raw.completionTokens, raw.completion_tokens),
    reasoningTokens: pickScalar(raw.reasoningTokens, raw.reasoning_tokens, raw.reasoning),
    cacheReadTokens: pickScalar(raw.cacheReadTokens, raw.cache_read_tokens, raw.cacheRead, raw.cache_read),
    cacheWriteTokens: pickScalar(raw.cacheWriteTokens, raw.cache_write_tokens, raw.cacheWrite, raw.cache_write),
    costUsd: pickScalar(raw.costUsd, raw.cost_usd, raw.cost),
    project: pickString(raw.project, raw.project_name, raw.cwd, raw.directory),
    mode: pickString(raw.mode, raw.agent),
    source: pickString(raw.source, raw.client),
    eventAt: raw.eventAt ?? raw.event_at ?? raw.timestamp ?? raw.time ?? raw.createdAt,
  };
}

export function parseEvents(body: unknown): { events: UsageEvent[]; issues: string[] } {
  const container = body as { events?: unknown } | null;
  const list = Array.isArray(container?.events) ? container!.events : [body];
  const events: UsageEvent[] = [];
  const issues: string[] = [];

  list.slice(0, 500).forEach((raw, index) => {
    if (typeof raw !== "object" || raw === null) {
      issues.push(`${index}: expected an object`);
      return;
    }
    const parsed = eventSchema.safeParse(normalizeRaw(raw as Record<string, unknown>));
    if (parsed.success) {
      events.push(parsed.data);
    } else {
      const detail = parsed.error.issues.map((issue) => `${issue.path.join(".") || "body"}: ${issue.message}`).join("; ");
      issues.push(`${index}: ${detail}`);
    }
  });

  return { events, issues };
}

export async function insertUsage(
  workspaceId: string,
  events: UsageEvent[],
): Promise<number> {
  if (events.length === 0) return 0;
  const db = getDb();
  let recorded = 0;

  await db.begin(async (tx) => {
    for (const event of events) {
      const values = {
        workspaceId,
        messageId: event.messageId ?? null,
        sessionId: event.sessionId ?? null,
        provider: event.provider,
        model: event.model,
        inputTokens: event.inputTokens,
        outputTokens: event.outputTokens,
        reasoningTokens: event.reasoningTokens,
        cacheReadTokens: event.cacheReadTokens,
        cacheWriteTokens: event.cacheWriteTokens,
        costUsd: event.costUsd,
        project: event.project ?? null,
        mode: event.mode ?? null,
        source: event.source,
        eventAt: event.eventAt,
      };

      if (event.messageId) {
        await tx`
          insert into usage_events (
            workspace_id, message_id, session_id, provider, model,
            input_tokens, output_tokens, reasoning_tokens,
            cache_read_tokens, cache_write_tokens, cost_usd,
            project, mode, source, event_at
          ) values (
            ${values.workspaceId}, ${values.messageId}, ${values.sessionId}, ${values.provider}, ${values.model},
            ${values.inputTokens}, ${values.outputTokens}, ${values.reasoningTokens},
            ${values.cacheReadTokens}, ${values.cacheWriteTokens}, ${values.costUsd},
            ${values.project}, ${values.mode}, ${values.source}, ${values.eventAt}
          )
          on conflict (workspace_id, message_id) where message_id is not null
          do update set
            session_id = excluded.session_id,
            provider = excluded.provider,
            model = excluded.model,
            input_tokens = excluded.input_tokens,
            output_tokens = excluded.output_tokens,
            reasoning_tokens = excluded.reasoning_tokens,
            cache_read_tokens = excluded.cache_read_tokens,
            cache_write_tokens = excluded.cache_write_tokens,
            cost_usd = excluded.cost_usd,
            project = excluded.project,
            mode = excluded.mode,
            source = excluded.source,
            event_at = excluded.event_at
        `;
      } else {
        await tx`
          insert into usage_events (
            workspace_id, message_id, session_id, provider, model,
            input_tokens, output_tokens, reasoning_tokens,
            cache_read_tokens, cache_write_tokens, cost_usd,
            project, mode, source, event_at
          ) values (
            ${values.workspaceId}, null, ${values.sessionId}, ${values.provider}, ${values.model},
            ${values.inputTokens}, ${values.outputTokens}, ${values.reasoningTokens},
            ${values.cacheReadTokens}, ${values.cacheWriteTokens}, ${values.costUsd},
            ${values.project}, ${values.mode}, ${values.source}, ${values.eventAt}
          )
        `;
      }

      recorded += 1;
    }
  });

  return recorded;
}
