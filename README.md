# Yordan Decorations & Building Ltd – website (Next.js PWA)

Next.js (App Router, TypeScript) site that works as a normal website **and** can be installed as an app
(Android/Chrome, desktop Chrome/Edge, and iPhone/iPad via Add to Home Screen). The visual design is unchanged from the
previous static site (verified with screenshot comparison).

## Structure
| Path | Purpose |
|---|---|
| `app/(site)` | Home page layout + page (metadata, JSON-LD, fonts) |
| `app/(legal)` | Privacy, Cookie, Terms pages (keep their `.html` URLs through rewrites) |
| `app/(offline)/offline` | Offline fallback page (self-contained styling) |
| `app/manifest.ts` | Web app manifest (`/manifest.webmanifest`) |
| `app/globals.css` | Original site CSS (moved verbatim) |
| `content/` | Page markup as HTML fragments, rendered on the server |
| `components/legacy-home.ts` | Original page script (menu, gallery, quote form, assistant), run by `home-behaviour.tsx` |
| `app/(app)` + `components/app-ui.ts` | Mobile-app UI served at `/app` (opened by the installed app) |
| `components/install-app.tsx` | "Download Mobile App" button/link, Android and iOS only |
| `components/pwa-register.tsx` | Service-worker registration (production only) |
| `scripts/generate-sw.mjs` | Writes `public/sw.js` with a new cache version on every build |
| `public/` | Images, icons (`icons/`), iOS splash (`splash/`), sitemap, robots, Search Console file |

## Run locally
```bash
npm install
npm run dev          # development (service worker is off in dev)
npm run build && npm start   # production build, test PWA at http://localhost:3000
```

## Deploy (Vercel)
1. `vercel.json` sets `"framework": "nextjs"`; no environment variables are needed.
2. Merge branch `nextjs-pwa` into `main` (or review its Vercel preview first). Vercel runs `npm run build`
   (this also regenerates the service worker with a fresh cache version) and the domain keeps working.
3. HTTPS is required for PWA features; Vercel provides it for your domain.

## How installing works
- **Android (Chrome, Samsung Internet, ...):** a floating **Download Mobile App** button (bottom-left, above WhatsApp) and a
  footer link appear. Chrome's native install prompt opens when the browser provides it; otherwise the button shows the
  manual steps (browser menu ⋮ → Install app / Add to Home screen).
- **iPhone / iPad (Safari):** the same button opens a short guide: Share → Add to Home Screen → Add
  (iOS cannot be installed from a button, so only instructions are shown).
- **Desktop (Windows, macOS, Linux, Chrome, Edge):** no install option is shown.
- Nothing is shown once the app is installed / running standalone.

## Website vs installed app (two different UIs, one codebase)
- In a browser (desktop or mobile) visitors always get the normal website at `/`.
- The installed app opens **`/app`** (manifest `start_url`), a mobile-app interface (bottom tabs: Home, Services, Quote,
  Projects, About; services sheet; 5-step quote wizard; emergency sheet). Its source is `content/app.html`,
  `app/(app)/app.css` and `components/app-ui.ts` (from `yordan-app.html`).
- If the installed app is ever opened at `/` (e.g. an old iOS home-screen icon), a tiny script in the site layout
  redirects it to `/app` when it detects standalone mode.
- `/app` is `noindex` so search engines keep listing the website only.
- The app's quote wizard sends through WhatsApp / SMS (as in the provided design); the website form emails via FormSubmit.
- The gallery tiles and the before/after slider in the app are still placeholders (as in the provided file).

## Offline & caching (`public/sw.js`, generated)
- Pages: network first, last good copy when offline, otherwise `/offline`.
- `/_next/static/*`: cache first (hashed files). Images/icons: stale-while-revalidate.
- Never cached: POST requests (quote form), anything cross-origin (FormSubmit, Google Fonts, WhatsApp), `/api/*`.
- Each deploy gets a new cache name; old caches are deleted on activation, so updates roll out automatically.
- The quote form needs internet to send; offline, the visitor sees the normal error asking them to call.

## Quote form email
Unchanged: posts to `https://formsubmit.co/ajax/yordandecoandbuilding@gmail.com`. FormSubmit needs a one-time
activation: submit a test enquiry, then click **Activate Form** in the email sent to that inbox.

## Things to provide / replace
- Icons are generated from your logo (`public/icons`, `public/splash`). Replace them with designer-made artwork if you
  want a different look, keeping the file names and sizes.
- Update insurance details in the page content before the policy dates in the certificates expire.

## Tests performed
Production build + typecheck; pixel comparison with the old static site (legal pages identical, home identical apart from
non-deterministic animation frames, which also differ between two loads of the original); quote form (success, failure,
activation states, payload); manifest keys and all four icons; service-worker activation and control; offline home /
cached page / offline fallback; Android-style install prompt; iOS Safari instructions; no console errors.
