import type { PublicRole } from "./types";

export type GenerationVisibility =
  | { visible: true; reason: "share_ownership" | "site_authority" | "capital_exposure" }
  | { visible: false; reason: "no_share_ownership" | "no_capital_exposure" };

export function generationVisibilityForRole(
  role: PublicRole,
  input: { shareOwnershipPct?: number; capitalExposureKes?: number } = {},
): GenerationVisibility {
  const shareOwnershipPct = input.shareOwnershipPct ?? 0;
  const capitalExposureKes = input.capitalExposureKes ?? 0;

  if (role === "building_owner" || role === "homeowner") {
    return { visible: true, reason: "site_authority" };
  }

  if (role === "financier") {
    return capitalExposureKes > 0
      ? { visible: true, reason: "capital_exposure" }
      : { visible: false, reason: "no_capital_exposure" };
  }

  if (role === "resident" || role === "provider") {
    return shareOwnershipPct > 0
      ? { visible: true, reason: "share_ownership" }
      : { visible: false, reason: "no_share_ownership" };
  }

  return { visible: false, reason: "no_share_ownership" };
}
