// shared-screens.jsx — common screens used by multiple roles

// Splash / Welcome
function ScreenWelcome() {
  return (
    <Page bg={TOKENS.screenBg}>
      <div style={{ height: 160 }}/>
      <div style={{ textAlign: 'center' }}>
        <div style={{
          width: 72, height: 72, margin: '0 auto 22px',
          borderRadius: 22, background: TOKENS.accent,
          display: 'grid', placeItems: 'center',
          boxShadow: '0 18px 40px -16px rgba(150,90,53,0.7)',
        }}>
          <div style={{ fontFamily: 'Fraunces, Georgia, serif', color: TOKENS.cream, fontSize: 42, fontWeight: 600, lineHeight: 1, letterSpacing: '-0.04em' }}>e</div>
        </div>
        <div style={{ fontFamily: 'Fraunces, Georgia, serif', fontWeight: 600, fontSize: 32, letterSpacing: '-0.03em', color: TOKENS.ink, lineHeight: 1.05 }}>e.mappa</div>
        <div style={{ marginTop: 10, fontSize: 13, color: TOKENS.inkSoft, lineHeight: 1.5, padding: '0 28px' }}>
          Your building's energy economy. Prepaid solar, fair grid fallback, optional ownership.
        </div>
      </div>
      <div style={{ position: 'absolute', bottom: 28, left: 18, right: 18 }}>
        <Stack gap={10}>
          <Button primary full>Join my building</Button>
          <Button full>I'm a partner</Button>
        </Stack>
        <div style={{ textAlign: 'center', fontSize: 11, color: TOKENS.inkMute, marginTop: 16 }}>
          Already a member? <span style={{ color: TOKENS.accent, fontWeight: 600 }}>Log in</span>
        </div>
      </div>
    </Page>
  );
}

// Phone OTP / Verify
function ScreenVerify() {
  return (
    <Page>
      <NavBar title="Verify"/>
      <PageHeader title="Confirm it's you" sub="Step 2 of 3"/>
      <div style={{ fontSize: 13, color: TOKENS.inkSoft, lineHeight: 1.5, marginBottom: 20 }}>
        We sent a 6-digit code to <b style={{ color: TOKENS.ink }}>+30 698 ••• 4421</b>
      </div>
      <Row style={{ justifyContent: 'space-between' }}>
        {['4','2','9','1','•','•'].map((d,i) => (
          <div key={i} style={{
            width: 40, height: 52, borderRadius: 12,
            background: i < 4 ? '#FFFFFF' : TOKENS.screenSubtle,
            border: `1.5px solid ${i === 4 ? TOKENS.accent : TOKENS.hairline}`,
            display: 'grid', placeItems: 'center',
            fontFamily: 'Fraunces, Georgia, serif', fontWeight: 600, fontSize: 24, color: TOKENS.ink,
          }}>{d !== '•' ? d : ''}</div>
        ))}
      </Row>
      <div style={{ marginTop: 24, fontSize: 12, color: TOKENS.inkMute }}>
        Resend code in <b style={{ color: TOKENS.ink }}>0:23</b>
      </div>
      <div style={{ position: 'absolute', bottom: 28, left: 18, right: 18 }}>
        <Button primary full>Continue</Button>
      </div>
    </Page>
  );
}

// Role picker (after verify)
function ScreenRolePicker() {
  const roles = [
    { k: 'resident',  l: 'Resident',  s: 'I live in a building' },
    { k: 'owner',     l: 'Owner',     s: 'I own a building' },
    { k: 'provider',  l: 'Provider',  s: 'I deploy solar capacity' },
    { k: 'financier', l: 'Financier', s: 'I fund deal-level capital' },
    { k: 'installer', l: 'Electrician', s: 'I install and verify' },
    { k: 'supplier',  l: 'Supplier',  s: 'I supply hardware & BOM' },
  ];
  return (
    <Page>
      <NavBar title="Continue as"/>
      <PageHeader title="Pick your role" sub="One account, six surfaces"/>
      <Stack gap={8} style={{ marginTop: 8 }}>
        {roles.map((r, i) => (
          <Card key={r.k} pad={12} style={{ display: 'flex', alignItems: 'center', gap: 12,
            ...(i === 0 ? { borderColor: TOKENS.accent, boxShadow: `0 0 0 2px ${TOKENS.accent}22` } : {}) }}>
            <div style={{
              width: 34, height: 34, borderRadius: 10,
              background: ROLES[r.k].soft, color: ROLES[r.k].color,
              display: 'grid', placeItems: 'center', fontWeight: 700, fontSize: 14,
              fontFamily: 'Fraunces, Georgia, serif',
            }}>{r.l[0]}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13.5, fontWeight: 600, color: TOKENS.ink }}>{r.l}</div>
              <div style={{ fontSize: 11.5, color: TOKENS.inkSoft, marginTop: 1 }}>{r.s}</div>
            </div>
            {i === 0 && <Dot color={TOKENS.accent}/>}
          </Card>
        ))}
      </Stack>
    </Page>
  );
}

// Building detail (Resident & Owner & Financier all reach this)
function ScreenBuildingDetail() {
  return (
    <Page>
      <NavBar title="Building" right={<I.cog c={TOKENS.inkSoft}/>}/>
      <div>
        <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.16em', textTransform: 'uppercase', color: TOKENS.accent }}>Athens · Plaka</div>
        <div style={{ fontFamily: 'Fraunces, Georgia, serif', fontWeight: 600, fontSize: 26, letterSpacing: '-0.02em', color: TOKENS.ink, marginTop: 4 }}>
          Aiolou 24
        </div>
        <Row gap={6} style={{ marginTop: 6 }}>
          <Pill color={TOKENS.ok}>● Activated</Pill>
          <Pill color={TOKENS.cocoa} kind="soft">DRS 87</Pill>
          <Pill color={TOKENS.inkSoft} kind="soft">38 units</Pill>
        </Row>
      </div>

      <div style={{
        marginTop: 14, height: 92, borderRadius: 14,
        background: `linear-gradient(135deg, ${TOKENS.caramel}, ${TOKENS.cream})`,
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', inset: 0, background: 'repeating-linear-gradient(45deg, rgba(255,255,255,0.0) 0 8px, rgba(255,255,255,0.18) 8px 9px)' }}/>
        <div style={{ position: 'absolute', left: 12, bottom: 10, color: TOKENS.espresso, fontFamily: 'JetBrains Mono, monospace', fontSize: 10, letterSpacing: '0.1em', opacity: 0.7 }}>
          BUILDING IMAGE
        </div>
      </div>

      <Card pad={14} style={{ marginTop: 12 }}>
        <Row style={{ justifyContent: 'space-between', marginBottom: 6 }}>
          <div style={{ fontSize: 11.5, color: TOKENS.inkSoft, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>This month</div>
          <Pill color={TOKENS.ok}>+8.2%</Pill>
        </Row>
        <MiniChart values={[12,14,11,18,20,19,22,24,21,28,26,30,32]} w={264} h={56} color={TOKENS.accent} fill={TOKENS.accent + '20'} baseline/>
        <Row style={{ justifyContent: 'space-between', marginTop: 10 }}>
          <Metric label="Solar produced" value="12.4" unit="MWh"/>
          <Metric label="Self-used" value="71" unit="%"/>
          <Metric label="Royalty" value="€384" unit=""/>
        </Row>
      </Card>

      <Stack gap={8} style={{ marginTop: 12 }}>
        <Card pad={12}><Row style={{ justifyContent: 'space-between' }}>
          <Row gap={10}><div style={{ width: 28, height: 28, borderRadius: 8, background: TOKENS.accent + '1A', color: TOKENS.accent, display: 'grid', placeItems: 'center' }}>{I.bldg(TOKENS.accent)}</div>
          <div><div style={{ fontSize: 13, fontWeight: 600 }}>Site & permissions</div><div style={{ fontSize: 11, color: TOKENS.inkSoft }}>Owner approved · April 12</div></div></Row>
          <I.check c={TOKENS.ok}/>
        </Row></Card>
        <Card pad={12}><Row style={{ justifyContent: 'space-between' }}>
          <Row gap={10}><div style={{ width: 28, height: 28, borderRadius: 8, background: TOKENS.cocoa + '1A', color: TOKENS.cocoa, display: 'grid', placeItems: 'center' }}>{I.sun(TOKENS.cocoa)}</div>
          <div><div style={{ fontSize: 13, fontWeight: 600 }}>Provider · 24kW array</div><div style={{ fontSize: 11, color: TOKENS.inkSoft }}>Heliotype Co · 70% retained</div></div></Row>
          <span style={{ fontSize: 11, color: TOKENS.inkMute }}>›</span>
        </Row></Card>
      </Stack>
    </Page>
  );
}

// Notifications (shared)
function ScreenNotifications() {
  const items = [
    { t: 'Settlement period closed', s: 'April · €38.40 credited to your wallet', c: TOKENS.ok, i: I.wallet },
    { t: 'Battery charging from solar', s: 'Self-consumption profile · 22 min ago', c: TOKENS.accent, i: I.battery },
    { t: 'Inspection scheduled', s: 'Tue 14:00 · Lead electrician confirmed', c: TOKENS.cocoa, i: I.wrench },
    { t: 'Low prepaid balance', s: 'Top up to keep solar-first allocation', c: TOKENS.warn, i: I.bolt },
    { t: 'New deal in your watchlist', s: 'Aiolou 24 · DRS 87 · Capital open', c: TOKENS.deep_wood || TOKENS.cocoa, i: I.briefcase },
  ];
  return (
    <Page scroll>
      <PageHeader title="Updates" big sub="Today"/>
      <Stack gap={8}>
        {items.map((it, i) => (
          <Card key={i} pad={12}>
            <Row gap={12}>
              <div style={{ width: 34, height: 34, borderRadius: 10, background: it.c + '1A', color: it.c, display: 'grid', placeItems: 'center' }}>{it.i(it.c)}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: TOKENS.ink }}>{it.t}</div>
                <div style={{ fontSize: 11.5, color: TOKENS.inkSoft, marginTop: 2 }}>{it.s}</div>
              </div>
            </Row>
          </Card>
        ))}
      </Stack>
    </Page>
  );
}

// Profile (shared, Airbnb-style)
function ScreenProfile() {
  return (
    <Page scroll>
      <PageHeader title="Profile" big right={<div style={{ width: 34, height: 34, borderRadius: 999, background: TOKENS.screenSubtle, display: 'grid', placeItems: 'center' }}>{I.bell(TOKENS.inkSoft)}</div>}/>
      <Card pad={18} style={{ marginTop: 8 }}>
        <Row gap={16}>
          <div style={{ position: 'relative' }}>
            <Avatar name="Maya" size={68} color={TOKENS.caramel}/>
            <div style={{ position: 'absolute', bottom: -2, right: -2, width: 22, height: 22, borderRadius: 999, background: TOKENS.accent, color: '#fff', display: 'grid', placeItems: 'center', border: '2px solid #fff' }}>{I.check('#fff')}</div>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: 'Fraunces, Georgia, serif', fontWeight: 600, fontSize: 22, color: TOKENS.ink, letterSpacing: '-0.02em' }}>Maya</div>
            <div style={{ fontSize: 12, color: TOKENS.inkSoft, marginTop: 1 }}>Aiolou 24 · Apt 3B</div>
            <Row gap={6} style={{ marginTop: 8 }}>
              <Pill color={TOKENS.accent}>★ Verified</Pill>
              <Pill color={TOKENS.cocoa} kind="soft">2 yrs</Pill>
            </Row>
          </div>
        </Row>
        <Row gap={0} style={{ marginTop: 16, borderTop: `1px solid ${TOKENS.hairlineSoft}`, paddingTop: 14 }}>
          <Metric label="Balance" value="€48.20"/>
          <div style={{ width: 1, background: TOKENS.hairlineSoft, margin: '0 12px' }}/>
          <Metric label="Owned" value="2.4" unit="%"/>
          <div style={{ width: 1, background: TOKENS.hairlineSoft, margin: '0 12px' }}/>
          <Metric label="Saved" value="€127"/>
        </Row>
      </Card>
      <Stack gap={8} style={{ marginTop: 12 }}>
        {['Wallet & top-up','Ownership','Building','Settings','Help'].map((l,i) => (
          <Card key={i} pad={14}><Row style={{ justifyContent: 'space-between' }}>
            <span style={{ fontSize: 13.5, fontWeight: 500, color: TOKENS.ink }}>{l}</span>
            <span style={{ fontSize: 11, color: TOKENS.inkMute }}>›</span>
          </Row></Card>
        ))}
      </Stack>
    </Page>
  );
}

Object.assign(window, {
  ScreenWelcome, ScreenVerify, ScreenRolePicker,
  ScreenBuildingDetail, ScreenNotifications, ScreenProfile,
});
