export function GateList({ gates }: { gates: Array<{ label: string; complete: boolean }> }) {
  return (
    <div className="gate-stack">
      {gates.map((gate) => (
        <div className="gate-row" key={gate.label}>
          <span>{gate.label}</span>
          <strong className={gate.complete ? "ready" : "blocked"}>{gate.complete ? "Ready" : "Blocked"}</strong>
        </div>
      ))}
    </div>
  );
}
