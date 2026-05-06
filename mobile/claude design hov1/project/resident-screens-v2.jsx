// ─────────────────────────────────────────────────────────────
// resident-screens-v2.jsx — faithful HTML port of components/resident/*
// Each function returns the screen content; mount inside a Phone bezel.
// ─────────────────────────────────────────────────────────────

const fmtKes = (v) => `KSh ${Math.round(v).toLocaleString()}`;
const fmtKwh = (v) => `${Math.round(v).toLocaleString()} kWh`;
const fmtPct = (v) => `${Math.round(v * 100)}%`;

function ResidentHomeScreenV2() {
  const b = window.MOCK; const view = b.roleViews.resident;
  const hasBalance = view.prepaidBalanceKes > 0;
  return (
    <ScreenShell
      section="Home"
      roleLabel="resident workspace"
      title="Today at Home"
      subtitle="A calm snapshot of prepaid balance, local solar coverage, and savings for this household."
      actions={["Top up", "See flow", "Review saving"]}
      hero={{
        label: 'Prepaid solar balance',
        value: fmtKes(view.prepaidBalanceKes),
        sub: `${fmtKwh(view.monthlySolarKwh)} sold solar has been available to this home this month.`,
      }}
    >
      <BuildingPulse role="resident"/>
      <KillSwitchBanner/>
      <KpiRow items={[
        { label: 'Coverage', value: fmtPct(view.solarCoverage), note: 'Local solar share' },
        { label: 'Savings',  value: fmtKes(view.savingsKes),   note: 'Projected vs grid' },
        { label: 'Balance',  value: hasBalance ? 'Ready' : 'Top up', note: hasBalance ? 'Solar can allocate' : 'Solar blocked' },
      ]}/>
      <BigMetric label="Household balance" value={fmtKes(view.averagePrepaidBalanceKes)}
        detail={`${b.project.name} residents are shown with mock averaged wallet values so private household finances stay hidden.`}/>
      <GlassCard>
        <Label>Daily rhythm</Label>
        <div style={{ color: KIT.text, letterSpacing: '-0.02em', fontWeight: 600, fontSize: 17, letterSpacing: '-0.02em', marginTop: 5, lineHeight: 1.15 }}>
          Solar carries the day when tokens are funded
        </div>
        <ProgressBar label="Home solar cover" value={view.solarCoverage}
          caption="Coverage is capped to sold solar. Grid fallback remains separate from e.mappa prepaid balance."/>
      </GlassCard>
      <BigMetric label="Building context" value={`${b.project.units} homes`}
        detail={`${b.project.name} is shown as a privacy-safe resident view for ${b.project.locationBand}.`}/>
      <SettlementWaterfall role="resident"/>
    </ScreenShell>
  );
}

function ResidentWalletScreenV2() {
  const b = window.MOCK; const view = b.roleViews.resident;
  const expectedTopUp = Math.max(500, Math.round(view.savingsKes * 1.4));
  const fundedRatio = Math.min(1, view.prepaidBalanceKes / Math.max(1, view.averagePrepaidBalanceKes + expectedTopUp));
  return (
    <ScreenShell
      section="Wallet"
      roleLabel="resident workspace"
      title="Token Wallet"
      subtitle="A prepaid token artefact for top-ups and allocation guardrails. No credit, no hidden debt."
      actions={["Top up tokens", "See guard", "History"]}
      hero={{
        label: 'Available tokens',
        value: fmtKes(view.prepaidBalanceKes),
        sub: 'Cash-cleared tokens are the only way this resident session can receive sold solar.',
      }}
    >
      <BuildingPulse role="resident"/>
      <KillSwitchBanner/>
      <TokenArtifact balance={fmtKes(view.prepaidBalanceKes)} topUp={fmtKes(expectedTopUp)} fundedRatio={fundedRatio}/>
      <GlassCard>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}>
          <div style={{ flex: 1 }}>
            <Label>Token checkout</Label>
            <div style={{ color: KIT.text, letterSpacing: '-0.02em', fontWeight: 600, fontSize: 17, marginTop: 5 }}>Add prepaid solar tokens</div>
            <div style={{ color: KIT.muted, fontSize: 12, lineHeight: 1.5, marginTop: 6 }}>The demo checkout keeps wallet action separate from usage and ownership education.</div>
          </div>
          <Pill tone="good">prepaid</Pill>
        </div>
        <button style={{
          marginTop: 12, width: '100%', padding: '11px 14px',
          borderRadius: 999, border: 'none',
          background: KIT.graphite, color: '#fff',
          fontSize: 12, fontWeight: 600, cursor: 'pointer',
        }}>Top up tokens</button>
      </GlassCard>
      <BriefCard
        eyebrow="Prepaid-only rule"
        title="No prepaid cash, no solar allocation."
        body="The wallet protects the resident from hidden debt and protects the building economy from unpaid solar claims."
        rows={[
          { label: 'Cash clears first',     value: 'required', note: 'Tokens are usable only after top-up confirmation.', tone: 'good' },
          { label: 'Solar must be sold',    value: 'required', note: 'Unused, curtailed, or free-exported energy creates no claim.' },
          { label: 'Zero balance behavior', value: 'blocked',  note: 'The app should show grid fallback instead of allocating unpaid solar.', tone: 'warn' },
        ]}
      />
    </ScreenShell>
  );
}

function ResidentUsageScreenV2() {
  const b = window.MOCK; const view = b.roleViews.resident;
  const householdGridKwh    = b.energy.E_grid / b.project.units;
  const householdBatteryKwh = b.energy.E_battery_used / b.project.units;
  return (
    <ScreenShell
      section="Usage"
      roleLabel="resident workspace"
      title="Energy Flow"
      subtitle="A visual source map only: solar, stored support, and grid fallback without wallet or ownership repetition."
      actions={["View source map", "Check fallback", "Read kWh"]}
      hero={{
        label: 'Solar coverage',
        value: fmtPct(view.solarCoverage),
        sub: `${fmtKwh(view.monthlySolarKwh)} sold solar moved through this household flow.`,
      }}
    >
      <BuildingPulse role="resident"/>
      <KillSwitchBanner/>
      <TariffComparison/>
      <EnergyFlowGraphic
        coverage={view.solarCoverage}
        solar={fmtKwh(view.monthlySolarKwh)}
        battery={fmtKwh(householdBatteryKwh)}
        grid={fmtKwh(householdGridKwh)}
      />
      <FlowLane steps={[
        { label: 'Solar allocation', value: fmtKwh(view.monthlySolarKwh), detail: 'Prepaid tokens are matched against monetized local solar first.', color: KIT.foxOrange },
        { label: 'Battery support',  value: fmtKwh(householdBatteryKwh),  detail: 'Stored solar smooths the day when direct sunlight is not available.', color: KIT.amber },
        { label: 'Grid fallback',    value: fmtKwh(householdGridKwh),     detail: 'Grid covers the remaining load without becoming an e.mappa postpaid balance.', color: KIT.muted },
      ]}/>
    </ScreenShell>
  );
}

function ResidentOwnershipScreenV2() {
  const b = window.MOCK; const view = b.roleViews.resident;
  const residentPayout = 1850;
  return (
    <ScreenShell
      section="Ownership"
      roleLabel="resident workspace"
      title="Ownership Lessons"
      subtitle="Future cashflow education with caveats up front. Residents can use prepaid solar without buying shares."
      actions={["Learn shares", "Read caveat", "Decide later"]}
      hero={{
        label: 'Resident-owned share',
        value: fmtPct(view.ownedProviderShare),
        sub: 'Optional resident pool share of future provider-side cashflows in this demo building.',
      }}
    >
      <BuildingPulse role="resident"/>
      <KillSwitchBanner/>
      <OwnershipLedgerEntry lens="resident"/>
      <OwnershipPrimer share={fmtPct(view.ownedProviderShare)} payout={fmtKes(residentPayout)}/>
      <BriefCard
        eyebrow="Payout truth"
        title="Payout only follows monetized solar."
        body="This screen avoids guaranteed-return language and keeps ownership separate from usage or wallet views."
        rows={[
          { label: 'Future cashflows',   value: 'after buy',     note: 'Share changes apply to future payout periods after payment clears.', tone: 'good' },
          { label: 'No payout from waste', value: 'blocked',     note: 'Generated, wasted, curtailed, or free-exported energy does not create payout.', tone: 'warn' },
          { label: 'Ownership transfer', value: 'proportional', note: "A seller's future payout reduces by the share they sell." },
        ]}
      />
    </ScreenShell>
  );
}

function ResidentProfileScreenV2() {
  const b = window.MOCK;
  const trustReady = b.project.prepaidCommittedKes > 0 && b.drs.reasons.length === 0;
  return (
    <ScreenShell
      section="Profile"
      roleLabel="resident workspace"
      title="Resident Pass"
      subtitle="A trust card for building membership, privacy boundaries, and resident-only access."
      actions={["Verify building", "Read privacy", "Trust status"]}
      hero={{
        label: 'Verified building',
        value: b.project.name,
        sub: `${b.project.units} homes in ${b.project.locationBand}. Resident-only session.`,
      }}
    >
      <BuildingPulse role="resident"/>
      <KillSwitchBanner/>
      <IdentityCard
        buildingName={b.project.name}
        location={b.project.locationBand}
        units={b.project.units}
        trustReady={trustReady}
        privacyNote={b.transparency.privacyNote}
      />
      <TrustList title="What is verified" items={[
        { label: 'Building access',   detail: 'Access is scoped to this building and this resident session.', status: 'scoped',  tone: 'good' },
        { label: 'Privacy averaging', detail: `Resident benchmarks are described across ${b.project.units} homes without exposing neighbors.`, status: 'private' },
        { label: 'Settlement data',   detail: 'Residents see household outcomes and benchmarks, not private counterparty finances.', status: b.drs.reasons.length === 0 ? 'trusted' : 'review', tone: b.drs.reasons.length === 0 ? 'good' : 'warn' },
      ]}/>
    </ScreenShell>
  );
}

function ResidentSupportScreenV2() {
  const b = window.MOCK; const view = b.roleViews.resident;
  const hasBlocker = b.drs.reasons.length > 0;
  return (
    <ScreenShell
      section="Support"
      roleLabel="resident workspace"
      title="Support Triage"
      subtitle="A simple resident help surface: choose the issue type, then keep the answer inside this household app."
      actions={["Wallet issue", "Power issue", "Share question"]}
      hero={{
        label: 'Support status',
        value: 'Start here',
        sub: `${fmtKes(view.prepaidBalanceKes)} token balance is available for wallet-related context.`,
      }}
    >
      <BuildingPulse role="resident"/>
      <KillSwitchBanner/>
      <SupportTriage
        items={[
          { label: 'Wallet', detail: 'Top-up, missing token, or allocation blocked.',  status: 'money' },
          { label: 'Power',  detail: 'Solar unavailable, battery support, or grid fallback.', status: 'energy' },
          { label: 'Shares', detail: 'Optional ownership and payout caveat questions.', status: 'learn' },
        ]}
        hasBlocker={hasBlocker}
        blocker={b.drs.reasons[0]}
      />
    </ScreenShell>
  );
}

window.ResidentHomeScreenV2      = ResidentHomeScreenV2;
window.ResidentWalletScreenV2    = ResidentWalletScreenV2;
window.ResidentUsageScreenV2     = ResidentUsageScreenV2;
window.ResidentOwnershipScreenV2 = ResidentOwnershipScreenV2;
window.ResidentProfileScreenV2   = ResidentProfileScreenV2;
window.ResidentSupportScreenV2   = ResidentSupportScreenV2;
