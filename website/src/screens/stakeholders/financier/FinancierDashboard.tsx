import { GateList } from "../../../components/GateList";
import { PortalKpiBar, PortalLedger, PortalPanel, PortalTable, PortalWorkflow } from "../../../components/PortalPrimitives";
import { PrivacyNote } from "../../../components/PrivacyNote";
import { ProgressBar } from "../../../components/ProgressBar";
import type { StakeholderScreenProps } from "../../../types";

const kes = (value: number) => `KSh ${Math.round(value).toLocaleString()}`;
const pct = (value: number) => `${Math.round(value * 100)}%`;

export function FinancierDashboard({ project, activeSectionId = "home" }: StakeholderScreenProps) {
  const view = project.roleViews.financier;
  const availableProgress = Math.min(1, view.fundingProgress);

  if (activeSectionId === "deals") {
    return (
      <div className="dashboard-stack">
        <PortalKpiBar
          items={[
            { label: "Named building", value: project.project.name, detail: "not opaque pool" },
            { label: "Committed", value: kes(view.committedCapitalKes), detail: `${kes(view.remainingCapitalKes)} left` },
            { label: "Funding progress", value: pct(availableProgress), detail: "milestone capital" },
            { label: "DRS", value: `${project.drs.score}`, detail: project.drs.label },
          ]}
        />
        <PortalPanel eyebrow="Named deal room" title="Named building pipeline">
          <p>Financiers browse and fund named building deals, not an opaque pooled fund. This screen keeps the pipeline anchored to one physical deployment.</p>
          <ProgressBar value={availableProgress} label="Funding progress" />
          <PortalLedger
            rows={[
              { label: "Building", value: project.project.name, note: project.project.locationBand },
              { label: "Committed", value: kes(view.committedCapitalKes), note: "capital already attached" },
              { label: "Remaining", value: kes(view.remainingCapitalKes), note: "unfunded requirement" },
            ]}
          />
        </PortalPanel>
      </div>
    );
  }

  if (activeSectionId === "deal-detail") {
    return (
      <div className="dashboard-stack">
        <PortalKpiBar
          items={[
            { label: "DRS", value: `${project.drs.score}`, detail: project.drs.label },
            { label: "Base utilization", value: pct(view.baseUtilization), detail: "expected case" },
            { label: "Downside", value: pct(view.downsideUtilization), detail: "stress case" },
            { label: "ROI band", value: project.transparency.roiRange, detail: "not guaranteed" },
          ]}
        />
        <section className="portal-two-column">
          <PortalPanel eyebrow="DRS evidence" title="DRS, milestones, and diligence">
            <GateList gates={project.roleViews.owner.gates} />
          </PortalPanel>
          <PortalPanel eyebrow="Risk cases" title="Returns are shown as cases, never guarantees.">
            <PortalLedger
              rows={[
                { label: "Base utilization", value: pct(view.baseUtilization), note: "expected case" },
                { label: "Downside utilization", value: pct(view.downsideUtilization), note: "stress case" },
                { label: "Monthly recovery", value: kes(view.monthlyRecoveryKes), note: "financier pool" },
                { label: "ROI band", value: project.transparency.roiRange, note: "projection range" },
              ]}
            />
          </PortalPanel>
        </section>
      </div>
    );
  }

  if (activeSectionId === "portfolio") {
    return (
      <div className="dashboard-stack">
        <PortalKpiBar
          items={[
            { label: "Committed", value: kes(view.committedCapitalKes), detail: "deal-level exposure" },
            { label: "Monthly recovery", value: kes(view.monthlyRecoveryKes), detail: "base case" },
            { label: "Payback", value: `${project.financierPayback.yearsToPrincipal.toFixed(1)} yrs`, detail: "principal projection" },
            { label: "Downside", value: pct(view.downsideUtilization), detail: "stress case" },
          ]}
        />
        <PortalPanel eyebrow="Portfolio" title="Recovery curve and exposure">
          <PortalTable
            columns={["Exposure", "Current", "Investor meaning"]}
            rows={[
              ["Named building", project.project.name, "not pooled into an opaque fund"],
              ["Capital committed", kes(view.committedCapitalKes), "visible funding exposure"],
              ["Recovery range", project.transparency.roiRange, "case band, not a promise"],
              ["Downside case", pct(view.downsideUtilization), "stress-test utilization"],
            ]}
          />
        </PortalPanel>
        <PrivacyNote>Financiers see project-specific performance for deals they fund plus system-wide anonymized recovery bands.</PrivacyNote>
      </div>
    );
  }

  return (
    <div className="dashboard-stack">
      <PortalKpiBar
        items={[
          { label: "Committed", value: kes(view.committedCapitalKes), detail: `${kes(view.remainingCapitalKes)} left` },
          { label: "Monthly recovery", value: kes(view.monthlyRecoveryKes), detail: "base case" },
          { label: "Principal payback", value: `${project.financierPayback.yearsToPrincipal.toFixed(1)} yrs`, detail: "projected" },
          { label: "Downside utilization", value: pct(view.downsideUtilization), detail: "modeled case" },
        ]}
      />

      <PortalWorkflow
        steps={[
          { label: "Name the deal", detail: "Capital is tied to this building, not an opaque pool.", status: project.project.name },
          { label: "Review DRS", detail: "Funding waits for demand, supplier lock, install proof, and data trust.", status: project.drs.label },
          { label: "Release milestones", detail: "Capital moves only as verified deployment evidence arrives.", status: pct(availableProgress) },
          { label: "Track recovery", detail: "Returns are shown as ranges and cases, never guarantees.", status: project.transparency.roiRange },
        ]}
      />

      <section className="portal-two-column">
        <PortalPanel id="deals" eyebrow="Named deal room" title={project.project.name}>
          <p>Financiers fund this exact building, not an opaque pool. The deal room tracks DRS, capital, supplier readiness, resident prepayment, and known risks.</p>
          <ProgressBar value={availableProgress} label="Funding progress" />
          <PortalLedger
            rows={[
              { label: "Committed", value: kes(view.committedCapitalKes), note: "capital already attached" },
              { label: "Remaining", value: kes(view.remainingCapitalKes), note: "unfunded requirement" },
              { label: "DRS decision", value: project.drs.label, note: `${project.drs.score}/100 readiness` },
            ]}
          />
        </PortalPanel>
        <PortalPanel id="deal-detail" eyebrow="Diligence and risk cases" title="The mobile deal detail becomes a desktop underwriting file.">
          <PortalLedger
            rows={[
              { label: "Base utilization", value: pct(view.baseUtilization), note: "expected case" },
              { label: "Downside utilization", value: pct(view.downsideUtilization), note: "stress case" },
              { label: "ROI band", value: project.transparency.roiRange, note: "not guaranteed" },
              { label: "Recovery", value: kes(view.monthlyRecoveryKes), note: "monthly financier pool" },
            ]}
          />
        </PortalPanel>
      </section>

      <section className="portal-two-column">
        <PortalPanel eyebrow="Milestone gates" title="Capital release stays tied to evidence.">
          <GateList gates={project.roleViews.owner.gates} />
        </PortalPanel>
        <PortalPanel id="portfolio" eyebrow="Portfolio" title="Exposure stays deal-level.">
          <PortalTable
            columns={["Exposure", "Current", "Investor meaning"]}
            rows={[
              ["Named building", project.project.name, "not pooled into an opaque fund"],
              ["Capital committed", kes(view.committedCapitalKes), "visible funding exposure"],
              ["Recovery range", project.transparency.roiRange, "case band, not a promise"],
              ["Downside case", pct(view.downsideUtilization), "stress-test utilization"],
            ]}
          />
        </PortalPanel>
      </section>

      <PrivacyNote>Financiers see project-specific performance for deals they fund plus system-wide anonymized recovery bands.</PrivacyNote>
    </div>
  );
}
