import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { CodeBlock } from "@/components/code-block";
import { CopyButton } from "@/components/copy-button";
import { RotateKey } from "@/components/rotate-key";
import { getCurrentWorkspace } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const workspace = await getCurrentWorkspace();
  if (!workspace) redirect("/login");

  const header = await headers();
  const baseUrl =
    process.env.APP_URL ??
    `${header.get("x-forwarded-proto") ?? "http"}://${
      header.get("x-forwarded-host") ?? header.get("host") ?? "localhost:3001"
    }`;

  const mcpUrl = `${baseUrl}/api/mcp`;
  const ingestUrl = `${baseUrl}/api/ingest`;
  const pluginUrl = `${baseUrl}/api/plugin`;

  const opencodeConfig = `{
  "mcp": {
    "tokenledger": {
      "type": "remote",
      "url": "${mcpUrl}",
      "enabled": true,
      "headers": { "Authorization": "Bearer tl_your_key" }
    }
  }
}`;

  const pluginInstall = `curl -fsSL ${pluginUrl} -o ~/.config/opencode/plugins/tokenledger.js`;

  const pluginEnv = `export TOKENLEDGER_URL=${baseUrl}
export TOKENLEDGER_API_KEY=tl_your_key`;

  const ingestCurl = `curl -X POST ${ingestUrl} \\
  -H "Authorization: Bearer tl_your_key" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "claude-sonnet-4-5",
    "provider": "anthropic",
    "inputTokens": 1200,
    "outputTokens": 450,
    "costUsd": 0.0104,
    "project": "my-app"
  }'`;

  const statsCurl = `curl ${baseUrl}/api/stats \\
  -H "Authorization: Bearer tl_your_key"`;

  return (
    <div>
      <div className="flex flex-col gap-2">
        <div>
          <h1 className="text-[22px] font-semibold tracking-[-0.02em] sm:text-[26px]">
            Settings
          </h1>
          <p className="mt-1 text-[12px] text-muted">
            Connection details for <span className="text-fg">{workspace.name}</span>
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-3 lg:grid-cols-2">
        <div className="card card-pad lg:col-span-2">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-[13px] font-medium">API key</h2>
              <p className="mt-0.5 text-[11px] text-muted">
                Used to authenticate ingest, the MCP server, and the REST API.
              </p>
            </div>
            <span className="chip">Bearer auth</span>
          </div>
          <div className="mt-4">
            <RotateKey prefix={workspace.key_prefix} />
          </div>
          <p className="mt-3 text-[11px] leading-relaxed text-dim">
            The full key is only shown when you create the workspace or rotate it. Treat it like a
            secret. If it is lost, rotate to issue a new one.
          </p>
        </div>

        <div className="card card-pad">
          <div className="flex items-center justify-between">
            <h2 className="text-[13px] font-medium">Remote MCP endpoint</h2>
            <span className="chip">Streamable HTTP</span>
          </div>
          <p className="mt-0.5 text-[11px] text-muted">
            Query your spend and log usage from any MCP-compatible client.
          </p>
          <div className="mt-4 space-y-3">
            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <span className="text-[11px] text-fg">URL</span>
                <CopyButton value={mcpUrl} className="btn btn-ghost btn-sm" />
              </div>
              <div className="input mono flex h-9 items-center !text-[12px]">{mcpUrl}</div>
            </div>
            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <span className="text-[11px] text-fg">Authorization header</span>
                <CopyButton
                  value="Authorization: Bearer tl_your_key"
                  className="btn btn-ghost btn-sm"
                />
              </div>
              <div className="input mono flex h-9 items-center !text-[12px]">
                Authorization: Bearer tl_your_key
              </div>
            </div>
            <div>
              <span className="label">opencode config</span>
              <CodeBlock code={opencodeConfig} language="json" />
            </div>
          </div>
        </div>

        <div className="card card-pad">
          <h2 className="text-[13px] font-medium">opencode auto-report plugin</h2>
          <p className="mt-0.5 text-[11px] text-muted">
            Automatically record completed assistant messages with tokens, cost, model, and
            project.
          </p>
          <div className="mt-4 space-y-4">
            <div>
              <span className="label">1) Download the plugin</span>
              <CodeBlock code={pluginInstall} language="bash" />
            </div>
            <div>
              <span className="label">2) Set environment variables</span>
              <CodeBlock code={pluginEnv} language="bash" />
              <p className="mt-1.5 text-[10.5px] text-dim">
                Add these to your shell profile, or run them before launching opencode.
              </p>
            </div>
            <p className="text-[11px] leading-relaxed text-muted">
              The plugin lives at <span className="mono">~/.config/opencode/plugins/tokenledger.js</span>.
              Duplicate message IDs are upserted server-side, so restarts cannot double-count.
            </p>
          </div>
        </div>

        <div className="card card-pad lg:col-span-2">
          <h2 className="text-[13px] font-medium">REST API</h2>
          <p className="mt-0.5 text-[11px] text-muted">
            Report usage or fetch aggregated stats with the same API key.
          </p>
          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <div>
              <div className="mb-2 flex items-center gap-2">
                <span className="chip">POST</span>
                <span className="mono text-[11px] text-muted">{ingestUrl}</span>
                <CopyButton value={ingestUrl} className="btn btn-ghost btn-sm" />
              </div>
              <CodeBlock code={ingestCurl} language="bash" />
              <p className="mt-1.5 text-[10.5px] text-dim">
                Accepts a single event or <span className="mono">{`{"events":[...]}`}</span> (up to 500).
                Aliases like <span className="mono">input_tokens</span>,{" "}
                <span className="mono">message_id</span> are accepted.
              </p>
            </div>
            <div>
              <div className="mb-2 flex items-center gap-2">
                <span className="chip !text-[10px]">GET</span>
                <span className="mono text-[11px] text-muted">{baseUrl}/api/stats?range=month</span>
                <CopyButton value={statsCurl} className="btn btn-ghost btn-sm" />
              </div>
              <CodeBlock code={statsCurl} language="bash" />
              <p className="mt-1.5 text-[10.5px] text-dim">
                Ranges: <span className="mono">month</span>, <span className="mono">7d</span>,{" "}
                <span className="mono">30d</span>, <span className="mono">all</span>, or{" "}
                <span className="mono">2026-10</span>. You can also use a session cookie to hit it
                from the dashboard.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
