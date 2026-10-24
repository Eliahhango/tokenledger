"use client";

import { useState } from "react";

export function CopyButton({
  value,
  label = "Copy",
  className = "btn btn-ghost btn-sm",
}: {
  value: string;
  label?: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  }

  return (
    <button type="button" onClick={copy} className={className} aria-label={label}>
      {copied ? "Copied" : label}
    </button>
  );
}
