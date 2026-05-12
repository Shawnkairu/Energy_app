export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`brand-lockup ${compact ? "brand-lockup-compact" : ""}`} aria-label="e.mappa">
      <span className="brand-mark" aria-hidden="true">e</span>
      <span className="brand-wordmark">e.mappa</span>
    </div>
  );
}
