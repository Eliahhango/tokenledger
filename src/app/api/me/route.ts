import { getCurrentWorkspace, getWorkspaceFromRequest } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const workspace = (await getWorkspaceFromRequest(request)) ?? (await getCurrentWorkspace());
  if (!workspace) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  return Response.json({
    workspace: {
      id: workspace.id,
      name: workspace.name,
      keyPrefix: workspace.key_prefix,
      createdAt: workspace.created_at,
    },
  });
}
