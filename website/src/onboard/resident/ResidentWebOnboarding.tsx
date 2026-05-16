import { useState, type FormEvent } from "react";
import {
  commitPrepaidWeb,
  completeOnboarding,
  joinBuildingWithCode,
} from "../../lib/api";

const steps = ["Join", "Confirm", "Optional pledge"];

export function ResidentWebOnboarding({ onFinished }: { onFinished: () => void | Promise<void> }) {
  const [step, setStep] = useState(0);
  const [code, setCode] = useState("");
  const [buildingId, setBuildingId] = useState<string | null>(null);
  const [buildingLabel, setBuildingLabel] = useState("");
  const [address, setAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function submitJoin(event: FormEvent) {
    event.preventDefault();
    const trimmed = code.trim();
    if (trimmed.length < 4) {
      setMessage("Enter the invite code from your building owner.");
      return;
    }
    setBusy(true);
    setMessage(null);
    try {
      const result = await joinBuildingWithCode(trimmed);
      setBuildingId(result.building.id);
      setBuildingLabel(result.building.name);
      setAddress(result.building.address);
      setStep(1);
    } catch (cause) {
      setMessage(cause instanceof Error ? cause.message : "Could not join that building.");
    } finally {
      setBusy(false);
    }
  }

  async function finish(skipPledge: boolean) {
    if (!buildingId) {
      setMessage("Missing building context.");
      return;
    }
    setBusy(true);
    setMessage(null);
    try {
      if (!skipPledge) {
        const kes = Number(amount);
        if (!Number.isFinite(kes) || kes <= 0) {
          setMessage("Enter a pledge amount greater than 0 KES, or skip for now.");
          setBusy(false);
          return;
        }
        await commitPrepaidWeb(buildingId, kes);
      }
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
            <p className="eyebrow">Resident onboarding</p>
            <h1>{steps[step]}</h1>
          </div>
          <span aria-label={`Step ${step + 1} of ${steps.length}`}>
            {step + 1} of {steps.length}
          </span>
        </div>

        {step === 0 ? (
          <form className="onboard-pane" onSubmit={submitJoin}>
            <label htmlFor="resident-code">
              Building invite code
              <input
                id="resident-code"
                value={code}
                onChange={(event) => setCode(event.target.value)}
                placeholder="From owner or QR"
                autoComplete="off"
                required
              />
            </label>
            <div className="onboard-actions">
              <button type="submit" disabled={busy}>{busy ? "Checking…" : "Continue"}</button>
            </div>
          </form>
        ) : null}

        {step === 1 ? (
          <div className="onboard-pane">
            <div className="terms-preview">
              <p className="roof-map-placeholder" style={{ minHeight: "auto", padding: 16 }}>
                <strong>{buildingLabel}</strong>
                <small>{address}</small>
              </p>
              <p>Confirm this is the building where your unit participates.</p>
            </div>
            <div className="onboard-actions">
              <button className="ghost-action" type="button" onClick={() => setStep(0)}>Back</button>
              <button type="button" onClick={() => setStep(2)}>This is my building</button>
            </div>
          </div>
        ) : null}

        {step === 2 ? (
          <div className="onboard-pane">
            <div className="pledge-preview">
              <span>Optional</span>
              <strong>Prepaid pledge</strong>
              <small>Pilot pledges are non-binding until cash rails are live.</small>
            </div>
            <label htmlFor="pledge-kes">
              Amount (KES)
              <input
                id="pledge-kes"
                inputMode="numeric"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                placeholder="1000"
              />
            </label>
            <div className="onboard-actions">
              <button className="ghost-action" type="button" onClick={() => setStep(1)}>Back</button>
              <button type="button" disabled={busy} onClick={() => finish(false)}>{busy ? "Saving…" : "Pledge and finish"}</button>
              <button type="button" disabled={busy} onClick={() => finish(true)}>Skip for now</button>
            </div>
          </div>
        ) : null}

        {message ? <p className="form-note onboard-message" role="status">{message}</p> : null}
      </section>
    </main>
  );
}
