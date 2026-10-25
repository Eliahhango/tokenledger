import Link from "next/link";
import { SignupForm } from "@/components/signup-form";
import { Logo } from "@/components/logo";

export default function SignupPage() {
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden">
      <div className="pointer-events-none absolute inset-0 grid-bg" />
      <div className="pointer-events-none absolute left-1/2 top-[-14rem] h-[30rem] w-[40rem] -translate-x-1/2 bg-[radial-gradient(circle,rgba(255,255,255,0.04),transparent_70%)] blur-[140px]" />

      <header className="relative z-10 border-b border-line">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-5">
          <Link href="/" aria-label="TokenLedger home">
            <Logo />
          </Link>
          <Link href="/login" className="text-[13px] text-muted hover:text-fg">
            Sign in
          </Link>
        </div>
      </header>

      <main className="relative z-10 flex flex-1 items-center justify-center px-5 pb-20">
        <div className="w-full max-w-[380px]">
          <div className="card card-pad">
            <h1 className="text-[22px] font-semibold tracking-[-0.02em]">Create account</h1>
            <p className="mt-1 text-[12px] leading-relaxed text-muted">
              Track opencode and API usage in one ledger.
            </p>
            <div className="mt-5">
              <SignupForm />
            </div>
          </div>
          <p className="mt-4 text-center text-[12px] text-dim">
            Already have an account?{" "}
            <Link href="/login" className="text-fg hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
