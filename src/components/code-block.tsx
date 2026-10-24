import { CopyButton } from "./copy-button";

export function CodeBlock({
  code,
  language = "bash",
  copy = true,
  className = "",
}: {
  code: string;
  language?: string;
  copy?: boolean;
  className?: string;
}) {
  return (
    <div className={`code ${className}`}>
      <div className="code-head">
        <span className="mono text-[10px] uppercase tracking-[0.16em] text-dim">{language}</span>
        {copy && <CopyButton value={code} className="btn btn-ghost btn-sm !h-7 !px-2.5 text-[11px]" />}
      </div>
      <pre>
        <code>{code}</code>
      </pre>
    </div>
  );
}
