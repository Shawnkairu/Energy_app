import { GateList } from "../../../components/GateList";
import { PortalKpiBar, PortalLedger, PortalPanel, PortalTable, PortalWorkflow } from "../../../components/PortalPrimitives";
import { PrivacyNote } from "../../../components/PrivacyNote";
import { ProgressBar } from "../../../components/ProgressBar";
import type { StakeholderScreenProps } from "../../../types";

const kes = (value: number) => `KSh ${Math.round(value).toLocaleString()}`;
const pct = (value: number) => `${Math.round(value * 100)}%`;

export function OwnerDashboard({ project, activeSectionId = "home" }: StakeholderScreenProps) {
  const view = project.roleViews.owner;

  if (activeSectionId === "drs") {
    return (
      <div className="dashboard-stack">
        <PortalKpiBar
          items={[
            { label: "DRS", value: `${project.drs.score}`, detail: project.drs.label },
            { label: "Demand", value: `${project.drs.components.demandCoverage}/100`, detail: "resident load match" },
            { label: "Prepaid", value: `${project.drs.components.prepaidCommitment}/100`, detail: "cash-cleared demand" },
            { label: "Install", value: `${project.drs.components.installationReadiness}/100`, detail: "site readiness" },
          ]}
        />
        <PortalPanel eyebrow="DRS evidence" title="Readiness score and blockers">
          <GateList gates={view.gates} />
        </PortalPanel>
        <PortalPanel eyebrow="Component ledger" title="A building qualifies before capital and hardware move.">
          <PortalTable
            columns={["Component", "Score", "Why owner sees it"]}
            rows={[
              ["Demand coverage", `${project.drs.components.demandCoverage}/100`, "deployment should not chase demand later"],
              ["Prepaid commitment", `${project.drs.components.prepaidCommitment}/100`, "no prepaid funds blocks solar allocation"],
              ["Installer readiness", `${project.drs.components.installerReadiness}/100`, "certified lead controls go-live"],
              ["Supplier readiness", project.project.drs.hasVerifiedSupplierQuote ? "Verified" : "Pending", "BOM lock protects schedule"],
            ]}
          />
        </PortalPanel>
      </div>
    );
  }

  if (activeSectionId === "deployment") {
    return (
      <div className="dashboard-stack">
        <PortalKpiBar
          items={[
            { label: "Resident participation", value: pct(view.residentParticipation), detail: "pre-onboarding" },
            { label: "Prepaid coverage", value: pct(view.prepaidCoverage), detail: `${view.prepaidMonthsCovered} months` },
            { label: "Supplier quote", value: project.project.drs.hasVerifiedSupplierQuote ? "Verified" : "Pending", detail: "BOM lock" },
            { label: "Certified lead", value: project.project.drs.hasCertifiedLeadElectrician ? "Assigned" : "Missing", detail: "go-live gate" },
          ]}
        />
        <PortalWorkflow
          steps={[
            { label: "List building", detail: "Submit basics and compare current power situation.", status: project.project.locationBand },
            { label: "Pre-onboard", detail: "Drive resident demand and prepaid commitment.", status: pct(view.residentParticipation) },
            { label: "Approve terms", detail: "Confirm rooftop, access, partner obligations, and deployment gates.", status: project.drs.label },
            { label: "Track go-live", detail: "Supplier, installer, monitoring, and settlement trust move together.", status: "gated" },
          ]}
        />
        <PortalPanel eyebrow="Owner toolkit" title="Deployment readiness gates and obligations">
          <PortalLedger
            rows={[
              { label: "Resident demand", value: pct(view.residentParticipation), note: "pre-onboarding progress" },
              { label: "Access obligations", value: project.drs.components.installationReadiness >= 60 ? "Ready" : "Needs work", note: "roof, DB, route, metering" },
              { label: "Supplier quote", value: project.project.drs.hasVerifiedSupplierQuote ? "Verified" : "Pending", note: "BOM lock" },
              { label: "Settlement trust", value: project.project.drs.settlementDataTrusted ? "Trusted" : "Pending", note: "readings and allocation proof" },
            ]}
          />
        </PortalPanel>
      </div>
    );
  }

  if (activeSectionId === "earnings") {
    return (
      <div className="dashboard-stack">
        <PortalKpiBar
          items={[
            { label: "Host royalty", value: kes(view.monthlyRoyaltyKes), detail: "monetized solar" },
            { label: "Comparable median", value: kes(view.comparableMedianRoyaltyKes), detail: "anonymized" },
            { label: "Prepaid months", value: `${view.prepaidMonthsCovered}`, detail: "demand runway" },
            { label: "Rule", value: "Sold solar", detail: "unused generation excluded" },
          ]}
        />
        <PortalPanel eyebrow="Earnings" title="Host royalty and benchmarks">
          <PortalLedger
            rows={[
              { label: "Projected royalty", value: kes(view.monthlyRoyaltyKes), note: "monthly sold solar royalty" },
              { label: "Comparable median", value: kes(view.comparableMedianRoyaltyKes), note: "distribution, not private counterpart income" },
              { label: "Payout rule", value: "Monetized solar only", note: "waste and free export do not pay" },
            ]}
          />
        </PortalPanel>
        <PrivacyNote>Owners see anonymized comparable building bands, not another owner's exact address, income, or private terms.</PrivacyNote>
      </div>
    );
  }

  return (
    <div className="dashboard-stack">
      <PortalKpiBar
        items={[
          { label: "DRS", value: `${project.drs.score}`, detail: project.drs.label },
          { label: "Host royalty", value: kes(view.monthlyRoyaltyKes), detail: "monetized solar" },
          { label: "Prepaid coverage", value: pct(view.prepaidCoverage), detail: `${view.prepaidMonthsCovered} months` },
          { label: "Resident participation", value: pct(view.residentParticipation), detail: "demand signal" },
        ]}
      />

      <PortalWorkflow
        steps={[
          { label: "Invite", detail: "Residents signal prepaid demand before a rooftop becomes investable.", status: pct(view.residentParticipation) },
          { label: "Confirm access", detail: "Roof, DB room, meter, and building obligations are made explicit.", status: "host gate" },
          { label: "Clear DRS", detail: "Supplier, installer, monitoring, and settlement trust gate the deployment.", status: project.drs.label },
          { label: "Earn", detail: "Owner royalty follows sold solar, not unused generation.", status: kes(view.monthlyRoyaltyKes) },
        ]}
      />

      <PortalPanel eyebrow="Owner command" title="The building view is readiness first, revenue second.">
        <PortalTable
          columns={["Lane", "Owner sees", "Why it matters"]}
          rows={[
            ["Resident demand", pct(view.residentParticipation), "prepaid participation validates local consumption"],
            ["Deployment readiness", `${project.drs.score} DRS`, "capital and partners wait for gates"],
            ["Host economics", kes(view.monthlyRoyaltyKes), "royalty is tied to monetized kWh"],
            ["Privacy boundary", "Aggregated", "resident balances and private usage stay hidden"],
          ]}
        />
      </PortalPanel>

      <section className="portal-two-column">
        <PortalPanel id="drs" eyebrow="Deployment gates" title="Capital does not release early.">
          <GateList gates={view.gates} />
        </PortalPanel>
        <PortalPanel id="deployment" eyebrow="Owner toolkit" title="Turn resident demand into a qualified project.">
          <PortalLedger
            rows={[
              { label: "Invite residents", value: pct(view.residentParticipation), note: "demand participation" },
              { label: "Schedule inspection", value: project.drs.components.installationReadiness >= 60 ? "Ready" : "Needs work", note: "roof, route, DB, metering" },
              { label: "Supplier quote", value: project.project.drs.hasVerifiedSupplierQuote ? "Verified" : "Pending", note: "BOM lock before go-live" },
              { label: "Certified installer", value: project.project.drs.hasCertifiedLeadElectrician ? "Assigned" : "Missing", note: "go-live proof owner can track" },
            ]}
          />
          <ProgressBar value={view.residentParticipation} label="Resident participation" />
        </PortalPanel>
      </section>

      <PortalPanel id="earnings" eyebrow="Earnings" title="Host royalty follows monetized solar only.">
        <PortalLedger
          rows={[
            { label: "Projected royalty", value: kes(view.monthlyRoyaltyKes), note: "monthly sold solar royalty" },
            { label: "Comparable median", value: kes(view.comparableMedianRoyaltyKes), note: "anonymized building band" },
            { label: "Prepaid months covered", value: `${view.prepaidMonthsCovered}`, note: "cash-cleared demand runway" },
            { label: "Rule", value: "Sold solar only", note: "unused generation does not pay out" },
          ]}
        />
      </PortalPanel>

      <PrivacyNote>Owners see anonymized comparable building bands, not another owner's exact address, income, or private terms.</PrivacyNote>
    </div>
  );
}
