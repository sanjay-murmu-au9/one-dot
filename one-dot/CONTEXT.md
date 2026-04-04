# ONE DOT — PROJECT CONTEXT
> Read this file before starting any work. It is the single source of truth.

---

## What is One Dot?
A **Stoic Sync Engine** — a cross-platform app that sets a personalized, living wallpaper on your phone lock screen as a daily reminder that time is finite. The wallpaper updates automatically every day showing life grids, countdowns, and philosophical quotes.

---

## Repo & Branches
- **Repo**: `https://github.com/sanjay-murmu-au9/one-dot`
- **Main branch**: `main` (production)
- **Feature branch**: `branding-v2` (keep in sync with main)

---

## Project Structure
```
one-dot/
├── client/         # React + Vite + Capacitor (FE + Android)
├── server/         # Express + TypeScript (BE)
├── .github/
│   └── workflows/
│       └── deploy.yml   # Auto-deploys FE to GitHub Pages on push to main
```

---

## Tech Stack

### Frontend (`client/`)
- React 18 + Vite + TailwindCSS
- Firebase Auth (Google + Email)
- Firestore (config sync)
- Capacitor 8 (Android wrapper)
- Custom Capacitor plugin: `WallpaperPlugin.java` (sets wallpaper via Android WallpaperManager)

### Backend (`server/`)
- Express + TypeScript
- `node-canvas` — SSR wallpaper image generation
- Firebase Admin SDK — reads user config from Firestore
- Deployed on **Render.com**

### Deployments
| Service | URL |
|---|---|
| Frontend (GitHub Pages) | `https://sanjay-murmu-au9.github.io/one-dot` |
| Backend (Render) | `https://one-dot.onrender.com` |
| Firebase Project | `onedot-app-23614` |

---

## Environment Variables

### Client (`client/.env`)
- Firebase config keys (VITE_FIREBASE_*)
- `VITE_API_BASE_URL` is split into:
  - `client/.env.development` → `http://localhost:3001`
  - `client/.env.production` → `https://one-dot.onrender.com`

### Server (`server/.env`) — local only, gitignored
- `FIREBASE_SERVICE_ACCOUNT_JSON` — not needed locally (uses `serviceAccountKey.json` file)

### Server (Render dashboard env vars)
- `FIREBASE_SERVICE_ACCOUNT_JSON` — full service account JSON as single line string
- `NODE_ENV=production`

---

## Firebase Config
- **Project ID**: `onedot-app-23614`
- **Auth**: Email/Password + Google Sign-In enabled
- **Authorized domains**: `localhost`, `sanjay-murmu-au9.github.io`
- **Firestore**: users collection → `users/{uid}` document

### Firestore User Document Shape
```json
{
  "email": "...",
  "name": "...",
  "dob": "YYYY-MM-DD",
  "birthYear": 1995,
  "onboardingCompleted": true,
  "style": "memento-mori",
  "active_wallpaper_config": {
    "style": "memento-mori",
    "targetDate": "YYYY-MM-DD",
    "resolution": "android",
    "memento_options": { "birthYear": 1995, "density": "life", "accent": "#94a3b8", "quote": "MEMENTO MORI" },
    "backgroundImage": null
  },
  "updatedAt": "..."
}
```

---

## Key API Endpoints
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/health` | Health check |
| GET | `/api/wallpaper/u/:uid/daily.png` | Returns live PNG wallpaper for user |

---

## Wallpaper Styles (10 total)
`memento-mori`, `dot-grid`, `large-countdown`, `progress-bar`, `quarterly-view`, `yearly-view`, `carpe-diem`, `life-view`, `weekly-grid`, `special-dates`

---

## Android App
- **Package ID**: `com.sanjayamurmu.onedot`
- **Capacitor version**: 8.2.0
- **Android project**: `client/android/`
- **Custom plugin**: `WallpaperPlugin.java` — sets wallpaper from Base64 via `WallpaperManager`

### Android Build Commands
```bash
cd client
npm run build:android     # builds web + syncs to android
npx cap open android      # opens Android Studio
```

### Google Sign-In on Android
- Uses `signInWithRedirect` on native (Capacitor), `signInWithPopup` on web
- `getRedirectResult` handled in `AuthContext.jsx` on app load

---

## Local Dev
```bash
# Backend
cd server && npm run dev       # runs on http://localhost:3001
# uses serviceAccountKey.json for Firebase (file must exist at server root)

# Frontend
cd client && npm run dev       # runs on http://localhost:5173
```

---

## Render Deployment
- **Build command**: `rm -rf node_modules && npm install --build-from-source && npm run build`
- **Start command**: `npm start`
- **Root directory**: `server`
- `node-canvas` is compiled from source on Render (Linux) — do NOT use cached Windows binaries

---

## GitHub Actions (FE Auto-Deploy)
- Trigger: push to `main`
- Builds `client/` and deploys `dist/` to GitHub Pages
- File: `.github/workflows/deploy.yml`

---

## Completed Features ✅
- 10 wallpaper styles with SSR canvas engine
- Firebase Auth (email + Google, web + Android)
- Firestore config sync
- Live wallpaper API (`/api/wallpaper/u/:uid/daily.png`)
- Android APK via Capacitor
- Native wallpaper setting via `WallpaperPlugin.java`
- Auto-update toggle (WorkManager based)
- Shortcut URL for iOS/Android automation
- Shock onboarding (DOB → life stats reveal)
- Branding v2 (Stoic dark theme)

---

## Pending / Next Features 🔲
- [ ] WorkManager daily background refresh (Android)
- [ ] Push notifications ("1 more day gone")
- [ ] Lock screen widgets (Android)
- [ ] Shareability loop (export + watermark)
- [ ] Analytics (DAU, retention events)
- [ ] Play Store submission
- [ ] iOS build + App Store

---

## Important Notes
- `server/node_modules` must NOT be committed (gitignored)
- `server/serviceAccountKey.json` must NOT be committed (gitignored)
- `client/.env` contains Firebase keys — currently committed (no secrets, public Firebase config is safe)
- Render caches node_modules — always use `rm -rf node_modules` in build command to force fresh install
- `node-canvas` requires native Linux libs on Render — compiled from source via `--build-from-source`
