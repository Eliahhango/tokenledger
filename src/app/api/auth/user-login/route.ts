import { createSession, findUserByEmail, verifyPassword } from "@/lib/auth";
import { getUserWorkspaces } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { email?: unknown; password?: unknown } | null;

  if (!body || typeof body !== "object") {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }

  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body.password === "string" ? body.password : "";

  if (!email || !password) {
    return Response.json({ error: "Enter your email and password" }, { status: 400 });
  }

  try {
    const user = await findUserByEmail(email);
    if (!user || !verifyPassword(password, user.password_hash)) {
      return Response.json({ error: "Invalid email or password" }, { status: 401 });
    }
    const workspaces = await getUserWorkspaces(user.id);
    if (workspaces.length === 0) {
      return Response.json({ error: "No workspace found for this account" }, { status: 404 });
    }
    await createSession(workspaces[0].id, user.id);
    return Response.json({ ok: true, workspace: workspaces[0] }, { status: 200 });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Could not sign in" },
      { status: 500 },
    );
  }
}
