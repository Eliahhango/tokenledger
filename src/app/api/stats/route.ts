import { getCurrentWorkspace, getWorkspaceFromRequest } from "@/lib/auth";
import { resolveRange } from "@/lib/range";
import { getStats } from "@/lib/stats";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const workspace =
    (await getWorkspaceFromRequest(request)) ?? (await getCurrentWorkspace());

  if (!workspace) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const range = resolveRange(url.searchParams.get("range"));

  try {
    const stats = await getStats(workspace.id, range);
    return Response.json({
      workspace: { id: workspace.id, name: workspace.name },
      ...stats,
    });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Could not load stats" },
      { status: 500 },
    );
  }
}
