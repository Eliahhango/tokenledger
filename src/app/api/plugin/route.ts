import { PLUGIN_SOURCE } from "@/lib/plugin-source";

export const dynamic = "force-dynamic";

export async function GET() {
  return new Response(PLUGIN_SOURCE, {
    headers: {
      "content-type": "application/javascript; charset=utf-8",
      "cache-control": "public, max-age=300",
      "content-disposition": 'inline; filename="tokenledger.js"',
    },
  });
}
