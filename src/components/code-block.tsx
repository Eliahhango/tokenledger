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
        <span className="text-[11px] text-muted">{language}</span>
        {copy && <CopyButton value={code} className="btn btn-ghost btn-sm" />}
      </div>
      <pre>
        <code>{code}</code>
      </pre>
    </div>
  );
}
