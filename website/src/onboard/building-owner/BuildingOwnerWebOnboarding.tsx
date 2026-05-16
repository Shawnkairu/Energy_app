import { useState, type FormEvent } from "react";
import { apiPostJson, completeOnboarding, geocodeQuery } from "../../lib/api";
import type { BuildingRecord } from "@emappa/shared";

const steps = ["Welcome", "Building basics", "Roof", "Terms"];

export function BuildingOwnerWebOnboarding({ onFinished }: { onFinished: () => void | Promise<void> }) {
  const [step, setStep] = useState(0);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [buildingId, setBuildingId] = useState<string | null>(null);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [form, setForm] = useState({
    name: "",
    address: "",
    unitCount: "8",
    occupancy: "85",
    roofArea: 120,
    lat: 0,
    lon: 0,
    formattedAddress: "",
  });

  async function geocodeAddress() {
    const q = form.address.trim();
    if (q.length < 4) {
      setMessage("Enter a full address, then blur the field to geocode.");
      return;
    }
    setBusy(true);
    setMessage(null);
    try {
      const g = await geocodeQuery(q);
      setForm((prev) => ({
        ...prev,
        lat: g.lat,
        lon: g.lon,
        formattedAddress: g.formattedAddress,
        address: g.formattedAddress,
      }));
    } catch (cause) {
      setMessage(cause instanceof Error ? cause.message : "Could not geocode that address.");
    } finally {
      setBusy(false);
    }
  }

  async function saveBasics(event: FormEvent) {
    event.preventDefault();
    const units = Number(form.unitCount);
    const occ = Number(form.occupancy);
    if (!form.name.trim()) {
      setMessage("Enter the building name.");
      return;
    }
    if (!form.formattedAddress) {
      setMessage("Geocode the address before continuing (tab out of the address field).");
      return;
    }
    if (!Number.isInteger(units) || units <= 1) {
      setMessage("Building-owner onboarding is for multi-unit properties (more than one unit).");
      return;
    }
    if (!Number.isFinite(occ) || occ < 0 || occ > 100) {
      setMessage("Occupancy must be between 0 and 100%.");
      return;
    }

    setBusy(true);
    setMessage(null);
    try {
      const result = await apiPostJson<{ building: BuildingRecord }>("/buildings", {
        name: form.name.trim(),
        address: form.formattedAddress,
        lat: form.lat,
        lon: form.lon,
        unitCount: units,
        occupancy: occ / 100,
        kind: "apartment",
      });
      setBuildingId(result.building.id);
      setStep(2);
    } catch (cause) {
      setMessage(cause instanceof Error ? cause.message : "Could not create building.");
    } finally {
      setBusy(false);
    }
  }

  async function saveRoof(event: FormEvent) {
    event.preventDefault();
    if (!buildingId) {
      setMessage("Missing building.");
      return;
    }
    if (!Number.isFinite(form.roofArea) || form.roofArea < 10) {
      setMessage("Enter a roof area of at least 10 sqm.");
      return;
    }
    setBusy(true);
    setMessage(null);
    try {
      await apiPostJson<{ building: BuildingRecord }>(`/buildings/${encodeURIComponent(buildingId)}/roof`, {
        areaM2: form.roofArea,
        source: "owner_typed",
      });
      setStep(3);
    } catch (cause) {
      setMessage(cause instanceof Error ? cause.message : "Could not save roof.");
    } finally {
      setBusy(false);
    }
  }

  async function finish() {
    setBusy(true);
    setMessage(null);
    try {
      await completeOnboarding({});
      await onFinished();
    } catch (cause) {
      setMessage(cause instanceof Error ? cause.message : "Could not finish onboarding.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="onboard-shell">
      <section className="onboard-card">
        <div className="onboard-header">
          <div>
            <p className="eyebrow">Building owner onboarding</p>
            <h1>{steps[step]}</h1>
          </div>
        </div>

        {step === 0 ? (
          <div className="onboard-pane">
            <p>List a multi-unit building, capture roof area, then preview owner terms.</p>
            <div className="onboard-actions">
              <button type="button" onClick={() => setStep(1)}>Get started</button>
            </div>
          </div>
        ) : null}

        {step === 1 ? (
          <form className="onboard-pane" onSubmit={saveBasics}>
            <label htmlFor="bo-name">
              Building name
              <input id="bo-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </label>
            <label htmlFor="bo-address">
              Address
              <input
                id="bo-address"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value, formattedAddress: "" })}
                onBlur={geocodeAddress}
                required
              />
            </label>
            <label htmlFor="bo-units">
              Unit count
              <input id="bo-units" inputMode="numeric" value={form.unitCount} onChange={(e) => setForm({ ...form, unitCount: e.target.value })} required />
            </label>
            <label htmlFor="bo-occ">
              Occupancy estimate (%)
              <input id="bo-occ" inputMode="numeric" value={form.occupancy} onChange={(e) => setForm({ ...form, occupancy: e.target.value })} required />
            </label>
            {form.formattedAddress ? <p className="form-note">Geocoded: {form.formattedAddress}</p> : null}
            <div className="onboard-actions">
              <button type="button" className="ghost-action" onClick={() => setStep(0)}>Back</button>
              <button type="submit" disabled={busy}>{busy ? "Saving…" : "Continue"}</button>
            </div>
          </form>
        ) : null}

        {step === 2 ? (
          <form className="onboard-pane" onSubmit={saveRoof}>
            <label htmlFor="bo-roof">
              Usable roof area (sqm)
              <input
                id="bo-roof"
                type="number"
                min={10}
                value={form.roofArea}
                onChange={(e) => setForm({ ...form, roofArea: Number(e.target.value) })}
              />
            </label>
            <div className="onboard-actions">
              <button type="button" className="ghost-action" onClick={() => setStep(1)}>Back</button>
              <button type="submit" disabled={busy}>{busy ? "Saving…" : "Save roof"}</button>
            </div>
          </form>
        ) : null}

        {step === 3 ? (
          <div className="onboard-pane">
            <div className="terms-preview">
              <p>Royalties come from monetized solar only. Deployment waits for DRS readiness gates.</p>
              <label className="terms-check" htmlFor="bo-terms">
                <input
                  id="bo-terms"
                  type="checkbox"
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                />
                <span>I understand pilot terms are non-binding and payouts are simulated until settlement is live.</span>
              </label>
            </div>
            <div className="onboard-actions">
              <button type="button" className="ghost-action" onClick={() => setStep(2)}>Back</button>
              <button type="button" disabled={!acceptedTerms || busy} onClick={finish}>{busy ? "Finishing…" : "Finish onboarding"}</button>
            </div>
          </div>
        ) : null}

        {message ? <p className="form-note onboard-message" role="status">{message}</p> : null}
      </section>
    </main>
  );
}
