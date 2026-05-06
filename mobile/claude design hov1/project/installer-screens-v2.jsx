// ─────────────────────────────────────────────────────────────
// installer-screens-v2.jsx — faithful HTML port of components/installer/*
// ─────────────────────────────────────────────────────────────

function InstallerHomeScreenV2() {
  const b = window.MOCK; const view = b.roleViews.installer;
  const drs = b.project.drs;
  const stable = drs.monitoringConnectivityResolved && drs.settlementDataTrusted;
  return (
    <ScreenShell
      section="Home"
      roleLabel="installer workspace"
      title="Today's Field Board"
      subtitle="A calm snapshot for the crew: active site, lead gate, proof progress, and post-live risk."
      actions={["Review site", "Capture proof", "Sync crew"]}
      hero={{
        label: 'Active proof',
        value: `${view.checklistComplete}/${view.checklistTotal}`,
        sub: 'Commissioning items closed for the active building',
      }}
    >
      <BuildingPulse role="installer"/>
      <KillSwitchBanner/>
      <BriefCard
        eyebrow="Today"
        title={`${b.project.name} is the crew's current site.`}
        body="Home is only the field dashboard snapshot: what building the crew is on, whether the lead can dispatch, and what proof still affects activation."
        rows={[
          { label: 'Lead gate',  value: view.certified ? 'Ready' : 'Blocked', note: 'Certified lead electrician is required before scheduling.', tone: view.certified ? 'good' : 'bad' },
          { label: 'Proof count', value: `${view.checklistComplete}/${view.checklistTotal}`, note: 'Only the active go-live proof count is surfaced here.', tone: view.checklistComplete === view.checklistTotal ? 'good' : 'warn' },
          { label: 'DRS',        value: b.drs.label, note: 'Installer work advances only when readiness gates allow it.', tone: b.drs.decision === 'approve' ? 'good' : 'warn' },
        ]}
      />
      <FieldCard
        eyebrow="Crew board"
        title="Field rhythm for this visit"
        body="Keep the crew pointed at site proof and activation blockers, not repeated admin queues."
        statusTone={stable ? 'good' : 'warn'}
        statusLabel={stable ? 'stable' : 'watch'}
        fields={[
          { label: 'Site focus',    value: b.project.locationBand, note: 'Named building job, not pooled work.' },
          { label: 'Next proof',    value: drs.meterInverterMatchResolved ? 'Connectivity' : 'Meter map', note: 'Capture the artifact that unblocks ops review.' },
          { label: 'Closeout risk', value: view.maintenanceTickets === 0 ? 'None open' : `${view.maintenanceTickets} service item`, note: 'Post-live tickets stay visible without crowding commissioning.' },
        ]}
      />
      <MiniGrid items={[
        { label: 'Installer readiness', value: `${b.drs.components.installerReadiness}`, detail: 'DRS installer/labor component for the active building.' },
        { label: 'Open service risk',   value: `${view.maintenanceTickets}`, detail: 'Post-live items that can affect monitoring trust.' },
      ]}/>
    </ScreenShell>
  );
}

function InstallerJobDetailScreenV2() {
  const b = window.MOCK; const drs = b.project.drs;
  return (
    <ScreenShell
      section="Job Detail"
      roleLabel="installer workspace"
      title="Site Evidence"
      subtitle="The site packet for map context, physical evidence, and readings tied to one named building."
      actions={["Capture site", "Map meters", "Log readings"]}
      hero={{
        label: 'Site proof',
        value: drs.meterInverterMatchResolved ? 'Aligned' : 'Mismatch',
        sub: 'Meter and inverter proof for this named building',
      }}
    >
      <BuildingPulse role="installer"/>
      <KillSwitchBanner/>
      <BriefCard
        eyebrow="Job packet"
        title="Every field artifact stays attached to this building."
        body="Job detail is the crew's source of truth for physical proof, map context, and commissioning readings."
        rows={[
          { label: 'Site',         value: b.project.locationBand, note: 'The installer works against a named building, not an opaque pooled deployment.' },
          { label: 'Meter map',    value: drs.meterInverterMatchResolved ? 'Matched' : 'Review', note: 'Meter/inverter mismatch is a DRS kill switch.', tone: drs.meterInverterMatchResolved ? 'good' : 'bad' },
          { label: 'Owner access', value: drs.ownerPermissionsComplete ? 'Complete' : 'Blocked', note: 'Roof and meter access depends on completed building owner permission.', tone: drs.ownerPermissionsComplete ? 'good' : 'bad' },
        ]}
      />
      <SiteMapCard
        access={drs.ownerPermissionsComplete ? 'Open' : 'Hold'}
        meter={drs.meterInverterMatchResolved ? 'Matched' : 'Mismatch'}
        inverter={drs.settlementDataTrusted ? 'Reading' : 'Pending'}
        mapped={drs.meterInverterMatchResolved}
      />
      <MiniGrid items={[
        { label: 'Array size', value: `${b.project.energy.arrayKw} kW`,    detail: 'Mock projected system size for the active job.' },
        { label: 'Battery',    value: `${b.project.energy.batteryKwh} kWh`, detail: 'Storage capacity used during commissioning checks.' },
      ]}/>
      <GlassCard>
        <Label>Readings</Label>
        <div style={{ color: KIT.text, letterSpacing: '-0.02em', fontWeight: 600, fontSize: 17, marginTop: 5 }}>Commissioning evidence</div>
        <div style={{ marginTop: 10, border: `1px solid ${KIT.border}`, borderRadius: 14, overflow: 'hidden', background: KIT.sky }}>
          {[
            ['Meter map',          drs.meterInverterMatchResolved ? 'Matched' : 'Mismatch blocks go-live'],
            ['Cable route',        drs.ownerPermissionsComplete ? 'Access confirmed' : 'Owner access incomplete'],
            ['Settlement readings', drs.settlementDataTrusted ? 'Trusted' : 'Needs fresh capture'],
          ].map(([label, value], i) => (
            <div key={label} style={{
              display: 'flex', justifyContent: 'space-between', gap: 8,
              padding: 10, background: i % 2 === 0 ? KIT.white : KIT.panelSoft,
              borderTop: i === 0 ? 'none' : `1px solid ${KIT.border}`,
            }}>
              <div style={{ color: KIT.muted, fontSize: 9.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</div>
              <div style={{ color: KIT.text, fontSize: 11, fontWeight: 600, textAlign: 'right' }}>{value}</div>
            </div>
          ))}
        </div>
      </GlassCard>
    </ScreenShell>
  );
}

function InstallerChecklistScreenV2() {
  const b = window.MOCK; const view = b.roleViews.installer; const drs = b.project.drs;
  const checklistComplete = view.checklistComplete === view.checklistTotal;
  return (
    <ScreenShell
      section="Checklist"
      roleLabel="installer workspace"
      title="Go-Live Checklist"
      subtitle="The commissioning proof lane: photos, readings, connectivity, and ops signoff before activation."
      actions={["Upload photos", "Add readings", "Request signoff"]}
      hero={{
        label: 'Proof complete',
        value: `${view.checklistComplete}/${view.checklistTotal}`,
        sub: 'All evidence gates must close before go-live',
      }}
    >
      <BuildingPulse role="installer"/>
      <KillSwitchBanner/>
      <BriefCard
        eyebrow="Activation proof"
        title={checklistComplete ? 'Checklist evidence is ready for ops review.' : 'Checklist evidence still has blockers.'}
        body="This is the only installer screen with the full go-live checklist, keeping proof capture concentrated instead of repeated everywhere."
        rows={[
          { label: 'Photos',      value: 'Required',                                                   note: 'Distribution board, roof works, cable route, inverter, and meter photos.', tone: 'warn' },
          { label: 'Readings',    value: drs.meterInverterMatchResolved ? 'Aligned' : 'Mismatch',     note: 'Meter and inverter readings must agree before activation.', tone: drs.meterInverterMatchResolved ? 'good' : 'bad' },
          { label: 'Ops signoff', value: checklistComplete ? 'Ready' : 'Pending',                     note: 'Ops acceptance happens after evidence and connectivity are complete.', tone: checklistComplete ? 'good' : 'warn' },
        ]}
      />
      <EvidenceList title="Commissioning checklist" items={[
        { label: 'Site photos',      detail: 'Capture physical proof for DB, roof, cable route, and inverter install.', complete: drs.meterInverterMatchResolved },
        { label: 'Meter readings',   detail: 'Record commissioning readings for meter/inverter reconciliation.',         complete: drs.meterInverterMatchResolved },
        { label: 'Connectivity test', detail: 'Confirm monitoring is online before go-live.',                              complete: drs.monitoringConnectivityResolved },
        { label: 'Ops signoff',      detail: 'Final internal acceptance before solar allocation starts.',                  complete: checklistComplete && drs.settlementDataTrusted },
      ]}/>
      <MiniGrid items={[
        { label: 'Monitoring',     value: drs.monitoringConnectivityResolved ? 'Online' : 'Blocked', detail: 'Unresolved connectivity blocks activation.' },
        { label: 'Settlement data', value: drs.settlementDataTrusted ? 'Trusted' : 'Paused',           detail: 'Go-live needs trusted telemetry.' },
      ]}/>
      <WorkflowCard eyebrow="Proof capture order" title="Capture in order" items={[
        { label: 'Photo pack',                   detail: 'Upload site proof before readings so ops can compare physical layout.', status: 'photos',   tone: 'neutral' },
        { label: 'Readings pack',                 detail: 'Add meter and inverter readings after commissioning checks.',          status: 'readings', tone: drs.meterInverterMatchResolved ? 'good' : 'warn' },
        { label: 'Connectivity and signoff',      detail: 'Request ops signoff once monitoring and settlement data are trusted.', status: 'signoff',  tone: drs.monitoringConnectivityResolved && drs.settlementDataTrusted ? 'good' : 'warn' },
      ]}/>
    </ScreenShell>
  );
}

function InstallerMaintenanceScreenV2() {
  const b = window.MOCK; const view = b.roleViews.installer; const drs = b.project.drs;
  return (
    <ScreenShell
      section="Maintenance"
      roleLabel="installer workspace"
      title="Service Trust"
      subtitle="A post-live trust loop for restoring telemetry, readings, and closeout proof when service issues appear."
      actions={["Open tickets", "Restore data", "Close with proof"]}
      hero={{
        label: 'Tickets',
        value: `${view.maintenanceTickets}`,
        sub: 'Open post-live service items',
      }}
    >
      <BuildingPulse role="installer"/>
      <KillSwitchBanner/>
      <BriefCard
        eyebrow="Post-live"
        title="Maintenance protects settlement data trust."
        body="Maintenance is not a generic support queue. It is the field loop that keeps monitoring and readings credible after go-live."
        rows={[
          { label: 'Monitoring',       value: drs.monitoringConnectivityResolved ? 'Online' : 'Blocked', note: 'Unresolved monitoring connectivity blocks go-live and weakens live operations.', tone: drs.monitoringConnectivityResolved ? 'good' : 'bad' },
          { label: 'Settlement data',  value: drs.settlementDataTrusted ? 'Trusted' : 'Paused',           note: 'Untrusted settlement data pauses activation until readings are reliable.',         tone: drs.settlementDataTrusted ? 'good' : 'bad' },
          { label: 'Tickets',          value: view.maintenanceTickets === 0 ? 'Clear' : `${view.maintenanceTickets} open`, note: 'Post-live service work stays attached to the building record.', tone: view.maintenanceTickets === 0 ? 'good' : 'warn' },
        ]}
      />
      <MiniGrid items={[
        { label: 'Telemetry', value: drs.monitoringConnectivityResolved ? 'Live' : 'Restore',   detail: 'Monitoring must remain online for trusted settlement.' },
        { label: 'Data trust', value: drs.settlementDataTrusted ? 'Trusted' : 'Paused',          detail: 'Readings must support monetized solar allocation.' },
      ]}/>
      <FieldCard
        eyebrow="Service ledger"
        title="Trust work after activation"
        body="Each ticket resolves toward monitored data the settlement engine can trust."
        statusTone={view.maintenanceTickets === 0 ? 'good' : 'warn'}
        statusLabel={view.maintenanceTickets === 0 ? 'clear' : 'open'}
        fields={[
          { label: 'Telemetry',    value: drs.monitoringConnectivityResolved ? 'Live' : 'Restore feed', note: 'Monitoring heartbeat and inverter feed.' },
          { label: 'Reading trust', value: drs.settlementDataTrusted ? 'Trusted' : 'Recheck',            note: 'Fresh readings when settlement confidence drops.' },
          { label: 'Closeout',     value: view.maintenanceTickets === 0 ? 'No open ticket' : 'Proof required', note: 'Repair notes or photos before ops closes the item.' },
        ]}
      />
    </ScreenShell>
  );
}

function InstallerCertificationScreenV2() {
  const b = window.MOCK; const certified = b.roleViews.installer.certified;
  return (
    <ScreenShell
      section="Certification"
      roleLabel="installer workspace"
      title="Lead Eligibility"
      subtitle="A focused eligibility lane for the accountable lead electrician before any installer schedule opens."
      actions={["Review lead", "Attach license", "Clear dispatch"]}
      hero={{
        label: 'Lead electrician',
        value: certified ? 'Ready' : 'Blocked',
        sub: 'No certified lead means no deployment scheduling',
      }}
    >
      <BuildingPulse role="installer"/>
      <KillSwitchBanner/>
      <BriefCard
        eyebrow="Scheduling guard"
        title={certified ? 'This crew can be scheduled.' : 'Scheduling is blocked until lead proof clears.'}
        body="Certification stays narrow: one accountable lead, one named building, and a clear DRS kill switch if eligibility is missing."
        rows={[
          { label: 'Lead proof',    value: certified ? 'Verified' : 'Missing',                  note: 'License, assignment, and safety accountability stay attached to the job.', tone: certified ? 'good' : 'bad' },
          { label: 'Installer DRS', value: `${b.drs.components.installerReadiness}`,            note: 'Displayed as the readiness outcome, not recalculated in the UI.',         tone: b.drs.components.installerReadiness >= 80 ? 'good' : 'warn' },
          { label: 'Dispatch',      value: certified ? 'Allowed' : 'Blocked',                   note: 'Installer scheduling opens only after lead electrician eligibility is verified.', tone: certified ? 'good' : 'bad' },
        ]}
      />
      <FieldCard
        eyebrow="Credential packet"
        title="Lead electrician eligibility only"
        body="This packet avoids commissioning clutter and keeps the scheduling decision auditable."
        statusTone={certified ? 'good' : 'bad'}
        statusLabel={certified ? 'valid' : 'hold'}
        fields={[
          { label: 'License',    value: certified ? 'Verified' : 'Missing', note: 'Current lead electrician license attached to this crew.', valueTone: certified ? 'good' : 'bad' },
          { label: 'Assignment', value: certified ? 'Bound' : 'Unbound',    note: "Named lead is accountable for this building's site work.", valueTone: certified ? 'good' : 'bad' },
          { label: 'Dispatch',   value: certified ? 'Open' : 'Closed',      note: 'Crew scheduling remains closed until eligibility clears.',  valueTone: certified ? 'good' : 'bad' },
        ]}
      />
      <BigMetric label="Scheduling state" value={certified ? 'Cleared' : 'Hold'}
        detail="Deployment cannot be scheduled without a certified lead electrician, even if other gates look ready."/>
    </ScreenShell>
  );
}

window.InstallerHomeScreenV2          = InstallerHomeScreenV2;
window.InstallerJobDetailScreenV2     = InstallerJobDetailScreenV2;
window.InstallerChecklistScreenV2     = InstallerChecklistScreenV2;
window.InstallerMaintenanceScreenV2   = InstallerMaintenanceScreenV2;
window.InstallerCertificationScreenV2 = InstallerCertificationScreenV2;
