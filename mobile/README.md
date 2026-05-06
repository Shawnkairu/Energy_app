# e.mappa mobile (Expo)

Install dependencies from the **monorepo root** (`/Users/shawnkairu/emappa`) so `postinstall` runs `patch-package` and applies the `@expo/ngrok` fix.

**Tunnel:** `npm run tunnel:8082` in this package, or `npx expo start --tunnel --clear --port 8082`. If ngrok asks for authentication, run `ngrok config add-authtoken <your token>` (create a token in the ngrok dashboard; do not commit it).

**LAN (no tunnel):** `npm run qr` or `npx expo start --lan --clear --port 8081`.

## Troubleshooting (“stuck loading” / won’t open)

1. **Expo Go must match the SDK** — this app uses **Expo SDK 54** (`expo ~54.x`). Update **Expo Go** from the App Store / Play Store; an older Expo Go often spins forever on a new SDK.
2. **Confirm Metro is actually serving a bundle** — with the dev server running, open `http://127.0.0.1:8081/status` in a browser; you should see JSON. If that fails, Metro isn’t up or the port is wrong.
3. **Phone and Mac on the same Wi‑Fi** for LAN mode; turn off **VPN** on both while testing. Enter manually in Expo Go: `exp://<your-mac-lan-ip>:8081` (get IP with `ipconfig getifaddr en0` on macOS).
4. **Port already in use** — use `npm run tunnel:8082` or `npx expo start --lan --port 8082` so Expo doesn’t sit on an interactive “use 8082?” prompt in non-interactive terminals.
5. **First open after `--clear`** can take a long time (monorepo + cold Metro cache). Prefer `npx expo start` **without** `--clear` for day‑to‑day.
6. **Run Expo in a normal terminal** (Terminal.app) if you need the **QR code** — some IDE-embedded terminals don’t render the QR. The URL line still works in Expo Go.
7. **Tunnel:** after `npm install` at the repo root (ngrok patch), use `npm run tunnel` or `npm run tunnel:8082`. If tunnel fails, set `ngrok config add-authtoken <token>`.
