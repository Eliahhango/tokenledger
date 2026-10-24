import Link from "next/link";
import { redirect } from "next/navigation";
import { AppNav } from "@/components/app-nav";
import { Logo } from "@/components/logo";
import { SignOutButton } from "@/components/sign-out";
import { getCurrentWorkspace } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const workspace = await getCurrentWorkspace();
  if (!workspace) redirect("/login");

  const initials = workspace.name
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 border-b border-line bg-ink/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-[1400px] items-center gap-5 px-4 sm:px-6">
          <Link href="/app" aria-label="Dashboard home">
            <Logo />
          </Link>
          <span className="hidden h-4 w-px bg-line sm:block" />
          <AppNav />
          <div className="ml-auto flex items-center gap-2.5">
            <div className="hidden items-center gap-2 rounded-xl border border-line bg-white/[0.02] py-1 pl-1 pr-3 sm:flex">
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-lime/[0.12] text-[9.5px] font-semibold text-lime">
                {initials || "TL"}
              </span>
              <span className="max-w-[140px] truncate text-[12px] text-muted">{workspace.name}</span>
            </div>
            <SignOutButton />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1400px] px-4 py-7 sm:px-6 sm:py-9">{children}</main>
    </div>
  );
}
