/** Synthetic 24h shaped curve summing to `dayTotalKwh` (for immersive hero without live hourly API). */
export function immersiveHourlyFromDayTotal(dayTotalKwh: number, peakHour = 13): number[] {
  if (dayTotalKwh <= 0) return Array(24).fill(0);
  const weights = Array.from({ length: 24 }, (_, h) => {
    const d = Math.abs(h - peakHour);
    return Math.max(0.08, Math.exp(-(d * d) / 26));
  });
  const sum = weights.reduce((a, b) => a + b, 0);
  return weights.map((w) => (w / sum) * dayTotalKwh);
}
