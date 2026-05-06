export function PrivacyNote({ children }: { children: string }) {
  return (
    <aside className="privacy-note">
      <span>Privacy-safe truth</span>
      <p>{children}</p>
    </aside>
  );
}
