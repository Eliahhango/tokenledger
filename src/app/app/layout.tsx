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
      <div className="min-h-screen">
        <header className="sticky top-0 z-40 border-b border-line bg-black/80 backdrop-blur-xl">
          <div className="flex h-14 items-center gap-3 px-4 sm:px-6">
            <button
              type="button"
              aria-label="Toggle sidebar"
              className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-white/[0.04]"
              onClick={() => {
                const el = document.getElementById("app-sidebar");
                const main = document.getElementById("app-main");
                if (el && main) {
                  const hidden = el.dataset.hidden === "true";
                  el.dataset.hidden = hidden ? "false" : "true";
                  main.dataset.sidebar = hidden ? "open" : "closed";
                  try { localStorage.setItem("tl_sidebar", hidden ? "open" : "closed"); } catch {}
                }
              }}
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M3 5h12M3 9h12M3 13h12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
              </svg>
            </button>
            <Link href="/app" aria-label="Dashboard home" className="flex items-center gap-2">
              <Logo />
            </Link>
            <div className="ml-auto flex items-center gap-2">
              <div className="hidden items-center gap-2 rounded-lg border border-line bg-white/[0.01] px-2 py-1 sm:flex">
                <span className="flex h-6 w-6 items-center justify-center rounded-md bg-white/[0.06] text-[10px] font-medium text-fg">
                  {initials || "TL"}
                </span>
                <span className="max-w-[140px] truncate text-[12px] text-muted">{workspace.name}</span>
              </div>
              <SignOutButton />
            </div>
          </div>
        </header>
        <div className="flex">
          <aside
            id="app-sidebar"
            data-hidden="false"
            className="hidden h-[calc(100vh-56px)] w-[260px] shrink-0 flex-col border-r border-line bg-black/60 lg:flex data-[hidden=true]:hidden"
          >
            <nav className="flex-1 px-2 py-2">
              <AppNav />
            </nav>
            <div className="border-t border-line p-2">
              <Link href="/app/settings" className="flex items-center gap-2 rounded-md px-2 py-1.5 text-[13px] text-muted hover:bg-white/[0.02] hover:text-fg">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <circle cx="7" cy="7" r="2" stroke="currentColor" strokeWidth="1.2" />
                  <path d="M7 1.5v1.2M7 11.3v1.2M1.5 7h1.2M11.3 7h1.2M2.9 2.9l.85.85M10.25 10.25l.85.85M11.1 2.9l-.85.85M3.75 10.25l-.85.85" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                </svg>
                Integrations
              </Link>
            </div>
          </aside>
          <main id="app-main" data-sidebar="open" className="mx-auto w-full max-w-[1400px] flex-1 px-4 py-6 sm:px-6 sm:py-8 data-[sidebar=closed]:max-w-[1100px]">
            {children}
          </main>
        </div>
        <script
          dangerouslySetInnerHTML={{
            __html: `try{const s=localStorage.getItem('tl_sidebar');if(s==='closed'){const e=document.getElementById('app-sidebar');const m=document.getElementById('app-main');if(e&&m){e.dataset.hidden='true';m.dataset.sidebar='closed';}}}catch(e){}`,
          }}
        />
      </div>
    </div>
  );
}
