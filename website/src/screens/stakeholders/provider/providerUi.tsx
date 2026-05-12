import type { CSSProperties, ReactNode } from "react";

const surface: CSSProperties = {
  display: "grid",
  gap: 10,
};

const railStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
  gap: 10,
  marginTop: 14,
};

const itemStyle: CSSProperties = {
  display: "grid",
  gap: 7,
  minHeight: 98,
  padding: "13px 14px",
  border: "1px solid rgba(164, 72, 45, 0.12)",
  borderRadius: 8,
  background: "rgba(255, 255, 255, 0.72)",
};

const labelStyle: CSSProperties = {
  color: "#a9482d",
  fontSize: "0.68rem",
  fontWeight: 950,
  letterSpacing: 0,
  textTransform: "uppercase",
};

const valueStyle: CSSProperties = {
  color: "#2f3338",
  fontSize: "1.35rem",
  fontWeight: 900,
  lineHeight: 1,
};

const detailStyle: CSSProperties = {
  color: "#6c5b54",
  fontSize: "0.78rem",
  lineHeight: 1.35,
};

const calloutStyle: CSSProperties = {
  display: "grid",
  gap: 8,
  marginTop: 14,
  padding: "14px 16px",
  border: "1px solid rgba(24, 94, 82, 0.16)",
  borderRadius: 8,
  background: "linear-gradient(135deg, rgba(235, 249, 245, 0.9), rgba(255, 250, 247, 0.92))",
};

export function ProviderMetricRail({
  items,
}: {
  items: Array<{ label: string; value: string; detail: string }>;
}) {
  return (
    <div style={railStyle}>
      {items.map((item) => (
        <div key={item.label} style={itemStyle}>
          <span style={labelStyle}>{item.label}</span>
          <strong style={valueStyle}>{item.value}</strong>
          <small style={detailStyle}>{item.detail}</small>
        </div>
      ))}
    </div>
  );
}

export function ProviderCallout({
  label,
  title,
  children,
}: {
  label: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <div style={calloutStyle}>
      <span style={labelStyle}>{label}</span>
      <strong style={{ ...valueStyle, fontSize: "1rem", lineHeight: 1.25 }}>{title}</strong>
      <div style={{ ...surface, color: "#4d4946", fontSize: "0.86rem", lineHeight: 1.45 }}>{children}</div>
    </div>
  );
}
