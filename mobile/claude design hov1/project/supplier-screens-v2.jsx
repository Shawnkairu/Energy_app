// ─────────────────────────────────────────────────────────────
// supplier-screens-v2.jsx — faithful HTML port of components/supplier/*
// ─────────────────────────────────────────────────────────────

function SupplierHomeScreenV2() {
  const b = window.MOCK; const view = b.roleViews.supplier;
  return (
    <ScreenShell
      section="Home"
      roleLabel="supplier workspace"
      title="Supply Desk"
      subtitle="A calm operating snapshot for what needs supplier attention today."
      actions={["Triage inbox", "Check stock", "Send proof"]}
      hero={{
        label: 'Desk pressure',
        value: `${view.openRequests}`,
        sub: `${view.openRequests === 1 ? 'One request needs' : `${view.openRequests} requests need`} a clear owner before supplier lock.`,
      }}
    >
      <BuildingPulse role="supplier"/>
      <KillSwitchBanner/>
      <MiniGrid items={[
        { label: 'Inbox',   value: `${view.openRequests}`,      detail: 'RFQs needing response' },
        { label: 'Catalog', value: `${view.catalogItems}`,      detail: 'Maintained component lines' },
        { label: 'Proof',   value: `${view.warrantyDocuments}`, detail: 'Warranty files on hand' },
        { label: 'Score',   value: `${view.reliabilityScore}%`, detail: 'Fulfillment signal' },
      ]}/>
      <GlassCard>
        <Label>Today</Label>
        <div style={{ color: KIT.text, letterSpacing: '-0.02em', fontWeight: 600, fontSize: 17, marginTop: 5 }}>What needs attention first</div>
        <div style={{ color: KIT.muted, fontSize: 12, lineHeight: 1.5, marginTop: 6 }}>The home screen stays at desk level: what is open, what can be answered, and what proof is missing.</div>
        <SupplierRow label="RFQ triage"   detail="Reply only where availability, price, and proof can be stated cleanly." value={`${view.openRequests} RFQ`} tone={view.openRequests > 1 ? 'warn' : 'neutral'}/>
        <SupplierRow label="Dispatch watch" detail="Use the orders lane for award, dispatch, and delivery proof details." value={`${view.leadTimeDays}d`} tone={view.leadTimeDays <= 7 ? 'good' : 'warn'}/>
        <SupplierRow label="Proof queue"  detail="Attach warranty and serial expectations before handoff gets noisy." value={`${view.warrantyDocuments} docs`} tone={view.warrantyDocuments >= 4 ? 'good' : 'warn'}/>
      </GlassCard>
      <ActivityCard eyebrow="Supplier activity" items={[
        'PO-221 panels accepted; dispatch window opens Thursday.',
        'RFQ-1042 inverter pack response delivered with warranty file.',
        'PO-229 protection gear: serial capture rule attached to closeout.',
      ]}/>
    </ScreenShell>
  );
}

function SupplierCatalogScreenV2() {
  const b = window.MOCK; const view = b.roleViews.supplier;
  return (
    <ScreenShell
      section="Catalog"
      roleLabel="supplier workspace"
      title="Component Catalog"
      subtitle="The maintained component and warranty catalogue. No RFQ or dispatch noise here."
      actions={["Edit component", "Add warranty", "Set substitute"]}
      hero={{
        label: 'Listed components',
        value: `${view.catalogItems}`,
        sub: `${view.warrantyDocuments} warranty document${view.warrantyDocuments === 1 ? '' : 's'} available for catalogue lines.`,
      }}
    >
      <BuildingPulse role="supplier"/>
      <KillSwitchBanner/>
      <MiniGrid items={[
        { label: 'Standard parts', value: `${view.catalogItems}`,      detail: 'Available components' },
        { label: 'Warranty docs',  value: `${view.warrantyDocuments}`, detail: 'Attached to component lines' },
        { label: 'Alternates',     value: view.verifiedBom ? 'Mapped' : 'Review', detail: 'Approved substitutions' },
        { label: 'Serial rule',    value: 'On',                         detail: 'Capture required' },
      ]}/>
      <GlassCard>
        <Label>Component lines</Label>
        <div style={{ color: KIT.text, letterSpacing: '-0.02em', fontWeight: 600, fontSize: 17, marginTop: 5 }}>Catalogue entries stay simple and auditable.</div>
        <div style={{ color: KIT.muted, fontSize: 12, lineHeight: 1.5, marginTop: 6 }}>Each line describes the component, approved alternate, serial expectation, and warranty file. Pricing and dispatch belong in other lanes.</div>
        <ProofTable rows={[
          { label: 'PV module pack',           primary: 'Tier-1 540W mono panels',                  secondary: 'Warranty file attached; serial capture required at delivery.', status: view.verifiedBom ? 'active' : 'check', tone: view.verifiedBom ? 'good' : 'warn' },
          { label: 'Hybrid inverter',          primary: 'Three-phase hybrid inverter',              secondary: 'Approved alternate must preserve meter and monitoring compatibility.', status: 'alternate' },
          { label: 'Mounting and protection', primary: 'Roof rail, isolators, breakers',           secondary: 'Warranty terms and serial policy are visible before RFQ response.', status: 'warranty' },
        ]}/>
      </GlassCard>
      <GlassCard>
        <Label>Warranty policy</Label>
        <div style={{ color: KIT.text, letterSpacing: '-0.02em', fontWeight: 600, fontSize: 17, marginTop: 5 }}>Proof belongs on the catalogue line.</div>
        <SupplierRow label="Warranty parity"     detail="Alternate components need warranty terms equal to or better than the awarded line." value="required"/>
        <SupplierRow label="Serial expectation"   detail="Components that affect settlement data must carry serial capture rules."          value="tracked"/>
        <SupplierRow label="Compatibility notes"  detail="Inverter, meter, and protection gear alternates must include compatibility notes." value="mapped" tone={view.verifiedBom ? 'good' : 'warn'}/>
      </GlassCard>
      <GlassCard>
        <Label>Catalogue health</Label>
        <div style={{ color: KIT.text, letterSpacing: '-0.02em', fontWeight: 600, fontSize: 17, marginTop: 5 }}>Coverage by line</div>
        <div style={{ marginTop: 10 }}>
          <SupplierBar label="Warranty attachment"  value={view.verifiedBom ? 92 : 54} note="Share of active catalog lines with attached warranty evidence."/>
          <SupplierBar label="Substitution clarity" value={view.verifiedBom ? 88 : 61} note="Share of lines with approved alternates and compatibility notes."/>
        </div>
      </GlassCard>
    </ScreenShell>
  );
}

function SupplierOrdersScreenV2() {
  const b = window.MOCK; const view = b.roleViews.supplier;
  return (
    <ScreenShell
      section="Orders"
      roleLabel="supplier workspace"
      title="Awards & Proof"
      subtitle="Purchase orders only: award state, dispatch window, delivery proof, serials, and warranty closeout."
      actions={["Confirm award", "Log dispatch", "Upload proof"]}
      hero={{
        label: 'Proof path',
        value: `${view.leadTimeDays}d`,
        sub: `${view.verifiedBom ? 'Award can move into dispatch' : 'Award is paused until proof is clean'}.`,
      }}
    >
      <BuildingPulse role="supplier"/>
      <KillSwitchBanner/>
      <MiniGrid items={[
        { label: 'Award',         value: view.verifiedBom ? 'Ready' : 'Paused',  detail: 'PO acceptance state' },
        { label: 'Dispatch',      value: `${view.leadTimeDays}d`,                detail: 'Quoted movement window' },
        { label: 'Delivery note', value: 'Needed',                                detail: 'Proof at handoff' },
        { label: 'Serials',       value: 'Open',                                  detail: 'Captured before closeout' },
      ]}/>
      <GlassCard>
        <Label>Order progress</Label>
        <div style={{ color: KIT.text, letterSpacing: '-0.02em', fontWeight: 600, fontSize: 17, marginTop: 5 }}>Orders move from award to dispatch to proof.</div>
        <div style={{ color: KIT.muted, fontSize: 12, lineHeight: 1.5, marginTop: 6 }}>This lane shows physical fulfillment artifacts only. Quote quality and catalogue policy stay elsewhere.</div>
        <EvidenceList title="Order timeline" items={[
          { label: 'Award confirmed',                  detail: 'Supplier accepts the PO and locks price, stock, and substitution terms.', complete: view.verifiedBom },
          { label: 'Dispatch logged',                  detail: `Movement window is ${view.leadTimeDays} days from award confirmation.`,    complete: view.verifiedBom && view.leadTimeDays <= 7 },
          { label: 'Delivery proof captured',          detail: 'Delivery note, site handoff, and installer acknowledgement are attached to the project lane.', complete: false },
          { label: 'Serials and warranty attached',   detail: 'Component serials and warranty documents close the supplier proof loop.',  complete: view.warrantyDocuments >= 4 },
        ]}/>
      </GlassCard>
      <GlassCard>
        <Label>Active purchase orders</Label>
        <div style={{ color: KIT.text, letterSpacing: '-0.02em', fontWeight: 600, fontSize: 17, marginTop: 5 }}>Minimal proof register</div>
        <ProofTable rows={[
          { label: 'PO-221 panels and mounting', primary: view.verifiedBom ? 'Award accepted, dispatch next' : 'Award held for proof', secondary: 'Delivery note and serial capture required at site handoff.',  status: view.verifiedBom ? 'award' : 'blocked', tone: view.verifiedBom ? 'good' : 'warn' },
          { label: 'PO-226 inverter pack',       primary: `${view.leadTimeDays} day estimated lead time`,                                secondary: 'Dispatch proof must include inverter and meter compatibility evidence.', status: 'dispatch' },
          { label: 'PO-229 protection gear',     primary: `${view.warrantyDocuments} warranty document${view.warrantyDocuments === 1 ? '' : 's'} attached`, secondary: 'Closeout waits for delivery note, serials, and installer acknowledgement.', status: 'proof' },
        ]}/>
      </GlassCard>
    </ScreenShell>
  );
}

function SupplierQuoteRequestsScreenV2() {
  const b = window.MOCK; const view = b.roleViews.supplier;
  return (
    <ScreenShell
      section="Quote Requests"
      roleLabel="supplier workspace"
      title="RFQ Inbox"
      subtitle="Response quality only: complete quotes, explicit assumptions, and clean proof attachments."
      actions={["Answer RFQ", "Add assumption", "Attach proof"]}
      hero={{
        label: 'Open RFQs',
        value: `${view.openRequests}`,
        sub: `${view.verifiedBom ? 'Responses are complete enough for review' : 'Responses need clearer availability or proof'}.`,
      }}
    >
      <BuildingPulse role="supplier"/>
      <KillSwitchBanner/>
      <MiniGrid items={[
        { label: 'Requests',     value: `${view.openRequests}`,                detail: 'RFQs in supplier inbox' },
        { label: 'Completeness', value: view.verifiedBom ? 'High' : 'Partial', detail: 'Answer quality' },
        { label: 'Assumptions',  value: 'Visible',                              detail: 'No hidden caveats' },
        { label: 'Proof',        value: `${view.warrantyDocuments}`,           detail: 'Attachments referenced' },
      ]}/>
      <GlassCard>
        <Label>RFQ response table</Label>
        <div style={{ color: KIT.text, letterSpacing: '-0.02em', fontWeight: 600, fontSize: 17, marginTop: 5 }}>A quote is useful only when its quality is legible.</div>
        <div style={{ color: KIT.muted, fontSize: 12, lineHeight: 1.5, marginTop: 6 }}>Keep responses low-noise: price range, availability confidence, warranty reference, and any substitution rule.</div>
        <ProofTable rows={[
          { label: 'RFQ-1042 inverter and meter pack', primary: `KSh 684k range · ${view.leadTimeDays} day estimated lead time`, secondary: 'Availability confidence, delivery assumption, and warranty file are referenced in the response.', status: view.verifiedBom ? 'complete' : 'proof gap', tone: view.verifiedBom ? 'good' : 'warn' },
          { label: 'RFQ-1045 mounting hardware',        primary: 'KSh 218k range · 4 day dispatch window',                       secondary: 'Substitution note is explicit and requires installer roof rail confirmation.',                  status: 'qualified' },
          { label: 'RFQ-1047 protection gear',           primary: 'KSh 96k range · stock held for 48h',                            secondary: 'Hold window and serial evidence requirement are visible before award.',                          status: 'held' },
        ]}/>
      </GlassCard>
      <GlassCard>
        <Label>Quality rubric</Label>
        <div style={{ color: KIT.text, letterSpacing: '-0.02em', fontWeight: 600, fontSize: 17, marginTop: 5 }}>Every answer should close one uncertainty.</div>
        <SupplierRow label="Availability"   detail="State whether stock is held, incoming, or needs a substitution."  value={view.verifiedBom ? 'confirmed' : 'partial'} tone={view.verifiedBom ? 'good' : 'warn'}/>
        <SupplierRow label="Price"          detail="Use a clear range or fixed quote without exposing private counterpart finances." value="range"/>
        <SupplierRow label="Warranty proof" detail="Reference the exact catalogue warranty file that supports the quote." value={`${view.warrantyDocuments} docs`}/>
        <SupplierRow label="Assumptions"    detail="Call out exchange-rate, substitution, or delivery-window assumptions directly." value={`${view.leadTimeDays}d`}/>
      </GlassCard>
    </ScreenShell>
  );
}

function SupplierReliabilityScreenV2() {
  const b = window.MOCK; const view = b.roleViews.supplier;
  const proofScore = view.warrantyDocuments >= 4 ? 94 : 58;
  const leadTimeScore = view.leadTimeDays <= 7 ? 91 : 64;
  return (
    <ScreenShell
      section="Reliability"
      roleLabel="supplier workspace"
      title="Reliability Score"
      subtitle="Fulfillment history, proof gaps, and schedule confidence. No catalog or RFQ work here."
      actions={["Review score", "Lead history", "Close proof gaps"]}
      hero={{
        label: 'Fulfillment score',
        value: `${view.reliabilityScore}%`,
        sub: `${view.leadTimeDays} day lead-time signal with ${view.warrantyDocuments} proof files contributing.`,
      }}
    >
      <BuildingPulse role="supplier"/>
      <KillSwitchBanner/>
      <MiniGrid items={[
        { label: 'Fulfillment',  value: `${view.reliabilityScore}%`, detail: 'Scheduling signal' },
        { label: 'Lead history', value: `${leadTimeScore}%`,         detail: 'On-time confidence' },
        { label: 'Proof',        value: `${proofScore}%`,             detail: 'Evidence coverage' },
        { label: 'Proof gaps',   value: view.warrantyDocuments >= 4 ? 'Low' : 'Open', detail: 'Missing attachment risk' },
      ]}/>
      <GlassCard>
        <Label>Reliability model</Label>
        <div style={{ color: KIT.text, letterSpacing: '-0.02em', fontWeight: 600, fontSize: 17, marginTop: 5 }}>The score is a scheduling signal, not a promise.</div>
        <div style={{ color: KIT.muted, fontSize: 12, lineHeight: 1.5, marginTop: 6 }}>Reliability summarizes fulfillment history, lead-time variance, delivery proof, and open exceptions so deployments are scheduled honestly.</div>
        <div style={{ marginTop: 10 }}>
          <SupplierBar label="Fulfillment score"  value={view.reliabilityScore} note="Current supplier reliability for active deployment lanes."/>
          <SupplierBar label="Lead-time history"   value={leadTimeScore}        note="Recent ability to meet quoted delivery windows."/>
          <SupplierBar label="Proof completeness" value={proofScore}            note="Warranty, serial, and delivery documents attached before closeout."/>
        </div>
      </GlassCard>
      <GlassCard>
        <Label>Proof gaps</Label>
        <div style={{ color: KIT.text, letterSpacing: '-0.02em', fontWeight: 600, fontSize: 17, marginTop: 5 }}>Close the gaps that weaken fulfillment trust.</div>
        <SupplierRow label="Warranty attachment" detail="Missing warranty files lower confidence in future order closeout." value={view.warrantyDocuments >= 4 ? 'covered' : 'gap'} tone={view.warrantyDocuments >= 4 ? 'good' : 'warn'}/>
        <SupplierRow label="Lead-time variance"   detail="Longer lead times require earlier installer coordination."         value={`${view.leadTimeDays}d`} tone={view.leadTimeDays <= 7 ? 'good' : 'warn'}/>
        <SupplierRow label="BOM verification"     detail="Unverified supplier proof creates a historical exception."          value={view.verifiedBom ? 'verified' : 'blocked'} tone={view.verifiedBom ? 'good' : 'bad'}/>
      </GlassCard>
      <GlassCard>
        <Label>Fulfillment history</Label>
        <div style={{ color: KIT.text, letterSpacing: '-0.02em', fontWeight: 600, fontSize: 17, marginTop: 5 }}>Recent delivery pattern</div>
        <ProofTable rows={[
          { label: 'Last verified lane', primary: view.leadTimeDays <= 7 ? 'Delivered inside quoted window' : 'Delivery risk exceeded target', secondary: 'Feeds the next scheduling confidence score.', status: view.leadTimeDays <= 7 ? 'on time' : 'watch', tone: view.leadTimeDays <= 7 ? 'good' : 'warn' },
          { label: 'Proof package',      primary: `${view.warrantyDocuments} documents available`,                                              secondary: 'Warranty, serial, and delivery-note coverage are tracked together.', status: 'docs' },
          { label: 'Open exceptions',    primary: view.verifiedBom ? 'No critical fulfillment exception' : 'Critical proof exception open',     secondary: 'Exceptions remain visible until closeout evidence is attached.', status: view.verifiedBom ? 'clear' : 'block', tone: view.verifiedBom ? 'good' : 'bad' },
        ]}/>
      </GlassCard>
    </ScreenShell>
  );
}

window.SupplierHomeScreenV2          = SupplierHomeScreenV2;
window.SupplierCatalogScreenV2       = SupplierCatalogScreenV2;
window.SupplierOrdersScreenV2        = SupplierOrdersScreenV2;
window.SupplierQuoteRequestsScreenV2 = SupplierQuoteRequestsScreenV2;
window.SupplierReliabilityScreenV2   = SupplierReliabilityScreenV2;
