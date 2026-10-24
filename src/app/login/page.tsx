import Link from "next/link";
import { LoginForm } from "@/components/login-form";
import { Logo } from "@/components/logo";

export default function LoginPage() {
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden">
      <div className="pointer-events-none absolute inset-0 grid-bg" />
      <div className="glow-lime pointer-events-none absolute left-1/2 top-[-14rem] h-[30rem] w-[40rem] -translate-x-1/2" />

      <header className="relative z-10 border-b border-line">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-5">
          <Link href="/" aria-label="TokenLedger home">
            <Logo />
          </Link>
          <Link href="/start" className="btn btn-ghost btn-sm">
            Create a ledger
          </Link>
        </div>
      </header>

      <main className="relative z-10 flex flex-1 items-center justify-center px-5 pb-20">
        <div className="w-full max-w-[380px]">
          <div className="card card-pad">
            <h1 className="text-[22px] font-semibold tracking-[-0.02em]">Sign in</h1>
            <p className="mt-1 text-[12px] leading-relaxed text-muted">
              Paste your API key to access the dashboard.
            </p>
            <div className="mt-5">
              <LoginForm />
            </div>
          </div>
          <p className="mt-4 text-center text-[12px] text-dim">
            No key yet?{" "}
            <Link href="/start" className="text-fg hover:underline">
              Create a ledger
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
