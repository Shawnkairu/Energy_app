export type SyntheticMode = "show" | "hide" | "mixed";

export function SyntheticBadge({ source = "synthetic", mode = "mixed" }: { source?: string; mode?: SyntheticMode }) {
  if (mode === "hide" || source === "measured") return null;

  const label = source === "mixed" || mode === "mixed" ? "Mixed source" : "Synthetic";

  return (
    <span className={`synthetic-badge ${source === "mixed" ? "mixed" : ""}`}>
      {label}
    </span>
  );
}
