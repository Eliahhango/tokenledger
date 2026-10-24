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

      <header className="relative z-10 border-b border-line">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-5">
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

      <main className="relative mx-auto grid max-w-5xl gap-10 px-5 py-12 sm:py-16 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12">
        <div>
          <span className="pill">
            <span className="pill-dot" />
            New ledger
          </span>
          <h1 className="mt-4 text-[32px] font-semibold leading-tight tracking-[-0.02em] sm:text-[40px]">
            Create your usage ledger
          </h1>
          <p className="mt-4 max-w-md text-[14px] leading-relaxed text-muted">
            One workspace, one key, zero setup. You will be able to connect a client before your
            coffee gets cold.
          </p>

          <div className="card card-pad mt-6">
            <CreateWorkspaceForm />
          </div>
        </div>

        <div className="lg:pt-12">
          <div className="card card-pad">
            <h2 className="text-[12px] font-medium text-fg">
              What you get
            </h2>
            <ul className="mt-3 space-y-2.5">
              {included.map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-[13px] text-muted">
                  <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-emerald/30 bg-emerald/[0.08]">
                    <svg width="8" height="8" viewBox="0 0 10 10" fill="none">
                      <path
                        d="m2 5.2 2 2L8 3"
                        stroke="currentColor"
                        className="text-emerald"
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
