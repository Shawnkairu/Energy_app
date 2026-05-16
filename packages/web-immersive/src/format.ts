export function kes(value: number | undefined | null): string {
  return value == null ? "—" : `KSh ${Math.round(value).toLocaleString()}`;
}

export function kwh(value: number | undefined | null): string {
  return value == null ? "—" : `${Number(value.toFixed(1)).toLocaleString()} kWh`;
}

export function pct(value: number | undefined | null): string {
  return value == null ? "—" : `${Math.round(value * 100)}%`;
}
