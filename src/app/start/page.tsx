import Link from "next/link";
import { CreateWorkspaceForm } from "@/components/create-form";
import { Logo } from "@/components/logo";

const included = [
  "A private usage ledger",
  "A bearer API key shown once",
  "A remote MCP endpoint for your agent",
  "A dashboard with tokens, models, and cost",
  "Automatic reporting for opencode",
];

export default function StartPage() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[600px] overflow-hidden">
        <div className="absolute inset-0 grid-bg" />
        <div className="glow-lime absolute left-1/2 top-[-18rem] h-[34rem] w-[46rem] -translate-x-1/2" />
      </div>

      <header className="relative z-10 border-b border-white/[0.04]">
        <div className="mx-auto flex h-[68px] max-w-5xl items-center justify-between px-5">
          <Link href="/" aria-label="TokenLedger home">
            <Logo />
          </Link>
          <div className="flex items-center gap-3 text-[13px]">
            <Link href="/login" className="text-muted hover:text-fg">
              Sign in
            </Link>
          </div>
        </div>
      </header>

      <main className="relative mx-auto grid max-w-5xl gap-10 px-5 py-14 sm:py-20 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
        <div className="hero-rise">
          <span className="pill">
            <span className="h-1.5 w-1.5 rounded-full bg-lime" />
            New ledger
          </span>
          <h1 className="mt-5 text-[36px] font-semibold leading-[1.02] tracking-[-0.04em] sm:text-[46px]">
            Create your
            <br />
            <span className="text-lime">usage ledger.</span>
          </h1>
          <p className="mt-4 max-w-md text-[14px] leading-relaxed text-muted">
            One workspace, one key, zero setup. You will be able to connect a client before your
            coffee gets cold.
          </p>

          <div className="card mt-8 p-5 sm:p-6">
            <CreateWorkspaceForm />
          </div>
        </div>

        <div className="hero-rise-2 lg:pt-16">
          <div className="card p-6">
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-dim">
              What you get
            </h2>
            <ul className="mt-4 space-y-3">
              {included.map((item) => (
                <li key={item} className="flex items-start gap-3 text-[13px] text-muted">
                  <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-lime/25 bg-lime/[0.08]">
                    <svg width="9" height="9" viewBox="0 0 10 10" fill="none">
                      <path
                        d="m2 5.2 2 2L8 3"
                        stroke="#b8f26a"
                        strokeWidth="1.4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-3 rounded-xl border border-line bg-white/[0.015] px-4 py-3.5">
            <p className="text-[11.5px] leading-relaxed text-dim">
              TokenLedger is self-hosted. The data you record lives in the Postgres database behind
              this deployment — not on someone else&apos;s analytics platform.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
