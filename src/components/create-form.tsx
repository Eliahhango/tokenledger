"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CodeBlock } from "./code-block";
import { CopyButton } from "./copy-button";

type Created = {
  apiKey: string;
  workspace: { name: string; keyPrefix: string };
};

export function CreateWorkspaceForm() {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [created, setCreated] = useState<Created | null>(null);
  const [origin, setOrigin] = useState("");

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/workspaces", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Could not create ledger");
      setCreated({ apiKey: data.apiKey, workspace: data.workspace });
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  if (created) {
    const base = origin || "https://your-app.vercel.app";
    const mcpConfig = `{
  "mcp": {
    "tokenledger": {
      "type": "remote",
      "url": "${base}/api/mcp",
      "enabled": true,
      "headers": { "Authorization": "Bearer ${created.apiKey}" }
    }
  }
}`;

    return (
      <div className="space-y-5">
        <div>
          <div className="pill !border-lime/30 !text-lime">Ledger ready</div>
          <h2 className="mt-3 text-2xl font-semibold tracking-[-0.02em]">
            {created.workspace.name} is live.
          </h2>
          <p className="mt-1.5 text-[13.5px] leading-relaxed text-muted">
            This API key is shown once. Copy it now and add it to your client.
          </p>
        </div>

        <div className="rounded-xl border border-amber/25 bg-amber/[0.06] px-4 py-3 text-[12.5px] leading-relaxed text-amber">
          Keep this key secret. Anyone with it can write usage to your ledger. Rotate it any time
          from Settings.
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <span className="label !mb-0">API key</span>
            <CopyButton value={created.apiKey} label="Copy key" />
          </div>
          <div className="code">
            <pre>
              <code className="text-lime">{created.apiKey}</code>
            </pre>
          </div>
        </div>

        <div>
          <span className="label">Add to opencode</span>
          <CodeBlock code={mcpConfig} language="json" />
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link href="/app" className="btn btn-primary">
            Open dashboard →
          </Link>
          <Link href="/login" className="btn btn-ghost">
            I already have a key
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label htmlFor="ledger-name" className="label">
          Ledger name
        </label>
        <input
          id="ledger-name"
          className="input"
          placeholder="Acme AI"
          value={name}
          maxLength={48}
          onChange={(event) => setName(event.target.value)}
          autoFocus
        />
      </div>

      {error && (
        <div className="rounded-xl border border-rose/25 bg-rose/[0.06] px-3.5 py-2.5 text-[12.5px] text-rose">
          {error}
        </div>
      )}

      <button type="submit" className="btn btn-primary w-full" disabled={loading}>
        {loading ? "Creating ledger…" : "Create ledger →"}
      </button>

      <p className="text-[11.5px] leading-relaxed text-dim">
        No email, no password. You get an API key and a private dashboard. Usage data stays in the
        Postgres database you deploy with.
      </p>
    </form>
  );
}
