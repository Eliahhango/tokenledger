import Link from "next/link";
import { UserLoginForm } from "@/components/user-login-form";
import { LoginForm } from "@/components/login-form";
import { Logo } from "@/components/logo";

export default function LoginPage() {
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden">
      <div className="pointer-events-none absolute inset-0 grid-bg" />
      <div className="pointer-events-none absolute left-1/2 top-[-14rem] h-[30rem] w-[40rem] -translate-x-1/2 bg-[radial-gradient(circle,rgba(255,255,255,0.04),transparent_70%)] blur-[140px]" />

      <header className="relative z-10 border-b border-line">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-5">
          <Link href="/" aria-label="TokenLedger home">
            <Logo />
          </Link>
          <Link href="/signup" className="btn btn-ghost btn-sm">
            Create account
          </Link>
        </div>
      </header>

      <main className="relative z-10 flex flex-1 items-center justify-center px-5 pb-20">
        <div className="w-full max-w-[380px] space-y-4">
          <div className="card card-pad">
            <h1 className="text-[22px] font-semibold tracking-[-0.02em]">Sign in</h1>
            <p className="mt-1 text-[12px] leading-relaxed text-muted">
              Sign in with your account or use an API key.
            </p>
            <div className="mt-5">
              <UserLoginForm />
            </div>
          </div>
          <div className="card card-pad">
            <h2 className="text-[14px] font-medium">Sign in with API key</h2>
            <p className="mt-1 text-[12px] text-muted">For direct key access or opencode setup.</p>
            <div className="mt-4">
              <LoginForm />
            </div>
          </div>
          <p className="text-center text-[12px] text-dim">
            Need an account?{" "}
            <Link href="/signup" className="text-fg hover:underline">
              Create one
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
