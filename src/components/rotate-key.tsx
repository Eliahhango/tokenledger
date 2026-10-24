"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { CopyButton } from "./copy-button";

export function RotateKey({ prefix }: { prefix: string }) {
  const router = useRouter();
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function rotate() {
    if (
      !window.confirm(
        "Rotate this API key? The current key stops working immediately for ingest and MCP.",
      )
    ) {
      return;
    }
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/me/rotate-key", { method: "POST" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Could not rotate key");
      setApiKey(data.apiKey);
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <code className="mono rounded-lg border border-line bg-white/[0.02] px-2.5 py-1.5 text-[12px] text-fg/85">
            {prefix}…
          </code>
          <span className="text-[11px] text-dim">Only the prefix is stored for display.</span>
        </div>
        <button type="button" onClick={rotate} className="btn btn-ghost btn-sm" disabled={loading}>
          {loading ? "Rotating…" : "Rotate key"}
        </button>
      </div>

      {error && (
        <div className="mt-3 rounded-xl border border-rose/25 bg-rose/[0.06] px-3.5 py-2.5 text-[12px] text-rose">
          {error}
        </div>
      )}

      {apiKey && (
        <div className="mt-4 rounded-lg border border-amber/30 bg-amber/[0.05] p-3.5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-[12px] font-medium text-amber">
              New key — copy it now. It will not be shown again.
            </span>
            <CopyButton value={apiKey} label="Copy key" className="btn btn-ghost btn-sm" />
          </div>
          <div className="code mt-2.5">
            <pre>
              <code className="text-emerald">{apiKey}</code>
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
