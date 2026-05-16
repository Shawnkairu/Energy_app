import { useState, type FormEvent } from "react";
import { apiPostJson, completeOnboarding, readSession } from "../../lib/api";
import type { BusinessType, PublicRole } from "@emappa/shared";

export function ContributorWebOnboarding({
  role,
  onFinished,
}: {
  role: Extract<PublicRole, "provider" | "electrician" | "financier">;
  onFinished: () => void | Promise<void>;
}) {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const [providerForm, setProviderForm] = useState({
    businessName: "",
    contact: "",
    businessType: "panels" as BusinessType,
  });

  const [electricianForm, setElectricianForm] = useState({
    displayName: "",
    region: "",
    scope: [] as Array<"install" | "inspection" | "maintenance">,
    certName: "",
    certIssuer: "",
    certExpires: "",
    addCert: false,
  });

  const [financierForm, setFinancierForm] = useState({
    displayName: "",
    investorKind: "individual" as "individual" | "institution",
    targetDealSize: "",
    targetReturn: "",
  });

  async function finishProvider(event: FormEvent) {
    event.preventDefault();
    if (!providerForm.businessName.trim() || !providerForm.contact.trim()) {
      setMessage("Enter business name and operations contact.");
      return;
    }
    setBusy(true);
    setMessage(null);
    try {
      await completeOnboarding({
        displayName: providerForm.businessName.trim(),
        businessType: providerForm.businessType,
        profile: {
          business_name: providerForm.businessName.trim(),
          operations_contact: providerForm.contact.trim(),
        },
      });
      await onFinished();
    } catch (cause) {
      setMessage(cause instanceof Error ? cause.message : "Could not finish onboarding.");
    } finally {
      setBusy(false);
    }
  }

  async function finishElectrician(event: FormEvent) {
    event.preventDefault();
    const { displayName, region, scope } = electricianForm;
    if (!displayName.trim() || !region.trim() || scope.length === 0) {
      setMessage("Enter name, region, and at least one scope.");
      return;
    }
    setBusy(true);
    setMessage(null);
    try {
      const userId = readSession()?.user?.id;
      if (electricianForm.addCert && userId && electricianForm.certName.trim() && electricianForm.certIssuer.trim() && electricianForm.certExpires.trim()) {
        const expiresAt = new Date(electricianForm.certExpires.trim());
        if (Number.isNaN(expiresAt.getTime())) {
          setMessage("Enter certification expiry as a valid date (e.g. 2027-12-31).");
          setBusy(false);
          return;
        }
        await apiPostJson(`/electricians/${encodeURIComponent(userId)}/certifications`, {
          name: electricianForm.certName.trim(),
          issuer: electricianForm.certIssuer.trim(),
          issuedAt: new Date().toISOString(),
          expiresAt: expiresAt.toISOString(),
        });
      }
      await completeOnboarding({
        displayName: displayName.trim(),
        profile: { region: region.trim(), scope },
      });
      await onFinished();
    } catch (cause) {
      setMessage(cause instanceof Error ? cause.message : "Could not finish onboarding.");
    } finally {
      setBusy(false);
    }
  }

  async function finishFinancier(event: FormEvent) {
    event.preventDefault();
    const deal = Number(financierForm.targetDealSize);
    const ret = Number(financierForm.targetReturn);
    if (!financierForm.displayName.trim()) {
      setMessage("Enter investor name.");
      return;
    }
    if (!Number.isFinite(deal) || deal <= 0 || !Number.isFinite(ret) || ret <= 0) {
      setMessage("Enter target deal size and return percentage.");
      return;
    }
    setBusy(true);
    setMessage(null);
    try {
      await completeOnboarding({
        displayName: financierForm.displayName.trim(),
        profile: {
          investor_kind: financierForm.investorKind,
          target_deal_size_kes: deal,
          target_return_pct: ret,
        },
      });
      await onFinished();
    } catch (cause) {
      setMessage(cause instanceof Error ? cause.message : "Could not finish onboarding.");
    } finally {
      setBusy(false);
    }
  }

  if (role === "provider") {
    return (
      <main className="onboard-shell">
        <section className="onboard-card">
          <div className="onboard-header">
            <div>
              <p className="eyebrow">Provider onboarding</p>
              <h1>Business basics</h1>
            </div>
          </div>
          <form className="onboard-pane" onSubmit={finishProvider}>
            <label htmlFor="pv-name">Business name<input id="pv-name" value={providerForm.businessName} onChange={(e) => setProviderForm({ ...providerForm, businessName: e.target.value })} required /></label>
            <label htmlFor="pv-contact">Operations contact<input id="pv-contact" value={providerForm.contact} onChange={(e) => setProviderForm({ ...providerForm, contact: e.target.value })} required /></label>
            <label htmlFor="pv-type">Business type</label>
            <select id="pv-type" value={providerForm.businessType} onChange={(e) => setProviderForm({ ...providerForm, businessType: e.target.value as BusinessType })}>
              <option value="panels">Panels</option>
              <option value="infrastructure">Infrastructure</option>
              <option value="both">Both</option>
            </select>
            <div className="onboard-actions">
              <button type="submit" disabled={busy}>{busy ? "Saving…" : "Finish onboarding"}</button>
            </div>
          </form>
          {message ? <p className="form-note onboard-message" role="status">{message}</p> : null}
        </section>
      </main>
    );
  }

  if (role === "electrician") {
    return (
      <main className="onboard-shell">
        <section className="onboard-card">
          <div className="onboard-header">
            <div>
              <p className="eyebrow">Electrician onboarding</p>
              <h1>Profile & certification</h1>
            </div>
          </div>
          <form className="onboard-pane" onSubmit={finishElectrician}>
            <label htmlFor="el-name">Name<input id="el-name" value={electricianForm.displayName} onChange={(e) => setElectricianForm({ ...electricianForm, displayName: e.target.value })} required /></label>
            <label htmlFor="el-region">Region<input id="el-region" value={electricianForm.region} onChange={(e) => setElectricianForm({ ...electricianForm, region: e.target.value })} required /></label>
            <fieldset>
              <legend>Scope</legend>
              {(["install", "inspection", "maintenance"] as const).map((s) => (
                <label key={s} className="terms-check">
                  <input
                    type="checkbox"
                    checked={electricianForm.scope.includes(s)}
                    onChange={() =>
                      setElectricianForm({
                        ...electricianForm,
                        scope: electricianForm.scope.includes(s)
                          ? electricianForm.scope.filter((x) => x !== s)
                          : [...electricianForm.scope, s],
                      })
                    }
                  />
                  <span>{s}</span>
                </label>
              ))}
            </fieldset>
            <label className="terms-check">
              <input type="checkbox" checked={electricianForm.addCert} onChange={(e) => setElectricianForm({ ...electricianForm, addCert: e.target.checked })} />
              <span>Add a certification record now</span>
            </label>
            {electricianForm.addCert ? (
              <>
                <label htmlFor="el-cert-name">Certification name<input id="el-cert-name" value={electricianForm.certName} onChange={(e) => setElectricianForm({ ...electricianForm, certName: e.target.value })} /></label>
                <label htmlFor="el-cert-issuer">Issuer<input id="el-cert-issuer" value={electricianForm.certIssuer} onChange={(e) => setElectricianForm({ ...electricianForm, certIssuer: e.target.value })} /></label>
                <label htmlFor="el-cert-exp">Expires at<input id="el-cert-exp" value={electricianForm.certExpires} onChange={(e) => setElectricianForm({ ...electricianForm, certExpires: e.target.value })} placeholder="2027-12-31" /></label>
              </>
            ) : null}
            <div className="onboard-actions">
              <button type="submit" disabled={busy}>{busy ? "Saving…" : "Finish onboarding"}</button>
            </div>
          </form>
          {message ? <p className="form-note onboard-message" role="status">{message}</p> : null}
        </section>
      </main>
    );
  }

  return (
    <main className="onboard-shell">
      <section className="onboard-card">
        <div className="onboard-header">
          <div>
            <p className="eyebrow">Financier onboarding</p>
            <h1>Investor profile</h1>
          </div>
        </div>
        <form className="onboard-pane" onSubmit={finishFinancier}>
          <label htmlFor="fn-name">Investor name<input id="fn-name" value={financierForm.displayName} onChange={(e) => setFinancierForm({ ...financierForm, displayName: e.target.value })} required /></label>
          <label htmlFor="fn-kind">Kind</label>
          <select id="fn-kind" value={financierForm.investorKind} onChange={(e) => setFinancierForm({ ...financierForm, investorKind: e.target.value as "individual" | "institution" })}>
            <option value="individual">Individual</option>
            <option value="institution">Institution</option>
          </select>
          <label htmlFor="fn-deal">Target deal size (KES)<input id="fn-deal" inputMode="numeric" value={financierForm.targetDealSize} onChange={(e) => setFinancierForm({ ...financierForm, targetDealSize: e.target.value })} required /></label>
          <label htmlFor="fn-ret">Target return (%)<input id="fn-ret" inputMode="numeric" value={financierForm.targetReturn} onChange={(e) => setFinancierForm({ ...financierForm, targetReturn: e.target.value })} required /></label>
          <div className="onboard-actions">
            <button type="submit" disabled={busy}>{busy ? "Saving…" : "Finish onboarding"}</button>
          </div>
        </form>
        {message ? <p className="form-note onboard-message" role="status">{message}</p> : null}
      </section>
    </main>
  );
}
