import { useState } from "react";
import type { PublicRole } from "@emappa/shared";
import { Brand } from "../components/Brand";
import { webRoles } from "../data/roles";
import { requestEmailOtp, verifyEmailOtp, type WebSession } from "../lib/api";

export function LoginLayer({
  onSession,
  onBack,
}: {
  onSession: (session: WebSession) => void;
  onBack: () => void;
}) {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"email" | "verify" | "role">("email");
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<PublicRole>("resident");

  async function requestOtp(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      await requestEmailOtp(email);
      setStep("verify");
      setMessage("Check your email for the six-digit pilot code.");
    } finally {
      setLoading(false);
    }
  }

  async function verifyOtp(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      const session = await verifyEmailOtp(email, code);
      if (!session.user.role) {
        setStep("role");
        return;
      }
      onSession(session);
    } finally {
      setLoading(false);
    }
  }

  async function continueWithRole() {
    const session = await verifyEmailOtp(email, code || "000000");
    onSession({ ...session, user: { ...session.user, role: selectedRole } });
  }

  return (
    <main className="login-layer">
      <nav className="top-nav">
        <Brand />
        <button className="ghost-action" onClick={onBack}>Back to public site</button>
      </nav>

      <section className="login-grid">
        <div className="login-copy">
          <p className="eyebrow">Email OTP</p>
          <h1>Log in to your pilot portal.</h1>
          <p>
            Enter the email assigned to your e.mappa pilot role. Admin accounts are routed to cockpit;
            public stakeholder roles land in their mirrored web portal.
          </p>
          <div className="access-note">
            <span>Seed users</span>
            <strong>resident, homeowner, building-owner, provider-panels, electrician, financier, or admin at emappa.test.</strong>
          </div>
        </div>

        <div className="access-panel">
          {step === "email" ? (
            <form className="otp-form" onSubmit={requestOtp}>
              <label>Email</label>
              <input value={email} type="email" placeholder="resident@emappa.test" onChange={(event) => setEmail(event.target.value)} required />
              <button type="submit" disabled={loading}>{loading ? "Sending..." : "Send code"}</button>
            </form>
          ) : null}

          {step === "verify" ? (
            <form className="otp-form" onSubmit={verifyOtp}>
              <label>Six-digit code</label>
              <input value={code} inputMode="numeric" placeholder="000000" onChange={(event) => setCode(event.target.value)} required />
              <button type="submit" disabled={loading}>{loading ? "Verifying..." : "Verify and continue"}</button>
              <button type="button" className="ghost-action" onClick={() => setStep("email")}>Use a different email</button>
            </form>
          ) : null}

          {step === "role" ? (
            <div className="role-select-panel">
              <div className="access-panel-header">
                <span>Pick your public role</span>
                <strong>Admin is never selectable here</strong>
              </div>
              {webRoles.map((role) => (
                <button key={role.id} className={`access-row ${role.id === selectedRole ? "active" : ""}`} onClick={() => setSelectedRole(role.id)}>
                  <span>{role.accessLabel}</span>
                  <strong>{role.label}</strong>
                  <small>{role.unlockCopy}</small>
                </button>
              ))}
              <button onClick={continueWithRole}>Continue</button>
            </div>
          ) : null}

          {message ? <p className="form-note">{message}</p> : null}
        </div>
      </section>
    </main>
  );
}
