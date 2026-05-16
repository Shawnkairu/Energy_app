// ─────────────────────────────────────────────────────────────
// proposed-flow-screens.jsx — wireframes for spec-required screens
// that aren't yet in components/. All marked with the same amber
// "Proposed" ribbon as owner-proposed-screens.jsx.
//
// Adds, by spec:
//   Resident: Join (QR), Verify (OTP)
//   Provider: Projects, Commit capacity, Accept terms
//   Financier: Tranche release
//   Electrician: Jobs inbox
// ─────────────────────────────────────────────────────────────

// (Reuses ProposedScreen / ProposedRibbon / WirePlaceholder / WireField
//  from owner-proposed-screens.jsx, which loads first.)

// ── RESIDENT ──────────────────────────────────────────────────
function ResidentJoinScreen() {
  return (
    <ProposedScreen>
      <ScreenShell
        section="Join"
        roleLabel="resident workspace"
        title="Join your Building"
        subtitle="Scan the building's QR code or enter the join code your owner shared. One household, one resident session."
        actions={["Scan QR", "Enter code", "Why join?"]}
        hero={{
          label: 'Step 1 of 3',
          value: 'Scan QR',
          sub: 'Owner posts a QR in the lobby and shares a 6-digit code via building messaging.',
          status: 'unverified', statusTone: 'warn',
        }}
      >
        <BuildingPulse role="resident"/>
        <GlassCard>
          <Label>Scan or enter code</Label>
          <div style={{ color: KIT.text, fontSize: 17, fontWeight: 700, letterSpacing: '-0.02em', marginTop: 5 }}>Two ways in</div>
          <div style={{
            marginTop: 12, height: 200, borderRadius: 16,
            border: `1.5px dashed ${KIT.borderStrong}`, background: '#FAFAFB',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: KIT.muted, fontSize: 11, fontWeight: 600,
            letterSpacing: '0.08em', textTransform: 'uppercase',
          }}>QR scanner viewfinder</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '12px 0', color: KIT.muted, fontSize: 11 }}>
            <div style={{ flex: 1, height: 1, background: KIT.border }}/>
            or
            <div style={{ flex: 1, height: 1, background: KIT.border }}/>
          </div>
          <WireField label="Building join code" placeholder="6 digits" helper="Provided by your building owner or property manager."/>
        </GlassCard>
        <BriefCard
          eyebrow="Privacy"
          title="What e.mappa knows about you here."
          body="Joining only confirms you live in this building. Resident benchmarks are aggregated; neighbors never see your wallet."
          rows={[
            { label: 'Building scope',   value: 'this one only', note: 'Your session is bound to one building at a time.', tone: 'good' },
            { label: 'Phone',            value: 'verified next', note: 'Used for OTP and account recovery.' },
            { label: 'No credit check', value: 'never',          note: 'e.mappa is prepaid; nothing hits your credit.', tone: 'good' },
          ]}
        />
      </ScreenShell>
    </ProposedScreen>
  );
}

function ResidentVerifyScreen() {
  return (
    <ProposedScreen>
      <ScreenShell
        section="Verify"
        roleLabel="resident workspace"
        title="Verify your Phone"
        subtitle="A one-time code confirms this household account belongs to you. After verification, your prepaid wallet opens."
        actions={["Send code", "Use new number", "Help"]}
        hero={{
          label: 'Step 2 of 3',
          value: '+254 7•• ••• 412',
          sub: 'We will send a 6-digit code to this number. Standard SMS rates may apply.',
          status: 'awaiting OTP', statusTone: 'warn',
        }}
      >
        <GlassCard>
          <Label>One-time code</Label>
          <div style={{ color: KIT.text, fontSize: 17, fontWeight: 700, letterSpacing: '-0.02em', marginTop: 5 }}>Enter the 6-digit code</div>
          <div style={{ display: 'flex', gap: 6, marginTop: 12, justifyContent: 'space-between' }}>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} style={{
                flex: 1, height: 48, borderRadius: 10,
                border: `1px solid ${i === 0 ? KIT.text : KIT.border}`,
                background: KIT.white, display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: KIT.text, fontSize: 22, fontWeight: 700,
              }}>{i === 0 ? '4' : ''}</div>
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12 }}>
            <div style={{ color: KIT.muted, fontSize: 11 }}>Code expires in 4:32</div>
            <div style={{ color: KIT.text, fontSize: 11, fontWeight: 600 }}>Resend</div>
          </div>
        </GlassCard>
        <BriefCard
          eyebrow="What unlocks after verify"
          title="Three things start working."
          body="Verification opens a household session. Solar allocation still needs prepaid cash."
          rows={[
            { label: 'Wallet', value: 'open',     note: 'Top up to receive solar allocation.', tone: 'good' },
            { label: 'Usage',  value: 'visible',  note: 'See solar / battery / grid for your home.' },
            { label: 'Shares', value: 'optional', note: 'Browse but never required to use solar.' },
          ]}
        />
      </ScreenShell>
    </ProposedScreen>
  );
}

// ── PROVIDER ──────────────────────────────────────────────────
function ProviderProjectsScreen() {
  const projects = [
    { name: 'Riverside Apartments', units: 38, score: 78, capacity: '64 kW', residents: '84%', tone: 'good' },
    { name: 'Tatu Heights',          units: 56, score: 62, capacity: '92 kW', residents: '54%', tone: 'warn' },
    { name: 'Highridge Court',       units: 24, score: 84, capacity: '38 kW', residents: '91%', tone: 'good' },
    { name: 'Brookside Suites',      units: 42, score: 58, capacity: '70 kW', residents: '38%', tone: 'bad' },
  ];
  return (
    <ProposedScreen>
      <ScreenShell
        section="Projects"
        roleLabel="provider workspace"
        title="Qualified Projects"
        subtitle="DRS-cleared buildings looking for provider capacity. Each card shows demand, readiness, and the capacity needed."
        actions={["Filter by DRS", "Sort by demand", "Refresh"]}
        hero={{
          label: 'Open opportunities',
          value: '4',
          sub: 'Buildings with DRS ≥ 65 and verified resident demand.',
          status: 'qualified', statusTone: 'good',
        }}
      >
        <GlassCard>
          <Label>Marketplace</Label>
          <div style={{ color: KIT.text, fontSize: 17, fontWeight: 700, letterSpacing: '-0.02em', marginTop: 5 }}>Buildings looking for capacity</div>
          <div style={{ marginTop: 10 }}>
            {projects.map((p, i) => (
              <div key={i} style={{
                display: 'flex', gap: 10, padding: '11px 0',
                borderTop: i === 0 ? 'none' : `1px solid ${KIT.border}`,
              }}>
                <div style={{
                  width: 38, height: 38, borderRadius: 10,
                  background: KIT.panelSoft,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 14, fontWeight: 700, color: KIT.text,
                  flexShrink: 0,
                }}>{p.name.slice(0, 1)}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ color: KIT.text, fontSize: 12.5, fontWeight: 600 }}>{p.name}</div>
                  <div style={{ color: KIT.muted, fontSize: 10.5, marginTop: 2 }}>{p.units} units · capacity needed {p.capacity} · {p.residents} residents joined</div>
                </div>
                <Pill tone={p.tone}>DRS {p.score}</Pill>
              </div>
            ))}
          </div>
        </GlassCard>
        <BriefCard
          eyebrow="Selection rule"
          title="Qualify before you commit."
          body="Provider commitment is binding. Spend the time on a project's demand and gates before committing capacity."
          rows={[
            { label: 'Demand floor',  value: '60% min',     note: 'Below this, deployment is blocked.', tone: 'warn' },
            { label: 'Owner access',  value: 'required',     note: 'Inspection, roof, meter-room access must be confirmed.', tone: 'neutral' },
            { label: 'Settlement',    value: 'monetized',    note: 'Provider payout = sold kWh × pool share. No payout from waste.', tone: 'good' },
          ]}
        />
      </ScreenShell>
    </ProposedScreen>
  );
}

function ProviderCommitScreen() {
  return (
    <ProposedScreen>
      <ScreenShell
        section="Commit"
        roleLabel="provider workspace"
        title="Commit Capacity"
        subtitle="Reserve panel capacity to a named building. Commit is binding once accepted by the building owner."
        actions={["Reserve", "Cancel", "Open project"]}
        hero={{
          label: 'Reserving for',
          value: 'Riverside Apartments',
          sub: '38 units · DRS 78 · 84% resident participation. Capacity request: 64 kW.',
          status: 'pending owner approval', statusTone: 'warn',
        }}
      >
        <GlassCard>
          <Label>Capacity terms</Label>
          <div style={{ color: KIT.text, fontSize: 17, fontWeight: 700, letterSpacing: '-0.02em', marginTop: 5 }}>What you're committing</div>
          <div style={{ marginTop: 10 }}>
            <WireField label="Panel capacity reserved" placeholder="64 kW" helper="Sized to building demand. Edit only with owner approval."/>
            <WireField label="Battery sized" placeholder="80 kWh" helper="Smooths daily allocation; not part of the payout basis."/>
            <WireField label="Operating window" placeholder="3 years rolling" helper="Auto-renews unless both parties opt out at term end."/>
          </div>
        </GlassCard>
        <BriefCard
          eyebrow="What you accept"
          title="Three non-negotiables."
          body="These are the spec's settlement rules. They're not negotiated per deal."
          rows={[
            { label: 'Payout basis',   value: 'monetized solar', note: 'No payout from generated, wasted, curtailed, or free-exported energy.', tone: 'good' },
            { label: 'Demand-first',   value: 'always',           note: 'Capacity is sized to prepaid resident demand, not to fill the roof.', tone: 'good' },
            { label: 'Reserve cut',    value: '10% off the top',  note: 'Risk buffer paid before any provider payout.', tone: 'neutral' },
          ]}
        />
        <SettlementWaterfall role="provider"/>
      </ScreenShell>
    </ProposedScreen>
  );
}

function ProviderTermsScreen() {
  return (
    <ProposedScreen>
      <ScreenShell
        section="Terms"
        roleLabel="provider workspace"
        title="Accept Payout Terms"
        subtitle="Review the monetized-kWh payout terms for this named building. Sign once; live for the operating window."
        actions={["Accept all", "Request changes", "Open contract"]}
        hero={{
          label: 'For',
          value: 'Riverside Apartments',
          sub: 'After accepting, the provider lock window opens for BOM proof.',
          status: 'awaiting signature', statusTone: 'warn',
        }}
      >
        <BriefCard
          eyebrow="Term sheet"
          title="What you're signing."
          body="All numbers are taken from the deal room. Anonymized benchmarks visible; counterparty private rates are not."
          rows={[
            { label: 'Pool share',      value: '74% retained', note: '26% sold to residents in the resident pool. Future cashflows only.', tone: 'good' },
            { label: 'Monetized basis', value: 'sold kWh × tariff', note: 'Pool ÷ (provider stakes) × monetized solar. Recorded per period.', tone: 'good' },
            { label: 'Reserve',         value: '10%', note: 'Off the top, before any payout.', tone: 'neutral' },
            { label: 'Owner royalty',   value: '15% of pool', note: 'After reserve and financier recovery.', tone: 'neutral' },
            { label: 'Settlement cadence', value: 'monthly', note: 'Period closes on the last day; payout settles within 5 business days.', tone: 'good' },
          ]}
        />
        <SettlementWaterfall role="provider"/>
        <GlassCard>
          <Label>Signature</Label>
          <div style={{ color: KIT.text, fontSize: 17, fontWeight: 700, letterSpacing: '-0.02em', marginTop: 5 }}>One signer per provider account</div>
          <div style={{ color: KIT.muted, fontSize: 12, lineHeight: 1.5, marginTop: 6 }}>e.mappa records signature versions. Future amendments require a new signature.</div>
          <button style={{
            marginTop: 12, width: '100%', padding: '12px 14px',
            borderRadius: 999, border: 'none',
            background: KIT.graphite, color: '#fff',
            fontSize: 12, fontWeight: 600, cursor: 'pointer',
          }}>Accept and sign</button>
        </GlassCard>
      </ScreenShell>
    </ProposedScreen>
  );
}

// ── FINANCIER ─────────────────────────────────────────────────
function FinancierTrancheScreen() {
  return (
    <ProposedScreen>
      <ScreenShell
        section="Tranche"
        roleLabel="financier workspace"
        title="Release a Tranche"
        subtitle="Capital is released by milestone, not by date. Confirm the next tranche only after the upstream gate clears."
        actions={["Release", "Hold", "Open evidence"]}
        hero={{
          label: 'Next tranche',
          value: 'KSh 850,000',
          sub: 'Tranche 2 of 3. Releases when provider lock + electrician scheduling are both verified.',
          status: 'gate pending', statusTone: 'warn',
        }}
      >
        <BriefCard
          eyebrow="Milestone-based release"
          title="Three tranches, three gates."
          body="Recovery follows milestones, not time. A tranche is a contract — once released, it cannot be clawed back."
          rows={[
            { label: 'Tranche 1', value: 'released',         note: 'Site survey + owner permission + supplier shortlist.', tone: 'good' },
            { label: 'Tranche 2', value: 'gate pending',     note: 'Awaiting verified supplier BOM + electrician scheduling.', tone: 'warn' },
            { label: 'Tranche 3', value: 'queued',           note: 'Awaiting monitoring online + first settlement run.',     tone: 'neutral' },
          ]}
        />
        <GlassCard>
          <Label>Release form</Label>
          <div style={{ color: KIT.text, fontSize: 17, fontWeight: 700, letterSpacing: '-0.02em', marginTop: 5 }}>Confirm release amount and recipient</div>
          <div style={{ marginTop: 10 }}>
            <WireField label="Amount" placeholder="KSh 850,000" helper="As specified in the term sheet for tranche 2."/>
            <WireField label="Recipient" placeholder="e.mappa escrow → supplier + electrician" helper="Funds flow through escrow; never directly to provider."/>
            <WireField label="Effective date" placeholder="On gate clearance" helper="Recorded immutably in the recovery ledger."/>
          </div>
        </GlassCard>
        <SettlementWaterfall role="financier"/>
      </ScreenShell>
    </ProposedScreen>
  );
}

// ── INSTALLER ─────────────────────────────────────────────────
function InstallerJobsScreen() {
  const jobs = [
    { name: 'Riverside Apartments',   stage: 'Active install',  next: 'Ops signoff', tone: 'good',     pillTone: 'good',    pill: 'on site' },
    { name: 'Highridge Court',        stage: 'Scheduled',       next: 'Site survey', tone: 'neutral',  pillTone: 'neutral', pill: 'queued' },
    { name: 'Tatu Heights',           stage: 'Awaiting lead',   next: 'Assign lead', tone: 'warn',     pillTone: 'warn',    pill: 'blocked' },
    { name: 'Brookside Suites',       stage: 'Inspection',      next: 'Photos',      tone: 'neutral',  pillTone: 'neutral', pill: 'today' },
  ];
  return (
    <ProposedScreen>
      <ScreenShell
        section="Jobs"
        roleLabel="electrician workspace"
        title="Jobs Inbox"
        subtitle="The crew's job queue across buildings. Today's site, what's next, and what's blocked."
        actions={["Accept job", "Reschedule", "Filter"]}
        hero={{
          label: 'Active queue',
          value: `${jobs.length}`,
          sub: '1 live install, 2 queued, 1 blocked on lead electrician.',
          status: 'on schedule', statusTone: 'good',
        }}
      >
        <GlassCard>
          <Label>All jobs</Label>
          <div style={{ color: KIT.text, fontSize: 17, fontWeight: 700, letterSpacing: '-0.02em', marginTop: 5 }}>By urgency</div>
          <div style={{ marginTop: 10 }}>
            {jobs.map((j, i) => (
              <div key={i} style={{
                display: 'flex', gap: 10, padding: '11px 0',
                borderTop: i === 0 ? 'none' : `1px solid ${KIT.border}`,
              }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 8,
                  background: KIT.panelSoft, color: KIT.text,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 13, fontWeight: 700, flexShrink: 0,
                }}>{j.name.slice(0, 1)}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ color: KIT.text, fontSize: 12, fontWeight: 600 }}>{j.name}</div>
                  <div style={{ color: KIT.muted, fontSize: 10.5, marginTop: 2 }}>{j.stage} · next: {j.next}</div>
                </div>
                <Pill tone={j.pillTone}>{j.pill}</Pill>
              </div>
            ))}
          </div>
        </GlassCard>
        <BriefCard
          eyebrow="Acceptance rule"
          title="Don't accept what you can't dispatch."
          body="Lead electrician eligibility is a kill switch. Confirm certification before accepting."
          rows={[
            { label: 'Lead electrician',  value: 'verified for 1 of 4', note: '3 jobs need a certified lead before scheduling can open.', tone: 'warn' },
            { label: 'Site access',        value: 'verified for 2 of 4', note: 'Owner permission gates roof + meter-room access.',         tone: 'warn' },
            { label: 'Monitoring',         value: 'online for 1 live job', note: 'Live ops requires connectivity stays online.',           tone: 'good' },
          ]}
        />
      </ScreenShell>
    </ProposedScreen>
  );
}

window.ResidentJoinScreen        = ResidentJoinScreen;
window.ResidentVerifyScreen      = ResidentVerifyScreen;
window.ProviderProjectsScreen    = ProviderProjectsScreen;
window.ProviderCommitScreen      = ProviderCommitScreen;
window.ProviderTermsScreen       = ProviderTermsScreen;
window.FinancierTrancheScreen    = FinancierTrancheScreen;
window.InstallerJobsScreen       = InstallerJobsScreen;
