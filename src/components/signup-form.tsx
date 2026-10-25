"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function SignupForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [workspaceName, setWorkspaceName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [apiKey, setApiKey] = useState<string | null>(null);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, password, workspaceName }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Could not create account");
      setApiKey(data.apiKey);
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  if (apiKey) {
    return (
      <div className="space-y-4">
        <div className="rounded-lg border border-emerald/30 bg-emerald/[0.05] px-3.5 py-2.5 text-[12px] text-emerald">
          Account created. Your API key is shown once.
        </div>
        <div>
          <div className="mb-1.5 text-[11px] text-fg">API key</div>
          <div className="code">
            <pre>
              <code className="text-emerald">{apiKey}</code>
            </pre>
          </div>
        </div>
        <button onClick={() => router.push("/app")} className="btn btn-primary w-full">
          Open dashboard
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label htmlFor="email" className="label">
          Email
        </label>
        <input
          id="email"
          type="email"
          className="input"
          placeholder="you@example.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          autoComplete="email"
          required
        />
      </div>
      <div>
        <label htmlFor="password" className="label">
          Password
        </label>
        <input
          id="password"
          type="password"
          className="input"
          placeholder="At least 8 characters"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoComplete="new-password"
          minLength={8}
          required
        />
      </div>
      <div>
        <label htmlFor="workspace" className="label">
          Ledger name
        </label>
        <input
          id="workspace"
          className="input"
          placeholder="My project"
          value={workspaceName}
          onChange={(event) => setWorkspaceName(event.target.value)}
        />
      </div>

      {error && (
        <div className="rounded-lg border border-rose/30 bg-rose/[0.05] px-3.5 py-2.5 text-[12px] text-rose">
          {error}
        </div>
      )}

      <button type="submit" className="btn btn-primary w-full" disabled={loading}>
        {loading ? "Creating account…" : "Create account"}
      </button>
    </form>
  );
}
