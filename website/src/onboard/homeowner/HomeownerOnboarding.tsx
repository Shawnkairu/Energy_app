import { useState } from "react";
import { completeOnboarding, createBuildingForOnboarding, saveRoof } from "../../lib/api";

export function HomeownerOnboarding({ onExit }: { onExit: () => void }) {
  const [step, setStep] = useState(0);
  const [buildingId, setBuildingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "My home",
    address: "",
    lat: -1.204,
    lon: 36.92,
    roofArea: 72,
    displayName: "",
  });
  const steps = ["Welcome", "Address", "Roof capture", "Terms preview", "First pledge"];

  async function saveAddress() {
    const result = await createBuildingForOnboarding({
      name: form.name,
      address: form.address,
      lat: form.lat,
      lon: form.lon,
      unit_count: 1,
      occupancy: 1,
      kind: "single_family",
    });
    setBuildingId(result?.building.id ?? "demo-home");
    setStep(2);
  }

  async function saveRoofCapture() {
    if (buildingId) {
      await saveRoof(buildingId, { area_m2: form.roofArea, source: "owner_typed" });
    }
    setStep(3);
  }

  async function finish() {
    await completeOnboarding({ display_name: form.displayName || undefined });
    onExit();
  }

  return (
    <main className="onboard-shell">
      <section className="onboard-card">
        <p className="eyebrow">Homeowner onboarding</p>
        <h1>{steps[step]}</h1>
        <div className="onboard-steps">{steps.map((label, index) => <span className={index <= step ? "active" : ""} key={label}>{label}</span>)}</div>

        {step === 0 ? (
          <div className="onboard-pane">
            <p>Set up your single-family home project. Homeowner onboarding creates a one-unit building, captures the roof, previews terms, and lets you make an optional first pledge.</p>
            <button onClick={() => setStep(1)}>Get started</button>
          </div>
        ) : null}

        {step === 1 ? (
          <div className="onboard-pane">
            <label>Display name<input value={form.displayName} onChange={(event) => setForm({ ...form, displayName: event.target.value })} /></label>
            <label>Home name<input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></label>
            <label>Address<input value={form.address} onChange={(event) => setForm({ ...form, address: event.target.value })} placeholder="Kahawa Sukari, Nairobi" /></label>
            <button onClick={saveAddress}>Confirm address</button>
          </div>
        ) : null}

        {step === 2 ? (
          <div className="onboard-pane">
            <div className="roof-map-placeholder">Satellite roof capture</div>
            <label>Manual roof area, sqm<input type="number" value={form.roofArea} onChange={(event) => setForm({ ...form, roofArea: Number(event.target.value) })} /></label>
            <button onClick={saveRoofCapture}>Save roof</button>
          </div>
        ) : null}

        {step === 3 ? (
          <div className="onboard-pane">
            <p>Terms are pilot-only and non-binding: pledges do not charge money, royalties are simulated until measured settlement goes live, and synthesized data is clearly marked.</p>
            <button onClick={() => setStep(4)}>Approve preview</button>
          </div>
        ) : null}

        {step === 4 ? (
          <div className="onboard-pane">
            <p>You can pledge tokens now or later from Home. This does not charge money during the pilot.</p>
            <button onClick={finish}>Skip for now and open Home</button>
          </div>
        ) : null}
      </section>
    </main>
  );
}
