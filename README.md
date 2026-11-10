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

## Admin portal (`/admin`)
One place to manage the website **and** the mobile app: quote requests and their stage, photos, company info and team accounts.

### One-time setup on Vercel
1. **Database:** Vercel project → *Storage* → *Create Database* → **Neon (Postgres)** → connect it to this project. This adds `DATABASE_URL` automatically (any other Postgres works too).
2. **Environment variables** (Project → Settings → Environment Variables), for Production (and Preview if you want to test there):
   - `AUTH_SECRET`: a long random string (32+ characters), e.g. from `openssl rand -base64 48`.
   - `ADMIN_EMAIL`: the administrator's login email.
   - `ADMIN_PASSWORD`: a **temporary** password (10+ characters). You must change it at first login.
3. **Redeploy**, open `https://<your-domain>/admin`, sign in, set your own password. Then **delete `ADMIN_PASSWORD`** from Vercel.
Tables are created automatically on first start. Without these variables the public site keeps working exactly as before (original content), and `/admin` shows "not set up".

Lost the admin password? Set `ADMIN_RECOVERY_PASSWORD` to a new temporary value, redeploy, sign in, change it, delete the variable.

### What you can do
| Area | What it does |
|---|---|
| **Enquiries** | Every website and app quote request, with stage **new → contacted → confirmed → completed / cancelled**, appointment date/time (UK time), private notes, history, search and filters, one-tap call / WhatsApp / email. |
| **Media** | Replace any website photo (gallery, service images, founder, logos) and the mobile-app gallery tiles / before-after slider. Photos are resized and stored in the database; *Reset* restores the original. |
| **Company info** | Phone, WhatsApp number, contact email, address, TikTok. Updates the website, legal pages, structured data, manifest shortcuts and the app. |
| **Users** | The administrator adds team members, resets passwords, disables or deletes them. |
| **My account** | Everyone can change their own password. |

### Roles
- **Administrator** (exactly one): everything, including Users. This account can only be changed by its owner (from *My account*); nobody else, including team members, can modify, disable or delete it.
- **Team member:** can manage enquiries, media and company info, and change their own password. Cannot see or use *Users*, cannot delete enquiries, cannot touch any account except their own password.

### Quote notifications are unchanged
Website quotes are still emailed by FormSubmit; the website and the app still open WhatsApp / SMS as before. The portal only receives a **copy** (a failure there never affects the customer). Because the app opens WhatsApp/SMS on the customer's phone, an app enquiry is recorded when the customer taps *Send*, not when the message is actually delivered. The FormSubmit inbox is configured separately and is intentionally not editable in the portal (changing it needs a new FormSubmit activation).

### Security
- Passwords: scrypt (memory-hard), 10+ characters with a letter and number, common passwords rejected; admin-set temporary passwords force a change at first login.
- Sessions: signed, `HttpOnly`, `Secure`, `SameSite=Lax` cookie, 12 h; every request re-checks the database, so disabling a user or changing/resetting a password signs out their other devices immediately.
- Brute-force protection: 5 wrong passwords per email (25 per IP) → 15-minute lock; unknown emails take the same time as real ones; generic error messages.
- CSRF: server actions are origin-checked by Next.js; the upload and enquiry endpoints verify the `Origin` header.
- Public endpoints: the enquiry endpoint validates, size-limits, rate-limits (10 per 10 min per IP, IPs stored only as salted hashes) and de-duplicates retries.
- Uploads: type verified by file signature, re-encoded to WebP (metadata such as GPS removed), max 4 MB, served with `nosniff`.
- Admin pages and APIs: `Cache-Control: no-store`, `noindex`, not framable, excluded from the service worker and from `robots.txt`.
- Server-side checks on every action; all SQL is parameterised; enquiry text is always rendered as text (never HTML).
- Audit log of sign-ins, password changes, user changes, media and settings changes (table `audit_log`).

### Data & limits
Data lives in your Postgres database (Neon's free tier is plenty for thousands of enquiries). Photos are stored in the same database (≈100-300 KB each after resizing). Public pages are cached and refreshed within a minute, or immediately after you save in the portal.
