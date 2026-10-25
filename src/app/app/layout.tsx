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
      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[260px_1fr]">
        <aside className="hidden flex-col border-r border-line bg-black/60 lg:flex">
          <div className="flex h-14 items-center px-5">
            <Link href="/app" aria-label="Dashboard home">
              <Logo />
            </Link>
          </div>
          <nav className="flex-1 px-3 py-2">
            <AppNav />
          </nav>
          <div className="border-t border-line p-3">
            <div className="flex items-center gap-2 rounded-lg px-2 py-1.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-md bg-white/[0.06] text-[10px] font-medium text-fg">
                {initials || "TL"}
              </span>
              <div className="min-w-0 flex-1">
                <div className="truncate text-[12px] text-fg">{workspace.name}</div>
                <div className="text-[10px] text-dim">{workspace.key_prefix}…</div>
              </div>
              <SignOutButton />
            </div>
          </div>
        </aside>
        <div className="flex flex-col">
          <header className="sticky top-0 z-40 border-b border-line bg-black/80 backdrop-blur-xl lg:hidden">
            <div className="mx-auto flex h-14 items-center gap-3 px-4">
              <Link href="/app" aria-label="Dashboard home">
                <Logo />
              </Link>
              <div className="ml-auto flex items-center gap-2">
                <AppNav />
                <SignOutButton />
              </div>
            </div>
          </header>
          <main className="mx-auto w-full max-w-[1400px] flex-1 px-4 py-6 sm:px-6 sm:py-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
