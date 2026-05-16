// ─────────────────────────────────────────────────────────────
// financier-screens-v2.jsx — faithful HTML port of components/financier/*
// ─────────────────────────────────────────────────────────────

const ffmtKes = (v) => `KSh ${Math.round(v).toLocaleString()}`;
const ffmtPct = (v) => `${Math.round(v * 100)}%`;

function FinancierHomeScreenV2() {
  const b = window.MOCK; const view = b.roleViews.financier;
  return (
    <ScreenShell
      section="Home"
      roleLabel="financier workspace"
      title="Financier Deal Room"
      subtitle="A calm overview of the active named building raise, readiness gate, and next underwriting move."
      actions={["Open deal room", "Review DRS", "Track recovery"]}
      hero={{
        label: 'Active deal room',
        value: b.project.name,
        sub: 'Capital and recovery stay tied to this building.',
      }}
    >
      <BuildingPulse role="financier"/>
      <KillSwitchBanner/>
      <StatusRail items={[
        { label: 'Committed',   value: ffmtKes(view.committedCapitalKes), note: 'To primary named deal.', tone: 'neutral' },
        { label: 'Progress',    value: ffmtPct(view.fundingProgress),     note: `${ffmtKes(view.remainingCapitalKes)} remaining.`, tone: 'good' },
        { label: 'DRS',         value: `${b.drs.score}/100`,               note: b.drs.label, tone: 'good' },
      ]}/>
      <BriefCard
        eyebrow="Deal room"
        title="Named building, named risk."
        body="Capital is committed to the building shown here, not a pooled vehicle. Readiness and recovery stay legible at every step."
        rows={[
          { label: 'Site',    value: b.project.locationBand, note: `${b.project.units} apartments under one named raise.` },
          { label: 'Stage',   value: b.project.stage, note: 'Building advances only after readiness gates clear.' },
          { label: 'Capital', value: ffmtKes(view.committedCapitalKes), note: `${ffmtPct(view.fundingProgress)} funded; ${ffmtKes(view.remainingCapitalKes)} remaining to close.` },
        ]}
      />
      <WorkflowCard eyebrow="Next deal-room moves" title="Underwriting plan" items={[
        { label: 'Confirm named exposure', detail: 'Capital is committed to the building shown here, not a pooled vehicle.', status: 'named', tone: 'good' },
        { label: 'Review readiness',       detail: 'DRS and kill switches determine when capital can move.',                  status: 'DRS' },
        { label: 'Watch recovery',         detail: 'Recovery cases use monetized prepaid solar and remain ranges.',           status: 'range' },
      ]}/>
    </ScreenShell>
  );
}

function FinancierDealsScreenV2() {
  const b = window.MOCK; const view = b.roleViews.financier;
  return (
    <ScreenShell
      section="Deals"
      roleLabel="financier workspace"
      title="Named Building Deals"
      subtitle="A compact pipeline of building-specific raises, sorted around readiness and remaining capital."
      actions={["Browse deals", "Compare DRS", "Review raise"]}
      hero={{
        label: 'Active raises',
        value: `${b.projects.length}`,
        sub: 'Sorted by readiness and remaining capital.',
      }}
    >
      <BuildingPulse role="financier"/>
      <KillSwitchBanner/>
      <DealPipeline projects={b.projects}/>
      <BriefCard
        eyebrow="Screening focus"
        title="Funding follows readiness, not deal hype."
        body="The deal list keeps DRS, prepaid demand, supplier readiness, and the remaining raise in front of the financier before any commitment."
        rows={[
          { label: 'Current lead',     value: b.project.name, note: `${b.project.locationBand}; ${b.project.units} apartments.` },
          { label: 'Funding progress', value: ffmtPct(view.fundingProgress), note: `${ffmtKes(view.remainingCapitalKes)} remains to close this raise.` },
          { label: 'DRS gate',         value: `${b.drs.score}/100`, note: b.drs.label },
        ]}
      />
    </ScreenShell>
  );
}

function FinancierDealDetailScreenV2() {
  const b = window.MOCK;
  const components = [
    { label: 'Demand',  value: b.drs.components.demandCoverage,         tone: 'good' },
    { label: 'Prepaid', value: b.drs.components.prepaidCommitment,      tone: 'good' },
    { label: 'Load',    value: b.drs.components.loadProfile,            tone: 'good' },
    { label: 'Install', value: b.drs.components.installationReadiness,  tone: 'good' },
    { label: 'Labor',   value: b.drs.components.installerReadiness,     tone: 'good' },
    { label: 'Capital', value: b.drs.components.capitalAlignment,       tone: 'good' },
  ];
  return (
    <ScreenShell
      section="Deal Detail"
      roleLabel="financier workspace"
      title="Deal Diligence"
      subtitle="Evidence, release gates, and downside cases for one building before any capital movement."
      actions={["Review evidence", "Stress cases", "Milestones"]}
      hero={{
        label: 'Diligence target',
        value: b.project.name,
        sub: `${b.project.locationBand} · ${b.project.units} apartments.`,
      }}
    >
      <BuildingPulse role="financier"/>
      <KillSwitchBanner/>
      <ScoreArtifact
        score={b.drs.score} label={b.drs.label} decision={b.drs.decision} decisionTone="good"
        components={components} blockers={null}
      />
      <SoldVsWaste headline="What this deal earns from"/>
      <DiligenceCard items={[
        { label: 'Owner permission',  detail: 'Inspection, roof access, and meter-room access confirmed.', status: 'verified', tone: 'good' },
        { label: 'Resident demand',   detail: '84% participation; 2 prepaid months committed.',           status: 'qualified', tone: 'good' },
        { label: 'Provider lock',     detail: 'BOM and quote proof attached on PO-221, PO-226, PO-229.',  status: 'locked',   tone: 'good' },
        { label: 'Electrician lead',    detail: 'Certified lead electrician assigned and bound to site.',    status: 'assigned', tone: 'good' },
        { label: 'Monitoring',        detail: 'Heartbeat and inverter feed online; readings trusted.',     status: 'online',   tone: 'good' },
      ]}/>
      <BriefCard
        eyebrow="Milestones"
        title="Capital release schedule"
        body="Capital is released against verified milestones, not against time."
        rows={[
          { label: 'Tranche 1', value: 'released', note: 'Site survey, owner permission, provider lock.', tone: 'good' },
          { label: 'Tranche 2', value: 'pending',  note: 'Electrician scheduling and BOM delivery proof.',  tone: 'warn' },
          { label: 'Tranche 3', value: 'queued',   note: 'Monitoring online and first settlement run.' },
        ]}
      />
      <RiskCaseCard cases={[
        { label: 'Low',  value: ffmtKes(54000),  note: 'Demand 60% · waste 8%',  tone: 'warn' },
        { label: 'Base', value: ffmtKes(88000),  note: 'Demand 75% · waste 3%',  tone: 'good' },
        { label: 'High', value: ffmtKes(112000), note: 'Demand 88% · waste 1%',  tone: 'good' },
      ]}/>
    </ScreenShell>
  );
}

function FinancierPortfolioScreenV2() {
  const b = window.MOCK; const view = b.roleViews.financier;
  return (
    <ScreenShell
      section="Portfolio"
      roleLabel="financier workspace"
      title="Recovery Portfolio"
      subtitle="Named exposure and projected recovery bands, kept separate from deal-room diligence."
      actions={["Track exposure", "Recovery ranges", "Review deals"]}
      hero={{
        label: 'Total committed',
        value: ffmtKes(view.committedCapitalKes),
        sub: `${ffmtKes(view.monthlyRecoveryKes)} projected monthly recovery from the active building.`,
      }}
    >
      <BuildingPulse role="financier"/>
      <KillSwitchBanner/>
      <StatusRail items={[
        { label: 'Exposure', value: ffmtKes(view.committedCapitalKes), note: 'Committed to primary named deal.', tone: 'neutral' },
        { label: 'Recovery', value: ffmtKes(view.monthlyRecoveryKes),  note: 'Projected monthly waterfall.',     tone: 'good' },
      ]}/>
      <DealPipeline projects={b.projects}/>
      <SettlementWaterfall role="financier"/>
      <RiskCaseCard cases={[
        { label: 'Low',  value: ffmtKes(54000),  note: 'Curtailment heavy month',         tone: 'warn' },
        { label: 'Base', value: ffmtKes(view.monthlyRecoveryKes), note: 'Median building outcome', tone: 'good' },
        { label: 'High', value: ffmtKes(112000), note: 'Full demand absorption',          tone: 'good' },
      ]}/>
    </ScreenShell>
  );
}

window.FinancierHomeScreenV2       = FinancierHomeScreenV2;
window.FinancierDealsScreenV2      = FinancierDealsScreenV2;
window.FinancierDealDetailScreenV2 = FinancierDealDetailScreenV2;
window.FinancierPortfolioScreenV2  = FinancierPortfolioScreenV2;
