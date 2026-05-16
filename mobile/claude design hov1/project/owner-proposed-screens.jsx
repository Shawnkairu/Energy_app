// ─────────────────────────────────────────────────────────────
// owner-proposed-screens.jsx — wireframes for owner screens that the
// deployment spec implies but that don't exist in components/owner/.
// All five are flagged "Proposed — not in codebase" so they can't be
// mistaken for ground truth.
//
// Visual treatment: same warm shell + ScreenHeader + ActionRail + Hero,
// but lower-fidelity content blocks (dashed-border placeholders,
// gray-on-cream rules, sparser data) so the gap is legible at a glance.
// ─────────────────────────────────────────────────────────────

function ProposedRibbon() {
  return (
    <div style={{
      position: 'absolute', top: 0, left: 0, right: 0, zIndex: 5,
      background: '#FFF7E5',
      borderBottom: `1px solid ${KIT.amber}40`,
      padding: '6px 14px',
      display: 'flex', alignItems: 'center', gap: 8,
    }}>
      <div style={{
        width: 6, height: 6, borderRadius: 999, background: KIT.amber,
      }}/>
      <div style={{
        color: KIT.amber, fontSize: 9.5, fontWeight: 700,
        letterSpacing: '0.12em', textTransform: 'uppercase', flex: 1,
      }}>Proposed · not yet in codebase</div>
      <div style={{ color: KIT.amber, fontSize: 9.5, fontWeight: 600 }}>wireframe</div>
    </div>
  );
}

function WirePlaceholder({ height = 80, label }) {
  return (
    <div style={{
      height, borderRadius: 14,
      border: `1.5px dashed ${KIT.borderStrong}`,
      background: 'repeating-linear-gradient(135deg, #FAF3E5 0 8px, #F1E8DA 8px 16px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: KIT.muted, fontSize: 10.5, fontWeight: 600,
      letterSpacing: '0.08em', textTransform: 'uppercase',
      marginBottom: 12,
    }}>{label}</div>
  );
}

function WireField({ label, placeholder, helper, value }) {
  return (
    <div style={{ marginBottom: 11 }}>
      <div style={{ color: KIT.text, fontSize: 11, fontWeight: 600, marginBottom: 5 }}>{label}</div>
      <div style={{
        padding: '9px 11px', borderRadius: 10,
        border: `1px solid ${KIT.border}`, background: KIT.white,
        color: value ? KIT.text : KIT.muted, fontSize: 12,
      }}>{value || placeholder}</div>
      {helper && <div style={{ color: KIT.muted, fontSize: 10.5, lineHeight: 1.4, marginTop: 4 }}>{helper}</div>}
    </div>
  );
}

// Wrapper that mounts the proposed ribbon on top
function ProposedScreen({ children }) {
  return (
    <div style={{ height: '100%', position: 'relative' }}>
      <ProposedRibbon/>
      <div style={{ paddingTop: 24, height: '100%', overflow: 'auto' }}>
        {children}
      </div>
    </div>
  );
}

// 1) ───────── Onboarding / List Building ──────────────────────
function OwnerListBuildingScreen() {
  return (
    <ProposedScreen>
      <ScreenShell
        section="Onboard"
        roleLabel="Owner private app"
        title="List your Building"
        subtitle="Tell e.mappa about the building so qualification can begin. Required before DRS, supplier, and electrician steps unlock."
        actions={["Save draft", "Request inspection", "Cancel"]}
        ownerStyle
        hero={{
          label: 'Step 1 of 5',
          value: 'Building basics',
          sub: 'Two minutes. You can edit any field before requesting inspection.',
          status: 'draft', statusTone: 'warn',
        }}
      >
        <SectionBriefCard
          eyebrow="What e.mappa needs"
          title="Just the basics. Inspection captures the rest."
          body="No counterparty data yet — this is the owner's self-declared snapshot. e.mappa verifies during inspection."
        />
        <GlassCard>
          <Label>Building basics</Label>
          <div style={{ marginTop: 10 }}>
            <WireField label="Building name" placeholder="e.g. Riverside Apartments" />
            <WireField label="Address / location band" placeholder="Nairobi · Kileleshwa" helper="A neighborhood band is enough; full address comes during inspection."/>
            <WireField label="Number of units" placeholder="38" />
            <WireField label="Current monthly grid bill (avg)" placeholder="KSh 240,000" helper="Used for the comparison view in step 2."/>
            <WireField label="Roof type / orientation" placeholder="Flat concrete, mostly south-facing"/>
          </div>
        </GlassCard>
        <BriefCard
          eyebrow="Optional now"
          title="Anything you can attach speeds up DRS."
          body="Skip these if you don't have them — inspection covers them."
          rows={[
            { label: 'Existing meter map',  value: 'attach',   note: 'PDF, image, or sketch.', tone: 'neutral' },
            { label: 'Roof photos',         value: 'attach',   note: 'A handful of phone photos works.' },
            { label: 'Land/title proof',    value: 'attach',   note: 'Inspection captures this if missing.' },
          ]}
        />
        <WirePlaceholder label="Map preview"/>
      </ScreenShell>
    </ProposedScreen>
  );
}

// 2) ───────── Comparison: today vs e.mappa ───────────────────
function OwnerComparisonScreen() {
  return (
    <ProposedScreen>
      <ScreenShell
        section="Compare"
        roleLabel="Owner private app"
        title="Today vs e.mappa"
        subtitle="A side-by-side of the building's current grid spend and the projected outcome under prepaid solar. No commitments here."
        actions={["See assumptions", "Adjust scenario", "Continue"]}
        ownerStyle
        hero={{
          label: 'Projected monthly delta',
          value: '−KSh 84,000',
          sub: 'Combined resident bill drop + new owner royalty, vs current grid-only spend.',
          status: 'projected', statusTone: 'good',
        }}
      >
        <SectionBriefCard
          eyebrow="How to read this"
          title="A range, not a guarantee."
          body="Numbers below assume pledged demand scenarios and median utilization. Both move with deployment readiness and resident sign-up."
        />
        <GlassCard>
          <Label>Side-by-side</Label>
          <div style={{ marginTop: 10, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div style={{
              border: `1px solid ${KIT.border}`, borderRadius: 16, padding: 12,
              background: KIT.panelSoft + '90',
            }}>
              <div style={{ color: KIT.muted, fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Today</div>
              <div style={{ color: KIT.text, letterSpacing: '-0.02em', fontSize: 22, fontWeight: 600, marginTop: 4 }}>KSh 240k</div>
              <div style={{ color: KIT.muted, fontSize: 10.5, marginTop: 4 }}>Grid spend / month, building total</div>
              <div style={{ marginTop: 10, color: KIT.text, fontSize: 11 }}>Owner royalty: KSh 0</div>
            </div>
            <div style={{
              border: `1px solid ${KIT.green}40`, borderRadius: 16, padding: 12,
              background: KIT.green + '08',
            }}>
              <div style={{ color: KIT.green, fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>With e.mappa</div>
              <div style={{ color: KIT.green, letterSpacing: '-0.02em', fontSize: 22, fontWeight: 600, marginTop: 4 }}>KSh 156k</div>
              <div style={{ color: KIT.muted, fontSize: 10.5, marginTop: 4 }}>Grid + prepaid solar, building total</div>
              <div style={{ marginTop: 10, color: KIT.text, fontSize: 11 }}>Owner royalty: <strong>KSh 18.4k</strong></div>
            </div>
          </div>
        </GlassCard>
        <BriefCard
          eyebrow="Levers"
          title="What changes the projection."
          body="The comparison reflects only monetized prepaid solar. Free generation, waste, and curtailment do not improve owner royalty."
          rows={[
            { label: 'Resident participation', value: 'scenario range',  note: 'Below 60% blocks deployment.', tone: 'good' },
            { label: 'Utilization',            value: '75% assumed',  note: 'Below 70% lowers royalty.',   tone: 'good' },
            { label: 'Grid tariff',            value: '+ shocks',     note: 'Tariff rises favor e.mappa more, never less.', tone: 'neutral' },
          ]}
        />
      </ScreenShell>
    </ProposedScreen>
  );
}

// 3) ───────── Resident Onboarding (cohort) ──────────────────
function OwnerResidentsScreen() {
  return (
    <ProposedScreen>
      <ScreenShell
        section="Residents"
        roleLabel="Owner private app"
        title="Drive Resident Sign-Up"
        subtitle="Owner-controlled funnel: invitations sent, residents joined, prepaid tokens loaded. Privacy-safe — no individual balances."
        actions={["Send invites", "Building message", "Print QR"]}
        ownerStyle
        hero={{
          label: 'Participation',
          value: '32 / 38',
          sub: '84% participation. Demand below 60% blocks deployment, below 80% slows royalty.',
          status: 'qualified', statusTone: 'good',
        }}
      >
        <KpiRow items={[
          { label: 'Invited',   value: '38', note: 'All units reached' },
          { label: 'Joined',    value: '32', note: '84% of invited' },
          { label: 'Funded',    value: '28', note: 'Cash-cleared tokens' },
        ]}/>
        <BriefCard
          eyebrow="Pre-onboarding gates"
          title="What unlocks deployment."
          body="The owner can move all three of these. Resident-side decisions are private to each household; the owner sees aggregates only."
          rows={[
            { label: 'Demand coverage', value: '≥ 60%', note: '84% reached. Above the deployment-block threshold.', tone: 'good' },
            { label: 'Prepaid commitment', value: 'received', note: '28 households have cleared at least one top-up.', tone: 'good' },
            { label: 'Building messages',  value: 'monthly', note: 'Owner can send a building-wide note inside the app.', tone: 'neutral' },
          ]}
        />
        <GlassCard>
          <Label>Invitation log</Label>
          <div style={{ color: KIT.text, letterSpacing: '-0.02em', fontWeight: 600, fontSize: 17, marginTop: 5 }}>Most recent waves</div>
          <div style={{ marginTop: 10 }}>
            {[
              { wave: 'Wave 3 · last week',  sent: 6,  joined: 4 },
              { wave: 'Wave 2 · 2 weeks ago', sent: 14, joined: 12 },
              { wave: 'Wave 1 · 4 weeks ago', sent: 18, joined: 16 },
            ].map((w, i) => (
              <div key={i} style={{
                display: 'flex', justifyContent: 'space-between', gap: 10,
                padding: '10px 0', borderTop: i === 0 ? 'none' : `1px solid ${KIT.border}`,
              }}>
                <div style={{ color: KIT.text, fontSize: 11.5, fontWeight: 600, flex: 1 }}>{w.wave}</div>
                <div style={{ color: KIT.muted, fontSize: 11 }}>sent {w.sent}</div>
                <div style={{ color: KIT.green, fontSize: 11, fontWeight: 600 }}>joined {w.joined}</div>
              </div>
            ))}
          </div>
        </GlassCard>
        <WirePlaceholder height={64} label="QR + shareable invite preview"/>
      </ScreenShell>
    </ProposedScreen>
  );
}

// 4) ───────── Approve Terms ─────────────────────────────────
function OwnerApproveTermsScreen() {
  return (
    <ProposedScreen>
      <ScreenShell
        section="Terms"
        roleLabel="Owner private app"
        title="Approve Building Terms"
        subtitle="A single-step owner approval before deployment moves. Provider, financier, and royalty terms are bundled here."
        actions={["Approve", "Request changes", "Open contract"]}
        ownerStyle
        hero={{
          label: 'Awaiting owner signature',
          value: '3 terms',
          sub: 'Provider royalty split, financier milestones, provider lock window.',
          status: 'pending', statusTone: 'warn',
        }}
      >
        <SectionBriefCard
          eyebrow="What you're approving"
          title="Owner has the last gate before money moves."
          body="Each term is bundled with its DRS dependency so it's clear what would be unlocked by approval."
        />
        <BriefCard
          eyebrow="Terms summary"
          title="Three things to confirm."
          body="None of these unlock deployment alone — DRS gates still apply."
          rows={[
            { label: 'Royalty split',     value: '12% owner', note: 'Of monetized solar after provider pool. Future periods only.', tone: 'good' },
            { label: 'Financier raise',  value: 'milestone', note: '3 tranches, released against verified evidence — not against time.' },
            { label: 'Provider lock',    value: '30 days', note: 'BOM and quote held for owner to confirm before electrician scheduling.' },
          ]}
        />
        <WorkflowCard eyebrow="Owner accountability" title="Once approved" items={[
          { label: 'Provider asset terms', detail: 'Provider can list this building as "named exposure" for capital matching.', status: 'unlocks', tone: 'good' },
          { label: 'Financier deal room',  detail: 'Capital matching opens for the deal up to the agreed raise.', status: 'unlocks', tone: 'good' },
          { label: 'Supplier scheduling',  detail: 'An electrician can be paired with a locked BOM and dispatch window.', status: 'unlocks', tone: 'good' },
        ]}/>
        <GlassCard>
          <Label>Signature</Label>
          <div style={{ color: KIT.text, letterSpacing: '-0.02em', fontWeight: 600, fontSize: 17, marginTop: 5 }}>One owner, one signature</div>
          <div style={{ color: KIT.muted, fontSize: 12, lineHeight: 1.5, marginTop: 6 }}>The signer must be the listed building owner. e.mappa keeps a versioned record of approval and any later change request.</div>
          <button style={{
            marginTop: 12, width: '100%', padding: '12px 14px',
            borderRadius: 999, border: 'none',
            background: KIT.graphite, color: '#fff',
            fontSize: 12, fontWeight: 600, cursor: 'pointer',
          }}>Approve all 3 terms</button>
        </GlassCard>
      </ScreenShell>
    </ProposedScreen>
  );
}

// 5) ───────── Profile / Settings ────────────────────────────
function OwnerProfileScreen() {
  return (
    <ProposedScreen>
      <ScreenShell
        section="Profile"
        roleLabel="Owner private app"
        title="Owner Settings"
        subtitle="Owner identity, building access, contacts, and notification preferences. Private to this owner session."
        actions={["Edit details", "Manage access", "Sign out"]}
        ownerStyle
        hero={{
          label: 'Signed in as',
          value: 'Anita Mwangi',
          sub: 'Riverside Apartments · primary owner · verified Aug 2025',
          status: 'verified', statusTone: 'good',
        }}
      >
        <BriefCard
          eyebrow="Owner identity"
          title="Verified once, used everywhere."
          body="Owner identity is the signature of record for terms, inspections, and approvals."
          rows={[
            { label: 'Legal name',     value: 'Anita Mwangi',          note: 'Matches title document on file.', tone: 'good' },
            { label: 'Phone',          value: '+254 7•• ••• 412',       note: 'Used for OTP and inspection coordination.' },
            { label: 'Identity check', value: 'verified',                note: 'KYC passed; re-verification due in 11 months.', tone: 'good' },
          ]}
        />
        <BriefCard
          eyebrow="Building access"
          title="Who can do what."
          body="Owner can delegate inspection coordination and building messaging without giving up signing rights."
          rows={[
            { label: 'Property manager', value: 'view + invite', note: 'Can send resident invites; cannot approve terms.', tone: 'neutral' },
            { label: 'Caretaker',         value: 'access only',   note: 'Can confirm inspection access windows; no financial visibility.', tone: 'neutral' },
            { label: 'Signing rights',    value: 'owner only',   note: 'Term approvals are non-delegable.', tone: 'good' },
          ]}
        />
        <GlassCard>
          <Label>Notifications</Label>
          <div style={{ color: KIT.text, letterSpacing: '-0.02em', fontWeight: 600, fontSize: 17, marginTop: 5 }}>What pings the owner</div>
          <div style={{ marginTop: 10 }}>
            {[
              { label: 'DRS changes',          on: true,  note: 'Score crosses a deployment-block threshold.' },
              { label: 'Term approvals due',   on: true,  note: 'Provider, financier, or supplier waiting on owner.' },
              { label: 'Resident milestones',  on: true,  note: 'Participation crosses 60% / 80%.' },
              { label: 'Settlement runs',      on: false, note: 'Monthly royalty statement is available.' },
              { label: 'Maintenance tickets',  on: false, note: 'Provider opens a service item against this building.' },
            ].map((n, i) => (
              <div key={n.label} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 0', borderTop: i === 0 ? 'none' : `1px solid ${KIT.border}`,
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{ color: KIT.text, fontSize: 12, fontWeight: 600 }}>{n.label}</div>
                  <div style={{ color: KIT.muted, fontSize: 10.5, lineHeight: 1.4, marginTop: 3 }}>{n.note}</div>
                </div>
                <div style={{
                  width: 30, height: 18, borderRadius: 999,
                  background: n.on ? KIT.green : KIT.borderStrong,
                  position: 'relative', flexShrink: 0,
                }}>
                  <div style={{
                    position: 'absolute', top: 2, left: n.on ? 14 : 2,
                    width: 14, height: 14, borderRadius: 999, background: '#fff',
                    transition: 'left 0.15s',
                  }}/>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
        <BriefCard
          eyebrow="Privacy"
          title="What e.mappa keeps from you (and from others)."
          body="Owners see aggregates and benchmarks, never resident-level balances or counterparty private terms."
          rows={[
            { label: 'Resident finances', value: 'hidden', note: 'You see participation and aggregate prepaid; never individual wallets.', tone: 'good' },
            { label: 'Counterparty terms', value: 'hidden', note: 'Provider, financier, and supplier private rates stay private.', tone: 'good' },
            { label: 'Your terms',         value: 'private', note: 'Other roles see anonymized benchmarks, not your specific royalty rate.', tone: 'good' },
          ]}
        />
      </ScreenShell>
    </ProposedScreen>
  );
}

window.OwnerListBuildingScreen   = OwnerListBuildingScreen;
window.OwnerComparisonScreen     = OwnerComparisonScreen;
window.OwnerResidentsScreen      = OwnerResidentsScreen;
window.OwnerApproveTermsScreen   = OwnerApproveTermsScreen;
window.OwnerProfileScreen        = OwnerProfileScreen;
