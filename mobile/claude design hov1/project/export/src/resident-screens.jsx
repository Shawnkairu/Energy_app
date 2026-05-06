// resident-screens.jsx — Resident role mocks (Tesla/Robinhood-inspired but warm-light)

// Onboarding QR
function ResJoinQR() {
  return (
    <Page>
      <NavBar title="Join building"/>
      <PageHeader title="Scan your building's QR" sub="Step 1 of 3"/>
      <div style={{ marginTop: 14, position: 'relative' }}>
        <div style={{
          aspectRatio: '1', background: TOKENS.screenSubtle, borderRadius: 18,
          display: 'grid', placeItems: 'center', position: 'relative', overflow: 'hidden',
        }}>
          {/* corner brackets */}
          {[
            { top: 16, left: 16, br: '6px 0 0 0' },
            { top: 16, right: 16, br: '0 6px 0 0' },
            { bottom: 16, left: 16, br: '0 0 0 6px' },
            { bottom: 16, right: 16, br: '0 0 6px 0' },
          ].map((p, i) => {
            const corners = {
              0: { borderTop: `3px solid ${TOKENS.accent}`, borderLeft: `3px solid ${TOKENS.accent}` },
              1: { borderTop: `3px solid ${TOKENS.accent}`, borderRight: `3px solid ${TOKENS.accent}` },
              2: { borderBottom: `3px solid ${TOKENS.accent}`, borderLeft: `3px solid ${TOKENS.accent}` },
              3: { borderBottom: `3px solid ${TOKENS.accent}`, borderRight: `3px solid ${TOKENS.accent}` },
            }[i];
            return <div key={i} style={{ position: 'absolute', width: 36, height: 36, ...p, ...corners, borderRadius: p.br }}/>;
          })}
          <div style={{ width: '60%', height: '60%', borderRadius: 14, background: '#fff', display: 'grid', placeItems: 'center', boxShadow: '0 8px 30px -16px rgba(0,0,0,0.15)' }}>
            {/* fake qr */}
            <svg width="120" height="120" viewBox="0 0 21 21">
              {Array.from({length: 21}).map((_,r) =>
                Array.from({length: 21}).map((_,c) => {
                  const v = (r*7+c*3+r*c) % 5;
                  if (v < 2) return <rect key={r+'-'+c} x={c} y={r} width="1" height="1" fill={TOKENS.ink}/>;
                  return null;
                })
              )}
              {[[0,0],[14,0],[0,14]].map(([x,y],i) => <g key={i}>
                <rect x={x} y={y} width="7" height="7" fill={TOKENS.ink}/>
                <rect x={x+1} y={y+1} width="5" height="5" fill="#fff"/>
                <rect x={x+2} y={y+2} width="3" height="3" fill={TOKENS.ink}/>
              </g>)}
            </svg>
          </div>
        </div>
      </div>
      <div style={{ marginTop: 14, fontSize: 12.5, color: TOKENS.inkSoft, textAlign: 'center', lineHeight: 1.5 }}>
        Or enter the 6-letter code from your building lobby
      </div>
      <div style={{ marginTop: 10, padding: '12px 14px', background: '#fff', border: `1px solid ${TOKENS.hairline}`, borderRadius: 12, fontFamily: 'JetBrains Mono, monospace', fontSize: 14, letterSpacing: '0.32em', textAlign: 'center', color: TOKENS.ink }}>
        AIOLOU
      </div>
    </Page>
  );
}

// Resident home — Tesla-inspired energy flow but warm-light
function ResHome() {
  return (
    <Page>
      <Row style={{ justifyContent: 'space-between', padding: '4px 2px 12px' }}>
        <div>
          <div style={{ fontSize: 11, color: TOKENS.inkMute, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Aiolou 24 · 3B</div>
          <div style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: 22, fontWeight: 600, letterSpacing: '-0.02em', color: TOKENS.ink, marginTop: 2 }}>Good morning, Maya</div>
        </div>
        <Avatar name="M" size={36}/>
      </Row>

      {/* Big balance card */}
      <Card pad={16} style={{ background: `linear-gradient(160deg, ${TOKENS.fur_cream}, #FFFFFF)` }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: TOKENS.accent }}>Solar wallet</div>
        <Row style={{ alignItems: 'baseline', marginTop: 4 }}>
          <span style={{ fontFamily: 'Fraunces, Georgia, serif', fontWeight: 600, fontSize: 42, letterSpacing: '-0.03em', color: TOKENS.ink, lineHeight: 1 }}>€48.20</span>
          <span style={{ fontSize: 12, color: TOKENS.inkSoft, marginLeft: 8 }}>≈ 142 kWh</span>
        </Row>
        <Row style={{ marginTop: 12, justifyContent: 'space-between' }}>
          <Pill color={TOKENS.ok}>● Solar-first active</Pill>
          <span style={{ fontSize: 11, color: TOKENS.inkSoft }}>Refills Tue</span>
        </Row>
      </Card>

      {/* Energy flow — Enphase-inspired */}
      <Card pad={14} style={{ marginTop: 12 }}>
        <Row style={{ justifyContent: 'space-between', marginBottom: 10 }}>
          <div style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: TOKENS.inkSoft }}>Live now</div>
          <Dot color={TOKENS.ok}/>
        </Row>
        <svg width="264" height="120" viewBox="0 0 264 120">
          {/* sun */}
          <g transform="translate(40,30)"><circle r="20" fill={TOKENS.accent + '22'} stroke={TOKENS.accent} strokeWidth="1.5"/><circle r="6" fill={TOKENS.accent}/></g>
          {/* battery */}
          <g transform="translate(224,30)"><rect x="-18" y="-12" width="36" height="24" rx="6" fill={TOKENS.cocoa + '14'} stroke={TOKENS.cocoa} strokeWidth="1.5"/><rect x="-14" y="-8" width="20" height="16" rx="3" fill={TOKENS.cocoa}/></g>
          {/* home */}
          <g transform="translate(132,90)"><path d="M-18 6 L0 -10 L18 6 L18 16 L-18 16 Z" fill={TOKENS.accent} stroke={TOKENS.accent} strokeWidth="1"/></g>
          {/* lines with animated dashes */}
          <path d="M60 36 Q 96 36 132 80" stroke={TOKENS.accent} strokeWidth="1.6" fill="none" strokeDasharray="3 3"/>
          <path d="M204 36 Q 168 36 132 80" stroke={TOKENS.cocoa} strokeWidth="1.6" fill="none" strokeDasharray="3 3"/>
          {/* labels */}
          <text x="40" y="68" textAnchor="middle" fontFamily="Inter" fontSize="10" fill={TOKENS.inkSoft}>Solar</text>
          <text x="40" y="80" textAnchor="middle" fontFamily="Fraunces" fontSize="13" fontWeight="600" fill={TOKENS.ink}>2.4 kW</text>
          <text x="224" y="68" textAnchor="middle" fontFamily="Inter" fontSize="10" fill={TOKENS.inkSoft}>Battery</text>
          <text x="224" y="80" textAnchor="middle" fontFamily="Fraunces" fontSize="13" fontWeight="600" fill={TOKENS.ink}>71%</text>
          <text x="132" y="118" textAnchor="middle" fontFamily="Inter" fontSize="10" fill={TOKENS.inkSoft}>Home · 0.9 kW</text>
        </svg>
      </Card>

      {/* allocation legend */}
      <Card pad={12} style={{ marginTop: 10 }}>
        <Row style={{ height: 8, borderRadius: 999, overflow: 'hidden' }}>
          <div style={{ flex: 64, background: TOKENS.accent }}/>
          <div style={{ flex: 22, background: TOKENS.cocoa }}/>
          <div style={{ flex: 14, background: TOKENS.inkMute }}/>
        </Row>
        <Row style={{ marginTop: 10, justifyContent: 'space-between', fontSize: 11 }}>
          <Row gap={6}><Dot color={TOKENS.accent}/><span style={{ color: TOKENS.inkSoft }}>Solar 64%</span></Row>
          <Row gap={6}><Dot color={TOKENS.cocoa}/><span style={{ color: TOKENS.inkSoft }}>Battery 22%</span></Row>
          <Row gap={6}><Dot color={TOKENS.inkMute}/><span style={{ color: TOKENS.inkSoft }}>Grid 14%</span></Row>
        </Row>
      </Card>

      <TabBar tabs={[
        { icon: I.home(), label: 'Home' },
        { icon: I.bolt(), label: 'Energy' },
        { icon: I.wallet(), label: 'Wallet' },
        { icon: I.user(), label: 'Profile' },
      ]} active={0} accent={TOKENS.accent}/>
    </Page>
  );
}

// Resident energy detail (Tesla Powerwall style adapted to light)
function ResEnergyDetail() {
  return (
    <Page>
      <NavBar title="Energy" right={<I.cog c={TOKENS.inkSoft}/>}/>
      <Row style={{ justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: 11.5, color: TOKENS.inkSoft, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Today</div>
          <Row gap={20} style={{ marginTop: 6 }}>
            <Metric label="Used" value="6.4" unit="kWh" color={TOKENS.accent}/>
            <Metric label="From solar" value="4.1" unit="kWh"/>
            <Metric label="Grid" value="0.9" unit="kWh" color={TOKENS.inkMute}/>
          </Row>
        </div>
        <Pill color={TOKENS.cocoa} kind="soft">Day ▾</Pill>
      </Row>

      <div style={{ position: 'relative', marginTop: 14, height: 170, background: '#FFFFFF', border: `1px solid ${TOKENS.hairline}`, borderRadius: 14, padding: 12 }}>
        <div style={{ position: 'absolute', top: 12, left: 14, fontSize: 9, color: TOKENS.inkMute, fontFamily: 'JetBrains Mono', letterSpacing: '0.06em' }}>2.0 kW</div>
        <div style={{ position: 'absolute', bottom: 30, left: 14, fontSize: 9, color: TOKENS.inkMute, fontFamily: 'JetBrains Mono' }}>0</div>
        <MiniChart values={[0.1,0.2,0.3,0.4,1.2,1.6,1.8,1.9,1.7,1.5,1.4,1.5,1.2,0.9,0.6,0.3,0.2,0.4,0.6,0.8,0.5,0.3,0.2,0.1]} w={264} h={130} color={TOKENS.accent} fill={TOKENS.accent + '20'} dotEnd={false}/>
        <Row style={{ marginTop: -2, justifyContent: 'space-between', fontSize: 9, color: TOKENS.inkMute, fontFamily: 'JetBrains Mono' }}>
          <span>00</span><span>06</span><span>12</span><span>18</span><span>24</span>
        </Row>
      </div>

      <Card pad={14} style={{ marginTop: 12 }}>
        <Row style={{ justifyContent: 'space-between' }}>
          <Row gap={10}><div style={{ width: 30, height: 30, borderRadius: 9, background: TOKENS.accent + '1A', display: 'grid', placeItems: 'center' }}>{I.sun(TOKENS.accent)}</div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600 }}>Solar-first</div>
              <div style={{ fontSize: 11.5, color: TOKENS.inkSoft }}>Battery → Grid as fallback</div>
            </div>
          </Row>
          <div style={{ width: 36, height: 22, borderRadius: 999, background: TOKENS.accent, position: 'relative' }}>
            <div style={{ position: 'absolute', right: 2, top: 2, width: 18, height: 18, borderRadius: 999, background: '#fff' }}/>
          </div>
        </Row>
      </Card>
    </Page>
  );
}

// Resident wallet & top-up (Robinhood-inspired finance hierarchy in light)
function ResWallet() {
  return (
    <Page>
      <NavBar title="Wallet"/>
      <div>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: TOKENS.accent }}>Prepaid balance</div>
        <Row style={{ alignItems: 'baseline', marginTop: 4 }}>
          <span style={{ fontFamily: 'Fraunces, Georgia, serif', fontWeight: 600, fontSize: 44, letterSpacing: '-0.03em', color: TOKENS.ink, lineHeight: 1 }}>€48.20</span>
        </Row>
        <Row gap={6} style={{ marginTop: 6 }}>
          <span style={{ color: TOKENS.ok, fontSize: 12, fontWeight: 600 }}>▲ €4.10 (8.3%) saved this month</span>
        </Row>
      </div>

      {/* timeline chart */}
      <div style={{ marginTop: 14 }}>
        <MiniChart values={[20,22,21,23,28,30,33,31,35,38,42,46,48]} w={284} h={88} color={TOKENS.accent} fill={TOKENS.accent + '20'} baseline/>
      </div>
      <Row style={{ marginTop: 8, gap: 6, fontSize: 10.5 }}>
        {['1D','1W','1M','3M','YTD','1Y'].map((l,i) => (
          <div key={l} style={{
            padding: '5px 9px', borderRadius: 999,
            background: i === 2 ? TOKENS.accent : 'transparent',
            color: i === 2 ? '#fff' : TOKENS.inkSoft, fontWeight: 600,
          }}>{l}</div>
        ))}
      </Row>

      <Card pad={14} style={{ marginTop: 14 }}>
        <Row gap={10} style={{ justifyContent: 'space-between' }}>
          <Button primary>Top up</Button>
          <Button>Buy ownership</Button>
        </Row>
      </Card>

      <div style={{ marginTop: 12, fontSize: 11, color: TOKENS.inkMute, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Recent</div>
      <Stack gap={6} style={{ marginTop: 6 }}>
        {[
          { l: 'Solar use · April 26', v: '−€1.40', c: TOKENS.inkSoft },
          { l: 'Top up · Card', v: '+€20.00', c: TOKENS.ok },
          { l: 'Settlement payout', v: '+€0.92', c: TOKENS.accent },
        ].map((r,i) => (
          <Row key={i} style={{ justifyContent: 'space-between', padding: '10px 4px', borderBottom: `1px solid ${TOKENS.hairlineSoft}` }}>
            <span style={{ fontSize: 13, color: TOKENS.ink, fontWeight: 500 }}>{r.l}</span>
            <span style={{ fontSize: 13, color: r.c, fontWeight: 600 }}>{r.v}</span>
          </Row>
        ))}
      </Stack>
    </Page>
  );
}

// Resident ownership (buy shares)
function ResOwnership() {
  return (
    <Page>
      <NavBar title="Ownership"/>
      <PageHeader title="Own a slice of your roof" sub="Optional · After 30 days"/>
      <Card pad={14} style={{ marginTop: 8, background: `linear-gradient(160deg, ${TOKENS.cream}, #FFFFFF)` }}>
        <Row style={{ justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 11.5, color: TOKENS.inkSoft, fontWeight: 600 }}>Current price</div>
            <div style={{ fontFamily: 'Fraunces, Georgia, serif', fontWeight: 600, fontSize: 28, letterSpacing: '-0.02em', color: TOKENS.ink }}>€42.00 <span style={{ fontSize: 12, color: TOKENS.inkSoft }}>/ share</span></div>
          </div>
          <Pill color={TOKENS.ok}>● Open</Pill>
        </Row>
        <div style={{ marginTop: 10 }}>
          <MiniChart values={[34,36,33,35,38,40,39,42]} w={264} h={56} color={TOKENS.accent} fill={TOKENS.accent + '18'}/>
        </div>
      </Card>
      <Card pad={14} style={{ marginTop: 10 }}>
        <Row style={{ justifyContent: 'space-between' }}>
          <Metric label="You own" value="2.4" unit="%"/>
          <Metric label="Building cap" value="30" unit="%"/>
          <Metric label="Est. royalty" value="€8.40" unit="/mo" color={TOKENS.accent}/>
        </Row>
        <div style={{ marginTop: 12 }}>
          <Progress value={0.08} color={TOKENS.accent} label="Your share" right="2.4 / 30%"/>
        </div>
      </Card>
      <div style={{ position: 'absolute', bottom: 16, left: 18, right: 18 }}>
        <Button primary full>Buy 1 share · €42.00</Button>
      </div>
    </Page>
  );
}

Object.assign(window, { ResJoinQR, ResHome, ResEnergyDetail, ResWallet, ResOwnership });
