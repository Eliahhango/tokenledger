import Link from "next/link";
import { CodeBlock } from "@/components/code-block";
import { LandingPreview } from "@/components/landing-preview";
import { Logo } from "@/components/logo";

const mcpConfig = `{
  "mcp": {
    "tokenledger": {
      "type": "remote",
      "url": "https://your-ledger.vercel.app/api/mcp",
      "enabled": true,
      "headers": { "Authorization": "Bearer tl_your_key" }
    }
  }
}`;

const curlExample = `curl -X POST https://your-ledger.vercel.app/api/ingest \\
  -H "Authorization: Bearer tl_your_key" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "claude-sonnet-4-5",
    "provider": "anthropic",
    "inputTokens": 12480,
    "outputTokens": 2130,
    "cacheReadTokens": 40200,
    "costUsd": 0.094,
    "project": "my-app"
  }'`;

const pluginExample = `# 1. Create a ledger in the browser and copy your key.
# 2. Install the reporter plugin in opencode:
curl -fsSL https://your-ledger.vercel.app/api/plugin \\
  -o ~/.config/opencode/plugins/tokenledger.js

# 3. Point it at your deployment:
export TOKENLEDGER_URL=https://your-ledger.vercel.app
export TOKENLEDGER_API_KEY=tl_your_key

# Every completed opencode message is now recorded automatically.`;

const features = [
  {
    title: "Token-level detail",
    body: "Input, output, reasoning, and cache tokens are split on every single run — not a single inflated number.",
    icon: "layers",
  },
  {
    title: "Model intelligence",
    body: "See which models and providers actually drive your bill, ranked by tokens and real cost.",
    icon: "spark",
  },
  {
    title: "Project attribution",
    body: "Attribute spend to repos, directories, and sessions automatically. Know which project is expensive.",
    icon: "folder",
  },
  {
    title: "MCP-native",
    body: "The dashboard is also a remote MCP server. Ask your agent for a spend report without leaving the terminal.",
    icon: "plug",
  },
  {
    title: "Automatic opencode reporting",
    body: "Drop in the reporter plugin and every completed assistant message lands in the ledger. No manual logging.",
    icon: "bolt",
  },
  {
    title: "Your database, your rules",
    body: "Self-hosted on Postgres. No third-party analytics, no telemetry, no vendor lock-in. Export anytime.",
    icon: "shield",
  },
];

const clients = ["opencode", "Claude Code", "Cursor", "Windsurf", "Cline", "any MCP client"];

function Icon({ name }: { name: string }) {
  const common = {
    width: 18,
    height: 18,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.6,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  if (name === "layers") {
    return (
      <svg {...common}>
        <path d="m12 3 9 5-9 5-9-5 9-5Z" />
        <path d="m3 13 9 5 9-5" />
      </svg>
    );
  }
  if (name === "spark") {
    return (
      <svg {...common}>
        <path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M18.4 5.6l-2.8 2.8M8.4 15.6l-2.8 2.8" />
      </svg>
    );
  }
  if (name === "folder") {
    return (
      <svg {...common}>
        <path d="M3 7.5A2.5 2.5 0 0 1 5.5 5H9l2 2.5h7.5A2.5 2.5 0 0 1 21 10v6.5a2.5 2.5 0 0 1-2.5 2.5h-13A2.5 2.5 0 0 1 3 16.5v-9Z" />
      </svg>
    );
  }
  if (name === "plug") {
    return (
      <svg {...common}>
        <path d="M9 3v6M15 3v6M6 9h12v3a6 6 0 0 1-12 0V9ZM12 18v3" />
      </svg>
    );
  }
  if (name === "bolt") {
    return (
      <svg {...common}>
        <path d="m13 2-9 12h7l-1 8 9-12h-7l1-8Z" />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <path d="M12 3 5 6v5c0 4.5 3 8.2 7 10 4-1.8 7-5.5 7-10V6l-7-3Z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

export default function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="noise" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[920px] overflow-hidden">
        <div className="absolute inset-0 grid-noise" />
        <div className="glow-orb absolute left-1/2 top-[-18rem] h-[42rem] w-[64rem] -translate-x-1/2" />
        <div className="glow-blue absolute right-[-12rem] top-[-6rem] h-[36rem] w-[38rem]" />
      </div>

      <header className="relative z-40">
        <div className="mx-auto flex h-[76px] max-w-6xl items-center gap-6 px-5">
          <Link href="/" aria-label="TokenLedger home">
            <Logo />
          </Link>
          <nav className="ml-auto hidden items-center gap-8 text-[13px] text-muted md:flex">
            <a href="#features" className="transition-colors hover:text-fg">
              Features
            </a>
            <a href="#how" className="transition-colors hover:text-fg">
              How it works
            </a>
            <a href="#connect" className="transition-colors hover:text-fg">
              Connect
            </a>
          </nav>
          <div className="ml-auto flex items-center gap-2 md:ml-0">
            <Link href="/login" className="hidden px-2 text-[13px] text-muted hover:text-fg sm:block">
              Sign in
            </Link>
            <Link href="/start" className="btn btn-primary btn-sm">
              <span>Create your ledger</span>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M2.5 7h9M7.5 3l4 4-4 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
          </div>
        </div>
      </header>

      <main className="relative">
        <section className="mx-auto max-w-6xl px-5 pb-20 pt-12 sm:pt-20">
          <div className="hero-fade flex flex-col items-center text-center">
            <span className="pill">
              <span className="pill-dot" />
              <span>Open source · MCP-native · Self-hosted</span>
            </span>
            <h1 className="mt-8 max-w-5xl text-balance text-[44px] font-medium leading-[0.98] tracking-[-0.06em] sm:text-[72px] lg:text-[88px]">
              <span className="text-gradient">Every token. Every model.</span>
              <br />
              <span className="text-accent-gradient">One ledger.</span>
            </h1>
            <p className="mt-6 max-w-2xl text-balance text-[15px] leading-relaxed text-muted sm:text-[18px]">
              TokenLedger is a cinematic, self-hosted usage dashboard for your AI coding agents.
              Connect opencode, Claude Code, Cursor, or any MCP client and track tokens, models,
              projects, and spend in one place.
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
              <Link href="/start" className="btn btn-primary">
                <span>Create your ledger</span>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
              <a href="#how" className="btn btn-ghost">
                See how it connects
              </a>
            </div>
            <p className="mt-5 text-[12px] text-dim">
              No credit card · No email · Your data stays in your Postgres
            </p>
          </div>

          <div className="hero-fade-delay mt-16 sm:mt-20">
            <LandingPreview />
          </div>

          <div className="hero-rise-3 mt-10 flex flex-col items-center gap-3">
            <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-dim">
              Works with
            </span>
            <div className="flex flex-wrap justify-center gap-2">
              {clients.map((client) => (
                <span key={client} className="chip !px-2.5 !py-1 !text-[11px]">
                  {client}
                </span>
              ))}
            </div>
          </div>
        </section>

        <section id="features" className="border-t border-white/[0.04] py-20 sm:py-24">
          <div className="mx-auto max-w-6xl px-5">
            <div className="max-w-2xl">
              <span className="text-[10.5px] font-semibold uppercase tracking-[0.18em] text-lime">
                The ledger
              </span>
              <h2 className="mt-3 text-[30px] font-semibold leading-tight tracking-[-0.03em] sm:text-[40px]">
                Everything your agents spend,
                <br className="hidden sm:block" /> in one place.
              </h2>
              <p className="mt-4 text-[14.5px] leading-relaxed text-muted">
                Most tools tell you a total. TokenLedger tells you where it came from — down to the
                model, the project, and the cache hit.
              </p>
            </div>

            <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((feature) => (
                <div key={feature.title} className="card card-pad card-hover">
                  <div className="flex h-9 w-9 items-center justify-center rounded-[10px] border border-lime/20 bg-lime/[0.07] text-lime">
                    <Icon name={feature.icon} />
                  </div>
                  <h3 className="mt-4 text-[14.5px] font-semibold tracking-[-0.01em]">
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-[12.5px] leading-relaxed text-muted">{feature.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="how" className="border-t border-white/[0.04] py-20 sm:py-24">
          <div className="mx-auto grid max-w-6xl gap-10 px-5 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
            <div>
              <span className="text-[10.5px] font-semibold uppercase tracking-[0.18em] text-cyan">
                How it works
              </span>
              <h2 className="mt-3 text-[30px] font-semibold leading-tight tracking-[-0.03em] sm:text-[40px]">
                Connected in three minutes.
              </h2>
              <div className="mt-8 space-y-6">
                {[
                  {
                    n: "01",
                    title: "Create a ledger",
                    body: "Name it, get an API key. No account, no email. A private workspace is created instantly.",
                  },
                  {
                    n: "02",
                    title: "Connect your client",
                    body: "Add the remote MCP server to opencode, or install the plugin so completed messages report themselves.",
                  },
                  {
                    n: "03",
                    title: "Watch the ledger fill",
                    body: "Tokens, models, projects, and cost update as your agents work. Query any of it through MCP.",
                  },
                ].map((step) => (
                  <div key={step.n} className="flex gap-4">
                    <span className="mono mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-line2 bg-white/[0.02] text-[10px] text-lime">
                      {step.n}
                    </span>
                    <div>
                      <h3 className="text-[14px] font-semibold">{step.title}</h3>
                      <p className="mt-1.5 text-[12.5px] leading-relaxed text-muted">{step.body}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Link href="/start" className="btn btn-primary mt-8">
                Start your ledger →
              </Link>
            </div>

            <div className="space-y-3">
              <CodeBlock code={mcpConfig} language="opencode.json" />
              <CodeBlock code={pluginExample} language="terminal" />
            </div>
          </div>
        </section>

        <section id="connect" className="border-t border-white/[0.04] py-20 sm:py-24">
          <div className="mx-auto max-w-6xl px-5">
            <div className="max-w-2xl">
              <span className="text-[10.5px] font-semibold uppercase tracking-[0.18em] text-violet">
                Open protocol
              </span>
              <h2 className="mt-3 text-[30px] font-semibold leading-tight tracking-[-0.03em] sm:text-[40px]">
                Query spend from inside your agent.
              </h2>
              <p className="mt-4 text-[14.5px] leading-relaxed text-muted">
                TokenLedger speaks MCP over Streamable HTTP. Your agent can ask for a summary,
                a model breakdown, or the last few runs — and log usage for anything that is not
                reported automatically.
              </p>
            </div>

            <div className="mt-10 grid gap-3 lg:grid-cols-2">
              <div className="card p-5">
                <div className="flex items-center justify-between">
                  <h3 className="text-[13.5px] font-semibold">Available MCP tools</h3>
                  <span className="chip !text-[10px]">POST /api/mcp</span>
                </div>
                <div className="mt-4 grid gap-2 text-[12.5px]">
                  {[
                    ["get_usage_summary", "Totals, cost, and top models for a period."],
                    ["get_model_breakdown", "Tokens and cost grouped by model."],
                    ["get_daily_usage", "Chart-ready usage buckets over time."],
                    ["get_project_breakdown", "Which repos are expensive."],
                    ["list_recent_usage", "The latest recorded runs."],
                    ["log_usage", "Record a run that was not auto-reported."],
                  ].map(([name, body]) => (
                    <div
                      key={name}
                      className="flex flex-col gap-0.5 rounded-lg border border-line bg-white/[0.015] px-3 py-2 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <code className="mono text-[11.5px] text-lime">{name}</code>
                      <span className="text-[11.5px] text-muted">{body}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="card p-5">
                <div className="flex items-center justify-between">
                  <h3 className="text-[13.5px] font-semibold">Plain HTTP ingest</h3>
                  <span className="chip !text-[10px]">POST /api/ingest</span>
                </div>
                <p className="mt-2 text-[12.5px] leading-relaxed text-muted">
                  Any script or client can report usage with a bearer key. Batch up to 500 events
                  per request; repeated message IDs are upserted, never double-counted.
                </p>
                <div className="mt-4">
                  <CodeBlock code={curlExample} language="bash" />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="pb-24 pt-4">
          <div className="mx-auto max-w-6xl px-5">
            <div className="card relative overflow-hidden px-6 py-14 text-center sm:px-12">
              <div className="glow-lime absolute left-1/2 top-0 h-64 w-[34rem] -translate-x-1/2" />
              <div className="relative">
                <h2 className="text-[30px] font-semibold tracking-[-0.035em] sm:text-[42px]">
                  Start with a clean ledger.
                </h2>
                <p className="mx-auto mt-3 max-w-xl text-[14px] leading-relaxed text-muted">
                  Deploy it yourself, create a workspace in the browser, and connect your first
                  client in minutes. Free and open source.
                </p>
                <div className="mt-7 flex flex-wrap justify-center gap-3">
                  <Link href="/start" className="btn btn-primary !h-11 !px-5">
                    Create your ledger →
                  </Link>
                  <Link href="/login" className="btn btn-ghost !h-11 !px-5">
                    Sign in with a key
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/[0.04]">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-5 py-8 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Logo />
            <span className="text-[11px] text-dim">Self-hosted AI usage ledger</span>
          </div>
          <div className="flex items-center gap-5 text-[12px] text-muted">
            <a href="#features" className="hover:text-fg">
              Features
            </a>
            <a href="#connect" className="hover:text-fg">
              MCP
            </a>
            <Link href="/login" className="hover:text-fg">
              Sign in
            </Link>
            <Link href="/start" className="hover:text-fg">
              Get started
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
