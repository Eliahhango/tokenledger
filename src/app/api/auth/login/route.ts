import { createSession, getWorkspaceByKey } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { apiKey?: unknown } | null;
  const apiKey = typeof body?.apiKey === "string" ? body.apiKey.trim() : "";

  if (!apiKey) {
    return Response.json({ error: "API key is required." }, { status: 400 });
  }

  const workspace = await getWorkspaceByKey(apiKey);
  if (!workspace) {
    return Response.json({ error: "That API key is not valid." }, { status: 401 });
  }

  await createSession(workspace.id);
  return Response.json({ ok: true, workspace: { name: workspace.name } });
}
