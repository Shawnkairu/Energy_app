import { useMemo, useState, type FormEvent } from "react";
import type { PublicRole } from "@emappa/shared";
import { Brand } from "../components/Brand";
import { webRoles } from "../data/roles";
import { requestEmailOtp, verifyEmailOtp, type WebSession } from "../lib/api";

const roleInitials: Record<PublicRole, string> = {
  resident: "R",
  homeowner: "H",
  building_owner: "B",
  provider: "P",
  financier: "F",
  electrician: "E",
};

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
  const normalizedEmail = useMemo(() => email.trim().toLowerCase(), [email]);
  const trimmedCode = useMemo(() => code.trim(), [code]);

  async function requestOtp(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      await requestEmailOtp(normalizedEmail);
      setStep("verify");
      setMessage(`We sent a six-digit pilot code to ${normalizedEmail}.`);
    } catch {
      setMessage("We could not send a code. Check the email and try again.");
    } finally {
      setLoading(false);
    }
  }

  async function verifyOtp(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      const session = await verifyEmailOtp(normalizedEmail, trimmedCode);
      if (!session.user.role) {
        setStep("role");
        return;
      }
      onSession(session);
    } catch {
      setMessage("That code did not open a pilot portal. Try again or request a new code.");
    } finally {
      setLoading(false);
    }
  }

  async function continueWithRole() {
    setLoading(true);
    setMessage(null);
    try {
      const session = await verifyEmailOtp(normalizedEmail, trimmedCode || "000000");
      onSession({ ...session, user: { ...session.user, role: selectedRole } });
    } catch {
      setMessage("We could not attach that role to this demo session. Please verify the code again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="login-layer">
      <LoginLayerStyles />
      <nav className="top-nav">
        <Brand />
        <button className="ghost-action login-back-action" onClick={onBack} type="button">Back to public site</button>
      </nav>

      <section className="login-grid">
        <div className="login-copy">
          <p className="eyebrow">Secure pilot access</p>
          <h1>Enter the portal built for your energy role.</h1>
          <p>
            Sign in with the email assigned to your e.mappa pilot role. The portal opens with the
            energy, wallet, project, and proof controls that role is allowed to use.
          </p>
          <div className="login-proof-grid" aria-label="Portal safeguards">
            <span><strong>Role scoped</strong><small>Only relevant controls load.</small></span>
            <span><strong>Demo safe</strong><small>Pledges never charge money.</small></span>
            <span><strong>Fast handoff</strong><small>Public site to portal in two steps.</small></span>
          </div>
          <div className="access-note" aria-label="Demo account examples">
            <span>Demo accounts</span>
            <strong>Use resident, homeowner, building-owner, provider-panels, electrician, financier, or admin at emappa.test.</strong>
          </div>
        </div>

        <div className="access-panel login-access-panel" aria-live="polite">
          <div className="access-panel-header login-panel-title">
            <span>{step === "email" ? "Step 1" : step === "verify" ? "Step 2" : "Final step"}</span>
            <strong>{step === "email" ? "Request a code" : step === "verify" ? "Verify email" : "Choose your portal"}</strong>
          </div>
          {step === "email" ? (
            <form className="otp-form" onSubmit={requestOtp}>
              <label htmlFor="pilot-email">Email</label>
              <input id="pilot-email" value={email} type="email" autoComplete="email" placeholder="resident@emappa.test" onChange={(event) => setEmail(event.target.value)} required />
              <button type="submit" disabled={loading || !normalizedEmail}>{loading ? "Sending..." : "Send code"}</button>
            </form>
          ) : null}

          {step === "verify" ? (
            <form className="otp-form" onSubmit={verifyOtp}>
              <label htmlFor="pilot-code">Six-digit code</label>
              <input id="pilot-code" value={code} inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]*" maxLength={6} placeholder="000000" onChange={(event) => setCode(event.target.value.replace(/\D/g, "").slice(0, 6))} required />
              <button type="submit" disabled={loading || trimmedCode.length < 6}>{loading ? "Verifying..." : "Verify and continue"}</button>
              <button type="button" className="ghost-action" onClick={() => { setStep("email"); setCode(""); setMessage(null); }}>Use a different email</button>
            </form>
          ) : null}

          {step === "role" ? (
            <div className="role-select-panel">
              <div className="access-panel-header">
                <span>Pick your public role</span>
                <strong>Admin is never selectable here</strong>
              </div>
              {webRoles.map((role) => (
                <button key={role.id} className={`access-row ${role.id === selectedRole ? "active" : ""}`} onClick={() => setSelectedRole(role.id)} type="button" aria-pressed={role.id === selectedRole}>
                  <em aria-hidden="true">{roleInitials[role.id]}</em>
                  <span>{role.accessLabel}</span>
                  <strong>{role.label}</strong>
                  <small>{role.unlockCopy}</small>
                </button>
              ))}
              <button onClick={continueWithRole} disabled={loading} type="button">{loading ? "Opening..." : "Continue"}</button>
            </div>
          ) : null}

          {message ? <p className="form-note" role="status">{message}</p> : null}
        </div>
      </section>
    </main>
  );
}

function LoginLayerStyles() {
  return (
    <style>{`
      .login-layer {
        min-height: 100vh;
      }

      .login-back-action {
        min-height: 42px;
      }

      .login-grid {
        grid-template-columns: minmax(0, 0.95fr) minmax(380px, 520px);
        gap: clamp(28px, 6vw, 72px);
      }

      .login-copy h1 {
        max-width: 680px;
        letter-spacing: 0 !important;
      }

      .login-proof-grid {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 10px;
        max-width: 680px;
        margin-top: 24px;
      }

      .login-proof-grid span {
        min-height: 92px;
        padding: 14px;
        border: 1px solid var(--line);
        border-radius: 14px;
        background: rgba(255, 255, 255, 0.82);
        box-shadow: 0 12px 34px rgba(164, 72, 45, 0.07);
      }

      .login-proof-grid strong,
      .login-proof-grid small {
        display: block;
      }

      .login-proof-grid strong {
        color: var(--text);
        font-size: 0.92rem;
      }

      .login-proof-grid small {
        margin-top: 8px;
        color: var(--muted);
        font-size: 0.78rem;
        line-height: 1.35;
      }

      .login-access-panel {
        border-radius: 18px;
      }

      .login-panel-title {
        border-bottom: 1px solid var(--line);
      }

      .login-access-panel .otp-form,
      .login-access-panel .role-select-panel {
        padding: 20px;
        background: #ffffff;
      }

      .login-access-panel .otp-form label {
        color: var(--muted);
        font-size: 0.82rem;
        font-weight: 900;
      }

      .login-access-panel .otp-form input {
        min-height: 48px;
        border-radius: 12px;
      }

      .login-access-panel button:disabled {
        cursor: not-allowed;
        opacity: 0.62;
        box-shadow: none;
      }

      .login-access-panel .access-row {
        grid-template-columns: 48px minmax(0, 1fr);
        align-items: center;
      }

      .login-access-panel .access-row.active {
        z-index: 1;
        background: #fff7f1;
        box-shadow: inset 3px 0 0 #a9482d;
      }

      .login-access-panel .form-note {
        margin: 0;
        padding: 0 20px 20px;
        background: #ffffff;
        color: #8f3d1f;
        line-height: 1.45;
      }

      @media (max-width: 900px) {
        .login-grid {
          grid-template-columns: minmax(0, 1fr);
          min-height: auto;
          padding: 22px 0 48px;
        }

        .login-proof-grid {
          grid-template-columns: 1fr;
        }
      }

      @media (max-width: 560px) {
        .login-layer .top-nav {
          gap: 12px;
        }

        .login-layer .brand-wordmark {
          display: none;
        }

        .login-copy h1 {
          font-size: clamp(34px, 12vw, 44px);
          line-height: 1;
        }

        .login-copy p:not(.eyebrow) {
          font-size: 0.95rem;
        }

        .login-proof-grid {
          display: none;
        }

        .access-note {
          margin-top: 18px;
        }

        .login-access-panel .access-row {
          grid-template-columns: 40px minmax(0, 1fr);
          padding: 14px;
        }

        .login-access-panel .access-row em {
          width: 40px;
          height: 40px;
          border-radius: 12px;
        }
      }
    `}</style>
  );
}
