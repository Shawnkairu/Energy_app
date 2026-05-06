import type { ReactNode } from "react";

export function PortalKpiBar({
  items,
}: {
  items: Array<{ label: string; value: string; detail?: string }>;
}) {
  return (
    <section className="portal-kpi-bar" aria-label="Key metrics">
      {items.map((item) => (
        <article key={item.label}>
          <span>{item.label}</span>
          <strong>{item.value}</strong>
          {item.detail ? <small>{item.detail}</small> : null}
        </article>
      ))}
    </section>
  );
}

export function PortalPanel({
  id,
  eyebrow,
  title,
  children,
  className = "",
}: {
  id?: string;
  eyebrow?: string;
  title?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section id={id} className={`portal-panel ${className}`}>
      {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
      {title ? <h2>{title}</h2> : null}
      {children}
    </section>
  );
}

export function PortalLedger({
  title,
  rows,
}: {
  title?: string;
  rows: Array<{ label: string; value: string; note?: string; status?: string }>;
}) {
  return (
    <div className="portal-ledger">
      {title ? <div className="portal-ledger-title">{title}</div> : null}
      {rows.map((row) => (
        <div className="portal-ledger-row" key={row.label}>
          <span>{row.label}</span>
          <strong>{row.value}</strong>
          <small>{row.status ?? row.note}</small>
        </div>
      ))}
    </div>
  );
}

export function PortalWorkflow({
  steps,
}: {
  steps: Array<{ label: string; detail: string; status?: string }>;
}) {
  return (
    <section className="portal-workflow" aria-label="Workflow">
      {steps.map((step, index) => (
        <article key={step.label}>
          <em>{String(index + 1).padStart(2, "0")}</em>
          <span>{step.label}</span>
          <strong>{step.detail}</strong>
          {step.status ? <small>{step.status}</small> : null}
        </article>
      ))}
    </section>
  );
}

export function PortalTable({
  columns,
  rows,
}: {
  columns: string[];
  rows: string[][];
}) {
  return (
    <div className="portal-table" role="table">
      <div className="portal-table-row header" role="row">
        {columns.map((column) => <span key={column} role="columnheader">{column}</span>)}
      </div>
      {rows.map((row) => (
        <div className="portal-table-row" role="row" key={row.join("|")}>
          {row.map((cell, index) => (
            <span key={`${cell}-${index}`} role="cell">{cell}</span>
          ))}
        </div>
      ))}
    </div>
  );
}
