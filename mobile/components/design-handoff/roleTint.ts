import type { StakeholderRole } from "@emappa/shared";
import { officialPalette } from "@emappa/ui";

export const ROLE_TINT: Record<
  StakeholderRole,
  { fg: string; bg: string; label: string }
> = {
  resident: { fg: officialPalette.foxOrange, bg: "#FFF4E8", label: "Resident" },
  homeowner: { fg: officialPalette.deepWood, bg: "#FBEFDF", label: "Homeowner" },
  building_owner: { fg: officialPalette.deepWood, bg: "#FBEFDF", label: "Building owner" },
  provider: { fg: officialPalette.studioCocoa, bg: "#F8EDDD", label: "Provider" },
  financier: { fg: officialPalette.burntChestnut, bg: "#FAEDDC", label: "Financier" },
  electrician: { fg: officialPalette.warmUmbar, bg: "#F7EFE0", label: "Electrician" },
  admin: { fg: officialPalette.nearBlackBrown, bg: "#F3EDE6", label: "Cockpit" },
};
