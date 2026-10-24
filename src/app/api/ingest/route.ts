import { getWorkspaceFromRequest } from "@/lib/auth";
import { insertUsage, parseEvents } from "@/lib/usage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const workspace = await getWorkspaceFromRequest(request);
  if (!workspace) {
    return Response.json({ error: "Invalid or missing API key." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  if (!body) {
    return Response.json({ error: "Expected a JSON body." }, { status: 400 });
  }

  const { events, issues } = parseEvents(body);
  if (events.length === 0) {
    return Response.json({ error: "No valid usage events.", issues }, { status: 400 });
  }

  try {
    const recorded = await insertUsage(workspace.id, events);
    return Response.json({ ok: true, recorded, issues });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Could not record usage" },
      { status: 500 },
    );
  }
}

export async function GET() {
  return Response.json(
    {
      error: "Use POST with an API key.",
      example: {
        method: "POST",
        headers: { Authorization: "Bearer tl_...", "Content-Type": "application/json" },
        body: {
          model: "claude-sonnet-4-5",
          provider: "anthropic",
          inputTokens: 1200,
          outputTokens: 450,
          costUsd: 0.0104,
          project: "my-app",
        },
      },
    },
    { status: 405 },
  );
}
