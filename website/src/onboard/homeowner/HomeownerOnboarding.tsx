import { useMemo, useState, type FormEvent } from "react";
import type { BuildingRecord } from "@emappa/shared";
import { apiPostJson, completeOnboarding } from "../../lib/api";

const steps = ["Welcome", "Address", "Roof capture", "Terms preview", "First pledge"];

export function HomeownerOnboarding({ onFinished }: { onFinished: () => void | Promise<void> }) {
  const [step, setStep] = useState(0);
  const [buildingId, setBuildingId] = useState<string | null>(null);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "My home",
    address: "",
    lat: -1.204,
    lon: 36.92,
    roofArea: 72,
    displayName: "",
  });
  const progress = useMemo(() => Math.round(((step + 1) / steps.length) * 100), [step]);
  const canSaveAddress = form.name.trim().length > 1 && form.address.trim().length > 4;
  const canSaveRoof = Number.isFinite(form.roofArea) && form.roofArea >= 10;

  async function saveAddress(event: FormEvent) {
    event.preventDefault();
    if (!canSaveAddress) {
      setMessage("Add a home name and a usable address to continue.");
      return;
    }

    setBusy(true);
    setMessage(null);
    try {
      const result = await apiPostJson<{ building: BuildingRecord }>("/buildings", {
        name: form.name.trim(),
        address: form.address.trim(),
        lat: form.lat,
        lon: form.lon,
        unitCount: 1,
        occupancy: 1,
        kind: "single_family",
      });
      setBuildingId(result.building.id);
      setStep(2);
    } catch {
      setMessage("We could not save the address. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  async function saveRoofCapture(event: FormEvent) {
    event.preventDefault();
    if (!canSaveRoof) {
      setMessage("Roof area should be at least 10 square meters for the demo model.");
      return;
    }

    setBusy(true);
    setMessage(null);
    try {
      if (buildingId) {
        await apiPostJson<{ building: BuildingRecord }>(
          `/buildings/${encodeURIComponent(buildingId)}/roof`,
          { areaM2: form.roofArea, source: "owner_typed" },
        );
      }
      setStep(3);
    } catch {
      setMessage("We could not save the roof capture. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  async function finish() {
    setBusy(true);
    setMessage(null);
    try {
      await completeOnboarding({ displayName: form.displayName.trim() || undefined });
      await onFinished();
    } catch {
      setMessage("We could not finish onboarding. Please try once more.");
    } finally {
      setBusy(false);
    }
  }

  function goToStep(nextStep: number) {
    setMessage(null);
    setStep(nextStep);
  }

  return (
    <main className="onboard-shell">
      <HomeownerOnboardingStyles />
      <section className="onboard-card">
        <div className="onboard-header">
          <div>
            <p className="eyebrow">Homeowner onboarding</p>
            <h1>{steps[step]}</h1>
          </div>
          <span aria-label={`Step ${step + 1} of ${steps.length}`}>{step + 1} of {steps.length}</span>
        </div>
        <div className="onboard-progress" aria-hidden="true"><span style={{ width: `${progress}%` }} /></div>
        <div className="onboard-steps" aria-label="Onboarding progress">{steps.map((label, index) => <span className={index <= step ? "active" : ""} key={label}>{label}</span>)}</div>

        {step === 0 ? (
          <div className="onboard-pane">
            <div className="homeowner-intro-grid">
              <article>
                <span>1</span>
                <strong>Create the home project</strong>
                <small>A one-unit building profile keeps the portal focused on your roof and wallet.</small>
              </article>
              <article>
                <span>2</span>
                <strong>Estimate solar capacity</strong>
                <small>Manual roof area is enough for the demo and can be replaced by measured data later.</small>
              </article>
              <article>
                <span>3</span>
                <strong>Open without payment</strong>
                <small>Pilot pledges are simulated until live settlement is explicitly enabled.</small>
              </article>
            </div>
            <button onClick={() => goToStep(1)} type="button">Get started</button>
          </div>
        ) : null}

        {step === 1 ? (
          <form className="onboard-pane" onSubmit={saveAddress}>
            <label htmlFor="homeowner-display-name">Display name<input id="homeowner-display-name" value={form.displayName} autoComplete="name" onChange={(event) => setForm({ ...form, displayName: event.target.value })} placeholder="Amina" /></label>
            <label htmlFor="homeowner-home-name">Home name<input id="homeowner-home-name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required /></label>
            <label htmlFor="homeowner-address">Address<input id="homeowner-address" value={form.address} autoComplete="street-address" onChange={(event) => setForm({ ...form, address: event.target.value })} placeholder="Kahawa Sukari, Nairobi" required /></label>
            <div className="onboard-actions">
              <button className="ghost-action" onClick={() => goToStep(0)} type="button">Back</button>
              <button disabled={busy || !canSaveAddress} type="submit">{busy ? "Saving..." : "Confirm address"}</button>
            </div>
          </form>
        ) : null}

        {step === 2 ? (
          <form className="onboard-pane" onSubmit={saveRoofCapture}>
            <div className="roof-map-placeholder" aria-label="Satellite roof capture preview">
              <span>Satellite roof capture</span>
              <small>{form.roofArea} sqm typed estimate</small>
            </div>
            <label htmlFor="homeowner-roof-area">Manual roof area, sqm<input id="homeowner-roof-area" type="number" min={10} step={1} value={form.roofArea} onChange={(event) => setForm({ ...form, roofArea: Number(event.target.value) })} /></label>
            <div className="onboard-actions">
              <button className="ghost-action" onClick={() => goToStep(1)} type="button">Back</button>
              <button disabled={busy || !canSaveRoof} type="submit">{busy ? "Saving..." : "Save roof"}</button>
            </div>
          </form>
        ) : null}

        {step === 3 ? (
          <div className="onboard-pane">
            <div className="terms-preview">
              <p>Terms for this stage are non-binding: pledges do not charge money, royalties are simulated until measured settlement goes live, and synthesized data is clearly marked.</p>
              <label className="terms-check" htmlFor="terms-acceptance">
                <input id="terms-acceptance" type="checkbox" checked={acceptedTerms} onChange={(event) => setAcceptedTerms(event.target.checked)} />
                <span>I understand this demo does not charge money or issue live royalties.</span>
              </label>
            </div>
            <div className="onboard-actions">
              <button className="ghost-action" onClick={() => goToStep(2)} type="button">Back</button>
              <button onClick={() => goToStep(4)} disabled={!acceptedTerms} type="button">Approve preview</button>
            </div>
          </div>
        ) : null}

        {step === 4 ? (
          <div className="onboard-pane">
            <div className="pledge-preview">
              <span>Recommended for demo</span>
              <strong>Open Home first</strong>
              <small>You can pledge tokens later from the portal after reviewing energy output, roof assumptions, and wallet streams.</small>
            </div>
            <div className="onboard-actions">
              <button className="ghost-action" onClick={() => goToStep(3)} type="button">Back</button>
              <button onClick={finish} disabled={busy} type="button">{busy ? "Opening..." : "Skip for now and open Home"}</button>
            </div>
          </div>
        ) : null}

        {message ? <p className="form-note onboard-message" role="status">{message}</p> : null}
      </section>
    </main>
  );
}

function HomeownerOnboardingStyles() {
  return (
    <style>{`
      .onboard-shell {
        align-items: center;
        padding: clamp(16px, 4vw, 32px);
      }

      .onboard-card {
        border-radius: 18px;
      }

      .onboard-header h1 {
        margin-bottom: 0;
        letter-spacing: 0 !important;
      }

      .onboard-progress {
        height: 8px;
        margin: 20px 0 14px;
        overflow: hidden;
        border-radius: 999px;
        background: rgba(180, 89, 55, 0.12);
      }

      .onboard-progress span {
        display: block;
        height: 100%;
        border-radius: inherit;
        background: linear-gradient(90deg, #a9482d, #d4654a);
        transition: width 0.2s ease;
      }

      .homeowner-intro-grid {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 12px;
      }

      .homeowner-intro-grid article,
      .terms-preview,
      .pledge-preview {
        padding: 16px;
        border: 1px solid rgba(180, 89, 55, 0.14);
        border-radius: 14px;
        background: #ffffff;
        box-shadow: 0 14px 36px rgba(164, 72, 45, 0.06);
      }

      .homeowner-intro-grid span,
      .pledge-preview span {
        display: inline-grid;
        place-items: center;
        min-width: 28px;
        min-height: 28px;
        border-radius: 999px;
        color: #a9482d;
        background: #fff2ec;
        font-size: 0.78rem;
        font-weight: 900;
      }

      .homeowner-intro-grid strong,
      .homeowner-intro-grid small,
      .pledge-preview strong,
      .pledge-preview small {
        display: block;
      }

      .homeowner-intro-grid strong,
      .pledge-preview strong {
        margin-top: 12px;
        color: #17110f;
      }

      .homeowner-intro-grid small,
      .pledge-preview small {
        margin-top: 8px;
        color: #6c5b54;
        line-height: 1.45;
      }

      .onboard-actions {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
        justify-content: flex-end;
      }

      .onboard-actions .ghost-action {
        color: #17110f;
        background: #ffffff;
        box-shadow: none;
      }

      .onboard-pane button:disabled {
        cursor: not-allowed;
        opacity: 0.62;
        box-shadow: none;
      }

      .roof-map-placeholder {
        position: relative;
        justify-items: start;
        align-content: end;
        min-height: 260px;
        padding: 22px;
        overflow: hidden;
        text-align: left;
      }

      .roof-map-placeholder::before {
        content: "";
        position: absolute;
        inset: 20% 22% 24% 28%;
        border: 2px solid rgba(164, 72, 45, 0.42);
        border-radius: 18px 28px 16px 24px;
        background: rgba(255, 255, 255, 0.38);
        transform: rotate(-8deg);
      }

      .roof-map-placeholder span,
      .roof-map-placeholder small {
        position: relative;
        display: block;
      }

      .roof-map-placeholder small {
        margin-top: 6px;
        color: #6c5b54;
      }

      .terms-check {
        grid-template-columns: auto minmax(0, 1fr);
        align-items: start;
        margin-top: 14px;
      }

      .terms-check input {
        width: 18px;
        margin-top: 1px;
        accent-color: #a9482d;
      }

      .onboard-message {
        margin: 16px 0 0;
        line-height: 1.45;
      }

      @media (max-width: 760px) {
        .onboard-header {
          align-items: flex-start;
          flex-direction: column;
        }

        .homeowner-intro-grid {
          grid-template-columns: 1fr;
        }

        .onboard-actions {
          justify-content: stretch;
        }

        .onboard-actions button {
          flex: 1 1 180px;
        }
      }
    `}</style>
  );
}
