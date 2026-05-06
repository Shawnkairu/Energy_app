// ─────────────────────────────────────────────────────────────
// owner-screens-v2.jsx — faithful HTML port of components/owner/*
// ─────────────────────────────────────────────────────────────

const ofmtKes = (v) => `KSh ${Math.round(v).toLocaleString()}`;
const ofmtPct = (v) => `${Math.round(v * 100)}%`;
const stageLabel = (s) => s.replace(/_/g, ' ').split(' ').map(w => w[0].toUpperCase() + w.slice(1)).join(' ');
const decTone = (d) => d === 'approve' ? 'good' : d === 'review' ? 'warn' : 'bad';

function OwnerHomeScreenV2() {
  const b = window.MOCK; const view = b.roleViews.owner;
  return (
    <ScreenShell
      section="Home"
      roleLabel="Owner private app"
      title="Building Command"
      subtitle="A calm owner snapshot for the building: current lane, resident trust, access obligations, and royalty context without DRS detail."
      actions={["Invite residents", "Confirm access", "Review handoff"]}
      ownerStyle
      hero={{
        label: b.project.name,
        value: stageLabel(b.project.stage),
        sub: `${b.project.units} units in ${b.project.locationBand}. Owner focus stays on demand, access, and clean partner handoffs.`,
        status: b.drs.decision,
        statusTone: decTone(b.drs.decision),
      }}
      activity={b.activity}
    >
      <BuildingPulse role="owner"/>
      <KillSwitchBanner/>
      <CommandCard
        buildingName={b.project.name}
        units={b.project.units}
        locationBand={b.project.locationBand}
        stage={stageLabel(b.project.stage)}
        decisionStatus={b.drs.decision}
        decisionTone={decTone(b.drs.decision)}
        participation={view.residentParticipation}
        prepaidMonths={view.prepaidMonthsCovered}
        gateText={`${view.gates.filter(g => g.complete).length}/${view.gates.length}`}
        royaltyText={ofmtKes(view.monthlyRoyaltyKes)}
      />
      <MiniGrid items={[
        { label: 'Participation', value: ofmtPct(view.residentParticipation), detail: 'Resident pre-onboarding signal.', tone: view.residentParticipation >= 0.8 ? 'good' : 'warn' },
        { label: 'Prepaid cover', value: `${view.prepaidMonthsCovered} mo`,    detail: 'Cash-backed demand before allocation.', tone: view.prepaidCoverage > 0 ? 'good' : 'bad' },
        { label: 'Royalty',       value: ofmtKes(view.monthlyRoyaltyKes),       detail: 'Projected from monetized solar only.' },
        { label: 'Benchmark',     value: ofmtKes(view.comparableMedianRoyaltyKes), detail: 'Anonymous comparable median.' },
      ]}/>
      <BriefCard
        eyebrow="Trust posture"
        title="Keep the owner lane focused and private."
        body="The home view avoids resident balances and detailed DRS math. It shows only the signals an owner can act on before the next handoff."
        rows={[
          { label: 'Resident trust', value: ofmtPct(view.residentParticipation), note: 'Use this snapshot to drive invitations and building communication before deployment.', tone: view.prepaidCoverage >= 0.8 ? 'good' : 'warn' },
          { label: 'Owner access',   value: b.project.drs.ownerPermissionsComplete ? 'ready' : 'needed', note: 'Inspection, roof, and meter-room access stay visible without turning home into a checklist.', tone: b.project.drs.ownerPermissionsComplete ? 'good' : 'bad' },
          { label: 'Private terms',  value: 'hidden', note: 'Benchmarks and public statuses are shown without exposing resident or counterparty finances.' },
        ]}
      />
      <WorkflowCard title="What needs owner attention" items={[
        { label: 'Invite the next resident cohort', detail: 'Participation is the cleanest owner-controlled signal before capital and installation move.', status: 'trust', tone: view.residentParticipation >= 0.8 ? 'good' : 'warn' },
        { label: 'Confirm building access',         detail: 'Keep inspection and installation access explicit so partner scheduling does not stall.', status: b.project.drs.ownerPermissionsComplete ? 'ready' : 'needed', tone: b.project.drs.ownerPermissionsComplete ? 'good' : 'bad' },
        { label: 'Review the deployment lane',      detail: 'Use Deployment for the timeline and DRS for readiness gates when deeper review is needed.', status: stageLabel(b.project.stage) },
      ]}/>
    </ScreenShell>
  );
}

function OwnerDrsScreenV2() {
  const b = window.MOCK; const view = b.roleViews.owner;
  const openGates = view.gates.filter(g => !g.complete);
  const components = [
    { label: 'Demand',  value: b.drs.components.demandCoverage,         tone: b.drs.components.demandCoverage >= 60 ? 'good' : 'bad' },
    { label: 'Prepaid', value: b.drs.components.prepaidCommitment,      tone: b.drs.components.prepaidCommitment > 0 ? 'good' : 'bad' },
    { label: 'Load',    value: b.drs.components.loadProfile,            tone: b.drs.components.loadProfile >= 65 ? 'good' : 'warn' },
    { label: 'Install', value: b.drs.components.installationReadiness,  tone: b.drs.components.installationReadiness >= 65 ? 'good' : 'warn' },
    { label: 'Labor',   value: b.drs.components.installerReadiness,     tone: b.drs.components.installerReadiness >= 65 ? 'good' : 'warn' },
    { label: 'Capital', value: b.drs.components.capitalAlignment,       tone: b.drs.components.capitalAlignment >= 65 ? 'good' : 'warn' },
  ];
  return (
    <ScreenShell
      section="DRS"
      roleLabel="Owner private app"
      title="Readiness Score"
      subtitle="Readiness only: the score, open gates, and kill switches that decide whether the building can advance."
      actions={["Resolve blockers", "Request inspection", "Review gates"]}
      ownerStyle
      hero={{
        label: 'Deployment readiness',
        value: `${b.drs.score}/100`,
        sub: `${b.drs.label}. Open blockers prevent premature deployment and go-live.`,
        status: b.drs.decision, statusTone: decTone(b.drs.decision),
      }}
      activity={b.activity}
    >
      <BuildingPulse role="owner"/>
      <KillSwitchBanner/>
      <ScoreArtifact
        score={b.drs.score} label={b.drs.label} decision={b.drs.decision}
        decisionTone={decTone(b.drs.decision)}
        components={components}
        blockers={null}
      />
      <MiniGrid items={[
        { label: 'Decision',     value: b.drs.decision, detail: 'Capital, supplier lock, installer scheduling, and go-live follow this gate.', tone: decTone(b.drs.decision) },
        { label: 'Open gates',   value: `${openGates.length}`, detail: openGates.length === 0 ? 'All deployment gates are ready.' : 'Resolve before activation.', tone: openGates.length === 0 ? 'good' : 'warn' },
        { label: 'Participation', value: ofmtPct(view.residentParticipation), detail: 'Demand below 60% blocks deployment.', tone: view.residentParticipation >= 0.6 ? 'good' : 'bad' },
        { label: 'Prepaid',      value: ofmtPct(view.prepaidCoverage), detail: 'No prepaid funds blocks deployment.', tone: view.prepaidCoverage > 0 ? 'good' : 'bad' },
      ]}/>
      <ProgressCard title="Weighted score inputs" rows={[
        { label: 'Demand coverage',   value: b.drs.components.demandCoverage,        detail: 'Resident demand signal used by DRS.',     tone: b.drs.components.demandCoverage >= 60 ? 'good' : 'bad' },
        { label: 'Prepaid commitment', value: b.drs.components.prepaidCommitment,    detail: 'Prepaid cash committed before allocation.', tone: b.drs.components.prepaidCommitment > 0 ? 'good' : 'bad' },
        { label: 'Load profile',       value: b.drs.components.loadProfile,           detail: 'Quality of building demand shape.',        tone: b.drs.components.loadProfile >= 65 ? 'good' : 'warn' },
        { label: 'Installation',       value: b.drs.components.installationReadiness, detail: 'Site and permission readiness.',           tone: b.drs.components.installationReadiness >= 65 ? 'good' : 'warn' },
        { label: 'Installer/labor',    value: b.drs.components.installerReadiness,    detail: 'Certified labor readiness.',               tone: b.drs.components.installerReadiness >= 65 ? 'good' : 'warn' },
        { label: 'Capital alignment',  value: b.drs.components.capitalAlignment,      detail: 'Named building capital progress.',         tone: b.drs.components.capitalAlignment >= 65 ? 'good' : 'warn' },
      ]}/>
      <GateList gates={view.gates} title="Activation gates"/>
      <BriefCard
        eyebrow="Kill switches"
        title="No active kill switches."
        body="DRS blocks deployment when demand, prepaid cash, certified labor, supplier proof, monitoring, settlement trust, or owner permission is not ready."
        rows={[{ label: 'Blocker', value: 'clear', note: 'No blocking readiness reasons returned.', tone: 'good' }]}
      />
    </ScreenShell>
  );
}

function OwnerEarningsScreenV2() {
  const b = window.MOCK; const view = b.roleViews.owner;
  return (
    <ScreenShell
      section="Earnings"
      roleLabel="Owner private app"
      title="Host Royalty"
      subtitle="A finance-light owner royalty view based only on monetized solar, anonymous benchmarks, and utilization risk."
      actions={["Review royalty", "Compare benchmark", "Check utilization"]}
      ownerStyle
      hero={{
        label: 'Projected host royalty',
        value: ofmtKes(view.monthlyRoyaltyKes),
        sub: 'Royalty follows prepaid, monetized solar only. Gross generation is not payout.',
        status: 'sold solar', statusTone: 'neutral',
      }}
      activity={b.activity}
    >
      <BuildingPulse role="owner"/>
      <KillSwitchBanner/>
      <SettlementWaterfall role="owner"/>
      <SoldVsWaste headline="Sold solar drives owner royalty"/>
      <RoyaltyCard
        royalty={ofmtKes(view.monthlyRoyaltyKes)}
        benchmark={ofmtKes(view.comparableMedianRoyaltyKes)}
        sold={`${Math.round(b.energy.E_sold).toLocaleString()}`}
        utilization={ofmtPct(b.energy.utilization)}
        waste={`${Math.round(b.energy.E_waste).toLocaleString()} kWh`}
      />
      <MiniGrid items={[
        { label: 'Monetized solar', value: `${Math.round(b.energy.E_sold).toLocaleString()} kWh`, detail: 'Sold through prepaid demand.', tone: 'good' },
        { label: 'Generated solar', value: `${Math.round(b.energy.E_gen).toLocaleString()} kWh`,  detail: 'Operational context, not payout.' },
        { label: 'Utilization',     value: ofmtPct(b.energy.utilization), detail: 'Royalty depends on absorbed solar demand.', tone: b.energy.utilization >= 0.75 ? 'good' : 'warn' },
        { label: 'Waste/curtailed', value: `${Math.round(b.energy.E_waste).toLocaleString()} kWh`, detail: 'Does not create owner payout.', tone: b.energy.E_waste > 0 ? 'warn' : 'good' },
      ]}/>
      <BriefCard
        eyebrow="Royalty truth"
        title="Royalty is a settlement outcome, not a generation claim."
        body="This screen separates sold solar from generated solar and frames the owner's payout against anonymous comparables without exposing private counterparty terms."
        rows={[
          { label: 'Payout basis', value: 'sold solar', note: 'Only monetized solar settlement creates owner royalty.', tone: 'good' },
          { label: 'Benchmark',    value: ofmtKes(view.comparableMedianRoyaltyKes), note: 'Comparable median is anonymized and should be read as context, not a guarantee.' },
          { label: 'Grid fallback', value: `${Math.round(b.energy.E_grid).toLocaleString()} kWh`, note: 'Grid fallback keeps residents served but does not expand host royalty.', tone: 'warn' },
        ]}
      />
      <WorkflowCard title="How to read the royalty" items={[
        { label: 'Start with sold kWh',  detail: 'Generated, wasted, curtailed, or free-exported energy does not create owner payout.', status: 'truth', tone: 'good' },
        { label: 'Compare anonymously', detail: 'Benchmarks show distributions without revealing private building or counterparty finances.', status: 'private' },
        { label: 'Improve participation', detail: 'Royalty grows only when prepaid resident demand absorbs more solar.', status: 'demand', tone: view.residentParticipation >= 0.8 ? 'good' : 'warn' },
      ]}/>
    </ScreenShell>
  );
}

function OwnerDeploymentScreenV2() {
  const b = window.MOCK; const view = b.roleViews.owner;
  const drs = b.project.drs;
  const readyGates = view.gates.filter(g => g.complete).length;
  return (
    <ScreenShell
      section="Deployment"
      roleLabel="Owner private app"
      title="Deployment Journey"
      subtitle="A timeline for owner access, resident readiness, supplier lock, installer proof, monitoring, and go-live."
      actions={["Confirm access", "Invite residents", "Track go-live"]}
      ownerStyle
      hero={{
        label: 'Current stage',
        value: stageLabel(b.project.stage),
        sub: `${b.project.name} advances only after readiness gates are cleared.`,
        status: b.drs.decision, statusTone: decTone(b.drs.decision),
      }}
      activity={b.activity}
    >
      <BuildingPulse role="owner"/>
      <KillSwitchBanner/>
      <MiniGrid items={[
        { label: 'Journey progress', value: `${readyGates}/${view.gates.length}`, detail: 'Required handoffs ready.', tone: readyGates === view.gates.length ? 'good' : 'warn' },
        { label: 'Residents',        value: ofmtPct(view.residentParticipation), detail: 'Pre-onboarding demand signal.', tone: view.residentParticipation >= 0.8 ? 'good' : 'warn' },
        { label: 'Supplier lock',    value: drs.hasVerifiedSupplierQuote ? 'locked' : 'pending', detail: 'BOM and quote proof before scheduling.', tone: drs.hasVerifiedSupplierQuote ? 'good' : 'bad' },
        { label: 'Installer proof',  value: drs.hasCertifiedLeadElectrician ? 'assigned' : 'missing', detail: 'Certified lead electrician is a deployment kill switch.', tone: drs.hasCertifiedLeadElectrician ? 'good' : 'bad' },
      ]}/>
      <BriefCard
        eyebrow="Go-live path"
        title="Activation is a sequence, not a status card."
        body="This screen keeps the owner oriented around the path to deployment: access first, demand next, partner proof, then monitored go-live."
        rows={[
          { label: 'Building access',     value: drs.ownerPermissionsComplete ? 'ready' : 'blocked', note: 'Inspection and installation access must be confirmed before the site can move.', tone: drs.ownerPermissionsComplete ? 'good' : 'bad' },
          { label: 'Resident onboarding', value: ofmtPct(view.residentParticipation), note: 'Owners drive resident pre-onboarding so demand exists before solar allocation.', tone: view.residentParticipation >= 0.6 ? 'good' : 'bad' },
          { label: 'Monitoring',          value: drs.monitoringConnectivityResolved ? 'online' : 'blocked', note: 'Unresolved monitoring connectivity blocks go-live even if installation is complete.', tone: drs.monitoringConnectivityResolved ? 'good' : 'bad' },
        ]}
      />
      <JourneyCard title="Owner and partner handoffs" items={[
        { label: 'Access window',         detail: 'Keep permission, rooftop access, and meter room availability explicit.', status: drs.ownerPermissionsComplete ? 'ready' : 'blocked', tone: drs.ownerPermissionsComplete ? 'good' : 'bad' },
        { label: 'Resident pre-onboarding', detail: 'Deployment should not move ahead of prepaid demand.', status: view.residentParticipation >= 0.6 ? 'qualified' : 'short', tone: view.residentParticipation >= 0.6 ? 'good' : 'bad' },
        { label: 'Supplier lock',         detail: 'BOM and quote proof are required before installer scheduling.', status: drs.hasVerifiedSupplierQuote ? 'locked' : 'pending', tone: drs.hasVerifiedSupplierQuote ? 'good' : 'warn' },
        { label: 'Installer assignment',  detail: 'Certified labor must be assigned before installation can start.', status: drs.hasCertifiedLeadElectrician ? 'assigned' : 'missing', tone: drs.hasCertifiedLeadElectrician ? 'good' : 'bad' },
        { label: 'Monitoring go-live',    detail: 'Connectivity and settlement trust must be clean before activation.', status: drs.monitoringConnectivityResolved ? 'online' : 'blocked', tone: drs.monitoringConnectivityResolved ? 'good' : 'bad' },
      ]}/>
    </ScreenShell>
  );
}

window.OwnerHomeScreenV2       = OwnerHomeScreenV2;
window.OwnerDrsScreenV2        = OwnerDrsScreenV2;
window.OwnerEarningsScreenV2   = OwnerEarningsScreenV2;
window.OwnerDeploymentScreenV2 = OwnerDeploymentScreenV2;
