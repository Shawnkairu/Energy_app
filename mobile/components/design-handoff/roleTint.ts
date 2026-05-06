import type { StakeholderRole } from "@emappa/shared";
import { officialPalette } from "@emappa/ui";

export const ROLE_TINT: Record<
  StakeholderRole,
  { fg: string; bg: string; label: string }
> = {
  resident: { fg: officialPalette.foxOrange, bg: "#FFF4E8", label: "Resident" },
  owner: { fg: officialPalette.deepWood, bg: "#FBEFDF", label: "Owner" },
  provider: { fg: officialPalette.studioCocoa, bg: "#F8EDDD", label: "Provider" },
  financier: { fg: officialPalette.burntChestnut, bg: "#FAEDDC", label: "Financier" },
  installer: { fg: officialPalette.warmUmbar, bg: "#F7EFE0", label: "Installer" },
  supplier: { fg: officialPalette.toastedClay, bg: "#F5EEDF", label: "Supplier" },
  admin: { fg: officialPalette.nearBlackBrown, bg: "#F3EDE6", label: "Cockpit" },
};
