import { getCurrentWorkspace, rotateApiKey } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  const workspace = await getCurrentWorkspace();
  if (!workspace) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { apiKey, prefix } = await rotateApiKey(workspace.id);
  return Response.json({ apiKey, keyPrefix: prefix });
}
