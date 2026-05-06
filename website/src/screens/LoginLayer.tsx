import { Brand } from "../components/Brand";
import { webRoles } from "../data/roles";
import type { WebRole } from "../types";

export function LoginLayer({
  onLogin,
  onBack,
}: {
  onLogin: (role: WebRole) => void;
  onBack: () => void;
}) {
  return (
    <main className="login-layer">
      <nav className="top-nav">
        <Brand />
        <button className="ghost-action" onClick={onBack}>Back to public site</button>
      </nav>

      <section className="login-grid">
        <div className="login-copy">
          <p className="eyebrow">Role access</p>
          <h1>Choose the truth layer you are allowed to see.</h1>
          <p>
            e.mappa does not show one generic dashboard to everyone. Each role gets the operational view needed to make
            a decision without exposing private counterpart finances.
          </p>
          <div className="access-note">
            <span>One session, one role</span>
            <strong>Each portal opens with only the sections that role is allowed to operate.</strong>
          </div>
        </div>

        <div className="access-panel">
          <div className="access-panel-header">
            <span>Secure portal gateway</span>
            <strong>Pick one operating room</strong>
          </div>
          {webRoles.map((role, index) => (
            <button className="access-row" key={role.id} onClick={() => onLogin(role.id)}>
              <em>{String(index + 1).padStart(2, "0")}</em>
              <span>{role.accessLabel}</span>
              <strong>{role.label}</strong>
              <small>{role.unlockCopy}</small>
            </button>
          ))}
        </div>
      </section>
    </main>
  );
}
