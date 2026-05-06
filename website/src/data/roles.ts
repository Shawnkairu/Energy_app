import type { RoleConfig } from "../types";

export const webRoles: RoleConfig[] = [
  {
    id: "resident",
    label: "Resident",
    shortLabel: "Resident",
    accessLabel: "I live in a building",
    promise: "Cheaper prepaid solar with grid fallback and optional ownership after trust.",
    unlockCopy: "See solar balance, usage, savings, fallback, and owned shares.",
  },
  {
    id: "owner",
    label: "Building Owner",
    shortLabel: "Owner",
    accessLabel: "I own or manage a building",
    promise: "Turn a building into a verified energy site without hiding deployment risk.",
    unlockCopy: "See DRS, resident readiness, deployment gates, and host royalty.",
  },
  {
    id: "provider",
    label: "Energy Provider",
    shortLabel: "Provider",
    accessLabel: "I provide panels",
    promise: "Deploy panels into qualified demand and track monetized-yield performance.",
    unlockCopy: "See generated vs monetized kWh, retained shares, and payout drift.",
  },
  {
    id: "financier",
    label: "Financier",
    shortLabel: "Financier",
    accessLabel: "I fund infrastructure",
    promise: "Fund named building deals with DRS, downside cases, and live recovery data.",
    unlockCopy: "See deal room, capital progress, recovery curve, and risk bands.",
  },
  {
    id: "installer",
    label: "Electrician",
    shortLabel: "Electrician",
    accessLabel: "I install systems",
    promise: "Certified deployment workflows with proof, readings, and go-live verification.",
    unlockCopy: "See checklist gates, site proof, install quality, and maintenance work.",
  },
  {
    id: "supplier",
    label: "Supplier",
    shortLabel: "Supplier",
    accessLabel: "I supply hardware",
    promise: "Standardized BOM requests, quote workflows, fulfillment proof, and reliability history.",
    unlockCopy: "See RFQs, orders, lead times, delivery proof, and warranty flows.",
  },
];

export function getRoleConfig(role: RoleConfig["id"]) {
  return webRoles.find((item) => item.id === role) ?? webRoles[0];
}
