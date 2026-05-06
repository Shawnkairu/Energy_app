import type { StakeholderRole } from "./types";

export type StakeholderSectionRole = StakeholderRole;

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
    section("home", "Home", "Balance, coverage, and savings", "/(resident)/home"),
    section("wallet", "Wallet", "Prepaid solar balance and top-ups", "/(resident)/wallet"),
    section("usage", "Usage", "Solar, battery, and grid fallback", "/(resident)/usage"),
    section("ownership", "Ownership", "Optional share upside", "/(resident)/ownership"),
    section("profile", "Profile", "Building membership and trust", "/(resident)/profile"),
    section("support", "Support", "Help, tickets, and service status", "/(resident)/support"),
  ],
  owner: [
    section("home", "Home", "DRS, royalty, and prepaid demand", "/(owner)/home"),
    section("drs", "DRS", "Readiness score and blockers", "/(owner)/drs"),
    section("deployment", "Deployment", "Readiness gates and obligations", "/(owner)/deployment"),
    section("earnings", "Earnings", "Host royalty and benchmarks", "/(owner)/earnings"),
  ],
  provider: [
    section("home", "Home", "Payout, output, and ownership", "/(provider)/home"),
    section("assets", "Assets", "Generated versus monetized kWh", "/(provider)/assets"),
    section("performance", "Performance", "Utilization, waste, and grid fallback", "/(provider)/performance"),
    section("shares", "Shares", "Ownership ledger and retained yield", "/(provider)/shares"),
    section("earnings", "Earnings", "Monetized-kWh payout tracking", "/(provider)/earnings"),
    section("maintenance", "Maintenance", "Support, warranty, and monitoring status", "/(provider)/maintenance"),
    section("deployment", "Deployment", "DRS gates and installation coordination", "/(provider)/deployment"),
  ],
  financier: [
    section("home", "Home", "Capital, recovery, and risk", "/(financier)/home"),
    section("deals", "Deals", "Named building pipeline", "/(financier)/deals"),
    section("deal-detail", "Deal Detail", "DRS, milestones, and diligence", "/(financier)/deal-detail"),
    section("portfolio", "Portfolio", "Recovery curve and exposure", "/(financier)/portfolio"),
  ],
  installer: [
    section("home", "Home", "Checklist and readiness", "/(installer)/home"),
    section("certification", "Certification", "Lead electrician eligibility", "/(installer)/certification"),
    section("checklist", "Checklist", "Proof before go-live", "/(installer)/checklist"),
    section("job-detail", "Job Detail", "Photos, readings, and connectivity", "/(installer)/job-detail"),
    section("maintenance", "Maintenance", "Post-live service tickets", "/(installer)/maintenance"),
  ],
  supplier: [
    section("home", "Home", "RFQs, BOM, and lead times", "/(supplier)/home"),
    section("catalog", "Catalog", "Available components and warranty docs", "/(supplier)/catalog"),
    section("quote-requests", "Quote Requests", "Award and dispatch status", "/(supplier)/quote-requests"),
    section("orders", "Orders", "Delivery proof and warranty flow", "/(supplier)/orders"),
    section("reliability", "Reliability", "Fulfillment history and lead-time trust", "/(supplier)/reliability"),
  ],
  admin: [
    section("home", "Home", "Internal command center", "/(admin)/home"),
    section("projects", "Projects", "Pipeline and DRS distribution", "/(admin)/projects"),
    section("alerts", "Alerts", "Settlement integrity and governance", "/(admin)/alerts"),
  ],
} as const satisfies Record<StakeholderSectionRole, readonly StakeholderSection[]>;

export const stakeholderPortalRoles = [
  "resident",
  "owner",
  "provider",
  "financier",
  "installer",
  "supplier",
] as const satisfies readonly StakeholderRole[];

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
