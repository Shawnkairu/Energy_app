// other-screens.jsx — Owner, Provider, Financier, Installer, Supplier, Admin

// ════════════ OWNER ════════════
function OwnList() {
  return (
    <Page>
      <NavBar title="Buildings" right={<I.search c={TOKENS.inkSoft}/>}/>
      <PageHeader title="Your sites" big sub="2 listed · 1 deployed"/>
      <Stack gap={10} style={{ marginTop: 4 }}>
        {[
          { n: 'Aiolou 24', s: 'Plaka · 38 units', drs: 87, st: 'Activated', c: TOKENS.ok },
          { n: 'Karaiskaki 11', s: 'Pangrati · 22 units', drs: 71, st: 'Inspection', c: TOKENS.warn },
          { n: 'Vouli 4', s: 'Kolonaki · 14 units', drs: 54, st: 'Drafting', c: TOKENS.inkMute },
        ].map((b,i) => (
          <Card key={i} pad={14}>
            <Row style={{ justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontFamily: 'Fraunces, Georgia, serif', fontWeight: 600, fontSize: 18, color: TOKENS.ink, letterSpacing: '-0.01em' }}>{b.n}</div>
                <div style={{ fontSize: 11.5, color: TOKENS.inkSoft, marginTop: 1 }}>{b.s}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: 22, fontWeight: 600, color: b.c, letterSpacing: '-0.02em' }}>{b.drs}</div>
                <div style={{ fontSize: 9.5, color: TOKENS.inkMute, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}>DRS</div>
              </div>
            </Row>
            <Row style={{ marginTop: 10, justifyContent: 'space-between' }}>
              <Pill color={b.c}>● {b.st}</Pill>
              <span style={{ fontSize: 11, color: TOKENS.inkMute }}>›</span>
            </Row>
          </Card>
        ))}
        <Card pad={14} style={{ borderStyle: 'dashed', textAlign: 'center', color: TOKENS.accent, fontWeight: 600 }}>+ List a building</Card>
      </Stack>
      <TabBar accent={ROLES.owner.color} tabs={[
        { icon: I.bldg(), label: 'Buildings' }, { icon: I.chart(), label: 'Royalties' },
        { icon: I.bell(), label: 'Updates' }, { icon: I.user(), label: 'Profile' },
      ]} active={0}/>
    </Page>
  );
}

function OwnDRS() {
  const parts = [
    { l: 'Demand', v: 0.92, w: 35 },
    { l: 'Prepaid commit', v: 0.74, w: 20 },
    { l: 'Load profile', v: 0.81, w: 15 },
    { l: 'Installation', v: 0.95, w: 10 },
    { l: 'Labor', v: 0.88, w: 10 },
    { l: 'Capital', v: 0.66, w: 10 },
  ];
  return (
    <Page scroll>
      <NavBar title="DRS Report"/>
      <Row style={{ alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: ROLES.owner.color }}>Aiolou 24</div>
          <Row style={{ alignItems: 'baseline', marginTop: 2 }}>
            <span style={{ fontFamily: 'Fraunces, Georgia, serif', fontWeight: 600, fontSize: 56, letterSpacing: '-0.04em', color: TOKENS.ink, lineHeight: 1 }}>87</span>
            <span style={{ fontSize: 13, color: TOKENS.inkSoft, marginLeft: 6 }}>/ 100</span>
          </Row>
        </div>
        <Pill color={TOKENS.ok}>● Approve</Pill>
      </Row>
      <Card pad={14} style={{ marginTop: 14 }}>
        <Stack gap={10}>
          {parts.map((p,i) => (
            <Progress key={i} value={p.v} color={ROLES.owner.color} label={`${p.l}`} right={`${Math.round(p.v*100)}% · ${p.w}%w`}/>
          ))}
        </Stack>
      </Card>
      <div style={{ marginTop: 14, fontSize: 11, color: TOKENS.inkMute, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Kill switches</div>
      <Stack gap={6} style={{ marginTop: 6 }}>
        {[
          { l: 'Demand ≥ 60%', ok: true },
          { l: 'Prepaid funded', ok: true },
          { l: 'Lead electrician certified', ok: true },
          { l: 'Meter / inverter match', ok: true },
          { l: 'Owner permission complete', ok: true },
        ].map((k,i) => (
          <Row key={i} style={{ justifyContent: 'space-between', padding: '10px 14px', background: '#fff', border: `1px solid ${TOKENS.hairlineSoft}`, borderRadius: 12 }}>
            <span style={{ fontSize: 12.5, color: TOKENS.ink }}>{k.l}</span>
            <I.check c={TOKENS.ok}/>
          </Row>
        ))}
      </Stack>
    </Page>
  );
}

function OwnRoyalty() {
  return (
    <Page>
      <NavBar title="Royalties"/>
      <PageHeader title="Cash distributions" big sub="Aiolou 24 · April"/>
      <Card pad={14} style={{ marginTop: 6 }}>
        <Row style={{ justifyContent: 'space-between' }}>
          <Metric label="This period" value="€384" big color={ROLES.owner.color}/>
          <Pill color={TOKENS.ok}>+12% MoM</Pill>
        </Row>
        <div style={{ marginTop: 10 }}>
          <MiniBars values={[180,210,240,290,310,330,384]} w={264} h={62} color={ROLES.owner.color} soft={ROLES.owner.color + '30'}/>
          <Row style={{ marginTop: 4, justifyContent: 'space-between', fontSize: 9.5, color: TOKENS.inkMute, fontFamily: 'JetBrains Mono' }}>
            {['Oct','Nov','Dec','Jan','Feb','Mar','Apr'].map(m => <span key={m}>{m}</span>)}
          </Row>
        </div>
      </Card>
      <div style={{ marginTop: 12, fontSize: 11, color: TOKENS.inkMute, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Waterfall</div>
      <Stack gap={6} style={{ marginTop: 6 }}>
        {[
          { l: '1 · Reserve', v: '€86', c: TOKENS.inkSoft },
          { l: '2 · Providers', v: '€512', c: ROLES.provider.color },
          { l: '3 · Financiers', v: '€198', c: ROLES.financier.color },
          { l: '4 · Owner (you)', v: '€384', c: ROLES.owner.color },
          { l: '5 · e.mappa', v: '€72', c: TOKENS.cocoa },
        ].map((r,i) => (
          <Row key={i} style={{ justifyContent: 'space-between', padding: '12px 14px', background: '#fff', border: `1px solid ${TOKENS.hairlineSoft}`, borderRadius: 12 }}>
            <Row gap={10}><Dot color={r.c}/><span style={{ fontSize: 13, fontWeight: 500, color: TOKENS.ink }}>{r.l}</span></Row>
            <span style={{ fontFamily: 'Fraunces, Georgia, serif', fontWeight: 600, color: TOKENS.ink }}>{r.v}</span>
          </Row>
        ))}
      </Stack>
    </Page>
  );
}

// ════════════ PROVIDER ════════════
function ProvProjects() {
  return (
    <Page>
      <NavBar title="Projects" right={<I.search c={TOKENS.inkSoft}/>}/>
      <PageHeader title="Qualified deals" big sub="DRS ≥ 65"/>
      <Stack gap={8} style={{ marginTop: 4 }}>
        {[
          { n: 'Aiolou 24', drs: 87, kw: 24, c: TOKENS.ok },
          { n: 'Pireos 88', drs: 78, kw: 36, c: TOKENS.ok },
          { n: 'Karaiskaki 11', drs: 71, kw: 18, c: TOKENS.warn },
          { n: 'Athinon 200', drs: 82, kw: 48, c: TOKENS.ok },
        ].map((p,i) => (
          <Card key={i} pad={14}>
            <Row style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontFamily: 'Fraunces, Georgia, serif', fontWeight: 600, fontSize: 16, color: TOKENS.ink }}>{p.n}</div>
                <Row gap={6} style={{ marginTop: 6 }}>
                  <Pill color={p.c}>DRS {p.drs}</Pill>
                  <Pill color={ROLES.provider.color} kind="soft">{p.kw} kW</Pill>
                </Row>
              </div>
              <Button primary small color={ROLES.provider.color}>Commit</Button>
            </Row>
          </Card>
        ))}
      </Stack>
      <TabBar accent={ROLES.provider.color} tabs={[
        { icon: I.briefcase(), label: 'Deals' }, { icon: I.chart(), label: 'Assets' },
        { icon: I.wallet(), label: 'Payouts' }, { icon: I.user(), label: 'Profile' },
      ]} active={0}/>
    </Page>
  );
}

function ProvAssetPerf() {
  return (
    <Page>
      <NavBar title="Asset perf"/>
      <Row style={{ justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: ROLES.provider.color }}>Aiolou 24 · 24kW</div>
          <Row style={{ alignItems: 'baseline', marginTop: 4 }}>
            <span style={{ fontFamily: 'Fraunces, Georgia, serif', fontWeight: 600, fontSize: 36, letterSpacing: '-0.03em', color: TOKENS.ink, lineHeight: 1 }}>€512</span>
            <span style={{ fontSize: 12, color: TOKENS.inkSoft, marginLeft: 6 }}>this period</span>
          </Row>
          <Row gap={6} style={{ marginTop: 6 }}>
            <span style={{ color: TOKENS.ok, fontSize: 12, fontWeight: 600 }}>▲ 6.4% vs DRS</span>
          </Row>
        </div>
      </Row>
      <div style={{ marginTop: 12 }}>
        <MiniChart values={[420,440,455,470,490,500,512]} w={284} h={86} color={ROLES.provider.color} fill={ROLES.provider.color + '20'} baseline/>
      </div>
      <Card pad={14} style={{ marginTop: 14 }}>
        <Row style={{ justifyContent: 'space-between' }}>
          <Metric label="Generated" value="3.2" unit="MWh"/>
          <Metric label="Monetized" value="2.7" unit="MWh"/>
          <Metric label="Wasted" value="0.1" unit="MWh" color={TOKENS.inkMute}/>
        </Row>
      </Card>
      <Card pad={14} style={{ marginTop: 10 }}>
        <Row style={{ justifyContent: 'space-between' }}>
          <div style={{ fontSize: 12.5, color: TOKENS.ink, fontWeight: 600 }}>Ownership</div>
          <span style={{ fontSize: 11, color: TOKENS.inkMute }}>Provider 70 · Residents 30</span>
        </Row>
        <Row style={{ height: 8, borderRadius: 999, overflow: 'hidden', marginTop: 8 }}>
          <div style={{ flex: 70, background: ROLES.provider.color }}/>
          <div style={{ flex: 30, background: TOKENS.accent }}/>
        </Row>
      </Card>
    </Page>
  );
}

// ════════════ FINANCIER ════════════
function FinDeals() {
  return (
    <Page>
      <NavBar title="Deals" right={<I.search c={TOKENS.inkSoft}/>}/>
      <PageHeader title="Named buildings" big sub="No pooled fund"/>
      <Stack gap={8} style={{ marginTop: 4 }}>
        {[
          { n: 'Aiolou 24', size: '€38k', irr: '12.4%', tag: 'Open' },
          { n: 'Pireos 88', size: '€62k', irr: '11.1%', tag: 'Recovery' },
          { n: 'Athinon 200', size: '€84k', irr: '13.2%', tag: 'Open' },
        ].map((d,i) => (
          <Card key={i} pad={14}>
            <Row style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontFamily: 'Fraunces, Georgia, serif', fontWeight: 600, fontSize: 17, color: TOKENS.ink }}>{d.n}</div>
                <Row gap={8} style={{ marginTop: 6 }}>
                  <span style={{ fontSize: 11.5, color: TOKENS.inkSoft }}>Size <b style={{ color: TOKENS.ink }}>{d.size}</b></span>
                  <span style={{ color: TOKENS.hairline }}>·</span>
                  <span style={{ fontSize: 11.5, color: TOKENS.inkSoft }}>Proj IRR <b style={{ color: ROLES.financier.color }}>{d.irr}</b></span>
                </Row>
              </div>
              <Pill color={d.tag === 'Open' ? TOKENS.ok : TOKENS.cocoa}>{d.tag}</Pill>
            </Row>
          </Card>
        ))}
      </Stack>
      <TabBar accent={ROLES.financier.color} tabs={[
        { icon: I.briefcase(), label: 'Deals' }, { icon: I.chart(), label: 'Portfolio' },
        { icon: I.wallet(), label: 'Payouts' }, { icon: I.user(), label: 'Profile' },
      ]} active={0}/>
    </Page>
  );
}

function FinDealRoom() {
  return (
    <Page scroll>
      <NavBar title="Aiolou 24"/>
      <Row style={{ justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: ROLES.financier.color }}>Deal room</div>
          <div style={{ fontFamily: 'Fraunces, Georgia, serif', fontWeight: 600, fontSize: 26, letterSpacing: '-0.02em', color: TOKENS.ink, marginTop: 2 }}>€38,400 ticket</div>
        </div>
        <Pill color={TOKENS.ok}>● Open</Pill>
      </Row>
      <Card pad={14} style={{ marginTop: 12 }}>
        <Row style={{ justifyContent: 'space-between' }}>
          <Metric label="DRS" value="87" color={TOKENS.ok}/>
          <Metric label="Proj IRR" value="12.4" unit="%" color={ROLES.financier.color}/>
          <Metric label="Recovery" value="5.4" unit="yr"/>
        </Row>
      </Card>
      <Card pad={14} style={{ marginTop: 10 }}>
        <div style={{ fontSize: 11.5, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: TOKENS.inkSoft, marginBottom: 8 }}>Capital release gates</div>
        <Stack gap={6}>
          {[
            { l: 'Owner permission', ok: true },
            { l: 'Demand ≥ 60%', ok: true },
            { l: 'Supplier BOM lock', ok: true },
            { l: 'Lead electrician', ok: true },
            { l: 'Activation', ok: false },
          ].map((g,i) => (
            <Row key={i} style={{ justifyContent: 'space-between', padding: '8px 10px', background: TOKENS.screenSubtle, borderRadius: 9 }}>
              <span style={{ fontSize: 12, color: TOKENS.ink }}>{g.l}</span>
              {g.ok ? <I.check c={TOKENS.ok}/> : <span style={{ fontSize: 10.5, color: TOKENS.inkMute, fontWeight: 600 }}>PENDING</span>}
            </Row>
          ))}
        </Stack>
      </Card>
      <Card pad={14} style={{ marginTop: 10 }}>
        <div style={{ fontSize: 11.5, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: TOKENS.inkSoft, marginBottom: 8 }}>Projected vs actual</div>
        <MiniChart values={[2,4,6,9,11,14,17,20,22,25]} w={264} h={56} color={ROLES.financier.color} fill={ROLES.financier.color + '18'} baseline/>
      </Card>
    </Page>
  );
}

// ════════════ INSTALLER ════════════
function InstJobs() {
  return (
    <Page>
      <NavBar title="Jobs" right={<I.search c={TOKENS.inkSoft}/>}/>
      <PageHeader title="Today" big sub="3 sites · 1 inspection"/>
      <Stack gap={8} style={{ marginTop: 4 }}>
        {[
          { n: 'Aiolou 24', s: 'Install · 24kW · 8 panels', t: '09:00', c: ROLES.installer.color },
          { n: 'Pireos 88', s: 'Inspection', t: '13:30', c: TOKENS.warn },
          { n: 'Vouli 4', s: 'Maintenance ticket', t: '16:00', c: TOKENS.inkSoft },
        ].map((j,i) => (
          <Card key={i} pad={14}>
            <Row style={{ justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontFamily: 'Fraunces, Georgia, serif', fontWeight: 600, fontSize: 16, color: TOKENS.ink }}>{j.n}</div>
                <div style={{ fontSize: 11.5, color: TOKENS.inkSoft, marginTop: 2 }}>{j.s}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontFamily: 'JetBrains Mono', fontSize: 14, fontWeight: 600, color: j.c }}>{j.t}</div>
                <div style={{ fontSize: 9.5, color: TOKENS.inkMute, marginTop: 2 }}>· tap to start</div>
              </div>
            </Row>
          </Card>
        ))}
      </Stack>
      <TabBar accent={ROLES.installer.color} tabs={[
        { icon: I.list(), label: 'Jobs' }, { icon: I.wrench(), label: 'Tickets' },
        { icon: I.check(), label: 'Verify' }, { icon: I.user(), label: 'Profile' },
      ]} active={0}/>
    </Page>
  );
}

function InstChecklist() {
  const items = [
    { l: 'Site safety walk', ok: true },
    { l: 'Roof structure', ok: true },
    { l: 'Mounting torque', ok: true },
    { l: 'String voltage', ok: true },
    { l: 'Inverter pairing', ok: false },
    { l: 'Meter handshake', ok: false },
    { l: 'Photo · array', ok: false },
    { l: 'Photo · DB box', ok: false },
  ];
  return (
    <Page scroll>
      <NavBar title="Install checklist"/>
      <PageHeader title="Aiolou 24" sub="24kW · Heliotype Co"/>
      <Card pad={14} style={{ marginTop: 8 }}>
        <Progress value={4/8} color={ROLES.installer.color} label="Progress" right="4 / 8"/>
      </Card>
      <Stack gap={6} style={{ marginTop: 12 }}>
        {items.map((it,i) => (
          <Row key={i} style={{ justifyContent: 'space-between', padding: '12px 14px', background: '#fff', border: `1px solid ${TOKENS.hairlineSoft}`, borderRadius: 12 }}>
            <Row gap={10}>
              <div style={{ width: 22, height: 22, borderRadius: 6, background: it.ok ? TOKENS.ok : TOKENS.screenSubtle, display: 'grid', placeItems: 'center' }}>
                {it.ok && I.check('#fff')}
              </div>
              <span style={{ fontSize: 13, color: TOKENS.ink, fontWeight: 500, textDecoration: it.ok ? 'line-through' : 'none', opacity: it.ok ? 0.6 : 1 }}>{it.l}</span>
            </Row>
            <span style={{ fontSize: 11, color: TOKENS.inkMute }}>›</span>
          </Row>
        ))}
      </Stack>
    </Page>
  );
}

// ════════════ SUPPLIER ════════════
function SupOrders() {
  return (
    <Page>
      <NavBar title="Orders" right={<I.search c={TOKENS.inkSoft}/>}/>
      <PageHeader title="Supplier" big sub="3 quotes · 2 POs"/>
      <Stack gap={8} style={{ marginTop: 4 }}>
        {[
          { n: 'BOM · Aiolou 24', s: '24kW + inverter + DB', st: 'Quote requested', c: TOKENS.warn },
          { n: 'BOM · Pireos 88', s: '36kW + battery + monitoring', st: 'Quote sent', c: TOKENS.cocoa },
          { n: 'PO #4421', s: 'Athinon 200 · serials needed', st: 'Fulfilling', c: ROLES.supplier.color },
          { n: 'PO #4407', s: 'Vouli 4 · delivered', st: 'Delivered', c: TOKENS.ok },
        ].map((o,i) => (
          <Card key={i} pad={14}>
            <Row style={{ justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontFamily: 'Fraunces, Georgia, serif', fontWeight: 600, fontSize: 15, color: TOKENS.ink }}>{o.n}</div>
                <div style={{ fontSize: 11.5, color: TOKENS.inkSoft, marginTop: 2 }}>{o.s}</div>
              </div>
              <Pill color={o.c}>{o.st}</Pill>
            </Row>
          </Card>
        ))}
      </Stack>
      <TabBar accent={ROLES.supplier.color} tabs={[
        { icon: I.list(), label: 'Orders' }, { icon: I.truck(), label: 'Catalog' },
        { icon: I.chart(), label: 'Reliability' }, { icon: I.user(), label: 'Profile' },
      ]} active={0}/>
    </Page>
  );
}

function SupQuote() {
  return (
    <Page scroll>
      <NavBar title="Quote · BOM"/>
      <PageHeader title="Aiolou 24" sub="Bill of materials"/>
      <Card pad={14} style={{ marginTop: 8 }}>
        <Stack gap={10}>
          {[
            { l: '8 × 410W panels', q: '€1,840' },
            { l: 'Inverter 24kW', q: '€2,200' },
            { l: 'Battery 10kWh', q: '€3,400' },
            { l: 'Mounting + BOS', q: '€680' },
            { l: 'Monitoring kit', q: '€140' },
          ].map((r,i) => (
            <Row key={i} style={{ justifyContent: 'space-between', borderBottom: i < 4 ? `1px solid ${TOKENS.hairlineSoft}` : 'none', paddingBottom: 8 }}>
              <span style={{ fontSize: 13, color: TOKENS.ink }}>{r.l}</span>
              <span style={{ fontFamily: 'JetBrains Mono', fontSize: 13, color: TOKENS.ink, fontWeight: 600 }}>{r.q}</span>
            </Row>
          ))}
        </Stack>
        <Row style={{ marginTop: 12, justifyContent: 'space-between' }}>
          <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: TOKENS.inkSoft }}>Total</span>
          <span style={{ fontFamily: 'Fraunces, Georgia, serif', fontWeight: 600, fontSize: 22, color: ROLES.supplier.color }}>€8,260</span>
        </Row>
      </Card>
      <Card pad={14} style={{ marginTop: 10 }}>
        <Row style={{ justifyContent: 'space-between' }}>
          <Metric label="Lead time" value="11" unit="days"/>
          <Metric label="Reliability" value="96" unit="%" color={TOKENS.ok}/>
        </Row>
      </Card>
      <div style={{ position: 'absolute', bottom: 16, left: 18, right: 18 }}>
        <Button primary full color={ROLES.supplier.color}>Send quote</Button>
      </div>
    </Page>
  );
}

// ════════════ ADMIN / COCKPIT ════════════
function AdminCockpit() {
  return (
    <Page>
      <NavBar title="Cockpit" right={<I.cog c={TOKENS.inkSoft}/>}/>
      <PageHeader title="Pipeline" big sub="Live · 14 buildings"/>
      <Card pad={14} style={{ marginTop: 6 }}>
        <Row style={{ justifyContent: 'space-between' }}>
          <Metric label="Approve" value="6" color={TOKENS.ok}/>
          <Metric label="Review" value="5" color={TOKENS.warn}/>
          <Metric label="Block" value="3" color={ROLES.admin.color}/>
        </Row>
        <div style={{ marginTop: 12 }}>
          <MiniBars values={[3,4,5,4,6,7,6]} w={264} h={48} color={ROLES.admin.color}/>
        </div>
      </Card>
      <Card pad={14} style={{ marginTop: 10 }}>
        <div style={{ fontSize: 11.5, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: TOKENS.inkSoft, marginBottom: 8 }}>Alerts</div>
        <Stack gap={6}>
          {[
            { l: 'Aiolou 24 · monitoring offline', c: ROLES.admin.color },
            { l: 'Pireos 88 · BOM quote expired', c: TOKENS.warn },
            { l: 'Vouli 4 · DRS dropped to 54', c: TOKENS.warn },
          ].map((a,i) => (
            <Row key={i} style={{ padding: '10px 12px', background: a.c + '12', borderRadius: 9, justifyContent: 'space-between' }}>
              <Row gap={8}><Dot color={a.c}/><span style={{ fontSize: 12, color: TOKENS.ink }}>{a.l}</span></Row>
              <span style={{ fontSize: 10.5, color: TOKENS.inkMute, fontWeight: 600 }}>OPEN</span>
            </Row>
          ))}
        </Stack>
      </Card>
      <TabBar accent={ROLES.admin.color} tabs={[
        { icon: I.chart(), label: 'Pipeline' }, { icon: I.bldg(), label: 'Buildings' },
        { icon: I.wallet(), label: 'Settle' }, { icon: I.cog(), label: 'Ops' },
      ]} active={0}/>
    </Page>
  );
}

function AdminSettlement() {
  return (
    <Page scroll>
      <NavBar title="Settlement"/>
      <PageHeader title="April period" big sub="14 buildings · €71,420"/>
      <Card pad={14} style={{ marginTop: 6 }}>
        <Row style={{ justifyContent: 'space-between' }}>
          <Metric label="Monetized" value="142" unit="MWh" color={TOKENS.ok}/>
          <Metric label="Wasted" value="6" unit="MWh" color={TOKENS.inkMute}/>
          <Metric label="Reserve" value="€8.4k"/>
        </Row>
      </Card>
      <Card pad={14} style={{ marginTop: 10 }}>
        <div style={{ fontSize: 11.5, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: TOKENS.inkSoft, marginBottom: 8 }}>Waterfall · all sites</div>
        <Row style={{ height: 12, borderRadius: 999, overflow: 'hidden' }}>
          <div style={{ flex: 12, background: TOKENS.cocoa }}/>
          <div style={{ flex: 36, background: ROLES.provider.color }}/>
          <div style={{ flex: 18, background: ROLES.financier.color }}/>
          <div style={{ flex: 22, background: ROLES.owner.color }}/>
          <div style={{ flex: 12, background: TOKENS.accent }}/>
        </Row>
        <Row style={{ marginTop: 10, fontSize: 10.5, justifyContent: 'space-between', flexWrap: 'wrap', gap: 6 }}>
          {[['Reserve',TOKENS.cocoa],['Providers',ROLES.provider.color],['Financiers',ROLES.financier.color],['Owners',ROLES.owner.color],['e.mappa',TOKENS.accent]].map(([l,c]) => (
            <Row key={l} gap={5}><Dot color={c}/><span style={{ color: TOKENS.inkSoft }}>{l}</span></Row>
          ))}
        </Row>
      </Card>
      <Card pad={14} style={{ marginTop: 10 }}>
        <div style={{ fontSize: 11.5, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: TOKENS.inkSoft, marginBottom: 8 }}>Predicted vs live</div>
        <MiniChart values={[60,68,72,78,82,86,90]} w={264} h={48} color={ROLES.admin.color} dashed/>
        <MiniChart values={[58,66,74,80,84,88,93]} w={264} h={48} color={TOKENS.accent} fill={TOKENS.accent + '18'}/>
      </Card>
    </Page>
  );
}

Object.assign(window, {
  OwnList, OwnDRS, OwnRoyalty,
  ProvProjects, ProvAssetPerf,
  FinDeals, FinDealRoom,
  InstJobs, InstChecklist,
  SupOrders, SupQuote,
  AdminCockpit, AdminSettlement,
});
