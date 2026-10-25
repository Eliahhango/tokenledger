import { createSession, createWorkspace, getCurrentWorkspace } from "@/lib/auth";
import { getDb } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const buckets = new Map<string, { count: number; resetAt: number }>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const bucket = buckets.get(ip);
  if (!bucket || bucket.resetAt < now) {
    buckets.set(ip, { count: 1, resetAt: now + 60 * 60 * 1000 });
    return false;
  }
  bucket.count += 1;
  return bucket.count > 12;
}

export async function POST(request: Request) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "local";

  if (rateLimited(ip)) {
    return Response.json({ error: "Too many workspaces created. Try again later." }, { status: 429 });
  }

  const body = (await request.json().catch(() => null));
  let rawName = "";
  if (body && typeof body === "object") {
    const candidate = (body as { name?: unknown }).name;
    if (typeof candidate === "string") rawName = candidate.trim();
  }
  const name = (rawName || "My ledger").slice(0, 48);

  try {
    let userId: string | null = null;
    // Try to get user from session
    try {
      const db = getDb();
      // We'll just pass null if not logged in as user for now
    } catch {}

    const { workspace, apiKey } = await createWorkspace(name, userId);
    await createSession(workspace.id);
    return Response.json(
      {
        workspace: {
          id: workspace.id,
          name: workspace.name,
          keyPrefix: workspace.key_prefix,
        },
        apiKey,
      },
      { status: 201 },
    );
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Could not create workspace" },
      { status: 500 },
    );
  }
}
