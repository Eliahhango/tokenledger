"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/app", label: "Overview", icon: "home" },
  { href: "/app/settings", label: "Integrations", icon: "plug" },
];

function Icon({ name }: { name: string }) {
  const common = { width: 16, height: 16, viewBox: "0 0 16 16", fill: "none", stroke: "currentColor", strokeWidth: "1.2", strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  if (name === "home") return <svg {...common}><path d="M2.5 6.5 8 2l5.5 4.5V13a.5.5 0 0 1-.5.5H3a.5.5 0 0 1-.5-.5V6.5Z" /><path d="M6 13.5V8h4v5.5" /></svg>;
  if (name === "plug") return <svg {...common}><path d="M6 2v4M10 2v4M4 6h8v2a4 4 0 0 1-8 0V6ZM8 12v2" /></svg>;
  return null;
}

export function AppNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1">
      {items.map((item) => {
        const active = item.href === "/app" ? pathname === "/app" : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-2 rounded-md px-2 py-1.5 text-[13px] transition-colors ${
              active ? "bg-white/[0.04] text-fg" : "text-muted hover:bg-white/[0.02] hover:text-fg"
            }`}
          >
            <span className="text-current">
              <Icon name={item.icon} />
            </span>
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
