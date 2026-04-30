import { auditAllDemoProjects } from "./consistency";
import { calculateDrs } from "./drs";
import { calculateEnergy, calculateSavings } from "./energy";
import { calculateOwnershipPayouts, transferOwnership } from "./ownership";
import { calculatePayback } from "./payback";
import { projectBuilding } from "./projector";
import { calculateSettlement, validateSettlementRates } from "./settlement";
import { demoProjects } from "./mockData";

function assert(condition: boolean, message: string) {
  if (!condition) throw new Error(message);
}

function assertClose(actual: number, expected: number, message: string, tolerance = 0.01) {
  assert(Math.abs(actual - expected) <= tolerance, `${message}. Expected ${expected}, received ${actual}.`);
}

function assertThrows(run: () => unknown, message: string) {
  let threw = false;
  try {
    run();
  } catch {
    threw = true;
  }
  assert(threw, message);
}

function runSharedDomainTests() {
  const energy = calculateEnergy({
    arrayKw: 10,
    peakSunHours: 5,
    systemEfficiency: 0.8,
    batteryKwh: 8,
    batteryDepthOfDischarge: 0.75,
    batteryRoundTripEfficiency: 0.9,
    monthlyDemandKwh: 900,
    daytimeDemandFraction: 0.4,
  });

  assertClose(energy.E_gen, 1200, "Monthly generation should follow array, sun, and efficiency inputs");
  assertClose(energy.E_sold, 522, "Sold energy should include direct solar and usable battery discharge");
  assertClose(energy.E_waste, 660, "Waste should only include generated energy that is neither direct nor charged");
  assertClose(energy.E_grid, 378, "Grid fallback should cover unmet monthly demand");
  assertClose(calculateSavings(100, 28, 20), 800, "Savings should compare grid and solar price");

  const settlement = calculateSettlement(100, 20, {
    reserve: 0.05,
    providers: 0.3,
    financiers: 0.45,
    owner: 0.06,
    emappa: 0.14,
  });

  assertClose(settlement.revenue, 2000, "Settlement revenue should be sold kWh multiplied by price");
  assertClose(settlement.providerPool, 600, "Provider pool should follow configured rate");
  assertClose(settlement.unallocated, 0, "Balanced settlement rates should leave no unallocated revenue");
  assert(validateSettlementRates({ reserve: 0.05, providers: 0.3, financiers: 0.45, owner: 0.06, emappa: 0.14 }).isBalanced, "Demo settlement rates should balance");

  const payouts = calculateOwnershipPayouts(1000, [
    { ownerId: "provider", ownerRole: "provider", percentage: 0.7 },
    { ownerId: "resident", ownerRole: "resident", percentage: 0.3 },
  ]);
  assertClose(payouts[0].payout, 700, "Ownership payout should follow ownership percentage");
  assertThrows(
    () => calculateOwnershipPayouts(1000, [{ ownerId: "provider", ownerRole: "provider", percentage: 0.9 }]),
    "Ownership payout calculation should reject ledgers that do not total 100%",
  );

  const transferred = transferOwnership(
    [{ ownerId: "provider", ownerRole: "provider", percentage: 1 }],
    "provider",
    { ownerId: "resident", ownerRole: "resident", percentage: 0.25 },
  );
  assertClose(transferred[0].percentage, 0.75, "Seller ownership should decrease after transfer");
  assertClose(transferred[1].percentage, 0.25, "Buyer ownership should be added after transfer");

  const approvedDrs = calculateDrs({
    demandCoverage: 90,
    prepaidCommitment: 85,
    loadProfile: 80,
    installationReadiness: 82,
    installerReadiness: 88,
    capitalAlignment: 84,
    projectedUtilization: 0.78,
    hasPrepaidFunds: true,
    hasCertifiedLeadElectrician: true,
    meterInverterMatchResolved: true,
    ownerPermissionsComplete: true,
    hasVerifiedSupplierQuote: true,
    monitoringConnectivityResolved: true,
    settlementDataTrusted: true,
  });
  assert(approvedDrs.decision === "approve", "High score with no kill switches should approve");

  const blockedDrs = calculateDrs({ ...approvedDrs.components, projectedUtilization: 0.59, hasPrepaidFunds: false, hasCertifiedLeadElectrician: true, meterInverterMatchResolved: true, ownerPermissionsComplete: true, hasVerifiedSupplierQuote: true, monitoringConnectivityResolved: true, settlementDataTrusted: true });
  assert(blockedDrs.decision === "block", "Kill switches should block deployment even when component scores are strong");

  const payback = calculatePayback({ investment: 12000, monthlyPayout: 1000 });
  assertClose(payback.yearsToPrincipal, 1, "Payback should convert principal months to years");

  const projected = projectBuilding(demoProjects[0]);
  assert(projected.roleViews.resident.averagePrepaidBalanceKes > 0, "Projected role views should expose resident prepaid balance");
  assert(projected.roleViews.financier.committedCapitalKes === demoProjects[0].fundedKes, "Financier view should expose committed capital");

  const audit = auditAllDemoProjects();
  assert(audit.ok, `Demo projects should pass shared consistency audit: ${audit.results.map((result) => result.issues.join("; ")).join(" | ")}`);
}

runSharedDomainTests();
console.log("Shared domain tests passed.");
