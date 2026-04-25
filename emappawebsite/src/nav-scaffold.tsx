import { useEffect, useMemo, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './nav-scaffold.css'

type NavChild = {
  label: string
  href: string
  description: string
}

type NavGroup = {
  label: string
  summary: string
  rationale: string
  children: NavChild[]
}

const navGroups: NavGroup[] = [
  {
    label: 'What is e.mappa',
    summary: 'Frame the core idea before the mechanics.',
    rationale: 'This cluster explains the problem first, then the product logic, then the two clearest resident-facing outcomes.',
    children: [
      { label: 'The problem', href: '#group-what-is', description: 'Lead with the grid pain, so the product solves something real.' },
      { label: 'What is e.mappa', href: '#group-what-is', description: 'Define the three-layer model and the plug-in infrastructure idea.' },
      { label: 'Solar tokens', href: '#group-what-is', description: 'Show how residents will actually buy and use energy.' },
      { label: 'Energy independence', href: '#group-what-is', description: 'Land the reliability and backup value clearly.' },
    ],
  },
  {
    label: 'Marketplace',
    summary: 'Move from the promise into the system.',
    rationale: 'This should mirror the page itself, so Who we serve sits before How it works in both places.',
    children: [
      { label: 'Who we serve', href: '#group-marketplace', description: 'Show the three core stakeholders and three network enablers.' },
      { label: 'How it works', href: '#group-marketplace', description: 'Walk through the building, provider, resident, and payment flow.' },
      { label: 'The marketplace', href: '#group-marketplace', description: 'Explain why e.mappa is a platform, not a traditional solar company.' },
    ],
  },
  {
    label: 'Buildout',
    summary: 'Show where the model goes after the core story lands.',
    rationale: 'This keeps roadmap, network, Kenya-first logic, and principles together as proof, scale, and expansion material.',
    children: [
      { label: 'Roadmap', href: '#group-buildout', description: 'Future phases like ownership, trading, and balcony solar.' },
      { label: 'The network', href: '#group-buildout', description: 'Electricians, fabricators, suppliers, and providers around each building.' },
      { label: 'Why Kenya first', href: '#group-buildout', description: 'Market timing, regulations, M-Pesa, and local roots.' },
      { label: 'Our commitments', href: '#group-buildout', description: 'Guardrails for transparency, dignity, and long-term trust.' },
    ],
  },
  {
    label: 'Company',
    summary: 'Keep team, participation, and investor information in one place.',
    rationale: 'This reduces clutter in the main story while keeping next steps easy to find.',
    children: [
      { label: 'Team', href: '#group-company', description: 'Founder story and why this work is personal.' },
      { label: 'Waitlist and partners', href: '#group-company', description: 'Resident waitlist, building-owner interest, and partner intake.' },
      { label: 'Investors', href: '#group-company', description: 'Pilot-stage fundraising language and credibility material.' },
    ],
  },
]

const flow = [
  {
    step: '01',
    title: 'Hero',
    body: 'Open with the marketplace thesis, the plug-in solar model, and the June 2026 pilot framing.',
    tags: ['Core promise', 'Pilot framing', 'Primary CTAs'],
  },
  {
    step: '02',
    title: 'What is e.mappa',
    body: 'Keep this narrative block together so the problem, system definition, tokens, and energy-independence outcome read as one arc.',
    tags: ['Problem', 'What is e.mappa', 'Solar tokens', 'Energy independence'],
  },
  {
    step: '03',
    title: 'Marketplace',
    body: 'After the product concept is clear, introduce the stakeholders, the operating flow, and the marketplace model in the same order.',
    tags: ['Who we serve', 'How it works', 'The marketplace'],
  },
  {
    step: '04',
    title: 'Buildout',
    body: 'Move into future features, local network effects, Kenya-first logic, and principles once the main engine is already understood.',
    tags: ['Roadmap', 'The network', 'Why Kenya first', 'Our commitments'],
  },
  {
    step: '05',
    title: 'Company and conversion',
    body: 'End with team, waitlist and partner actions, then investor material instead of scattering those points earlier in the narrative.',
    tags: ['Team', 'Waitlist and partners', 'Investors'],
  },
]

const groupedCards = [
  {
    id: 'group-what-is',
    order: 'Nav group 1',
    title: 'What is e.mappa',
    description: 'One top-level menu item for the conceptual foundation, instead of scattering these ideas across the nav.',
    cards: [
      { eyebrow: 'Start here', title: 'The problem', body: 'Grid pain should be nested here so the dropdown begins with the user pain point, not a feature.' },
      { eyebrow: 'Definition', title: 'What is e.mappa', body: 'This holds the three-layer explanation, including the physical, software, and payments layers.' },
      { eyebrow: 'Resident model', title: 'Solar tokens', body: 'A user should see how buying energy works right after the system is defined.' },
      { eyebrow: 'Outcome', title: 'Energy independence', body: 'Reliability and battery-backed continuity belong in the same conceptual cluster.' },
    ],
  },
  {
    id: 'group-marketplace',
    order: 'Nav group 2',
    title: 'Marketplace',
    description: 'This group should match the actual page sequence. Who we serve should sit before How it works in both places.',
    cards: [
      { eyebrow: 'Audience', title: 'Who we serve', body: 'Three core stakeholders plus three network enablers, grouped clearly.' },
      { eyebrow: 'Flow', title: 'How it works', body: 'The five-step operational sequence comes after the audience model is clear.' },
      { eyebrow: 'Model', title: 'The marketplace', body: 'This lands the platform logic after the reader already understands the participants and flow.' },
    ],
  },
  {
    id: 'group-buildout',
    order: 'Nav group 3',
    title: 'Buildout',
    description: 'Proof, growth, and credibility material should sit together rather than compete with the core product explanation.',
    cards: [
      { eyebrow: 'Future phases', title: 'Roadmap', body: 'Fractional ownership, peer-to-peer trading, and balcony solar belong here.' },
      { eyebrow: 'On-the-ground engine', title: 'The network', body: 'Electricians, fabricators, suppliers, and providers deserve one dedicated expansion lane.' },
      { eyebrow: 'Why now', title: 'Why Kenya first', body: 'Solar conditions, regulation, M-Pesa, and local context support the buildout case.' },
      { eyebrow: 'Trust layer', title: 'Our commitments', body: 'Principles should reinforce the model after the reader sees the scale ambition.' },
    ],
  },
  {
    id: 'group-company',
    order: 'Nav group 4',
    title: 'Company',
    description: 'The final group keeps people, participation, and capital asks together so the story stays cleaner up top.',
    cards: [
      { eyebrow: 'Founder context', title: 'Team', body: 'The founder story should appear after the model is clear, not before.' },
      { eyebrow: 'Conversion', title: 'Waitlist and partners', body: 'Resident, building-owner, and partner actions can live together under one conversion lane.' },
      { eyebrow: 'Capital', title: 'Investors', body: 'Investors get a distinct lane at the end, with future-tense pilot language preserved.' },
    ],
  },
]

function ScaffoldApp() {
  const [active, setActive] = useState(navGroups[0].label)
  const shellRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (shellRef.current && !shellRef.current.contains(event.target as Node)) {
        setActive('')
      }
    }

    document.addEventListener('pointerdown', handlePointerDown)
    return () => document.removeEventListener('pointerdown', handlePointerDown)
  }, [])

  const activeGroup = useMemo(
    () => navGroups.find(group => group.label === active) ?? navGroups[0],
    [active],
  )

  return (
    <div className="scaffold-page">
      <div className="scaffold-topbar">
        <div className="scaffold-shell">
          <div className="scaffold-topbar-row" ref={shellRef}>
            <div className="scaffold-brand">
              <span className="scaffold-brand-mark">e</span>
              .mappa
            </div>

            <div className="scaffold-nav" aria-label="Prototype navigation">
              {navGroups.map(group => (
                <button
                  key={group.label}
                  className={`scaffold-trigger${active === group.label ? ' is-active' : ''}`}
                  onMouseEnter={() => setActive(group.label)}
                  onFocus={() => setActive(group.label)}
                  onClick={() => setActive(current => current === group.label ? '' : group.label)}
                  type="button"
                >
                  {group.label}
                  <span className="scaffold-chevron">▾</span>
                </button>
              ))}
            </div>

            <div className="scaffold-actions">
              <a className="scaffold-action secondary" href="#group-company">Partner with us</a>
              <a className="scaffold-action primary" href="#group-company">Join waitlist</a>
            </div>

            {active && (
              <div
                className="scaffold-mega"
                onMouseLeave={() => setActive('')}
              >
                <div className="scaffold-mega-grid">
                  <div className="scaffold-menu-grid">
                    {activeGroup.children.map(item => (
                      <a key={item.label} href={item.href} className="scaffold-menu-item">
                        <span className="scaffold-menu-eyebrow">{activeGroup.label}</span>
                        <strong className="scaffold-menu-title">{item.label}</strong>
                        <span className="scaffold-menu-copy">{item.description}</span>
                      </a>
                    ))}
                  </div>

                  <aside className="scaffold-sidecard">
                    <span className="scaffold-sidecard-label">Why this grouping</span>
                    <h3>{activeGroup.summary}</h3>
                    <p>{activeGroup.rationale}</p>
                    <ul>
                      <li>Hover shows the nested structure.</li>
                      <li>Clicking a subtopic jumps to the matching scaffold block.</li>
                      <li>The live navbar can later inherit this exact information architecture.</li>
                    </ul>
                  </aside>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <main className="scaffold-shell">
        <section className="scaffold-hero">
          <div className="scaffold-intro">
            <div className="scaffold-intro-copy">
              <div className="scaffold-badge">Nav Scaffold Prototype</div>
              <h1>Nested first. Visuals later.</h1>
              <p>
                This page is a sandbox for the information architecture only. The goal is to decide what the navbar
                should group together, what each dropdown should reveal on hover, and how the top menu should mirror
                the actual order of the landing page before we redesign the live navigation.
              </p>
            </div>

            <div className="scaffold-principles">
              <h2>Scaffolding rules</h2>
              <p>This prototype follows the structure that feels cleanest for the story you are telling.</p>
              <ul>
                <li>`Who we serve` now lives before `How it works` in both the nav and page flow.</li>
                <li>`What is e.mappa` becomes a real group, with the problem, tokens, and energy independence nested under it.</li>
                <li>Future buildout material and company actions move into their own lanes instead of crowding the core story.</li>
              </ul>
            </div>
          </div>

          <div className="scaffold-flow">
            <h2>Recommended page flow</h2>
            <p>
              This is the sequence the dropdowns are built around, so the menu and the landing page tell the same story in the same order.
            </p>

            <div className="scaffold-flow-grid">
              {flow.map(item => (
                <div className="scaffold-flow-row" key={item.step}>
                  <div className="scaffold-step">{item.step}</div>
                  <div>
                    <h3>{item.title}</h3>
                    <p>{item.body}</p>
                    <div className="scaffold-flow-tags">
                      {item.tags.map(tag => <span key={tag}>{tag}</span>)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="scaffold-groups">
          {groupedCards.map(group => (
            <section key={group.id} id={group.id} className="scaffold-group">
              <div className="scaffold-group-head">
                <div>
                  <h2>{group.title}</h2>
                  <p>{group.description}</p>
                </div>
                <div className="scaffold-order-chip">{group.order}</div>
              </div>

              <div className="scaffold-card-grid">
                {group.cards.map(card => (
                  <article key={card.title} className="scaffold-card">
                    <span>{card.eyebrow}</span>
                    <h3>{card.title}</h3>
                    <p>{card.body}</p>
                  </article>
                ))}
              </div>
            </section>
          ))}
        </section>

        <section className="scaffold-footer-note">
          <h3>How to use this prototype</h3>
          <p>
            Hover the top labels first. If the grouping feels right, we can then port this exact scaffold into the real navbar and make each dropdown jump to the live section anchors. After that, we can style the menu and the animations with much less risk.
          </p>
        </section>
      </main>
    </div>
  )
}

createRoot(document.getElementById('root')!).render(<ScaffoldApp />)
