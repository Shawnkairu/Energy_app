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
    id: "homeowner",
    label: "Homeowner",
    shortLabel: "Homeowner",
    accessLabel: "I own and live in my home",
    promise: "Track your home solar project, then manage tokens, energy, and savings — no host royalty on your own roof.",
    unlockCopy: "See adaptive project/token home, energy, segmented wallet, and roof profile.",
  },
  {
    id: "building_owner",
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
    id: "electrician",
    label: "Electrician",
    shortLabel: "Electrician",
    accessLabel: "I install systems",
    promise: "Certified deployment workflows with proof, readings, and go-live verification.",
    unlockCopy: "See checklist gates, site proof, install quality, and maintenance work.",
  },
];

export function getRoleConfig(role: RoleConfig["id"]) {
  return webRoles.find((item) => item.id === role) ?? webRoles[0];
}
