export function Logo({ markOnly = false }: { markOnly?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <span className="logo-mark" aria-hidden="true">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <rect x="2" y="9" width="2.6" height="5" rx="1" fill="#ffffff" opacity="0.4" />
          <rect x="6.7" y="6" width="2.6" height="8" rx="1" fill="#ffffff" opacity="0.7" />
          <rect x="11.4" y="2.5" width="2.6" height="11.5" rx="1" fill="#ffffff" />
        </svg>
      </span>
      {!markOnly && (
        <span className="text-[15px] font-medium tracking-[-0.02em] text-fg">
          Token<span className="text-white">Ledger</span>
        </span>
      )}
    </span>
  );
}
