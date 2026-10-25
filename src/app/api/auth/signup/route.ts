import { createSession, createUser, findUserByEmail } from "@/lib/auth";
import { createWorkspace } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as
    | { email?: unknown; password?: unknown; workspaceName?: unknown }
    | null;

  if (!body || typeof body !== "object") {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }

  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body.password === "string" ? body.password : "";
  const workspaceName =
    typeof body.workspaceName === "string" && body.workspaceName.trim()
      ? body.workspaceName.trim().slice(0, 48)
      : "My ledger";

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return Response.json({ error: "Enter a valid email address" }, { status: 400 });
  }
  if (password.length < 8) {
    return Response.json({ error: "Password must be at least 8 characters" }, { status: 400 });
  }

  try {
    const existing = await findUserByEmail(email);
    if (existing) {
      return Response.json({ error: "An account with that email already exists" }, { status: 409 });
    }
    const user = await createUser(email, password);
    const { workspace, apiKey } = await createWorkspace(workspaceName, user.id);
    await createSession(workspace.id, user.id);
    return Response.json(
      {
        ok: true,
        workspace: { id: workspace.id, name: workspace.name, keyPrefix: workspace.key_prefix },
        apiKey,
      },
      { status: 201 },
    );
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Could not create account" },
      { status: 500 },
    );
  }
}
