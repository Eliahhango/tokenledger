import Link from "next/link";
import { LoginForm } from "@/components/login-form";
import { Logo } from "@/components/logo";

export default function LoginPage() {
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden">
      <div className="pointer-events-none absolute inset-0 grid-bg" />
      <div className="glow-lime pointer-events-none absolute left-1/2 top-[-14rem] h-[30rem] w-[40rem] -translate-x-1/2" />

      <header className="relative z-10">
        <div className="mx-auto flex h-[68px] max-w-5xl items-center justify-between px-5">
          <Link href="/" aria-label="TokenLedger home">
            <Logo />
          </Link>
          <Link href="/start" className="btn btn-ghost btn-sm">
            Create a ledger
          </Link>
        </div>
      </header>

      <main className="relative z-10 flex flex-1 items-center justify-center px-5 pb-20">
        <div className="w-full max-w-[400px]">
          <div className="card p-6 sm:p-7">
            <h1 className="text-[24px] font-semibold tracking-[-0.03em]">Sign in to your ledger</h1>
            <p className="mt-1.5 text-[12.5px] leading-relaxed text-muted">
              Paste the API key you received when you created the workspace.
            </p>
            <div className="mt-6">
              <LoginForm />
            </div>
          </div>
          <p className="mt-4 text-center text-[12px] text-dim">
            No key yet?{" "}
            <Link href="/start" className="text-lime hover:underline">
              Create a ledger
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
