import { EnergyFlow } from "../../../components/EnergyFlow";
import { PortalKpiBar, PortalLedger, PortalPanel, PortalWorkflow } from "../../../components/PortalPrimitives";
import { PrivacyNote } from "../../../components/PrivacyNote";
import { ProgressBar } from "../../../components/ProgressBar";
import type { StakeholderScreenProps } from "../../../types";

const kes = (value: number) => `KSh ${Math.round(value).toLocaleString()}`;
const kwh = (value: number) => `${Number(value.toFixed(1)).toLocaleString()} kWh`;
const pct = (value: number) => `${Math.round(value * 100)}%`;

export function ResidentDashboard({ project, activeSectionId = "home" }: StakeholderScreenProps) {
  const view = project.roleViews.resident;
  const householdGridKwh = project.energy.E_grid / project.project.units;
  const householdBatteryKwh = project.energy.E_battery_used / project.project.units;
  const expectedTopUp = Math.max(500, Math.round(view.savingsKes * 1.4));
  const fundedRatio = Math.min(1, view.prepaidBalanceKes / Math.max(1, view.averagePrepaidBalanceKes + expectedTopUp));
  const residentPayout = project.providerPayouts
    .filter((payout) => payout.ownerRole === "resident")
    .reduce((sum, payout) => sum + payout.payout, 0);

  if (activeSectionId === "wallet") {
    return (
      <div className="dashboard-stack">
        <PortalKpiBar
          items={[
            { label: "Available tokens", value: kes(view.prepaidBalanceKes), detail: "cash-cleared balance" },
            { label: "Suggested top-up", value: kes(expectedTopUp), detail: "demo checkout amount" },
            { label: "Funding posture", value: pct(fundedRatio), detail: "wallet runway" },
            { label: "Zero balance", value: "Grid fallback", detail: "no postpaid debt" },
          ]}
        />
        <PortalWorkflow
          steps={[
            { label: "Top up", detail: "Resident cash clears before any solar allocation is created.", status: "prepaid only" },
            { label: "Reserve", detail: "Tokens reserve local solar while supply and demand match.", status: "solar first" },
            { label: "Settle", detail: "Only consumed prepaid solar creates stakeholder payout.", status: "monetized kWh" },
            { label: "Fallback", detail: "If the wallet is empty, grid power stays separate from e.mappa debt.", status: "blocked solar" },
          ]}
        />
        <PortalPanel eyebrow="Token wallet" title="Prepaid solar balance and top-ups">
          <p>This screen follows the deployment doctrine: no prepaid cash means no solar allocation and no stakeholder payout.</p>
          <ProgressBar value={fundedRatio} label="Wallet funding posture" />
          <PortalLedger
            rows={[
              { label: "Available tokens", value: kes(view.prepaidBalanceKes), note: "ready for solar allocation" },
              { label: "Average funded balance", value: kes(view.averagePrepaidBalanceKes), note: "building-level resident context" },
              { label: "Suggested top-up", value: kes(expectedTopUp), note: "keeps allocation active" },
              { label: "Postpaid balance", value: "Not allowed", note: "product rule" },
            ]}
          />
        </PortalPanel>
        <PrivacyNote>Wallet screens expose this resident's balance only. Neighbor balances stay private.</PrivacyNote>
      </div>
    );
  }

  if (activeSectionId === "usage") {
    return (
      <div className="dashboard-stack">
        <PortalKpiBar
          items={[
            { label: "Solar allocation", value: kwh(view.monthlySolarKwh), detail: "prepaid local solar" },
            { label: "Solar coverage", value: pct(view.solarCoverage), detail: "current household mix" },
            { label: "Battery support", value: kwh(householdBatteryKwh), detail: "stored solar smoothing" },
            { label: "Grid fallback", value: kwh(householdGridKwh), detail: "separate from wallet" },
          ]}
        />
        <section className="portal-main-grid">
          <EnergyFlow project={project} />
          <PortalPanel eyebrow="Energy flow" title="Solar first. Battery second. Grid fallback third.">
            <PortalLedger
              rows={[
                { label: "Solar", value: kwh(view.monthlySolarKwh), note: "allocated only when prepaid" },
                { label: "Battery", value: kwh(householdBatteryKwh), note: "backup and smoothing" },
                { label: "Grid", value: kwh(householdGridKwh), note: "fallback, not postpaid e.mappa debt" },
              ]}
            />
          </PortalPanel>
        </section>
        <PrivacyNote>Usage is shown as a household allocation view, not a neighbor comparison board.</PrivacyNote>
      </div>
    );
  }

  if (activeSectionId === "ownership") {
    return (
      <div className="dashboard-stack">
        <PortalKpiBar
          items={[
            { label: "Resident-owned share", value: pct(view.ownedProviderShare), detail: "optional pool share" },
            { label: "Projected payout", value: kes(residentPayout), detail: "education only" },
            { label: "Provider retained", value: pct(project.roleViews.provider.retainedOwnership), detail: "remaining provider cashflow" },
            { label: "Payout rule", value: "Sold solar", detail: "no waste payout" },
          ]}
        />
        <PortalPanel eyebrow="Ownership lessons" title="Optional upside comes after trust is established.">
          <p>Ownership education is separate from the wallet. Buying shares does not create free power, guaranteed income, or a claim on unsold generation.</p>
          <PortalLedger
            rows={[
              { label: "Owned share", value: pct(view.ownedProviderShare), note: "future provider-pool participation" },
              { label: "Resident payout", value: kes(residentPayout), note: "projected monthly pool share" },
              { label: "Not paid", value: kwh(project.roleViews.provider.wasteKwh), note: "wasted, curtailed, or unsold kWh" },
            ]}
          />
        </PortalPanel>
        <PrivacyNote>Share education can show the resident's own pool position without exposing provider private finances.</PrivacyNote>
      </div>
    );
  }

  if (activeSectionId === "profile") {
    return (
      <div className="dashboard-stack">
        <PortalPanel eyebrow="Resident pass" title="Building membership and trust">
          <PortalLedger
            rows={[
              { label: "Verified building", value: project.project.name, note: `${project.project.units} homes in ${project.project.locationBand}` },
              { label: "Session role", value: "Resident", note: "one session, one role" },
              { label: "Privacy averaging", value: "On", note: "neighbors are never exposed" },
              { label: "Access boundary", value: "Household only", note: "no provider, owner, or financier workspace" },
            ]}
          />
        </PortalPanel>
        <PrivacyNote>{project.transparency.privacyNote}</PrivacyNote>
      </div>
    );
  }

  if (activeSectionId === "support") {
    return (
      <div className="dashboard-stack">
        <PortalKpiBar
          items={[
            { label: "Wallet state", value: kes(view.prepaidBalanceKes), detail: "support context" },
            { label: "Power state", value: project.drs.reasons[0] ? "Review" : "Stable", detail: project.drs.reasons[0] ?? "no active blocker" },
            { label: "Ownership state", value: pct(view.ownedProviderShare), detail: "education context" },
            { label: "Building", value: project.project.name, detail: project.project.locationBand },
          ]}
        />
        <PortalWorkflow
          steps={[
            { label: "Classify", detail: "Wallet, power, share, or profile issue.", status: "triage" },
            { label: "Attach context", detail: "Only role-safe metrics are attached to the support case.", status: "privacy-safe" },
            { label: "Resolve", detail: "Support routes to settlement, installer, provider, or owner workflow.", status: "operational" },
          ]}
        />
        <PortalPanel eyebrow="Support triage" title="Start with the issue type.">
          <PortalLedger
            rows={[
              { label: "Wallet issue", value: kes(view.prepaidBalanceKes), note: "token balance context" },
              { label: "Power issue", value: project.drs.reasons[0] ? "Review" : "Stable", note: project.drs.reasons[0] ?? "no active DRS blocker" },
              { label: "Share question", value: pct(view.ownedProviderShare), note: "ownership education stays separate" },
            ]}
          />
        </PortalPanel>
      </div>
    );
  }

  return (
    <div className="dashboard-stack">
      <PortalKpiBar
        items={[
          { label: "Prepaid balance", value: kes(view.prepaidBalanceKes), detail: "available tokens" },
          { label: "Solar coverage", value: pct(view.solarCoverage), detail: "local solar share" },
          { label: "Savings", value: kes(view.savingsKes), detail: "projected vs grid" },
          { label: "Owned share", value: pct(view.ownedProviderShare), detail: "optional future cashflow" },
        ]}
      />

      <PortalWorkflow
        steps={[
          { label: "Top up", detail: "Cash-cleared tokens are the only way this resident session can receive sold solar.", status: "prepaid only" },
          { label: "Allocate", detail: "Tokens are matched against monetized local solar first.", status: pct(view.solarCoverage) },
          { label: "Fallback", detail: "Battery and grid cover remaining load without becoming postpaid debt.", status: "no debt" },
          { label: "Learn ownership", detail: "Optional share education stays separate from wallet and usage.", status: "decide later" },
        ]}
      />

      <section className="portal-main-grid">
        <div id="usage">
          <EnergyFlow project={project} />
        </div>
        <PortalPanel id="wallet" eyebrow="Token wallet" title="Prepaid tokens control allocation.">
          <p>The wallet protects the resident from hidden debt and protects the building economy from unpaid solar claims.</p>
          <ProgressBar value={fundedRatio} label="Wallet funding posture" />
          <PortalLedger
            rows={[
              { label: "Available tokens", value: kes(view.prepaidBalanceKes), note: "cash cleared before allocation" },
              { label: "Suggested top-up", value: kes(expectedTopUp), note: "demo checkout amount" },
              { label: "Zero-balance behavior", value: "Grid fallback", note: "unpaid solar stays blocked" },
            ]}
          />
        </PortalPanel>
      </section>

      <section className="portal-two-column">
        <PortalPanel eyebrow="Usage source map" title="Solar, battery, and grid stay visually separate.">
          <PortalLedger
            rows={[
              { label: "Solar allocation", value: kwh(view.monthlySolarKwh), note: "prepaid local solar first" },
              { label: "Battery support", value: kwh(householdBatteryKwh), note: "stored solar smoothing" },
              { label: "Grid fallback", value: kwh(householdGridKwh), note: "not an e.mappa debt balance" },
            ]}
          />
        </PortalPanel>
        <PortalPanel eyebrow="Daily rhythm" title="Solar carries the day when tokens are funded.">
          <ProgressBar value={view.solarCoverage} label="Home solar cover" />
          <p>Coverage is capped to sold solar. Grid fallback remains separate from prepaid token balance.</p>
        </PortalPanel>
      </section>

      <PortalPanel id="ownership" eyebrow="Ownership lessons" title="Optional upside with caveats up front.">
        <PortalLedger
          rows={[
            { label: "Resident-owned share", value: pct(view.ownedProviderShare), note: "optional pool share in this demo building" },
            { label: "Estimated resident payout", value: kes(residentPayout), note: "future cashflow education, not a guarantee" },
            { label: "Payout truth", value: "Monetized solar only", note: "waste, curtailed, or free-exported energy does not pay" },
          ]}
        />
      </PortalPanel>

      <section id="profile" className="portal-two-column">
        <PortalPanel eyebrow="Resident pass" title="Building membership controls access.">
          <PortalLedger
            rows={[
              { label: "Verified building", value: project.project.name, note: `${project.project.units} homes in ${project.project.locationBand}` },
              { label: "Privacy averaging", value: "On", note: "neighbors are never exposed" },
              { label: "Session boundary", value: "Resident only", note: "no cross-role portal access" },
            ]}
          />
        </PortalPanel>
        <PortalPanel id="support" eyebrow="Support triage" title="Start with the issue type.">
          <PortalLedger
            rows={[
              { label: "Wallet issue", value: kes(view.prepaidBalanceKes), note: "token balance context" },
              { label: "Power issue", value: project.drs.reasons[0] ? "Review" : "Stable", note: project.drs.reasons[0] ?? "no active DRS blocker" },
              { label: "Share question", value: pct(view.ownedProviderShare), note: "ownership education stays separate" },
            ]}
          />
        </PortalPanel>
      </section>

      <PrivacyNote>{project.transparency.privacyNote}</PrivacyNote>
    </div>
  );
}
