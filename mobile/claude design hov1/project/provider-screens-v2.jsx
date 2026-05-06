// ─────────────────────────────────────────────────────────────
// provider-screens-v2.jsx — faithful HTML port of components/provider/*
// ─────────────────────────────────────────────────────────────

const pfmtKes = (v) => `KSh ${Math.round(v).toLocaleString()}`;
const pfmtKwh = (v) => `${Math.round(v).toLocaleString()} kWh`;
const pfmtPct = (v) => `${Math.round(v * 100)}%`;

const PROVIDER_ACTIONS = {
  Home:        { label: 'Open desk',     detail: 'Move to the desk for triage.',                                  status: 'desk',   tone: 'neutral' },
  Assets:      { label: 'Inspect proof', detail: 'Walk the asset proof packet.',                                   status: 'asset',  tone: 'neutral' },
  Performance: { label: 'Read flow',     detail: 'Confirm sold/waste/grid split.',                                  status: 'flow',   tone: 'neutral' },
  Earnings:    { label: 'Track payout',  detail: 'Reconcile pool and ownership against monetized solar.',          status: 'payout', tone: 'neutral' },
  Shares:      { label: 'Review ledger', detail: 'Check retained vs sold rights and future-only impact.',          status: 'ledger', tone: 'neutral' },
  Deployment:  { label: 'Watch gates',   detail: 'Watch DRS, supplier lock, and monitoring before activation.',    status: 'gates',  tone: 'warn' },
  Maintenance: { label: 'Open tickets',  detail: 'Service work that protects monitoring and warranty proof.',      status: 'service', tone: 'warn' },
};

function ProviderActionPlan({ section }) {
  const it = PROVIDER_ACTIONS[section];
  return <WorkflowCard eyebrow="Provider plan" title="Next provider action" items={[it]}/>;
}

function ProviderDashboard({ section, title, subtitle, actions, hero, children }) {
  return (
    <ScreenShell
      section={section}
      roleLabel="provider workspace"
      title={title}
      subtitle={subtitle}
      actions={actions}
      hero={hero}
    >
      <BuildingPulse role="provider"/>
      <KillSwitchBanner/>
      {children}
    </ScreenShell>
  );
}

function ProviderHomeScreenV2() {
  const b = window.MOCK; const view = b.roleViews.provider;
  return (
    <ProviderDashboard
      section="Home"
      title="Provider Asset Desk"
      subtitle="A clean desk view of the active provider asset: payout, sold solar, and current operating posture."
      actions={["Open asset desk", "Review payout", "Check posture"]}
      hero={{
        label: 'Active provider asset',
        value: b.project.name,
        sub: `${b.project.units} units in ${b.project.locationBand}.`,
      }}
    >
      <SectionBriefCard section="Home"
        eyebrow="Provider · Home"
        title="One building, one operating snapshot."
        body="The home screen stays high level so providers can see whether the asset is monetizing and ready for attention."
      />
      <BigMetric label="Projected payout" value={pfmtKes(view.monthlyPayoutKes)}
        detail="Monthly payout after sold provider shares are removed."/>
      <RowsCard title="Desk summary" eyebrow="Provider desk"
        rows={[
          { label: 'Monetized solar', value: pfmtKwh(view.monetizedKwh), note: 'Prepaid solar consumed by residents.', tone: 'good' },
          { label: 'Retained stake', value: pfmtPct(view.retainedOwnership), note: 'Current provider-side cashflow right.' },
          { label: 'Stage',           value: b.project.stage, note: 'Current provider operating posture.' },
        ]}
      />
      <ProviderActionPlan section="Home"/>
    </ProviderDashboard>
  );
}

function ProviderAssetsScreenV2() {
  const b = window.MOCK; const view = b.roleViews.provider;
  return (
    <ProviderDashboard
      section="Assets"
      title="Solar Asset Register"
      subtitle="Physical panel output separated from the portion residents prepaid for and consumed."
      actions={["Inspect output", "Meter proof", "Asset docs"]}
      hero={{
        label: 'Generated this month',
        value: pfmtKwh(view.generatedKwh),
        sub: `${pfmtKwh(view.monetizedKwh)} of that became sold solar.`,
      }}
    >
      <SectionBriefCard
        eyebrow="Provider · Assets"
        title="The asset view is physical first."
        body="It shows what the array generated, what became paid solar, and what evidence keeps the asset credible."
      />
      <SoldVsWaste headline="Generated → Sold → Waste"/>
      <RowsCard title="Asset proof packet" eyebrow="Physical proof"
        rows={[
          { label: 'Generated',     value: pfmtKwh(view.generatedKwh), note: 'Modeled monthly output from the installed array.' },
          { label: 'Monetized',     value: pfmtKwh(view.monetizedKwh), note: 'Prepaid solar allocation consumed by residents.', tone: 'good' },
          { label: 'Warranty docs', value: `${view.warrantyDocuments} files`, note: 'Supplier and equipment proof attached to this asset.' },
        ]}
      />
      <TruthCard
        title="Unsold output stays unpaid."
        body="Panels can generate more than the building monetizes. Wasted, curtailed, or free-exported kWh do not create provider payout."
      />
      <ProviderActionPlan section="Assets"/>
    </ProviderDashboard>
  );
}

function ProviderPerformanceScreenV2() {
  const b = window.MOCK; const view = b.roleViews.provider;
  return (
    <ProviderDashboard
      section="Performance"
      title="Utilization & Fallback"
      subtitle="A performance-only view of sold solar, unpaid waste, and grid fallback."
      actions={["Read utilization", "Waste reasons", "Fallback"]}
      hero={{
        label: 'Utilization',
        value: pfmtPct(view.utilization),
        sub: `${pfmtKwh(view.monetizedKwh)} of ${pfmtKwh(view.generatedKwh)} generated solar was monetized.`,
      }}
    >
      <SectionBriefCard
        eyebrow="Provider · Performance"
        title="Performance explains the gap."
        body="This screen keeps ownership and payout language out of the way so output quality is easy to read."
      />
      <BigMetric label="Utilization" value={pfmtPct(view.utilization)} detail="Sold kWh divided by generated kWh."/>
      <SoldVsWaste headline="Sold solar vs the rest"/>
      <ProviderPerformanceFlow
        sold={pfmtKwh(view.monetizedKwh)}
        waste={pfmtKwh(view.wasteKwh)}
        grid={pfmtKwh(view.gridFallbackKwh)}
      />
      <RowsCard title="Performance notes" eyebrow="Performance"
        rows={[
          { label: 'Sold solar',   value: pfmtKwh(view.monetizedKwh),  note: 'Prepaid demand absorbed this portion.', tone: 'good' },
          { label: 'Waste',        value: pfmtKwh(view.wasteKwh),      note: 'Visible for operations; not a revenue event.', tone: view.wasteKwh > 0 ? 'warn' : 'good' },
          { label: 'Grid fallback', value: pfmtKwh(view.gridFallbackKwh), note: 'Demand not covered by solar or battery.', tone: view.gridFallbackKwh > 0 ? 'bad' : 'good' },
        ]}
      />
      <TruthCard
        title="No payout on unused energy."
        body="Generated, wasted, curtailed, or free-exported energy stays outside settlement until prepaid building demand monetizes it."
      />
      <ProviderActionPlan section="Performance"/>
    </ProviderDashboard>
  );
}

function ProviderEarningsScreenV2() {
  const b = window.MOCK; const view = b.roleViews.provider;
  return (
    <ProviderDashboard
      section="Earnings"
      title="Monetized Solar Payout"
      subtitle="Payout basis only: prepaid solar consumed by residents, provider pool, and excluded output."
      actions={["Track payout", "Revenue basis", "Excluded output"]}
      hero={{
        label: 'Monthly provider payout',
        value: pfmtKes(view.monthlyPayoutKes),
        sub: 'Projected from monetized solar and retained provider ownership.',
      }}
    >
      <SectionBriefCard
        eyebrow="Provider · Earnings"
        title="Earnings start with monetized kWh."
        body="The screen keeps the settlement basis explicit so generation never looks like automatic revenue."
      />
      <SettlementWaterfall role="provider"/>
      <SoldVsWaste headline="Provider payout = sold kWh"/>
      <BigMetric label="Monthly provider payout" value={pfmtKes(view.monthlyPayoutKes)}
        detail="Projected from monetized solar and retained provider ownership."/>
      <RowsCard title="Payout basis" eyebrow="Settlement"
        rows={[
          { label: 'Monetized kWh',    value: pfmtKwh(view.monetizedKwh),                  note: 'Prepaid solar consumed by residents.', tone: 'good' },
          { label: 'Provider pool',    value: pfmtKes(b.settlement.providerPool),           note: 'Provider-side pool before ownership split.' },
          { label: 'Retained rights',  value: pfmtPct(view.retainedOwnership),              note: 'Sold shares reduce this payout basis.' },
          { label: 'Excluded output', value: pfmtKwh(view.wasteKwh),                       note: 'Generated but unpaid energy is not counted.', tone: view.wasteKwh > 0 ? 'warn' : 'good' },
        ]}
      />
      <TruthCard title="No prepaid demand, no payout."
        body="If residents have not prepaid and consumed solar, provider earnings do not accrue even when panels generate energy."/>
      <ProviderActionPlan section="Earnings"/>
    </ProviderDashboard>
  );
}

function ProviderSharesScreenV2() {
  const b = window.MOCK; const view = b.roleViews.provider;
  return (
    <ProviderDashboard
      section="Shares"
      title="Provider Share Ledger"
      subtitle="Ownership changes only: retained rights, sold rights, and future cashflow impact."
      actions={["Review ledger", "Sale impact", "Retained rights"]}
      hero={{
        label: 'Retained provider rights',
        value: pfmtPct(view.retainedOwnership),
        sub: `${pfmtPct(view.soldOwnership)} sold; future payout follows the current ledger.`,
      }}
    >
      <SectionBriefCard
        eyebrow="Provider · Shares"
        title="Selling shares is a ledger event."
        body="This screen avoids asset output and deployment detail so the cashflow-rights impact is obvious."
      />
      <OwnershipLedgerEntry lens="provider"/>
      <OwnershipImpact
        retained={pfmtPct(view.retainedOwnership)}
        sold={pfmtPct(view.soldOwnership)}
      />
      <RowsCard title="Ledger controls" eyebrow="Ownership ledger"
        rows={[
          { label: 'Provider retained', value: pfmtPct(view.retainedOwnership), note: 'Future provider payout that remains with the provider.', tone: 'good' },
          { label: 'Sold to residents', value: pfmtPct(view.soldOwnership),     note: 'Future payout redirected away from the provider.',       tone: view.soldOwnership > 0 ? 'warn' : 'neutral' },
          { label: 'Retained payout',  value: pfmtKes(view.monthlyPayoutKes),   note: 'Projected against the current ledger only.' },
        ]}
      />
      <ProviderActionPlan section="Shares"/>
    </ProviderDashboard>
  );
}

function ProviderDeploymentScreenV2() {
  const b = window.MOCK; const view = b.roleViews.provider;
  const completeGates = view.deploymentGates.filter(g => g.complete).length;
  return (
    <ProviderDashboard
      section="Deployment"
      title="Readiness Gate Path"
      subtitle="DRS, supplier lock, installer lead, monitoring, and settlement trust before go-live."
      actions={["Review gates", "Supplier lock", "Go-live proof"]}
      hero={{
        label: 'DRS decision',
        value: b.drs.label,
        sub: `${completeGates}/${view.deploymentGates.length} gates ready · score ${b.drs.score}/100.`,
      }}
    >
      <SectionBriefCard
        eyebrow="Provider · Deployment"
        title="Deployment waits for readiness."
        body="This path is only about gates: what is ready, what is blocked, and what must clear before activation."
      />
      <GateList gates={view.deploymentGates} title="Provider deployment gates"/>
      <RowsCard title="Readiness basis" eyebrow="DRS and field proof"
        rows={[
          { label: 'DRS decision',    value: b.drs.label, note: `Score ${Math.round(b.drs.score)} with ${completeGates}/${view.deploymentGates.length} gates ready.`, tone: b.drs.decision === 'approve' ? 'good' : b.drs.decision === 'review' ? 'warn' : 'bad' },
          { label: 'Demand coverage', value: pfmtPct(b.energy.utilization), note: 'Demand below 60% blocks deployment.', tone: b.energy.utilization >= 0.6 ? 'good' : 'bad' },
          { label: 'Supplier quote',  value: b.project.drs.hasVerifiedSupplierQuote ? 'locked' : 'missing', note: 'Supplier lock requires verified BOM and quote.', tone: b.project.drs.hasVerifiedSupplierQuote ? 'good' : 'bad' },
          { label: 'Installer lead',  value: b.project.drs.hasCertifiedLeadElectrician ? 'assigned' : 'missing', note: 'A certified lead is required before scheduling.', tone: b.project.drs.hasCertifiedLeadElectrician ? 'good' : 'bad' },
          { label: 'Monitoring',      value: view.monitoringStatus, note: 'Unresolved monitoring connectivity blocks go-live.', tone: b.project.drs.monitoringConnectivityResolved ? 'good' : 'bad' },
        ]}
      />
      <TruthCard
        title="Go-live waits for readiness."
        body="DRS gates capital release, supplier lock, installer scheduling, and activation. Provider assets should not be treated as live before those gates clear."
        tone={b.drs.decision === 'approve' ? 'good' : 'warn'}
      />
      <ProviderActionPlan section="Deployment"/>
    </ProviderDashboard>
  );
}

function ProviderMaintenanceScreenV2() {
  const b = window.MOCK; const view = b.roleViews.provider;
  return (
    <ProviderDashboard
      section="Maintenance"
      title="Monitoring & Warranty"
      subtitle="Service status only: connectivity, warranty evidence, and unresolved provider tickets."
      actions={["Open tickets", "Warranty docs", "Monitoring"]}
      hero={{
        label: 'Monitoring',
        value: view.monitoringStatus,
        sub: 'Connectivity must remain trusted before live settlement can continue.',
      }}
    >
      <SectionBriefCard
        eyebrow="Provider · Maintenance"
        title="Maintenance keeps proof intact."
        body="This screen is intentionally operational: monitoring continuity, warranty files, and ticket count."
      />
      <BigMetric label="Monitoring" value={view.monitoringStatus}
        detail="Connectivity must remain trusted before live settlement can continue."/>
      <RowsCard title="Support packet" eyebrow="Warranty and tickets"
        rows={[
          { label: 'Warranty documents', value: `${view.warrantyDocuments} files`,     note: 'Equipment proof stays attached to the active provider asset.' },
          { label: 'Open tickets',       value: `${view.openMaintenanceTickets}`,       note: 'Tickets cover monitoring, warranty, and service follow-up.', tone: view.openMaintenanceTickets > 0 ? 'warn' : 'good' },
          { label: 'Settlement trust',   value: b.project.drs.settlementDataTrusted ? 'trusted' : 'paused', note: 'Untrusted settlement data blocks go-live or active payout.', tone: b.project.drs.settlementDataTrusted ? 'good' : 'bad' },
        ]}
      />
      <TruthCard
        title={view.openMaintenanceTickets > 0 ? 'Tickets can pause confidence.' : 'No open provider tickets.'}
        body={view.openMaintenanceTickets > 0
          ? 'Open maintenance work needs resolution before providers should treat the asset as fully reliable.'
          : 'Monitoring and warranty proof are in place, so the provider asset has no visible service blockers.'}
        tone={view.openMaintenanceTickets > 0 ? 'warn' : 'good'}
      />
      <ProviderActionPlan section="Maintenance"/>
    </ProviderDashboard>
  );
}

window.ProviderHomeScreenV2        = ProviderHomeScreenV2;
window.ProviderAssetsScreenV2      = ProviderAssetsScreenV2;
window.ProviderPerformanceScreenV2 = ProviderPerformanceScreenV2;
window.ProviderEarningsScreenV2    = ProviderEarningsScreenV2;
window.ProviderSharesScreenV2      = ProviderSharesScreenV2;
window.ProviderDeploymentScreenV2  = ProviderDeploymentScreenV2;
window.ProviderMaintenanceScreenV2 = ProviderMaintenanceScreenV2;
