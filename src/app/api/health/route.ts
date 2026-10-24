import { getDb } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const db = getDb();
    await db`select 1`;
    return Response.json({ ok: true, service: "tokenledger" });
  } catch (error) {
    return Response.json(
      { ok: false, error: error instanceof Error ? error.message : "database unavailable" },
      { status: 500 },
    );
  }
}
