Need to Change (for other developers / deployers)

This file lists places and settings other users should update when running this project locally or in their environment.

1) Mobile app API URL (must point to your backend)
- app/src/config/api.ts
  - The config reads from `process.env.API_URL`, `expo.extra.API_URL` (app.json), or falls back to platform defaults.
  - Recommended: set `API_URL` via `app/app.json` `expo.extra.API_URL` or export `API_URL` before starting Expo.
  - Example (PowerShell):
    $env:API_URL = 'http://192.168.11.154:5000/api'
    npx expo start -c
- app/app.json
  - `expo.extra.API_URL` was added. Update it to your machine LAN IP if using a phone on the same Wi‑Fi.
  - Android emulator note: if using Android emulator (not physical device), you may use `http://10.0.2.2:5000/api`.

2) Any remaining hardcoded IPs in app code
- app/src/screens/UserLogin.tsx
- app/src/screens/UserDashboard.tsx
  - These files were refactored to use `app/src/config/api.ts`. If you see leftover IPs, replace them with the `API_URL` import or update `app.json`.

3) Backend MongoDB connection
- backend/src/config/database.ts
  - Uses `process.env.MONGODB_URI`. Create a `.env` file or set the env var before starting backend.
  - Example `.env` (do NOT commit to repo):
    MONGODB_URI="mongodb+srv://<user>:<pass>@cluster0.xyz.mongodb.net/mydb?retryWrites=true&w=majority"
  - Also ensure your MongoDB Atlas IP access list includes your machine IP (or 0.0.0.0/0 for testing), and the user/DB exist.

4) Backend host/port and binding
- backend/src/index.ts (server listen)
  - Server listens on `localhost:5000`. If running on a LAN and connecting from mobile devices, ensure the server binds to `0.0.0.0` or use your machine LAN IP in the request URL.
  - Example: `app.listen(port, '0.0.0.0', () => ...)`

5) Environment variables and secrets
- backend: `MONGODB_URI`, `JWT_SECRET` (if used), and any other secrets.
- app: `API_URL` can be set via `app.json` `expo.extra` or env for the dev session.
- Keep secrets out of Git. Use `.env` and add to `.gitignore`.

6) Expo / Node / npm compatibility
- Recommended Node versions: v18 or v20 (project was tested with Node v22 in this environment; if you encounter `expo` issues, try Node 18/20 via nvm).
- If `npx expo start` errors with the Metro doctor (`TypeError: fetch failed`), try disabling the doctor temporarily:
  - PowerShell:
    $env:EXPO_NO_DOCTOR='1'
    npx expo start --clear

7) Common commands
- Start backend (dev):
  cd backend
  npm install
  npm run dev
- Start app (dev/expo):
  cd app
  npm install
  # set API_URL as needed, then:
  npx expo start -c

8) Firewall / Network notes
- Ensure firewall allows incoming connections on the backend port (default 5000) if connecting from a phone.
- If using MongoDB Atlas, ensure outbound TLS connections to Atlas are allowed.

9) TypeScript and types
- If you get editor TypeScript errors (e.g., missing fields like `relationship` on `Contact`), either:
  - Update the type in `app/src/screens/UserDashboard.tsx` to include the optional field `relationship?: string`, or
  - Keep types synchronized if you edit model shapes.

10) Other tips
- Use your machine LAN IP (e.g., `192.168.11.154`) for physical devices on same Wi‑Fi.
- For Android emulators, use `10.0.2.2` (emulator) or `10.0.3.2` (Genymotion) to reach host `localhost`.
- When making frequent GPS updates, backend uses retry logic for transient MongoDB network errors; if you still see `ECONNRESET` errors, check Atlas IP whitelist and local network stability.

If you want, I can:
- Create a sample `.env.example` in `backend/` and add instructions, or
- Replace `app/app.json` API value with a placeholder and prompt for your IP when starting.

-- End of list
