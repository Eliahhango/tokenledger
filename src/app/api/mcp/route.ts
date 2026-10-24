import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import { z } from "zod";
import { getWorkspaceFromRequest, type Workspace } from "@/lib/auth";
import { usd } from "@/lib/format";
import { resolveRange } from "@/lib/range";
import { getStats } from "@/lib/stats";
import { insertUsage, parseEvents } from "@/lib/usage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const rangeInput = z
  .string()
  .default("month")
  .describe(
    "Time window: month (current), today, 7d, 30d, all, or a calendar month like 2026-10.",
  );

function text(value: unknown) {
  return {
    content: [
      {
        type: "text" as const,
        text: typeof value === "string" ? value : JSON.stringify(value, null, 2),
      },
    ],
  };
}

function registerTools(server: McpServer, workspace: Workspace) {
  server.registerTool(
    "log_usage",
    {
      title: "Log usage",
      description:
        "Record a single model usage event in the ledger. Use this when a run is not already reported automatically by the client plugin.",
      inputSchema: {
        model: z.string().min(1).describe("Model identifier, e.g. claude-sonnet-4-5"),
        provider: z.string().default("unknown").describe("Provider, e.g. anthropic"),
        inputTokens: z.number().int().min(0).default(0),
        outputTokens: z.number().int().min(0).default(0),
        reasoningTokens: z.number().int().min(0).default(0),
        cacheReadTokens: z.number().int().min(0).default(0),
        cacheWriteTokens: z.number().int().min(0).default(0),
        costUsd: z.number().min(0).default(0).describe("Cost in USD"),
        project: z.string().optional().describe("Project path or name"),
        mode: z.string().optional().describe("Agent or mode name"),
        sessionId: z.string().optional(),
        messageId: z
          .string()
          .optional()
          .describe("Stable id used to deduplicate repeated reports"),
        source: z.string().default("mcp"),
        eventAt: z.string().optional().describe("ISO timestamp; defaults to now"),
      },
    },
    async (args) => {
      const { events, issues } = parseEvents(args);
      if (events.length === 0) {
        return {
          content: [{ type: "text" as const, text: `Could not record usage: ${issues.join("; ")}` }],
          isError: true,
        };
      }
      await insertUsage(workspace.id, events);
      const event = events[0];
      const tokens =
        event.inputTokens +
        event.outputTokens +
        event.reasoningTokens +
        event.cacheReadTokens +
        event.cacheWriteTokens;
      return text(
        `Recorded ${event.provider}/${event.model}: ${tokens.toLocaleString("en-US")} tokens, ${usd(event.costUsd)}.`,
      );
    },
  );

  server.registerTool(
    "get_usage_summary",
    {
      title: "Get usage summary",
      description:
        "Return totals for a period: requests, tokens split by type, cost, and the top models.",
      inputSchema: { range: rangeInput },
    },
    async ({ range }) => {
      const stats = await getStats(workspace.id, resolveRange(range));
      return text({
        workspace: workspace.name,
        range: stats.range.label,
        totals: stats.totals,
        previousPeriod: stats.previous,
        topModels: stats.models.slice(0, 5),
      });
    },
  );

  server.registerTool(
    "get_model_breakdown",
    {
      title: "Get model breakdown",
      description: "Token and cost usage grouped by model for a period.",
      inputSchema: { range: rangeInput },
    },
    async ({ range }) => {
      const stats = await getStats(workspace.id, resolveRange(range));
      return text({ range: stats.range.label, models: stats.models });
    },
  );

  server.registerTool(
    "get_daily_usage",
    {
      title: "Get usage over time",
      description: "Daily (or monthly for all-time) usage buckets for charting.",
      inputSchema: { range: rangeInput },
    },
    async ({ range }) => {
      const stats = await getStats(workspace.id, resolveRange(range));
      return text({
        range: stats.range.label,
        bucket: stats.range.bucket,
        series: stats.series,
      });
    },
  );

  server.registerTool(
    "get_project_breakdown",
    {
      title: "Get project breakdown",
      description: "Token and cost usage grouped by project for a period.",
      inputSchema: { range: rangeInput },
    },
    async ({ range }) => {
      const stats = await getStats(workspace.id, resolveRange(range));
      return text({ range: stats.range.label, projects: stats.projects });
    },
  );

  server.registerTool(
    "list_recent_usage",
    {
      title: "List recent usage",
      description: "The most recent usage events in this ledger.",
      inputSchema: {
        limit: z.number().int().min(1).max(50).default(10),
      },
    },
    async ({ limit }) => {
      const stats = await getStats(workspace.id, resolveRange("all"));
      return text({ events: stats.recent.slice(0, limit) });
    },
  );
}

export async function POST(request: Request) {
  const workspace = await getWorkspaceFromRequest(request);
  if (!workspace) {
    return Response.json(
      {
        jsonrpc: "2.0",
        error: { code: -32001, message: "Unauthorized: send a Bearer API key." },
        id: null,
      },
      { status: 401 },
    );
  }

  const server = new McpServer(
    { name: "tokenledger", version: "0.1.0" },
    {
      instructions:
        "TokenLedger is a self-hosted AI usage ledger. Use get_usage_summary, get_model_breakdown, get_daily_usage, get_project_breakdown, and list_recent_usage to answer questions about token spend. Use log_usage only for runs that were not reported automatically.",
    },
  );

  registerTools(server, workspace);

  const transport = new WebStandardStreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
    enableJsonResponse: true,
  });

  await server.connect(transport);
  return transport.handleRequest(request);
}

export async function GET() {
  return Response.json(
    { jsonrpc: "2.0", error: { code: -32000, message: "Method not allowed" }, id: null },
    { status: 405 },
  );
}

export async function DELETE() {
  return Response.json(
    { jsonrpc: "2.0", error: { code: -32000, message: "Method not allowed" }, id: null },
    { status: 405 },
  );
}
