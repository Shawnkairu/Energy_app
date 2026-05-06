import type { Role, PublicRole } from "./types";

// Canonical section registry. Matches docs/IA_SPEC.md §1–6 exactly.
// Mobile and website portals must render these sections in this order.

export type StakeholderSectionRole = Role;

export interface StakeholderSection {
  id: string;
  label: string;
  detail: string;
  mobileRoute?: string;
  webRoute?: string;
  webAnchor?: string;
  webOnly?: boolean;
}

export const stakeholderSections = {
  resident: [
    section("home", "Home", "Token balance and pledge CTA", "/(resident)/home", { webRoute: "/portal/resident/home" }),
    section("energy", "Energy", "Usage and (when shares > 0) generation", "/(resident)/energy", { webRoute: "/portal/resident/energy" }),
    section("wallet", "Wallet", "Pledged total, ownership earnings, savings", "/(resident)/wallet", { webRoute: "/portal/resident/wallet" }),
    section("profile", "Profile", "Account, settings, support, logout", "/(resident)/profile", { webRoute: "/portal/resident/profile" }),
  ],
  homeowner: [
    section("home", "Home", "Adaptive: project readiness pre-live, token balance post-live", "/(homeowner)/home", { webRoute: "/portal/homeowner/home" }),
    section("energy", "Energy", "Usage + always-on generation (homeowner owns the rooftop)", "/(homeowner)/energy", { webRoute: "/portal/homeowner/energy" }),
    section("wallet", "Wallet", "Pledges, royalties, share earnings (segmented)", "/(homeowner)/wallet", { webRoute: "/portal/homeowner/wallet" }),
    section("profile", "Profile", "Building/roof profile, account, settings, support, logout", "/(homeowner)/profile", { webRoute: "/portal/homeowner/profile" }),
  ],
  building_owner: [
    section("home", "Home", "Project status, DRS, blockers, deployment progress", "/(building-owner)/home", { webRoute: "/portal/building-owner/home" }),
    section("energy", "Energy", "Generation and usage on owned building", "/(building-owner)/energy", { webRoute: "/portal/building-owner/energy" }),
    section("wallet", "Wallet", "Royalty cashflow", "/(building-owner)/wallet", { webRoute: "/portal/building-owner/wallet" }),
    section("profile", "Profile", "Account, settings, support, logout", "/(building-owner)/profile", { webRoute: "/portal/building-owner/profile" }),
  ],
  provider: [
    section("discover", "Discover", "Airbnb-style project cards needing equipment", "/(provider)/discover", { webRoute: "/portal/provider/discover" }),
    section("inventory", "Inventory", "SKUs, orders, quote requests, reliability", "/(provider)/inventory", { webRoute: "/portal/provider/inventory" }),
    section("generation", "Generation", "Live performance of arrays where shares are retained", "/(provider)/generation", { webRoute: "/portal/provider/generation" }),
    section("wallet", "Wallet", "Equipment sales + share royalties", "/(provider)/wallet", { webRoute: "/portal/provider/wallet" }),
    section("profile", "Profile", "Business profile, settings, support, logout", "/(provider)/profile", { webRoute: "/portal/provider/profile" }),
  ],
  electrician: [
    section("discover", "Discover", "Projects needing electrician work", "/(electrician)/discover", { webRoute: "/portal/electrician/discover" }),
    section("jobs", "Jobs", "Active, completed, maintenance", "/(electrician)/jobs", { webRoute: "/portal/electrician/jobs" }),
    section("wallet", "Wallet", "Job earnings and payouts", "/(electrician)/wallet", { webRoute: "/portal/electrician/wallet" }),
    section("compliance", "Compliance", "Certifications and training", "/(electrician)/compliance", { webRoute: "/portal/electrician/compliance" }),
    section("profile", "Profile", "Account, settings, support, logout", "/(electrician)/profile", { webRoute: "/portal/electrician/profile" }),
  ],
  financier: [
    section("discover", "Discover", "Airbnb-style deal cards", "/(financier)/discover", { webRoute: "/portal/financier/discover" }),
    section("portfolio", "Portfolio", "Robinhood-style positions and compounding", "/(financier)/portfolio", { webRoute: "/portal/financier/portfolio" }),
    section("wallet", "Wallet", "Cash, deployed capital, returns", "/(financier)/wallet", { webRoute: "/portal/financier/wallet" }),
    section("profile", "Profile", "Investor profile, settings, support, logout", "/(financier)/profile", { webRoute: "/portal/financier/profile" }),
  ],
  // Admin lives primarily in cockpit. Mobile admin is a thin read-only surface.
  // Per docs/IA_SPEC.md §8.5, admin is never publicly selectable.
  admin: [
    section("alerts", "Alerts", "Operational alerts feed", "/(admin)/alerts"),
    section("projects", "Projects", "Read-only portfolio scan", "/(admin)/projects"),
    section("profile", "Profile", "Account, settings, support, logout", "/(admin)/profile"),
  ],
} as const satisfies Record<StakeholderSectionRole, readonly StakeholderSection[]>;

// Public roles only — admin excluded by design (see IA_SPEC §8.5).
export const stakeholderPortalRoles = [
  "resident",
  "homeowner",
  "building_owner",
  "provider",
  "financier",
  "electrician",
] as const satisfies readonly PublicRole[];

export type StakeholderPortalRole = (typeof stakeholderPortalRoles)[number];

export function getStakeholderSections(role: StakeholderSectionRole): readonly StakeholderSection[] {
  return stakeholderSections[role];
}

export function getMobileSections(role: StakeholderSectionRole): readonly StakeholderSection[] {
  return stakeholderSections[role].filter((item) => item.mobileRoute && !item.webOnly);
}

export function getWebSections(role: StakeholderPortalRole): readonly StakeholderSection[] {
  return stakeholderSections[role].filter((item) => item.webRoute || item.webAnchor);
}

export interface StakeholderSectionAuditResult {
  ok: boolean;
  issues: string[];
}

export function auditStakeholderSectionParity(): StakeholderSectionAuditResult {
  const issues: string[] = [];

  for (const [role, sections] of Object.entries(stakeholderSections) as [StakeholderSectionRole, readonly StakeholderSection[]][]) {
    const ids = new Set<string>();

    if (role !== "admin" && sections.length > 5) {
      issues.push(`${role}: ${sections.length} tabs exceeds the 5-tab cap from IA_SPEC §1`);
    }

    for (const item of sections) {
      if (ids.has(item.id)) {
        issues.push(`${role}: duplicate section id "${item.id}"`);
      }
      ids.add(item.id);
    }

    if (role === "admin") {
      continue;
    }

    for (const item of sections) {
      if (!item.mobileRoute || item.webOnly) {
        continue;
      }

      if (!item.webRoute && !item.webAnchor) {
        issues.push(`${role}: mobile section "${item.id}" has no web route or anchor`);
      }
    }
  }

  return { ok: issues.length === 0, issues };
}

function section(
  id: string,
  label: string,
  detail: string,
  mobileRoute: string | undefined,
  options: Pick<StakeholderSection, "webRoute" | "webAnchor" | "webOnly"> = {},
): StakeholderSection {
  return {
    id,
    label,
    detail,
    mobileRoute,
    webRoute: options.webRoute,
    webAnchor: options.webAnchor ?? id,
    webOnly: options.webOnly,
  };
}
