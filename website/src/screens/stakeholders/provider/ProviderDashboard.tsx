import { EnergyFlow } from "../../../components/EnergyFlow";
import { GateList } from "../../../components/GateList";
import { PortalKpiBar, PortalLedger, PortalPanel, PortalTable, PortalWorkflow } from "../../../components/PortalPrimitives";
import { PrivacyNote } from "../../../components/PrivacyNote";
import { ProgressBar } from "../../../components/ProgressBar";
import type { StakeholderScreenProps } from "../../../types";

const kes = (value: number) => `KSh ${Math.round(value).toLocaleString()}`;
const kwh = (value: number) => `${Number(value.toFixed(1)).toLocaleString()} kWh`;
const pct = (value: number) => `${Math.round(value * 100)}%`;

export function ProviderDashboard({ project, activeSectionId = "home" }: StakeholderScreenProps) {
  const view = project.roleViews.provider;
  const retainedPayout = project.providerPayouts
    .filter((position) => position.ownerRole === "provider")
    .reduce((sum, position) => sum + position.payout, 0);
  const residentOwnedPayout = project.providerPayouts
    .filter((position) => position.ownerRole === "resident")
    .reduce((sum, position) => sum + position.payout, 0);

  if (activeSectionId === "assets") {
    return (
      <div className="dashboard-stack">
        <PortalKpiBar
          items={[
            { label: "Generated", value: kwh(view.generatedKwh), detail: "physical output" },
            { label: "Monetized", value: kwh(view.monetizedKwh), detail: "prepaid consumed solar" },
            { label: "Waste", value: kwh(view.wasteKwh), detail: "not payable" },
            { label: "Monitoring", value: view.monitoringStatus, detail: "asset trust" },
          ]}
        />
        <section className="portal-main-grid">
          <EnergyFlow project={project} />
          <PortalPanel eyebrow="Asset register" title="Generated output is not the same as revenue.">
            <PortalLedger
              rows={[
                { label: "Generated output", value: kwh(view.generatedKwh), note: "physical array production" },
                { label: "Monetized output", value: kwh(view.monetizedKwh), note: "resident-prepaid sold solar" },
                { label: "Unpaid waste", value: kwh(view.wasteKwh), note: "curtailed, unsold, or free-exported" },
                { label: "Grid fallback", value: kwh(view.gridFallbackKwh), note: "demand not covered by asset" },
              ]}
            />
          </PortalPanel>
        </section>
      </div>
    );
  }

  if (activeSectionId === "performance") {
    return (
      <div className="dashboard-stack">
        <PortalKpiBar
          items={[
            { label: "Utilization", value: pct(view.utilization), detail: project.transparency.utilizationBand },
            { label: "Monetized", value: kwh(view.monetizedKwh), detail: "settlement basis" },
            { label: "Waste", value: kwh(view.wasteKwh), detail: "lost yield" },
            { label: "DRS", value: `${project.drs.score}`, detail: project.drs.label },
          ]}
        />
        <PortalPanel eyebrow="Performance ledger" title="Output quality stays separate from ownership and payout.">
          <PortalTable
            columns={["Measure", "Current", "Deployment meaning"]}
            rows={[
              ["Utilization", pct(view.utilization), "demand converts production into revenue"],
              ["Waste / curtailment", kwh(view.wasteKwh), "no payout until prepaid demand absorbs it"],
              ["Grid fallback", kwh(view.gridFallbackKwh), "signals uncovered resident demand"],
              ["Monitoring", view.monitoringStatus, "connectivity gates live support"],
            ]}
          />
        </PortalPanel>
      </div>
    );
  }

  if (activeSectionId === "shares") {
    return (
      <div className="dashboard-stack">
        <PortalKpiBar
          items={[
            { label: "Retained stake", value: pct(view.retainedOwnership), detail: "future provider cashflow" },
            { label: "Sold stake", value: pct(view.soldOwnership), detail: "resident-owned share" },
            { label: "Retained payout", value: kes(retainedPayout), detail: "provider-owned portion" },
            { label: "Redirected payout", value: kes(residentOwnedPayout), detail: "resident share" },
          ]}
        />
        <PortalPanel eyebrow="Ownership ledger" title="Selling shares reduces future provider yield.">
          <p>This screen avoids production noise so the cashflow-rights impact is obvious.</p>
          <ProgressBar value={view.retainedOwnership} label="Retained provider cashflow" />
          <PortalLedger
            rows={[
              { label: "Provider retained", value: pct(view.retainedOwnership), note: "future payout basis" },
              { label: "Sold to residents", value: pct(view.soldOwnership), note: "redirected future provider-pool payout" },
              { label: "Resident share payout", value: kes(residentOwnedPayout), note: "removed from provider earnings" },
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
            { label: "Monthly payout", value: kes(view.monthlyPayoutKes), detail: "retained sold solar" },
            { label: "Provider pool", value: kes(project.settlement.providerPool), detail: "before ownership split" },
            { label: "Monetized kWh", value: kwh(view.monetizedKwh), detail: "payout basis" },
            { label: "Excluded output", value: kwh(view.wasteKwh), detail: "no payout" },
          ]}
        />
        <PortalPanel eyebrow="Earnings" title="Monetized-kWh payout tracking">
          <PortalLedger
            rows={[
              { label: "Provider payout", value: kes(view.monthlyPayoutKes), note: "retained share of provider pool" },
              { label: "Provider pool", value: kes(project.settlement.providerPool), note: "settlement waterfall" },
              { label: "Rule", value: "Sold solar only", note: "unused generation does not pay out" },
            ]}
          />
        </PortalPanel>
      </div>
    );
  }

  if (activeSectionId === "maintenance") {
    return (
      <div className="dashboard-stack">
        <PortalKpiBar
          items={[
            { label: "Monitoring", value: view.monitoringStatus, detail: "support signal" },
            { label: "Warranty docs", value: `${view.warrantyDocuments}`, detail: "equipment proof" },
            { label: "Open tickets", value: `${view.openMaintenanceTickets}`, detail: "provider action items" },
            { label: "DRS trust", value: project.project.drs.settlementDataTrusted ? "Trusted" : "Pending", detail: "readings and settlement" },
          ]}
        />
        <PortalPanel eyebrow="Maintenance and warranty" title="Service status only: connectivity, warranty evidence, and unresolved tickets.">
          <PortalLedger
            rows={[
              { label: "Warranty packet", value: `${view.warrantyDocuments} docs`, note: "equipment proof attached to active provider asset" },
              { label: "Open tickets", value: `${view.openMaintenanceTickets}`, note: "monitoring or field service work" },
              { label: "Monitoring", value: view.monitoringStatus, note: "required for reliable settlement" },
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
            { label: "DRS", value: `${project.drs.score}`, detail: project.drs.label },
            { label: "Demand coverage", value: pct(project.energy.utilization), detail: "deployment gate" },
            { label: "Monitoring", value: view.monitoringStatus, detail: "activation gate" },
            { label: "Gates", value: `${view.deploymentGates.filter((gate) => gate.complete).length}/${view.deploymentGates.length}`, detail: "ready" },
          ]}
        />
        <PortalWorkflow
          steps={[
            { label: "Qualify", detail: "DRS validates demand and prepaid commitment before deployment.", status: project.drs.label },
            { label: "Lock partners", detail: "Supplier quote and certified lead must be in place.", status: "partner gates" },
            { label: "Activate", detail: "Monitoring and settlement trust unlock live provider status.", status: view.monitoringStatus },
          ]}
        />
        <PortalPanel eyebrow="Deployment coordination" title="Provider assets should not be treated as live before gates clear.">
          <GateList gates={view.deploymentGates} />
        </PortalPanel>
      </div>
    );
  }

  return (
    <div className="dashboard-stack">
      <PortalKpiBar
        items={[
          { label: "Monthly payout", value: kes(view.monthlyPayoutKes), detail: "retained sold solar" },
          { label: "Monetized", value: kwh(view.monetizedKwh), detail: "paid local output" },
          { label: "Utilization", value: pct(view.utilization), detail: project.transparency.utilizationBand },
          { label: "Retained stake", value: pct(view.retainedOwnership), detail: `${pct(view.soldOwnership)} sold` },
        ]}
      />

      <PortalWorkflow
        steps={[
          { label: "Plug in", detail: "Panels connect after demand, supplier, installer, and monitoring gates clear.", status: project.drs.label },
          { label: "Measure", detail: "Provider production is tracked separately from resident consumption.", status: view.monitoringStatus },
          { label: "Monetize", detail: "Only prepaid local solar enters provider settlement.", status: kwh(view.monetizedKwh) },
          { label: "Service", detail: "Warranty docs and maintenance tickets stay attached to the asset.", status: `${view.openMaintenanceTickets} open` },
        ]}
      />

      <section className="portal-main-grid">
        <div id="assets">
          <EnergyFlow project={project} />
        </div>
        <PortalPanel eyebrow="Asset register" title="Hardware yield is split into generated, sold, and wasted output.">
          <p>Provider assets stay visible as physical equipment and as a settlement instrument. Production alone is not revenue until residents buy the allocation.</p>
          <PortalLedger
            rows={[
              { label: "Generated output", value: kwh(view.generatedKwh), note: "physical production" },
              { label: "Monetized output", value: kwh(view.monetizedKwh), note: "settlement-eligible solar" },
              { label: "Unpaid waste", value: kwh(view.wasteKwh), note: "not payable" },
              { label: "Warranty documents", value: `${view.warrantyDocuments}`, note: "attached to active BOM" },
            ]}
          />
        </PortalPanel>
      </section>

      <section className="portal-two-column">
        <PortalPanel id="shares" eyebrow="Share sale preview" title="Liquidity reduces future yield.">
          <p>Provider-side cashflows move with ownership. Selling shares creates upfront recovery while reducing future payout proportionally.</p>
          <ProgressBar value={view.retainedOwnership} label="Retained provider cashflow" />
          <PortalLedger
            rows={[
              { label: "Retained", value: `${Math.round(view.retainedOwnership * 100)}%`, note: "future payout basis" },
              { label: "Resident-owned", value: pct(view.soldOwnership), note: "education and optional upside" },
              { label: "Retained monthly payout", value: kes(retainedPayout), note: "provider-owned share only" },
              { label: "Resident share payout", value: kes(residentOwnedPayout), note: "shown outside provider earnings" },
            ]}
          />
        </PortalPanel>
        <PortalPanel id="earnings" eyebrow="Earnings" title="Payout tracks prepaid, monetized kWh.">
          <PortalLedger
            rows={[
              { label: "Provider payout", value: kes(view.monthlyPayoutKes), note: "retained share of provider pool" },
              { label: "Provider pool", value: kes(project.settlement.providerPool), note: "before ownership split" },
              { label: "Excluded output", value: kwh(view.wasteKwh), note: "curtailed or unsold" },
              { label: "Rule", value: "Sold solar only", note: "generated but unsold kWh does not pay" },
            ]}
          />
        </PortalPanel>
      </section>

      <PortalPanel id="performance" eyebrow="Performance ledger">
        <PortalTable
          columns={["Measure", "Current", "Meaning"]}
          rows={[
            ["Utilization", pct(view.utilization), "sold kWh divided by generated kWh"],
            ["Waste / curtailment", kwh(view.wasteKwh), "no payout until prepaid demand absorbs it"],
            ["Grid fallback", kwh(view.gridFallbackKwh), "demand not covered by solar or battery"],
            ["DRS", `${project.drs.score} / 100`, project.drs.label],
            ["Monitoring", view.monitoringStatus, "connectivity gates go-live and support"],
          ]}
        />
      </PortalPanel>

      <section className="portal-two-column">
        <PortalPanel id="maintenance" eyebrow="Maintenance and warranty" title="Asset support stays tied to verified equipment.">
          <PortalLedger
            rows={[
              { label: "Warranty packet", value: `${view.warrantyDocuments} docs`, note: "serials, inverter, battery, panels" },
              { label: "Open tickets", value: `${view.openMaintenanceTickets}`, note: "monitoring or field service" },
              { label: "Monitoring", value: view.monitoringStatus, note: "required for settlement trust" },
            ]}
          />
        </PortalPanel>
        <PortalPanel id="deployment" eyebrow="Deployment coordination" title="Panels move only when DRS gates are ready.">
          <GateList gates={view.deploymentGates} />
        </PortalPanel>
      </section>

      <PrivacyNote>Providers see their own raw performance and anonymized ROI/payback bands, never another provider's private earnings.</PrivacyNote>
    </div>
  );
}
