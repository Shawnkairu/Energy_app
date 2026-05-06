import { useState } from 'react'
import { submitWaitlistLead, type WaitlistSubmission } from '@emappa/api-client'
import './marketing.css'

export default function App() {
  return (
    <div className="marketing-shell" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <main>
        <Hero />
        <ProblemSection />
        <WhatIsEmappa />
        <SolarTokens />
        <EnergyIndependence />
        <WhoWeServe />
        <HowItWorks />
        <TheMarketplace />
        <ComingSoon />
        <NetworkSection />
        <WhyKenya />
        <Commitments />
        <Team />
        <WaitlistSection />
        <InvestorsSection />
      </main>
      <Footer />
    </div>
  )
}

/* ─── SHARED STYLES ─── */
const s = {
  container: {
    maxWidth: '1180px',
    margin: '0 auto',
    padding: '0 24px',
  } as React.CSSProperties,
  badge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    background: 'rgba(162,191,217,0.18)',
    color: 'var(--teal-darker)',
    border: '1px solid rgba(74,92,122,0.14)',
    borderRadius: '999px',
    padding: '6px 14px',
    fontSize: '11px',
    fontWeight: 700,
    letterSpacing: '0.08em',
    textTransform: 'uppercase' as const,
    marginBottom: '20px',
    boxShadow: '0 1px 0 rgba(255,255,255,0.6) inset',
  } as React.CSSProperties,
  section: (bg?: string): React.CSSProperties => ({
    padding: '88px 0',
    background: bg || 'var(--white)',
  }),
  h2: {
    fontSize: 'clamp(1.75rem, 3.2vw, 2.45rem)',
    fontWeight: 800,
    lineHeight: 1.15,
    color: 'var(--navy)',
    marginBottom: '14px',
    letterSpacing: '-0.035em',
  } as React.CSSProperties,
  body: {
    fontSize: '0.98rem',
    lineHeight: 1.66,
    color: 'var(--text-soft)',
  } as React.CSSProperties,
  card: {
    background: 'var(--white)',
    borderRadius: '18px',
    border: '1px solid var(--border)',
    padding: '24px',
    boxShadow: '0 12px 34px rgba(47, 51, 56, 0.07)',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease',
  } as React.CSSProperties,
}

type IconName =
  | 'bolt'
  | 'sun'
  | 'city'
  | 'hardware'
  | 'app'
  | 'battery'
  | 'payments'
  | 'building'
  | 'eye'
  | 'leaf'
  | 'home'
  | 'provider'
  | 'chart'
  | 'trade'
  | 'balcony'
  | 'phone'
  | 'document'
  | 'wrench'
  | 'pin'
  | 'spark'
  | 'plug'
  | 'shield'
  | 'scale'
  | 'network'
  | 'party'

function Glyph({ name, size = 22 }: { name: IconName; size?: number }) {
  const common = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  }

  switch (name) {
    case 'bolt':
      return <svg {...common}><path d="M13 2 5 14h5l-1 8 8-12h-5l1-8Z" /></svg>
    case 'sun':
      return <svg {...common}><circle cx="12" cy="12" r="4" /><path d="M12 2v3M12 19v3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M2 12h3M19 12h3M4.9 19.1 7 17M17 7l2.1-2.1" /></svg>
    case 'city':
      return <svg {...common}><path d="M3 21V8l6-3v16M9 21V3l6 3v15M15 21v-8l6-3v11M6 11h.01M6 15h.01M12 9h.01M12 13h.01M18 14h.01M18 18h.01" /></svg>
    case 'hardware':
      return <svg {...common}><path d="M4 18h16M6 18V8l6-4 6 4v10M9 11h6M9 14h6" /></svg>
    case 'app':
      return <svg {...common}><rect x="7" y="2.5" width="10" height="19" rx="2.5" /><path d="M10 6h4M12 18h.01" /></svg>
    case 'battery':
      return <svg {...common}><rect x="2" y="8" width="18" height="8" rx="2" /><path d="M22 11v2M6 11h6M9 8v8" /></svg>
    case 'payments':
      return <svg {...common}><rect x="3" y="5" width="18" height="14" rx="3" /><path d="M3 10h18M7 15h4" /></svg>
    case 'building':
      return <svg {...common}><path d="M5 21V6l7-3 7 3v15M9 10h.01M9 14h.01M15 10h.01M15 14h.01M10 21v-3h4v3" /></svg>
    case 'eye':
      return <svg {...common}><path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z" /><circle cx="12" cy="12" r="2.5" /></svg>
    case 'leaf':
      return <svg {...common}><path d="M19 5c-6 0-10 3.5-10 10 0 2.2.8 4.3 2.2 5.8C18 19 19 13 19 5Z" /><path d="M5 19c2.5-3 5.8-5.4 10-7" /></svg>
    case 'home':
      return <svg {...common}><path d="M3 11 12 4l9 7" /><path d="M5 10.5V20h14v-9.5M10 20v-5h4v5" /></svg>
    case 'provider':
      return <svg {...common}><path d="M3 18h18M5 18l2-8h10l2 8M9 10V6h6v4" /></svg>
    case 'chart':
      return <svg {...common}><path d="M4 19V5M4 19h16" /><path d="m7 15 3-3 3 2 4-5" /></svg>
    case 'trade':
      return <svg {...common}><path d="M7 7h11l-3-3M17 17H6l3 3" /><path d="M18 7 7 18" /></svg>
    case 'balcony':
      return <svg {...common}><path d="M4 20h16M6 20v-7h12v7M9 13V7h6v6M7 17h10" /></svg>
    case 'phone':
      return <svg {...common}><path d="M6 4h12v16H6z" /><path d="M10 7h4M10 17h4" /></svg>
    case 'document':
      return <svg {...common}><path d="M7 3h7l5 5v13H7z" /><path d="M14 3v5h5M10 13h6M10 17h6" /></svg>
    case 'wrench':
      return <svg {...common}><path d="M14 6a4 4 0 0 0 4.8 4.8l-7.6 7.6a2 2 0 0 1-2.8-2.8l7.6-7.6A4 4 0 0 0 14 6Z" /><path d="m18 6 1.5-1.5" /></svg>
    case 'pin':
      return <svg {...common}><path d="M12 21s6-5.8 6-11a6 6 0 1 0-12 0c0 5.2 6 11 6 11Z" /><circle cx="12" cy="10" r="2.5" /></svg>
    case 'spark':
      return <svg {...common}><path d="m12 2 2.1 5.9L20 10l-5.9 2.1L12 18l-2.1-5.9L4 10l5.9-2.1L12 2Z" /></svg>
    case 'plug':
      return <svg {...common}><path d="M9 7V3M15 7V3M8 7h8v3a4 4 0 0 1-4 4v7" /></svg>
    case 'shield':
      return <svg {...common}><path d="M12 3 5 6v5c0 4.5 3 8.2 7 10 4-1.8 7-5.5 7-10V6l-7-3Z" /><path d="m9.5 12 1.7 1.7 3.3-3.7" /></svg>
    case 'scale':
      return <svg {...common}><path d="M12 4v16M7 7h10M5 20h14" /><path d="m7 7-3 5h6l-3-5ZM17 7l-3 5h6l-3-5Z" /></svg>
    case 'network':
      return <svg {...common}><circle cx="5" cy="12" r="2" /><circle cx="19" cy="6" r="2" /><circle cx="19" cy="18" r="2" /><path d="M7 12h5M14.5 10.5 17.5 7.5M14.5 13.5l3 3" /></svg>
    case 'party':
      return <svg {...common}><path d="M4 4h16v16H4z" opacity="0" /><path d="m6 18 6-12 6 12" /><path d="M9.5 13h5M12 6V3M19 8l2-1M5 8 3 7" /></svg>
  }
}

function IconBadge({ name }: { name: IconName }) {
  return (
    <span className="icon-card" aria-hidden="true">
      <Glyph name={name} />
    </span>
  )
}

function ProductSuite() {
  const cards = [
    {
      title: 'Accept prepaid solar demand',
      body: 'Residents load balances through familiar payment behavior before allocation.',
      className: 'suite-card tall wallet',
      metric: 'KSh 7,667',
      label: 'resident balance',
    },
    {
      title: 'Operate shared rooftop supply',
      body: 'Providers plug capacity into measured buildings with clear generated and sold kWh.',
      className: 'suite-card wide flow',
      metric: '2,435 kWh',
      label: 'verified solar',
    },
    {
      title: 'Control deployment gates',
      body: 'Owners, installers, and suppliers move through readiness checks before go-live.',
      className: 'suite-card gates',
      metric: '83.9',
      label: 'DRS score',
    },
    {
      title: 'Settle only monetized energy',
      body: 'Generated energy pays out only after a building actually buys and uses it.',
      className: 'suite-card ledger',
      metric: '80%',
      label: 'sold coverage',
    },
    {
      title: 'Keep every role isolated',
      body: 'Residents, providers, owners, financiers, installers, and suppliers each get their own operating room.',
      className: 'suite-card wide roles',
      metric: '6',
      label: 'stakeholder portals',
    },
  ];

  return (
    <section className="product-suite" aria-label="e.mappa product suite">
      <div style={s.container}>
        <div className="suite-heading">
          <h2>Flexible operating rooms for every building energy model.</h2>
          <p>
            Start with prepaid solar for apartments. Grow into financing, fulfillment, ownership,
            maintenance, and settlement, all on one orange-and-white truth layer.
          </p>
        </div>
        <div className="suite-grid">
          {cards.map((card) => (
            <article key={card.title} className={card.className}>
              <div>
                <h3>{card.title}</h3>
                <p>{card.body}</p>
              </div>
              <div className="suite-mini-ui" aria-hidden="true">
                <strong>{card.metric}</strong>
                <span>{card.label}</span>
                <i />
                <i />
                <i />
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

function RadicalHero() {
  return (
    <section className="radical-hero">
      <div style={s.container} className="radical-hero-grid">
        <div className="radical-hero-copy">
          <div style={{ ...s.badge, background: 'rgba(224,120,86,0.12)', color: 'var(--peach-dark)', borderColor: 'rgba(224,120,86,0.2)' }}>
            Pilot planned in Nyeri, Kenya · June 2026
          </div>
          <h1>Energy operating systems for apartment buildings.</h1>
          <p className="hero-line">Map. Build. Empower.</p>
          <p>
            e.mappa turns a building into a measured energy economy: solar production, resident demand,
            prepaid tokens, deployment readiness, ownership, compliance, and settlement all move through
            one truth layer.
          </p>
          <div className="radical-hero-actions">
            <a href="#waitlist" style={btnPrimary}>Join the waitlist →</a>
            <a href="#how-it-works" style={btnSecondary}>See the system</a>
          </div>
          <div className="hero-proof-strip" aria-label="e.mappa stakeholder surfaces">
            {['Residents', 'Providers', 'Owners', 'Financiers', 'Installers', 'Suppliers'].map((label) => (
              <span key={label}>{label}</span>
            ))}
          </div>
        </div>

      </div>
    </section>
  )
}

function OperatingSystemScene() {
  const layers = [
    ['Physical layer', 'Rooftop access, panels, meters, inverter, battery, DB, and gateway.'],
    ['Data layer', 'Production, apartment load, battery state, certification proof, and audit trail.'],
    ['Economic layer', 'Prepaid tokens, monetized kWh, payout waterfall, ownership, and margins.'],
    ['Role layer', 'Residents, providers, owners, financiers, installers, and suppliers see only their truth.'],
  ];

  return (
    <section id="what-is-emappa" className="stripe-scene os-scene">
      <div style={s.container} className="scene-grid">
        <div className="scene-copy">
          <div style={s.badge}>What is e.mappa</div>
          <h2>A control plane for shared rooftop solar.</h2>
          <p>
            Stripe-like composition should not mean Stripe colors. For e.mappa, the product visual is the building:
            hardware above, homes below, and a software/economic layer in the middle that makes every kWh legible.
          </p>
        </div>
        <div className="layer-console">
          {layers.map(([title, body], index) => (
            <article key={title} style={{ ['--delay' as string]: `${index * 0.12}s` } as React.CSSProperties}>
              <span>{String(index + 1).padStart(2, '0')}</span>
              <strong>{title}</strong>
              <p>{body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

function BuildingEconomyScene() {
  return (
    <section id="solar-tokens" className="stripe-scene economy-scene">
      <div style={s.container}>
        <div className="economy-stage">
          <div className="scene-copy compact">
            <div style={s.badge}>Solar tokens</div>
            <h2>Prepaid energy that behaves like a product, not a bill.</h2>
            <p>
              Residents buy tokens before allocation. If solar is not available, there is fallback, not debt.
              That single invariant keeps the system honest.
            </p>
          </div>
          <div className="token-ledger-art">
            <div className="ledger-phone">
              <span>Resident wallet</span>
              <strong>KSh 7,667</strong>
              <small>solar balance</small>
              <div className="wallet-bars"><i /><i /><i /></div>
            </div>
            <div className="ledger-rail">
              {['M-Pesa', 'Tokens', 'Allocation', 'Savings'].map((item) => <span key={item}>{item}</span>)}
            </div>
            <div className="ledger-card">
              <span>Monthly result</span>
              <strong>KSh 622 saved</strong>
              <small>from monetized building solar</small>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function StakeholderMarketScene() {
  const roles = [
    ['Residents', 'Buy tokens, consume solar, see savings.'],
    ['Providers', 'Plug panels into verified demand.'],
    ['Owners', 'Host rooftops and track readiness.'],
    ['Financiers', 'Fund named building deals.'],
    ['Installers', 'Certify proof before go-live.'],
    ['Suppliers', 'Fulfill BOMs with warranty proof.'],
  ];

  return (
    <section id="who-we-serve" className="stripe-scene stakeholder-scene">
      <div style={s.container} className="stakeholder-stage">
        <div className="scene-copy">
          <div style={s.badge}>Who we serve</div>
          <h2>One market, six isolated operating rooms.</h2>
          <p>
            The product does not show one dashboard to everyone. It gives each participant a role-specific surface
            while the system reconciles data, gates, and settlement underneath.
          </p>
        </div>
        <div className="market-orbit">
          <div className="market-core">
            <span>e.mappa</span>
            <strong>truth layer</strong>
          </div>
          {roles.map(([role, body], index) => (
            <article key={role} className={`market-role role-${index + 1}`}>
              <strong>{role}</strong>
              <span>{body}</span>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

function DeploymentProofScene() {
  const gates = [
    ['Demand', 'Resident prepayment is visible before deployment.'],
    ['Readiness', 'DRS gates supplier lock, install scheduling, and go-live.'],
    ['Settlement', 'Only monetized solar creates payout.'],
  ];

  return (
    <section id="deployment-proof" className="stripe-scene proof-scene">
      <div style={s.container} className="scene-grid">
        <div className="scene-copy">
          <div style={s.badge}>Deployment discipline</div>
          <h2>Deploy after proof, not optimism.</h2>
          <p>
            e.mappa is not a solar company with a prettier app. It is the operating discipline around building-level
            energy economies: gates, proofs, settlement, and role isolation.
          </p>
        </div>
        <div className="proof-board">
          {gates.map(([title, body], index) => (
            <article key={title}>
              <span>{String(index + 1).padStart(2, '0')}</span>
              <strong>{title}</strong>
              <p>{body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

function NetworkScene() {
  return (
    <section id="network" className="stripe-scene network-scene">
      <div style={s.container} className="network-stage">
        <div className="scene-copy compact">
          <div style={s.badge}>Local network</div>
          <h2>Clean energy infrastructure becomes local industry.</h2>
          <p>
            Electricians, fabricators, suppliers, and providers are not side notes. They are the buildout engine.
          </p>
        </div>
        <div className="network-table">
          {[
            ['Electricians', 'Certification', 'Install proof and maintenance'],
            ['Fabricators', 'Build-to-spec', 'Racks, enclosures, brackets'],
            ['Suppliers', 'BOM fulfillment', 'Warranty, dispatch, delivery'],
            ['Providers', 'Panel capacity', 'Measured output and payout'],
          ].map(([role, status, detail]) => (
            <article key={role}>
              <strong>{role}</strong>
              <span>{status}</span>
              <small>{detail}</small>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

type NavDropdownItem = { label: string; href: string; description: string }
type NavDropdownColumn = { heading: string; items: NavDropdownItem[] }
type NavDropdownGroup = { label: string; summary: string; columns: NavDropdownColumn[] }

const navGroups: NavDropdownGroup[] = [
  {
    label: 'What is e.mappa',
    summary: 'Start with the problem, then define the product, then land the resident outcomes.',
    columns: [
      {
        heading: 'Foundation',
        items: [
          { label: 'The problem', href: '#problem', description: 'Why electricity access for apartment residents is still broken.' },
          { label: 'What is e.mappa', href: '#what-is-emappa', description: 'The shared rooftop system, software layer, and plug-in model.' },
        ],
      },
      {
        heading: 'Resident experience',
        items: [
          { label: 'Solar tokens', href: '#solar-tokens', description: 'How residents will buy and consume solar energy.' },
          { label: 'Energy independence', href: '#energy-independence', description: 'Reliability, visibility, and battery-backed continuity.' },
        ],
      },
    ],
  },
  {
    label: 'Marketplace',
    summary: 'Keep the audience, the operating flow, and the platform model in the same order as the page.',
    columns: [
      {
        heading: 'Core market',
        items: [
          { label: 'Who we serve', href: '#who-we-serve', description: 'The three core stakeholders and three network enablers.' },
        ],
      },
      {
        heading: 'Flow',
        items: [
          { label: 'How it works', href: '#how-it-works', description: 'The five-step flow from rooftop onboarding to payouts.' },
        ],
      },
      {
        heading: 'Model',
        items: [
          { label: 'The marketplace', href: '#marketplace', description: 'Why e.mappa is a platform, not a traditional solar company.' },
        ],
      },
    ],
  },
  {
    label: 'Buildout',
    summary: 'Future features, network scale, market logic, and principles all live in the same expansion lane.',
    columns: [
      {
        heading: 'Expansion',
        items: [
          { label: 'Roadmap', href: '#coming-soon', description: 'Fractional ownership, peer-to-peer trading, and balcony solar.' },
          { label: 'The network', href: '#network', description: 'Electricians, providers, fabricators, and suppliers around each building.' },
        ],
      },
      {
        heading: 'Proof',
        items: [
          { label: 'Why Kenya first', href: '#why-kenya', description: 'The market conditions that make the model possible here.' },
          { label: 'Our commitments', href: '#commitments', description: 'The trust and transparency standards behind the platform.' },
        ],
      },
    ],
  },
  {
    label: 'Company',
    summary: 'Keep the team, participation paths, and investor information together at the end of the story.',
    columns: [
      {
        heading: 'People',
        items: [
          { label: 'Team', href: '#team', description: 'Who is building e.mappa and why this work matters.' },
        ],
      },
      {
        heading: 'Get involved',
        items: [
          { label: 'Waitlist and partners', href: '#waitlist', description: 'Resident signups, building-owner interest, and partner intake.' },
        ],
      },
      {
        heading: 'Capital',
        items: [
          { label: 'Investors', href: '#investors', description: 'Pilot-stage investor and strategic partner entry point.' },
        ],
      },
    ],
  },
]

/* ─── NAVBAR ─── */
function Navbar() {
  const [open, setOpen] = useState(false)
  const [activeGroup, setActiveGroup] = useState<string | null>(null)

  const linkStyle: React.CSSProperties = {
    color: 'var(--slate)',
    fontSize: '0.9rem',
    fontWeight: 500,
    transition: 'color 0.15s',
    cursor: 'pointer',
  }

  const activeConfig = navGroups.find(group => group.label === activeGroup) ?? null

  function handleMobileGroupToggle(label: string) {
    setActiveGroup(current => current === label ? null : label)
  }

  function closeAllMenus() {
    setOpen(false)
    setActiveGroup(null)
  }

  return (
    <nav
      onMouseLeave={() => setActiveGroup(null)}
      style={{
      position: 'sticky', top: 0, zIndex: 100,
      background: 'rgba(255,255,255,0.78)',
      backdropFilter: 'blur(18px)',
      borderBottom: '1px solid rgba(10,10,10,0.06)',
      boxShadow: '0 10px 30px rgba(10, 10, 10, 0.05)',
      }}
    >
      <div style={{ ...s.container, display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '64px' }}>
        {/* Logo */}
        <a href="#" style={{ display: 'flex', alignItems: 'center', gap: '0px', fontWeight: 800, fontSize: '1.2rem', color: 'var(--navy)' }}>
          <span style={{ color: 'var(--emappa-solar-strong)' }}>e</span>
          <span>.mappa</span>
        </a>

        {/* Desktop nav */}
        <div
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1 }}
          className="desktop-nav"
        >
          <div className="nav-trigger-row">
            {navGroups.map(group => (
              <button
                key={group.label}
                type="button"
                className={`nav-trigger${activeGroup === group.label ? ' is-active' : ''}`}
                onMouseEnter={() => setActiveGroup(group.label)}
                onFocus={() => setActiveGroup(group.label)}
                onClick={() => setActiveGroup(current => current === group.label ? null : group.label)}
              >
                {group.label}
                <span className="nav-trigger-caret">▾</span>
              </button>
            ))}
          </div>
        </div>

        {/* Desktop CTAs */}
        <div style={{ display: 'flex', gap: '10px' }} className="desktop-nav">
          <a href="#partner" style={{ ...btnSecondary, padding: '8px 18px', fontSize: '0.875rem' }}>Partner with us</a>
          <a href="#waitlist" style={{ ...btnPrimary, padding: '8px 18px', fontSize: '0.875rem' }}>Join waitlist →</a>
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => {
            setOpen(current => !current)
            setActiveGroup(null)
          }}
          style={{ background: 'none', border: 'none', color: 'var(--navy)', padding: '8px' }}
          className="mobile-menu-btn"
          aria-label="Menu"
        >
          {open ? '✕' : '☰'}
        </button>
      </div>

      {activeConfig && (
        <div className="nav-dropdown-desktop" onMouseLeave={() => setActiveGroup(null)}>
          <div style={s.container}>
            <div className="nav-dropdown-panel">
              <div
                className="nav-dropdown-columns"
                style={{ gridTemplateColumns: `repeat(${activeConfig.columns.length}, minmax(0, 1fr))` }}
              >
                {activeConfig.columns.map(column => (
                  <div key={column.heading} className="nav-dropdown-column">
                    <div className="nav-dropdown-heading">{column.heading}</div>
                    <div className="nav-dropdown-list">
                      {column.items.map(item => (
                        <a key={item.label} href={item.href} className="nav-dropdown-link" onClick={() => setActiveGroup(null)}>
                          <strong className="nav-dropdown-link-title">{item.label}</strong>
                          <span className="nav-dropdown-link-copy">{item.description}</span>
                        </a>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {open && (
        <div style={{ borderTop: '1px solid var(--border)', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '16px' }} className="mobile-nav">
          {navGroups.map(group => (
            <div key={group.label} className="mobile-nav-group">
              <button
                type="button"
                className={`mobile-nav-trigger${activeGroup === group.label ? ' is-active' : ''}`}
                onClick={() => handleMobileGroupToggle(group.label)}
              >
                <span>{group.label}</span>
                <span className="nav-trigger-caret">{activeGroup === group.label ? '−' : '+'}</span>
              </button>

              {activeGroup === group.label && (
                <div className="mobile-nav-links">
                  {group.columns.flatMap(column => column.items).map(item => (
                    <a key={item.label} href={item.href} style={linkStyle} onClick={closeAllMenus}>
                      {item.label}
                    </a>
                  ))}
                </div>
              )}
            </div>
          ))}
          <div style={{ display: 'flex', gap: '10px', paddingTop: '8px' }}>
            <a href="#partner" style={{ ...btnSecondary, flex: 1, textAlign: 'center', fontSize: '0.875rem' }} onClick={closeAllMenus}>Partner with us</a>
            <a href="#waitlist" style={{ ...btnPrimary, flex: 1, textAlign: 'center', fontSize: '0.875rem' }} onClick={closeAllMenus}>Join waitlist</a>
          </div>
        </div>
      )}
    </nav>
  )
}

/* ─── HERO ─── */
function Hero() {
  return (
    <section className="marketing-hero" style={{
      background:
        'radial-gradient(circle at 86% 16%, rgba(224,120,86,0.18), transparent 26%), radial-gradient(circle at 12% 18%, rgba(162,191,217,0.2), transparent 26%), linear-gradient(180deg, #ffffff 0%, #f8fafb 48%, #f3f5f7 100%)',
      padding: '104px 0 84px',
      position: 'relative',
      overflow: 'hidden',
      borderBottom: '1px solid rgba(74,92,122,0.08)',
    }}>
      <div style={{ position: 'absolute', top: '-120px', right: '-60px', width: '420px', height: '420px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(224,120,86,0.22) 0%, rgba(224,120,86,0) 68%)' }} />
      <div style={{ position: 'absolute', bottom: '-120px', left: '-40px', width: '360px', height: '360px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(162,191,217,0.28) 0%, rgba(162,191,217,0) 70%)' }} />
      <div style={{ position: 'absolute', inset: '24px', borderRadius: '32px', border: '1px solid rgba(10,10,10,0.04)', pointerEvents: 'none' }} />
      <div className="hero-background-system" aria-hidden="true">
        <span className="system-thread one" />
        <span className="system-thread two" />
        <span className="system-thread three" />
        <span className="system-node-label top">prepaid demand</span>
        <span className="system-node-label middle">verified solar</span>
        <span className="system-node-label bottom">clear settlement</span>
      </div>

      <div style={{ ...s.container, position: 'relative', zIndex: 1 }}>
        <div className="hero-grid">
          <div className="hero-copy-restored">
            <div style={{ ...s.badge, background: 'rgba(224,120,86,0.12)', color: 'var(--peach-dark)', borderColor: 'rgba(224,120,86,0.2)' }}>
              Pilot planned in Nyeri, Kenya · June 2026
            </div>

            <h1 style={{
              fontSize: 'clamp(2.45rem, 5.1vw, 4.25rem)',
              fontWeight: 800,
              color: 'var(--navy)',
              lineHeight: 1.02,
              letterSpacing: '-0.055em',
              maxWidth: '860px',
              marginBottom: '18px',
            }}>
              A cleaner electricity market for apartment buildings.
            </h1>

            <p style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--peach-dark)', marginBottom: '16px', letterSpacing: '-0.02em' }}>
              Map. Build. Empower.
            </p>

            <p style={{ fontSize: '1rem', lineHeight: 1.68, color: 'var(--text-soft)', maxWidth: '640px', marginBottom: '32px' }}>
              Solar energy for apartment buildings, made accessible, affordable, and transparent. e.mappa will connect residents, energy providers,
              and building owners in one marketplace, supported by the electricians, fabricators, and suppliers who help the network come to life.
            </p>

            <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
              <a href="#waitlist" style={{ ...btnPrimary, padding: '14px 32px', fontSize: '1rem' }}>
                Join the waitlist →
              </a>
              <a href="#partner" style={{ ...btnSecondary, padding: '14px 32px', fontSize: '1rem' }}>
                Partner with us
              </a>
            </div>

            <div className="hero-stats" style={{ display: 'grid', gap: '16px', marginTop: '46px', paddingTop: '24px', borderTop: '1px solid rgba(74,92,122,0.12)', maxWidth: '720px' }}>
              {[
                { stat: '30–40%', label: 'target savings vs grid prices' },
                { stat: 'M-Pesa', label: 'native payment rail for token purchases' },
                { stat: 'Battery-backed', label: 'shared resilience at the building level' },
              ].map(({ stat, label }) => (
                <div key={stat}>
                  <div style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--navy)' }}>{stat}</div>
                  <div style={{ fontSize: '0.84rem', color: 'var(--slate)', marginTop: '6px', maxWidth: '180px' }}>{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ─── THE PROBLEM ─── */
function ProblemSection() {
  return (
    <section id="problem" style={s.section('var(--surface)')}>
      <div style={s.container}>
        <div style={{ maxWidth: '600px', marginBottom: '56px' }}>
          <div style={s.badge}>The Problem</div>
          <h2 style={s.h2}>Electricity shouldn't be a luxury.</h2>
          <p style={s.body}>
            Across Kenya and much of urban Africa, apartment residents have no control over their electricity.
            One provider. One price. No transparency. No alternatives.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '40px' }}>
          {[
            { icon: 'bolt' as IconName, title: 'No alternatives', body: "When the power goes out, which it does regularly, you wait. When your tokens run out, your lights go off. When prices rise, you pay more or sit in the dark." },
            { icon: 'sun' as IconName, title: 'Solar is abundant', body: "Kenya sits on the equator with some of the best solar irradiance in the world. The technology exists. The hardware is affordable. What is missing is access." },
            { icon: 'city' as IconName, title: 'Built for apartments', body: "Solar solutions have largely served homeowners. Millions of apartment residents, the majority of Kenya's urban population, have been left out. Until now." },
          ].map(({ icon, title, body }) => (
            <div key={title} style={s.card} className="card-hover">
              <div style={{ marginBottom: '16px' }}><IconBadge name={icon} /></div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--navy)', marginBottom: '10px' }}>{title}</h3>
              <p style={{ ...s.body, fontSize: '0.95rem' }}>{body}</p>
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}

/* ─── WHAT IS e.mappa ─── */
function WhatIsEmappa() {
  return (
    <section id="what-is-emappa" style={s.section()}>
      <div style={s.container}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '80px', alignItems: 'start' }} className="two-col">
          <div>
            <div style={s.badge}>What is e.mappa</div>
            <h2 style={s.h2}>A solar energy marketplace for apartment buildings.</h2>
            <p style={{ ...s.body, marginBottom: '20px' }}>
              We will build shared solar infrastructure on apartment rooftops and open it up to independent solar
              providers through a plug-in solar model. Instead of rebuilding every site from scratch, providers will be able to connect into shared infrastructure that is already in place. Residents will access that energy through our app, buying solar
              tokens cheaper than grid tokens, with full transparency.
            </p>
            <p style={s.body}>
              We will not replace the grid. We will complement it, like WiFi complements cellular networks.
              e.mappa will handle distributed solar at the building level. The grid will provide the backbone when solar
              is not available. Together, residents will get more reliable, more affordable, more transparent electricity.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {[
              { icon: 'hardware' as IconName, title: 'The physical layer', body: "Weatherproof rooftop infrastructure with modular panel mounts, a junction box, microinverters, battery storage, production meters, and a data gateway will be owned and maintained by e.mappa. That junction box is what makes plug-in solar possible. Providers will bring their panels, connect into the shared rooftop system, and plug in." },
              { icon: 'app' as IconName, title: 'The software layer', body: "A virtual allocation engine will track every kWh, who generated it, who consumed it, and what it is worth. On top of that, e.mappa will provide dedicated interfaces for residents, providers, building owners, electricians, fabricators, and component suppliers, so every participant in the network can manage work, see performance, and track earnings." },
              { icon: 'battery' as IconName, title: 'The battery layer', body: "Integrated battery storage at each building will store excess solar for evenings, cloudy periods, and grid outages. When the grid goes down, buildings will be able to keep running on stored solar." },
              { icon: 'payments' as IconName, title: 'The payments layer', body: "Everything will run through M-Pesa, the payment rail Kenyans already trust. Residents will use it to buy solar tokens, and everyone else in the network will use it to get paid through e.mappa, from providers earning on generation to electricians, fabricators, and suppliers earning on the work and components that keep each building running." },
            ].map(({ icon, title, body }) => (
              <div key={title} style={{ display: 'flex', gap: '16px', padding: '20px', borderRadius: '14px', border: '1px solid var(--border)', background: 'var(--surface)' }}>
                <div style={{ flexShrink: 0 }}><IconBadge name={icon} /></div>
                <div>
                  <div style={{ fontWeight: 700, color: 'var(--navy)', marginBottom: '6px' }}>{title}</div>
                  <p style={{ ...s.body, fontSize: '0.9rem' }}>{body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

/* ─── SOLAR TOKENS ─── */
function SolarTokens() {
  return (
    <section id="solar-tokens" style={s.section('var(--surface)')}>
      <div style={s.container}>
        <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 56px' }}>
          <div style={{ ...s.badge, display: 'inline-flex' }}>Solar Tokens</div>
          <h2 style={s.h2}>If you've lived in Kenya, you know the token.</h2>
          <p style={s.body}>
            Kenya uses a prepaid STS system for electricity. You buy a token via M-Pesa, enter it into your meter,
            and your power comes on. e.mappa will introduce <strong>solar tokens</strong>, a parallel token system powered by the sun.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '40px' }}>
          {[
            { title: 'Solar first', body: "When your building's solar panels are generating, you will consume solar energy first. The app will show your balance in real time: kWh available, savings versus grid, and when you are running low." },
            { title: 'Seamless fallback', body: "When solar runs out, at night or on heavy-demand days, your grid connection will take over seamlessly. No interruption. No confusion. Just electricity." },
            { title: 'Your choice, always', body: "Buy tokens on demand via M-Pesa, subscribe monthly for a fixed allocation with rollover, or combine both as a safety net. The choice is yours, and that choice is the point." },
          ].map(({ title, body }) => (
            <div key={title} style={s.card} className="card-hover">
              <div style={{ width: '4px', height: '32px', borderRadius: '4px', background: 'linear-gradient(to bottom, var(--teal-darker), var(--teal))', marginBottom: '20px' }} />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--navy)', marginBottom: '10px' }}>{title}</h3>
              <p style={{ ...s.body, fontSize: '0.95rem' }}>{body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─── ENERGY INDEPENDENCE ─── */
function EnergyIndependence() {
  return (
    <section id="energy-independence" style={s.section()}>
      <div style={s.container}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '80px', alignItems: 'center' }} className="two-col">
          <div style={{
            borderRadius: '24px',
            padding: '56px 48px',
            background: 'radial-gradient(circle at top right, rgba(224,120,86,0.18), transparent 28%), linear-gradient(155deg, #ffffff 0%, #f8fafc 58%, #eef2ff 100%)',
            minHeight: '360px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            boxShadow: '0 30px 80px rgba(15,23,42,0.12)',
          }}>
            <div style={{ marginBottom: '24px' }}><IconBadge name="building" /></div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--ink)', lineHeight: 1.2 }}>Your building.</div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--peach)', lineHeight: 1.2 }}>Your energy.</div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--ink)', lineHeight: 1.2, marginBottom: '20px' }}>Your choice.</div>
            <p style={{ color: 'var(--slate)', lineHeight: 1.7, fontSize: '0.95rem' }}>
              Apartment residents in Kenya will be able to take control of their electricity,
              not by going off-grid, not by buying expensive equipment, but by joining a marketplace
              that will give them options no one has offered before.
            </p>
          </div>

          <div>
            <div style={s.badge}>Energy Independence</div>
            <h2 style={s.h2}>Built on a simple belief.</h2>
            <p style={{ ...s.body, marginBottom: '20px' }}>
              Energy should be controlled by the people who use it, transparently, easily, and fairly.
              Every resident on the platform will be able to see exactly where their energy comes from, exactly what
              it will cost, and exactly how much they will save.
            </p>
            <p style={{ ...s.body, marginBottom: '32px' }}>
              The same marketplace infrastructure that will connect solar providers to residents can also connect
              any clean energy provider tomorrow. The platform is being designed to be energy-agnostic, ready to
              aggregate and distribute any form of clean generation as new technologies mature.
            </p>
            {[
              { icon: 'eye' as IconName, text: 'No opaque bills. No hidden surcharges. Full visibility, always.' },
              { icon: 'battery' as IconName, text: 'Stored solar keeps the lights on when the grid goes down.' },
              { icon: 'leaf' as IconName, text: 'Built to onboard any clean energy source, not just solar.' },
            ].map(({ icon, text }) => (
              <div key={text} style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', marginBottom: '16px' }}>
                <div style={{ flexShrink: 0 }}><IconBadge name={icon} /></div>
                <p style={{ ...s.body, fontSize: '0.95rem' }}>{text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

/* ─── WHO WE SERVE ─── */
function WhoWeServe() {
  return (
    <section id="who-we-serve" style={s.section('var(--surface)')}>
      <div style={s.container}>
        <div style={{ textAlign: 'center', marginBottom: '56px' }}>
          <div style={{ ...s.badge, display: 'inline-flex' }}>Who We Serve</div>
          <h2 style={{ ...s.h2, marginBottom: '8px' }}>Three core stakeholders. Three network enablers.</h2>
          <p style={{ ...s.body, fontSize: '1.1rem', maxWidth: '700px', margin: '0 auto' }}>
            The marketplace itself centers on residents, energy providers, and building owners. Around that core, electricians, fabricators, and component suppliers help make each building possible.
          </p>
        </div>

        <div style={{ marginBottom: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '18px' }}>
            <div style={s.badge}>Core Marketplace</div>
            <p style={{ ...s.body, fontSize: '0.95rem' }}>The three sides that directly exchange value on the platform.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
            {[
              {
                icon: 'home' as IconName, role: 'Residents', tagline: 'Buy tokens. Save money. Done.',
                body: "Residents will open the app, buy solar tokens or subscribe monthly, and start consuming cheaper, cleaner electricity once their building is on the network. They will be able to see solar consumed, token balance, and savings versus grid in real time.",
                highlights: ['30–40% cheaper electricity', 'Real-time consumption dashboard', 'M-Pesa payments', 'Battery backup included'],
              },
              {
                icon: 'provider' as IconName, role: 'Energy Providers', tagline: 'You do not have to be a company.',
                body: "A provider on e.mappa will be able to be a business, but it could also be an individual. A teacher, a shopkeeper, a retiree, anyone who buys a small number of panels and plugs into a partner building could earn from generation on the platform.",
                highlights: ['Open to individuals and small businesses', 'Ready infrastructure on arrival', 'Automated M-Pesa payouts', 'One installation, many customers'],
              },
              {
                icon: 'building' as IconName, role: 'Building Owners', tagline: 'One investment. Ongoing returns.',
                body: "Building owners will invest in a one-time rooftop infrastructure upgrade and will be positioned to earn a monthly revenue share from platform fees. Their tenants will get cheaper, more reliable electricity. Their building will become more attractive. Battery backup will mean the building can keep lights on during outages.",
                highlights: ['Monthly revenue share', 'Happier, loyal tenants', 'Battery backup for the building', 'e.mappa manages everything'],
              },
            ].map(({ icon, role, tagline, body, highlights }) => (
              <div key={role} style={{ ...s.card, display: 'flex', flexDirection: 'column' }} className="card-hover">
                <div style={{ marginBottom: '16px' }}><IconBadge name={icon} /></div>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--navy)', marginBottom: '4px' }}>{role}</h3>
                <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--teal-dark)', marginBottom: '16px' }}>{tagline}</p>
                <p style={{ ...s.body, fontSize: '0.9rem', flex: 1, marginBottom: '20px' }}>{body}</p>
                <ul style={{ borderTop: '1px solid var(--border)', paddingTop: '20px', listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {highlights.map(h => (
                    <li key={h} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.875rem', color: 'var(--navy)' }}>
                      <span style={{ color: 'var(--teal-dark)', fontWeight: 700 }}>✓</span> {h}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '18px', flexWrap: 'wrap' }}>
            <div style={s.badge}>Network Enablers</div>
            <p style={{ ...s.body, fontSize: '0.95rem' }}>The local partners who help install, supply, and scale the marketplace.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
            {[
              {
                icon: 'wrench' as IconName, role: 'Electricians', tagline: 'Local expertise becomes part of the platform.',
                body: "Every e.mappa building will need trusted installers and maintenance partners. Neighborhood electricians will become integral to rooftop setup, battery integration, safety testing, and long-term maintenance across the network.",
                highlights: ['Training and certification pathway', 'Installation income', 'Maintenance income', 'Trusted local relationships'],
              },
              {
                icon: 'hardware' as IconName, role: 'Fabricators', tagline: 'Local businesses scale with the network.',
                body: "Junction boxes, brackets, cable assemblies, enclosures, and rooftop mounting hardware will create recurring demand for local fabrication shops. As e.mappa grows, these manufacturing partners will grow with it.",
                highlights: ['Recurring fabrication demand', 'Clear technical specs', 'Build-to-spec opportunities', 'Growth with each new building'],
              },
              {
                icon: 'plug' as IconName, role: 'Component Suppliers', tagline: 'The parts pipeline becomes part of the platform.',
                body: "Microinverters, batteries, smart meters, protection hardware, and other electrical components will be sourced through local suppliers and distributors. Their inventory and relationships will help the network scale building by building.",
                highlights: ['Recurring component demand', 'Local procurement channels', 'Trusted electrical supply relationships', 'Supply chain visibility as the network grows'],
              },
            ].map(({ icon, role, tagline, body, highlights }) => (
              <div key={role} style={{ ...s.card, display: 'flex', flexDirection: 'column' }} className="card-hover">
                <div style={{ marginBottom: '16px' }}><IconBadge name={icon} /></div>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--navy)', marginBottom: '4px' }}>{role}</h3>
                <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--teal-dark)', marginBottom: '16px' }}>{tagline}</p>
                <p style={{ ...s.body, fontSize: '0.9rem', flex: 1, marginBottom: '20px' }}>{body}</p>
                <ul style={{ borderTop: '1px solid var(--border)', paddingTop: '20px', listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {highlights.map(h => (
                    <li key={h} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.875rem', color: 'var(--navy)' }}>
                      <span style={{ color: 'var(--teal-dark)', fontWeight: 700 }}>✓</span> {h}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

/* ─── HOW IT WORKS ─── */
function HowItWorks() {
  const hardwareNodes = [
    ['Provider A solar array', 'Production data', 'sun' as IconName],
    ['Provider A smart meter', 'Generation proof', 'hardware' as IconName],
    ['Provider B solar array', 'Production data', 'sun' as IconName],
    ['Hybrid inverter', 'Battery + MPPT', 'battery' as IconName],
    ['Main distribution board', 'Building load routing', 'document' as IconName],
    ['Grid CT / KPLC grid', 'Import / export data', 'plug' as IconName],
    ['Resident smart meters', 'Consumption data', 'hardware' as IconName],
    ['Apartments', 'Resident demand', 'home' as IconName],
  ];
  const leftActors = [
    ['Residents', 'Buy tokens, consume energy, view kWh, savings, balance', 'home' as IconName],
    ['Providers', 'Invest in panels, generate energy, view production and payouts', 'provider' as IconName],
    ['Building owners', 'Provide rooftop access, view demand, receive royalty', 'building' as IconName],
  ];
  const rightActors = [
    ['Suppliers', 'Supply panels, batteries, inverters, receive payments', 'plug' as IconName],
    ['Electricians', 'Install, route, meter, maintain, certify workflow', 'wrench' as IconName],
    ['Fabricators', 'Build mounts, rails, brackets, follow fabrication specs', 'hardware' as IconName],
  ];
  const dataEngine = [
    ['Production ingestion', 'Provider output', 'network' as IconName],
    ['Resident consumption', 'Apartment load', 'home' as IconName],
    ['Token allocation', 'Prepaid accounting', 'payments' as IconName],
    ['Audit trails', 'DRS evidence', 'document' as IconName],
    ['Analytics', 'Real-time visibility', 'eye' as IconName],
  ];
  const appModules = [
    ['Resident app', 'Token balance, kWh used, savings, payments', 'phone' as IconName],
    ['Provider portal', 'Production, performance, payouts', 'provider' as IconName],
    ['Building owner dashboard', 'Consumption, rooftop participation, royalty', 'building' as IconName],
  ];
  const operatingModules = [
    ['Payments & settlement', 'Top-ups, payouts, billing, settlement logic', 'payments' as IconName],
    ['Partner ops & compliance', 'Onboarding, certification workflows, install specs', 'shield' as IconName],
  ];
  const flowSteps = [
    ['1', 'Data is measured across production, consumption, and the grid.', 'hardware' as IconName],
    ['2', 'The operating layer ingests and validates data in real time.', 'network' as IconName],
    ['3', 'Tokens are allocated fairly and transparently to residents.', 'payments' as IconName],
    ['4', 'Stakeholders view live data via apps and dashboards.', 'phone' as IconName],
    ['5', 'Payments settle and payouts are automated.', 'scale' as IconName],
    ['6', 'Partners follow certified workflows and strict standards.', 'shield' as IconName],
  ];

  return (
    <section id="how-it-works" className="layered-screen how-system-section">
      <div style={s.container}>
        <div className="section-kicker-grid">
          <div>
            <div style={s.badge}>How It Works</div>
            <h2 style={s.h2}>A building-level energy economy, mapped end to end.</h2>
          </div>
          <p style={s.body}>
            Hardware, measured data, prepaid demand, stakeholder portals, and settlement move through one operating workflow. The graph below is modeled as a live system map: structured for clarity, not pasted as an image.
          </p>
        </div>

        <div className="reference-workflow-shell">
          <svg className="reference-wire-layer" viewBox="0 0 1400 760" preserveAspectRatio="none" aria-hidden="true">
            <defs>
              <marker id="referenceArrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto" markerUnits="strokeWidth">
                <path d="M0,0 L8,4 L0,8 Z" />
              </marker>
            </defs>
            <path className="ref-wire measured" d="M306 160 H1198" />
            <path className="ref-wire measured" d="M700 160 V278" />
            <path className="ref-wire measured" d="M700 590 V690" />
            <path className="ref-wire measured" d="M276 350 H420" />
            <path className="ref-wire measured" d="M276 463 H420" />
            <path className="ref-wire measured" d="M276 576 H420" />
            <path className="ref-wire ops" d="M982 350 H1112" />
            <path className="ref-wire ops" d="M982 463 H1112" />
            <path className="ref-wire ops" d="M982 576 H1112" />
            <path className="ref-wire payout" d="M276 510 H350 V620 H420" />
            <path className="ref-wire payout" d="M982 522 H1060 V410 H1112" />
            <text className="ref-wire-label" x="660" y="218">Measured data</text>
            <text className="ref-wire-label muted" x="330" y="332">App / dashboard</text>
            <text className="ref-wire-label muted" x="1015" y="332">Onboarding / certification / specs</text>
            <text className="ref-wire-label payout-label" x="1018" y="506">Payments / payouts</text>
          </svg>

          <aside className="reference-brand-panel">
            <strong>Building energy workflow</strong>
            <em>Measured. Transparent. Local.</em>
            <p>Coordinates hardware data, token allocation, stakeholder portals, partner proof, and settlement across one shared building economy.</p>
            <div className="reference-legend">
              <span><i />Measured data flow</span>
              <span><i />Payments / payouts flow</span>
              <span><i />Partner ops / compliance flow</span>
            </div>
          </aside>

          <section className="reference-hardware-layer">
            <h3>Technical / hardware layer - power & metering architecture</h3>
            <div className="reference-hardware-track">
              {hardwareNodes.map(([title, body, icon], index) => (
                <article key={title}>
                  <IconBadge name={icon as IconName} />
                  <div>
                    <strong>{title}</strong>
                    <span>{body}</span>
                  </div>
                  {index < hardwareNodes.length - 1 && <b aria-hidden="true">→</b>}
                </article>
              ))}
            </div>
          </section>

          <section className="reference-actors reference-left-actors">
            {leftActors.map(([title, body, icon]) => (
              <article key={title}>
                <IconBadge name={icon as IconName} />
                <div>
                  <strong>{title}</strong>
                  <span>{body}</span>
                </div>
              </article>
            ))}
          </section>

          <section className="reference-core">
            <div className="reference-core-title">
              <strong>Operating layer</strong>
              <span>Data, apps, payments, partner ops</span>
            </div>
            <div className="reference-core-block">
              <h3>A. Data engine</h3>
              <div className="reference-module-grid five">
                {dataEngine.map(([title, body, icon]) => (
                  <article key={title}>
                    <IconBadge name={icon as IconName} />
                    <strong>{title}</strong>
                    <span>{body}</span>
                  </article>
                ))}
              </div>
            </div>
            <div className="reference-core-block">
              <h3>B. Apps & dashboards</h3>
              <div className="reference-module-grid three">
                {appModules.map(([title, body, icon]) => (
                  <article key={title}>
                    <IconBadge name={icon as IconName} />
                    <strong>{title}</strong>
                    <span>{body}</span>
                  </article>
                ))}
              </div>
            </div>
            <div className="reference-core-bottom">
              {operatingModules.map(([title, body, icon], index) => (
                <div className="reference-core-block" key={title}>
                  <h3>{index === 0 ? 'C. Payments & settlement' : 'D. Partner ops & compliance'}</h3>
                  <article>
                    <IconBadge name={icon as IconName} />
                    <strong>{title}</strong>
                    <span>{body}</span>
                  </article>
                </div>
              ))}
            </div>
          </section>

          <section className="reference-actors reference-right-actors">
            {rightActors.map(([title, body, icon]) => (
              <article key={title}>
                <IconBadge name={icon as IconName} />
                <div>
                  <strong>{title}</strong>
                  <span>{body}</span>
                </div>
              </article>
            ))}
          </section>

          <section className="reference-flow-rail">
            <strong>How it works</strong>
            {flowSteps.map(([number, body, icon]) => (
              <article key={number}>
                <IconBadge name={icon as IconName} />
                <span>{number}. {body}</span>
              </article>
            ))}
            <div>
              <strong>Result</strong>
              <span>A trusted, transparent, repeatable energy economy for shared buildings.</span>
            </div>
          </section>
        </div>
      </div>
    </section>
  )
}

function OperatingLayerPreview() {
  const cards = [
    ['Data', 'Production, consumption, token allocation'],
    ['Apps', 'Role-specific dashboards and mobile views'],
    ['Settlement', 'Prepaid revenue waterfall and payouts'],
    ['Compliance', 'DRS gates, certification, audit trail'],
  ];

  return (
    <div className="operating-layer-preview">
      <div className="preview-orbit" aria-hidden="true" />
      <div className="preview-core-card">
        <span>e.mappa OS</span>
        <strong>One building. Many counterparties. One truth layer.</strong>
      </div>
      <div className="preview-card-grid">
        {cards.map(([title, body]) => (
          <article key={title}>
            <span>{title}</span>
            <strong>{body}</strong>
          </article>
        ))}
      </div>
    </div>
  );
}

/* ─── THE MARKETPLACE ─── */
function TheMarketplace() {
  return (
    <section id="marketplace" className="marketplace-layer-section">
      <div style={s.container}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '80px', alignItems: 'center' }} className="two-col">
          <div>
            <div style={{ ...s.badge, background: 'rgba(162,191,217,0.18)', color: 'var(--emappa-sky-strong)', borderColor: 'rgba(162,191,217,0.28)' }}>
              The Marketplace
            </div>
            <h2 style={s.h2}>We will not be a solar company. We will be the marketplace solar companies use.</h2>
            <p style={{ ...s.body, marginBottom: '20px' }}>
              A solar company owns panels, manages installations, and sells electricity. e.mappa will own the
              shared infrastructure layer and the software that will let multiple solar companies operate
              on the same rooftop, serve the same residents, and compete on reliability and output.
            </p>
            <p style={s.body}>
              Think of it like Airbnb for rooftop solar. Airbnb does not own apartments, it owns the marketplace.
              e.mappa will not own solar panels, it will own the marketplace connecting generation capacity
              to people who need affordable electricity.
            </p>
          </div>

          <OperatingLayerPreview />
        </div>
      </div>
    </section>
  )
}

/* ─── COMING SOON ─── */
function ComingSoon() {
  return (
    <section id="coming-soon" style={s.section('var(--surface)')}>
      <div style={s.container}>
        <div style={{ textAlign: 'center', marginBottom: '56px' }}>
          <div style={{ ...s.badge, display: 'inline-flex' }}>Roadmap</div>
          <h2 style={s.h2}>The features we're building next.</h2>
          <p style={{ ...s.body, maxWidth: '520px', margin: '0 auto' }}>
            The marketplace we plan to pilot in June 2026 will be the foundation. Here is where it could go next.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
          {[
            { icon: 'chart' as IconName, tag: 'Phase 2', title: 'Fractional solar ownership', body: "Buy shares in a rooftop solar array starting from as little as KSh 500. As the panels generate surplus energy sold through peer-to-peer trading, you earn proportional returns. Solar as an investment that is accessible, transparent, and community-powered." },
            { icon: 'trade' as IconName, tag: 'Phase 2', title: 'Peer-to-peer energy trading', body: "Under Kenya's Open Access Regulations 2024, surplus solar can be wheeled across the grid and sold to buyers in other buildings. Sellers earn from energy that would otherwise go to waste. Buyers pay less than grid prices. Everyone benefits." },
            { icon: 'balcony' as IconName, tag: 'Phase 3', title: 'Balcony solar', body: "If rooftop space is limited, residents with suitable balconies will be able to host a provider's panel, or install their own, and plug it into the building's shared system. Every balcony becomes a potential generation point." },
          ].map(({ icon, tag, title, body }) => (
            <div key={title} style={{ ...s.card, display: 'flex', flexDirection: 'column' }} className="card-hover">
              <div style={{ marginBottom: '12px' }}><IconBadge name={icon} /></div>
              <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--teal-dark)', marginBottom: '10px' }}>{tag}</span>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--navy)', marginBottom: '10px' }}>{title}</h3>
              <p style={{ ...s.body, fontSize: '0.9rem', flex: 1 }}>{body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function NetworkSection() {
  const scalePoints = [
    {
      number: '100',
      label: 'buildings',
      body: 'A network of trained electricians, a handful of local fabricators, and dozens of individual providers all earning because e.mappa will exist in their community.',
    },
    {
      number: '1,000',
      label: 'buildings',
      body: 'A regional workforce of certified installers, a local manufacturing supply chain, and hundreds of micro-entrepreneur providers whose livelihoods grow with the platform.',
    },
    {
      number: '10,000',
      label: 'buildings',
      body: 'An energy economy across East Africa with local jobs, local manufacturing, and local wealth creation in every neighborhood the network touches.',
    },
  ]

  const joinCards = [
    {
      icon: 'wrench' as IconName,
      title: 'Licensed electricians',
      body: 'Join our network of certified installation partners. We bring the training, the projects, and a growing pipeline of buildings.',
    },
    {
      icon: 'hardware' as IconName,
      title: 'Fabricators',
      body: 'If you manufacture enclosures, brackets, cable assemblies, or mounting hardware in Kenya, we want to hear from you.',
    },
    {
      icon: 'plug' as IconName,
      title: 'Component suppliers',
      body: 'If you supply batteries, microinverters, smart meters, breakers, or related electrical components, we want to talk.',
    },
    {
      icon: 'provider' as IconName,
      title: 'Future solar providers',
      body: 'You do not need a company or prior experience. You need two panels and the willingness to earn from them.',
    },
    {
      icon: 'phone' as IconName,
      title: 'Partners and referrals',
      body: 'Know a building, a neighborhood electrician, or a local supplier who should be part of the network? Send them our way.',
    },
  ]

  return (
    <section id="network" style={s.section()}>
      <div style={s.container}>
        <div style={{ maxWidth: '760px', marginBottom: '56px' }}>
          <div style={s.badge}>The e.mappa Network</div>
          <h2 style={s.h2}>We will not just bring energy to communities. We will build energy economies within them.</h2>
          <p style={{ ...s.body, fontSize: '1.08rem', marginBottom: '18px' }}>
            Every building e.mappa enters will create local work, local investment, and local opportunity. The infrastructure will be fabricated locally. The installations will be done by neighborhood electricians. The solar panels will be owned by local providers, individuals and small businesses earning returns from the sun.
          </p>
          <p style={s.body}>
            The money residents spend on solar tokens will circulate through their own community before it goes anywhere else. This is not a side effect. It is the design.
          </p>
          <p style={{ ...s.body, marginTop: '18px' }}>
            The marketplace will center on residents, providers, and building owners, while electricians, fabricators, and suppliers make that marketplace possible on the ground.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '28px' }}>
          {[
            {
              icon: 'wrench' as IconName,
              title: 'Local electricians',
              body: "Every e.mappa building will be installed by a licensed electrician from the neighborhood, someone who will already know the building owners, understand the local electrical infrastructure, and carry the trust that no outside company can replicate.",
              detail: "We plan to train and certify electricians through a dedicated e.mappa installation program covering rooftop infrastructure, microinverter connections, battery setup, and safety testing. They will earn on each installation and on ongoing maintenance. They will not be our employees. They will be independent professionals whose businesses can grow as e.mappa grows.",
            },
            {
              icon: 'provider' as IconName,
              title: 'Local providers',
              body: "A solar provider on e.mappa will not have to be a company. It could be anyone, a teacher, a shopkeeper, a retiree, who buys two panels, mounts them on a partner building's rooftop, and begins earning monthly income from their generation.",
              detail: "That could make solar a side hustle, a retirement plan, and a way to build wealth from an asset that produces value every day the sun rises. The barrier to entry will be the cost of two panels. The return would be automated M-Pesa deposits every month for 20 or more years.",
            },
            {
              icon: 'hardware' as IconName,
              title: 'Local fabricators',
              body: "Junction boxes, mounting brackets, cable harnesses, weatherproof enclosures, and racking systems could all be fabricated by Kenyan metalwork and electrical shops. We would design the specifications. Local fabricators would build to those specs.",
              detail: "As e.mappa scales, those fabrication shops could scale with it, hiring more workers, investing in better tooling, and growing around recurring demand from the network.",
            },
            {
              icon: 'plug' as IconName,
              title: 'Local suppliers',
              body: "Microinverters, batteries, smart meters, breakers, and protection hardware would be sourced through Kenyan electrical distributors and solar suppliers already serving the market.",
              detail: "Our certified electricians would source these locally as part of each installation using clear specifications and quality standards. That means every shilling of component spend would move through local suppliers rather than overseas procurement.",
            },
          ].map(({ icon, title, body, detail }) => (
            <div key={title} style={{ ...s.card, padding: '28px' }} className="card-hover">
              <div style={{ marginBottom: '16px' }}><IconBadge name={icon} /></div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--navy)', marginBottom: '10px' }}>{title}</h3>
              <p style={{ ...s.body, fontSize: '0.94rem', marginBottom: '12px' }}>{body}</p>
              <p style={{ ...s.body, fontSize: '0.9rem' }}>{detail}</p>
            </div>
          ))}
        </div>

        <div style={{
          background: 'radial-gradient(circle at top right, rgba(224,120,86,0.18), transparent 24%), linear-gradient(155deg, #ffffff 0%, var(--emappa-cream) 62%, var(--emappa-sky-soft) 100%)',
          borderRadius: '28px',
          padding: '40px',
          color: 'var(--navy)',
          marginBottom: '28px',
          border: '1px solid var(--border)',
          boxShadow: 'var(--shadow-layer)',
        }}>
          <div style={{ maxWidth: '640px', marginBottom: '28px' }}>
            <div style={s.badge}>What This Means At Scale</div>
            <h3 style={{ fontSize: 'clamp(1.8rem, 3vw, 2.5rem)', fontWeight: 800, lineHeight: 1.08, letterSpacing: '-0.04em', marginBottom: '12px' }}>
              Clean energy infrastructure becomes local industry.
            </h3>
            <p style={{ ...s.body, fontSize: '1rem' }}>
              As the platform scales, so will the local workforce, the fabrication base, and the pool of people earning from distributed generation.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
            {scalePoints.map(({ number, label, body }) => (
              <div key={number} style={{ borderRadius: '20px', background: 'rgba(255,255,255,0.72)', border: '1px solid var(--border)', padding: '22px', boxShadow: '0 14px 36px rgba(47,51,56,0.07)' }}>
                <div style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.04em', marginBottom: '2px', color: 'var(--emappa-solar-strong)' }}>{number}</div>
                <div style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--emappa-sky-strong)', marginBottom: '12px', fontWeight: 800 }}>{label}</div>
                <p style={{ ...s.body, fontSize: '0.92rem' }}>{body}</p>
              </div>
            ))}
          </div>
        </div>

        <div style={{ ...s.card, padding: '36px' }}>
          <div style={{ maxWidth: '720px', marginBottom: '24px' }}>
            <div style={s.badge}>Join The Network</div>
            <h3 style={{ fontSize: 'clamp(1.7rem, 3vw, 2.35rem)', fontWeight: 800, lineHeight: 1.1, letterSpacing: '-0.04em', color: 'var(--navy)', marginBottom: '12px' }}>
              The network only works if every part of it has a place to plug in.
            </h3>
            <p style={s.body}>
              We are planning this with electricians, fabricators, suppliers, local providers, and building partners from the start. If you want to be part of the network, reach out.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '28px' }}>
            {joinCards.map(({ icon, title, body }) => (
              <div key={title} style={{ borderRadius: '20px', border: '1px solid var(--border)', padding: '22px', background: '#fff' }}>
                <div style={{ marginBottom: '14px' }}><IconBadge name={icon} /></div>
                <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--navy)', marginBottom: '8px' }}>{title}</div>
                <p style={{ ...s.body, fontSize: '0.9rem' }}>{body}</p>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
            <p style={{ ...s.body, fontSize: '0.95rem', maxWidth: '560px' }}>
              Licensed electrician. Local fabricator. Supplier. Aspiring provider. If you can help build the network, we want to talk.
            </p>
            <a href="mailto:shawn.kairu@duke.edu?subject=Join%20the%20e.mappa%20network" style={{ ...btnPrimary, padding: '14px 28px', fontSize: '1rem' }}>
              Join the e.mappa network
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ─── WHY KENYA FIRST ─── */
function WhyKenya() {
  const reasons = [
    { icon: 'sun' as IconName, title: 'Exceptional solar irradiance', body: 'Kenya sits on the equator with among the best solar irradiance in the world.' },
    { icon: 'phone' as IconName, title: 'M-Pesa penetration', body: 'Payments work from day one, with no new financial infrastructure to build.' },
    { icon: 'document' as IconName, title: 'Open Access Regulations 2024', body: 'Explicitly permit third-party energy distribution and peer-to-peer wheeling.' },
    { icon: 'wrench' as IconName, title: 'Mature solar market', body: 'Providers, electricians, and equipment are already here.' },
    { icon: 'city' as IconName, title: 'Growing urban apartments', body: 'Rapidly expanding urban population living in the exact buildings we serve.' },
    { icon: 'pin' as IconName, title: 'Our roots are here', body: "A Kenyan solution to a Kenyan problem, built by someone who grew up watching the lights go out." },
  ]

  return (
    <section id="why-kenya" style={s.section()}>
      <div style={s.container}>
        <div style={{ maxWidth: '560px', marginBottom: '56px' }}>
          <div style={s.badge}>Why Kenya First</div>
          <h2 style={s.h2}>The fastest path to proof.</h2>
          <p style={s.body}>
            Every condition needed for e.mappa to work is already present in Kenya.
            No other market offers this combination at the scale we need to prove the model.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
          {reasons.map(({ icon, title, body }) => (
            <div key={title} style={{ padding: '24px', borderRadius: '14px', border: '1px solid var(--border)', background: 'var(--surface)' }}>
              <div style={{ marginBottom: '12px' }}><IconBadge name={icon} /></div>
              <h3 style={{ fontWeight: 700, color: 'var(--navy)', marginBottom: '8px' }}>{title}</h3>
              <p style={{ ...s.body, fontSize: '0.875rem' }}>{body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─── COMMITMENTS ─── */
function Commitments() {
  const items = [
    { icon: 'spark' as IconName, title: 'Empowerment', body: "Energy should be controlled by the people who use it. Every feature we build moves toward a future where communities own their energy destiny." },
    { icon: 'plug' as IconName, title: 'Independence', body: "With rooftop solar and integrated battery storage, your building generates and stores its own clean energy. When the grid goes down, your lights stay on." },
    { icon: 'eye' as IconName, title: 'Transparency', body: "Every resident sees exactly what they pay per kWh, where their energy comes from, and what they saved. No hidden fees. No opaque billing. Full visibility, always." },
    { icon: 'shield' as IconName, title: 'Reliability', body: "We target 90% uptime or better with remote monitoring, battery backup, and rapid maintenance response." },
    { icon: 'scale' as IconName, title: 'Fairness', body: "Providers are paid automatically on a predictable schedule. Building owners earn their share without managing anything. Residents get competitive pricing." },
    { icon: 'network' as IconName, title: 'Local value', body: "We train and employ local electricians and operators. Economic value stays in the communities we serve." },
  ]

  return (
    <section id="commitments" style={s.section('var(--surface)')}>
      <div style={s.container}>
        <div style={{ textAlign: 'center', marginBottom: '56px' }}>
          <div style={{ ...s.badge, display: 'inline-flex' }}>Our Commitments</div>
          <h2 style={s.h2}>What we stand by.</h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
          {items.map(({ icon, title, body }) => (
            <div key={title} style={s.card} className="card-hover">
              <div style={{ marginBottom: '16px' }}><IconBadge name={icon} /></div>
              <h3 style={{ fontWeight: 700, color: 'var(--navy)', marginBottom: '10px' }}>{title}</h3>
              <p style={{ ...s.body, fontSize: '0.9rem' }}>{body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─── TEAM ─── */
function Team() {
  return (
    <section id="team" style={s.section()}>
      <div style={s.container}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <div style={{ ...s.badge, display: 'inline-flex' }}>The Team</div>
          <h2 style={s.h2}>Built by people who believe in it.</h2>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <div style={{ ...s.card, maxWidth: '420px', width: '100%', textAlign: 'center' }} className="card-hover">
            <div style={{
              width: '72px', height: '72px', borderRadius: '50%', margin: '0 auto 20px',
              background: 'linear-gradient(135deg, var(--teal-darker), var(--teal))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.75rem', fontWeight: 800, color: '#fff',
            }}>S</div>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--navy)', marginBottom: '4px' }}>Shawn</h3>
            <p style={{ fontWeight: 600, color: 'var(--teal-dark)', marginBottom: '4px', fontSize: '0.95rem' }}>Founder</p>
            <p style={{ fontSize: '0.85rem', color: 'var(--slate)', marginBottom: '16px' }}>Computer Science, Duke University</p>
            <p style={{ ...s.body, fontSize: '0.9rem' }}>
              Leads platform architecture, backend and mobile development, hardware integration strategy,
              and overall company direction. Building the technical and business foundation for e.mappa
              from the ground up.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ─── WAITLIST ─── */
function WaitlistSection() {
  const [phone, setPhone] = useState('')
  const [neighborhood, setNeighborhood] = useState('')
  const [role, setRole] = useState('resident')
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submission, setSubmission] = useState<WaitlistSubmission | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    try {
      const result = await submitWaitlistLead({ role, phone, neighborhood })
      setSubmission(result)
      setSubmitted(true)
    } catch {
      setError('We could not save this signup right now. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section id="waitlist" style={s.section('var(--surface)')}>
      <div style={s.container}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '80px', alignItems: 'start' }} className="two-col">
          <div>
            <div style={s.badge}>Join the Waitlist</div>
            <h2 style={s.h2}>Don't live in a building with e.mappa yet?</h2>
            <p style={{ ...s.body, marginBottom: '16px' }}>
              We plan to expand building by building, neighborhood by neighborhood.
              Join the waitlist and we will let you know if e.mappa comes to your area after the June 2026 pilot.
            </p>
            <p style={{ ...s.body, fontWeight: 600, color: 'var(--navy)', marginBottom: '40px' }}>
              The neighborhoods with the most signups are the neighborhoods we prioritize,
              your registration tells us where to go next.
            </p>
            {[
              { icon: 'provider' as IconName, strong: 'Are you a solar provider?', text: " Register your interest and we'll reach out if a building near you becomes a fit for future panel deployment." },
              { icon: 'building' as IconName, strong: 'Do you own an apartment building?', text: ' Get in touch if you would like to be considered for a future pilot or rollout conversation.' },
            ].map(({ icon, strong, text }) => (
              <div key={strong} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '16px' }}>
                <div style={{ flexShrink: 0 }}><IconBadge name={icon} /></div>
                <p style={{ ...s.body, fontSize: '0.9rem' }}>
                  <strong style={{ color: 'var(--navy)' }}>{strong}</strong>{text}
                </p>
              </div>
            ))}
          </div>

          <div id="partner" style={{ ...s.card, padding: '40px' }}>
            {submitted ? (
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}><IconBadge name="party" /></div>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--navy)', marginBottom: '8px' }}>You're on the list!</h3>
                <p style={s.body}>We'll reach out if e.mappa expands to your neighborhood after the June 2026 pilot.</p>
                {submission?.source === 'local' ? (
                  <p style={{ ...s.body, fontSize: '0.82rem', marginTop: '12px' }}>
                    Saved locally for this demo. Connect `window.__EMAPPA_API_BASE_URL__` to persist signups server-side.
                  </p>
                ) : null}
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{
                  borderRadius: '16px',
                  border: '1px solid rgba(74,92,122,0.1)',
                  background: 'rgba(162,191,217,0.12)',
                  padding: '16px 18px',
                }}>
                  <p style={{ ...s.body, fontSize: '0.88rem', margin: 0 }}>
                    <strong style={{ color: 'var(--navy)' }}>Electrician, fabricator, supplier, or future energy provider?</strong>{' '}
                    This form is for residents and building owners.{' '}
                    <a href="#network" style={{ color: 'var(--teal-darker)', fontWeight: 700 }}>
                      Join the network instead.
                    </a>
                  </p>
                </div>

                <div>
                  <label style={{ display: 'block', fontWeight: 700, fontSize: '0.875rem', color: 'var(--navy)', marginBottom: '10px' }}>I am a…</label>
                  <div style={{ display: 'grid', gap: '8px' }} className="role-grid">
                    {[{ val: 'resident', label: 'Resident' }, { val: 'provider', label: 'Provider' }, { val: 'building_owner', label: 'Building Owner' }].map(({ val, label }) => (
                      <button key={val} type="button" onClick={() => setRole(val)} style={{
                        padding: '8px 4px', borderRadius: '8px', fontSize: '0.825rem', fontWeight: 600,
                        border: `1.5px solid ${role === val ? 'var(--teal-dark)' : 'var(--border)'}`,
                        background: role === val ? 'rgba(162,191,217,0.18)' : 'transparent',
                        color: role === val ? 'var(--teal-darker)' : 'var(--slate)',
                        cursor: 'pointer', transition: 'all 0.15s',
                      }}>{label}</button>
                    ))}
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontWeight: 700, fontSize: '0.875rem', color: 'var(--navy)', marginBottom: '8px' }}>Phone number (M-Pesa)</label>
                  <input type="tel" placeholder="0712 345 678" value={phone} onChange={e => setPhone(e.target.value)} required style={inputStyle} />
                </div>

                <div>
                  <label style={{ display: 'block', fontWeight: 700, fontSize: '0.875rem', color: 'var(--navy)', marginBottom: '8px' }}>Your neighborhood / area</label>
                  <input type="text" placeholder="e.g. Westlands/Nyeri Town/Kahawa" value={neighborhood} onChange={e => setNeighborhood(e.target.value)} required style={inputStyle} />
                </div>

                {error ? (
                  <p style={{ color: '#B84F2D', fontSize: '0.86rem', fontWeight: 700 }}>{error}</p>
                ) : null}

                <button type="submit" disabled={submitting} style={{ ...btnPrimary, width: '100%', justifyContent: 'center', padding: '14px', fontSize: '1rem', opacity: submitting ? 0.7 : 1 }}>
                  {submitting ? 'Saving...' : 'Join the waitlist →'}
                </button>

                <p style={{ textAlign: 'center', fontSize: '0.75rem', color: 'rgba(66,84,102,0.5)' }}>
                  We won't share your number with anyone.
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

/* ─── INVESTORS ─── */
function InvestorsSection() {
  return (
    <section id="investors" style={s.section()}>
      <div style={s.container}>
        <div style={{
          background: 'radial-gradient(circle at 18% 12%, rgba(162,191,217,0.24), transparent 22rem), radial-gradient(circle at 86% 10%, rgba(224,120,86,0.16), transparent 20rem), linear-gradient(180deg, #ffffff 0%, var(--emappa-cream) 100%)',
          border: '1px solid var(--border)',
          borderRadius: '28px',
          padding: '72px 64px',
          textAlign: 'center',
          boxShadow: 'var(--shadow-layer)',
        }}>
          <div style={{ ...s.badge, display: 'inline-flex', background: 'rgba(162,191,217,0.14)', color: 'var(--teal)', borderColor: 'rgba(162,191,217,0.2)' }}>
            Investors & Partners
          </div>
          <h2 style={{ ...s.h2, maxWidth: '640px', margin: '0 auto 20px' }}>
            e.mappa is being designed to become the energy operating system for urban Africa.
          </h2>
          <p style={{ ...s.body, maxWidth: '580px', margin: '0 auto 16px' }}>
            We plan to run our first pilot in Nyeri, Kenya, in June 2026, and build toward scale across East Africa and beyond if the pilot succeeds.
            The platform is being designed to be energy-agnostic, starting with solar first, and ready for any
            clean energy source tomorrow.
          </p>
          <p style={{ ...s.body, maxWidth: '580px', margin: '0 auto 40px' }}>
            We believe the most durable businesses in the world are built on things people cannot live without.
            Electricity is not optional.
          </p>
          <a href="mailto:shawn.kairu@duke.edu" style={{ ...btnPrimary, padding: '14px 40px', fontSize: '1rem' }}>
            Contact us →
          </a>
          <p style={{ marginTop: '24px', fontSize: '0.8rem', color: 'var(--slate)' }}>
            Impact investors · Development finance institutions · Energy funds · Strategic partners
          </p>
        </div>
      </div>
    </section>
  )
}

/* ─── FOOTER ─── */
function Footer() {
  return (
    <footer style={{ borderTop: '1px solid var(--border)', padding: '48px 0' }}>
      <div style={s.container}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '32px', marginBottom: '40px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0px', fontWeight: 800, fontSize: '1.2rem', color: 'var(--navy)', marginBottom: '10px' }}>
              <span style={{ color: 'var(--emappa-solar-strong)' }}>e</span>
              <span>.mappa</span>
            </div>
            <p style={{ fontSize: '0.9rem', color: 'var(--slate)', maxWidth: '220px' }}>Energy by the people. For the people.</p>
            <p style={{ fontSize: '0.875rem', color: 'var(--slate)', marginTop: '8px' }}>
              Nyeri, Kenya ·{' '}
              <a href="mailto:shawn.kairu@duke.edu" style={{ color: 'var(--teal-dark)' }}>shawn.kairu@duke.edu</a>
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 48px' }}>
            {[
              ['How it works', '#how-it-works'],
              ['Who we serve', '#who-we-serve'],
              ['The network', '#network'],
              ['Roadmap', '#coming-soon'],
              ['Investors', '#investors'],
              ['Join waitlist', '#waitlist'],
              ['Partner with us', '#partner'],
            ].map(([label, href]) => (
              <a key={label} href={href} style={{ fontSize: '0.875rem', color: 'var(--slate)', transition: 'color 0.15s' }}>
                {label}
              </a>
            ))}
          </div>
        </div>

        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '24px', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
          <span style={{ fontSize: '0.8rem', color: 'rgba(66,84,102,0.5)' }}>© {new Date().getFullYear()} e.mappa. All rights reserved.</span>
          <span style={{ fontSize: '0.8rem', color: 'rgba(66,84,102,0.5)' }}>Pilot planned in Nyeri, Kenya in June 2026 · Designed to scale across East Africa</span>
        </div>
      </div>
    </footer>
  )
}

/* ─── SHARED BUTTON / INPUT STYLES ─── */
const btnPrimary: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: '6px',
  background: 'linear-gradient(135deg, var(--peach-dark), var(--peach))', color: '#fff',
  borderRadius: '999px', border: '1px solid rgba(212,101,74,0.16)',
  fontWeight: 700, fontSize: '0.95rem',
  padding: '10px 20px', cursor: 'pointer',
  transition: 'transform 0.15s, box-shadow 0.15s, filter 0.15s',
  boxShadow: '0 16px 30px rgba(212,101,74,0.24)',
  textDecoration: 'none', fontFamily: 'inherit',
}

const btnSecondary: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: '6px',
  background: 'rgba(255,255,255,0.7)', color: 'var(--navy)',
  borderRadius: '999px', border: '1.5px solid rgba(74,92,122,0.12)',
  fontWeight: 700, fontSize: '0.95rem',
  padding: '10px 20px', cursor: 'pointer',
  transition: 'border-color 0.15s, background 0.15s',
  textDecoration: 'none', fontFamily: 'inherit',
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '12px 16px',
  border: '1.5px solid var(--border)', borderRadius: '16px',
  fontSize: '1rem', fontFamily: 'inherit', color: 'var(--navy)',
  background: 'rgba(255,255,255,0.88)',
  outline: 'none', transition: 'border-color 0.15s, box-shadow 0.15s',
}
