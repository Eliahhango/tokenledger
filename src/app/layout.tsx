import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TokenLedger — every token, every model, one ledger",
  description:
    "Self-hosted AI usage dashboard with a remote MCP endpoint. Track tokens, models, projects, and spend across opencode and any MCP client.",
  openGraph: {
    title: "TokenLedger — every token, every model, one ledger",
    description:
      "Self-hosted AI usage dashboard with a remote MCP endpoint. Connect opencode, Claude Code, Cursor, or any MCP client.",
    type: "website",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
