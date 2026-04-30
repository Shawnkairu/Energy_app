import type { OwnershipPayout, OwnershipPosition } from "./types";

const round = (value: number) => Number(value.toFixed(2));

export function calculateOwnershipPayouts(
  pool: number,
  positions: OwnershipPosition[],
): OwnershipPayout[] {
  const totalOwnership = positions.reduce((sum, position) => sum + position.percentage, 0);

  if (Math.abs(totalOwnership - 1) > 0.0001) {
    throw new Error(`Ownership ledger must total 100%. Received ${round(totalOwnership * 100)}%.`);
  }

  return positions.map((position) => ({
    ...position,
    payout: round(pool * position.percentage),
  }));
}

export function transferOwnership(
  positions: OwnershipPosition[],
  sellerId: string,
  buyer: OwnershipPosition,
): OwnershipPosition[] {
  return positions
    .map((position) => {
      if (position.ownerId !== sellerId) return position;
      if (position.percentage < buyer.percentage) {
        throw new Error("Cannot sell more ownership than the seller holds.");
      }
      return { ...position, percentage: round(position.percentage - buyer.percentage) };
    })
    .concat(buyer)
    .filter((position) => position.percentage > 0);
}
