import type { ProjectedBuilding } from "@emappa/shared";
import { Brand } from "../components/Brand";
import { EnergyFlow } from "../components/EnergyFlow";
import type { WebRole } from "../types";

export function PublicSite({
  project,
  onOpenLogin,
  onPreviewRole,
}: {
  project: ProjectedBuilding | null;
  onOpenLogin: () => void;
  onPreviewRole: (role: WebRole) => void;
}) {
  return (
    <main className="public-site">
      <nav className="top-nav">
        <Brand />
        <div className="nav-actions">
          <a href="#product">Product</a>
          <a href="#model">Model</a>
          <a href="#portal">Portal</a>
          <button onClick={onOpenLogin}>Log in</button>
        </div>
      </nav>

      <section className="public-hero">
        <div className="hero-story">
          <p className="eyebrow">Prepaid solar for apartment buildings</p>
          <h1>Turn buildings into cleaner, cheaper energy economies.</h1>
          <p>
            e.mappa helps residents buy pledged solar, building owners host productive assets, and capital partners
            fund named projects with visible demand before a single panel goes live.
          </p>
          <div className="hero-actions">
            <button onClick={onOpenLogin}>Open stakeholder portal</button>
            <a href="#product">See the product</a>
          </div>
        </div>

        <div className="system-visual" aria-label="Building energy economy preview">
          <div className="visual-sky">
            <span className="sun-core" />
            <span className="data-pulse one" />
            <span className="data-pulse two" />
            <span className="data-pulse three" />
          </div>
          <div className="building-stack">
            {Array.from({ length: 18 }).map((_, index) => (
              <span key={index} className={index % 5 === 0 ? "lit" : ""} />
            ))}
          </div>
          <div className="visual-caption">
            <strong>{project ? `${project.project.name} solar economy` : "Building solar economy"}</strong>
            <span>Prepaid demand, verified supply, transparent settlement.</span>
          </div>
        </div>
      </section>

      <section className="public-strip" aria-label="e.mappa product highlights">
        {[
          ["For residents", "Buy cleaner pledged energy without guessing what is available."],
          ["For owners", "Host solar infrastructure with transparent readiness and revenue logic."],
          ["For capital", "Back named buildings where demand, supply, and verification are visible."],
        ].map(([title, body]) => (
          <article key={title}>
            <strong>{title}</strong>
            <span>{body}</span>
          </article>
        ))}
      </section>

      <section className="marketing-block" id="product">
        <div className="section-copy">
          <p className="eyebrow">What e.mappa sells</p>
          <h2>Solar that behaves like a pledged building service.</h2>
          <p>
            Residents make non-binding pledges, the building consumes verified solar first, and grid fallback remains there
            when solar is unavailable. The experience is simple on the surface because the messy parts are handled
            underneath: readiness, procurement, installation, monitoring, settlement, and ownership attribution.
          </p>
        </div>
        <div className="product-stack">
          {[
            ["Pledge", "Residents commit real demand before deployment."],
            ["Generate", "Panels and batteries serve building load first."],
            ["Settle", "Only sold solar creates payouts and ownership value."],
          ].map(([title, body]) => (
            <article key={title}>
              <span>{title}</span>
              <strong>{body}</strong>
            </article>
          ))}
        </div>
      </section>

      {project ? (
        <section className="public-proof">
          <EnergyFlow project={project} />
        </section>
      ) : null}

      <section className="marketing-block model-block" id="model">
        <div className="section-copy">
          <p className="eyebrow">Why the model is different</p>
          <h2>Deployment waits for proof, not optimism.</h2>
          <p>
            e.mappa does not treat solar deployment as a pitch deck promise. Every project moves through a readiness
            score, named capital, provider lock, installation proof, and live metering before the economy opens.
          </p>
        </div>
        <div className="model-quote">
          <strong>No confirmed pledge means no solar allocation and no payout.</strong>
          <span>
            That one rule keeps the system honest: generated energy is not value until a building actually buys and
            uses it.
          </span>
        </div>
      </section>

      <section className="doctrine-grid">
        {[
          ["01", "Building fit", "A site is screened for load, resident demand, owner terms, technical feasibility, and install complexity."],
          ["02", "Prepaid demand", "Residents are invited before go-live so demand is visible, committed, and easy to understand."],
          ["03", "Named funding", "Capital goes into a specific building with clear assumptions, not an opaque pool of projects."],
          ["04", "Verified launch", "Hardware, installation proof, metering, and settlement logic must line up before launch."],
        ].map(([step, title, body]) => (
          <article key={step}>
            <span>{step}</span>
            <h2>{title}</h2>
            <p>{body}</p>
          </article>
        ))}
      </section>

      <section className="customer-band">
        {[
          ["Residents get", "Lower-cost pledged solar, usage clarity, fallback confidence, and optional ownership once trust is earned."],
          ["Owners get", "A stronger building utility story, host economics, resident readiness tools, and live deployment visibility."],
          ["Partners get", "A measurable project pipeline where providers, electricians, and financiers work from the same truth."],
        ].map(([title, body]) => (
          <article key={title}>
            <h3>{title}</h3>
            <p>{body}</p>
          </article>
        ))}
      </section>

      <section className="role-doorway" id="portal">
        <div>
          <p className="eyebrow">Private portal</p>
          <h2>Stakeholder work happens behind the front door.</h2>
          <p>
            The public website explains the product. Logged-in stakeholders see their own operating layer: residents
            manage energy, owners track building readiness, and deployment partners coordinate the work that makes the
            system real.
          </p>
          <button className="portal-cta" onClick={onOpenLogin}>Log in to portal</button>
        </div>

        <div className="portal-preview">
          <button onClick={() => onPreviewRole("resident")}>
            <span>Resident energy wallet</span>
            <strong>Prepaid solar, savings, fallback, and ownership.</strong>
          </button>
          <button onClick={() => onPreviewRole("building_owner")}>
            <span>Owner readiness room</span>
            <strong>Building fit, resident demand, deployment gates.</strong>
          </button>
          <button onClick={() => onPreviewRole("financier")}>
            <span>Capital deal room</span>
            <strong>Named assets, downside cases, recovery curves.</strong>
          </button>
        </div>
      </section>

      <section className="public-footer">
        <p>Build energy infrastructure only when the building is ready to use it.</p>
        <button onClick={onOpenLogin}>Open portal</button>
      </section>
    </main>
  );
}
