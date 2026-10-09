# Deployment guide

Everything below is about running the project **as it is** — no feature changes,
no schema migration beyond the one the server already performs on boot.

## 1. Local development (unchanged)

```bash
# terminal 1 — MongoDB must be running (the "MongoDB Server" Windows service)
cd backend && npm install && npm start        # http://localhost:4000

# terminal 2
cd frontend && npm install && npm run dev     # the port Vite prints (5173/5174)
```

Vite proxies `/api` to `localhost:4000`, so the site only ever calls relative
URLs and needs no API address of its own. On the first boot against an empty
database the server imports `backend/data/*.json` and hashes any plaintext
passwords it finds; both are one-time operations tracked in `_meta`.

## 2. Build the site

```bash
cd frontend && npm run build      # → frontend/dist
```

`dist` is a plain static bundle: `index.html` plus hashed assets. It can be
served by the API (`SERVE_FRONTEND`), by any static host, or by nginx.

## 3. Configuration

The server reads `backend/.env` at start-up if the file exists — no dependency
needed; real environments can set the variables in the platform instead, and
those always win. Copy `backend/.env.example` and fill it in.

| Variable | Default | Notes |
| --- | --- | --- |
| `JWT_SECRET` | a development fallback | **must** be set. Random ≥32 chars: `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`. With `NODE_ENV=production` the server refuses to start without it, and with `JWT_SECRET` unset it prints a warning on every boot |
| `NODE_ENV` | unset | `production` also stops `/api/auth/forgot-password` from returning the reset code |
| `MONGODB_URI` | `mongodb://127.0.0.1:27017` | keep the `127.0.0.1` form locally; for a managed cluster use the provided `mongodb+srv://…` string |
| `MONGODB_DB` | `entrepreneur_network` | |
| `PORT` | `4000` | |
| `SERVE_FRONTEND` | unset | path to `frontend/dist`; when set, the API also serves the built site and hands any non-`/api` path to `index.html` |
| `ALLOWED_ORIGINS` | unset (no restriction) | comma-separated origins for CORS once you are live |
| `FRONTEND_URL` | `http://localhost:5173` | the OAuth callback redirects here — set it to the public site origin |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | unset | unset keeps the built-in demo consent screen; set both for real Google sign-in and add the callback URL `https://<host>/api/auth/google/callback` in the Google console |
| `MAIL_PROVIDER` | unset | any non-empty value means "a mail service is wired up", so the reset code is no longer echoed to the client |
| `RESEND_API_KEY` / `SENDGRID_API_KEY` / `MAILGUN_API_KEY` + `MAILGUN_DOMAIN` | unset | email delivery for codes, sign-in notices and important-task alerts. First one found wins; unset leaves every message in the delivery log with status `queued` |
| `TWILIO_ACCOUNT_SID` + `TWILIO_AUTH_TOKEN` | unset | enables SMS/WhatsApp, each still needing its own sender below |
| `TWILIO_SMS_FROM` / `TWILIO_WHATSAPP_FROM` | unset | the sender numbers (`+1…`); a Twilio sandbox number is enough for testing |
| `ALERT_EMAIL_FROM` / `ALERT_FROM_NAME` | `VentureLink` | how the sender and signature look to the member |

## 4. Docker

Two ways, both additive:

```bash
# one container for site + API, plus MongoDB
JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(48).toString('hex'))") \
  docker compose up --build          # → http://localhost:4000
```

* The root `Dockerfile` is multi-stage: it builds `frontend/dist` and copies it
  into a Node image that runs `backend/server.js` with `SERVE_FRONTEND` set.
* `backend/Dockerfile` still exists for an **API-only** image when the site is
  hosted elsewhere.
* The image declares a `HEALTHCHECK` against `/api/health`, which answers `503`
  the moment MongoDB stops responding to a ping — so an orchestrator can gate
  traffic on it.
* Mongo data lives in the named `mongo-data` volume.

## 5. Any other host (Render / Railway / Fly / a VPS / nginx)

1. Provision MongoDB (or MongoDB Atlas) and set `MONGODB_URI` + `MONGODB_DB`.
2. Deploy `backend/`, set `NODE_ENV=production`, `JWT_SECRET`, `FRONTEND_URL`,
   `ALLOWED_ORIGINS`.
3. Build the front-end and host `frontend/dist` — either point `SERVE_FRONTEND`
   at it (single process) or put it behind nginx and proxy `/api` to the Node
   process.

nginx sketch for the two-piece setup:

```nginx
server {
  listen 443 ssl;
  server_name venturelink.example.com;

  root /var/www/venturelink/dist;          # frontend/dist
  location / { try_files $uri /index.html; }

  location /api/ {
    proxy_pass http://127.0.0.1:4000;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;   # real client IP in the audit trail
    proxy_set_header X-Forwarded-Proto $scheme;
    client_max_body_size 16m;              # matches the 15 MB JSON limit
  }
}
```

The server already sets `trust proxy`, so `X-Forwarded-For` is what the session
list and sign-in activity show as the address.

## 6. What the platform does for you

* **Security headers** on every response: `X-Content-Type-Options: nosniff`,
  `X-Frame-Options: DENY`, `Referrer-Policy: no-referrer`,
  `Permissions-Policy` (no camera/mic/geolocation), `Cross-Origin-Resource-Policy:
  same-origin`, and `Strict-Transport-Security` once the request arrives over
  HTTPS. `X-Powered-By` is disabled.
* **One error exit** (`apiErrorHandler`): oversized body → `413`, malformed JSON
  → `400`, anything else → a generic `500` with the stack only in the server log.
* **Brute-force guards** on the credential, recovery, two-factor and alert
  routes (see `docs/API.md`).
* **Two-step verification** is per account and off by default: an account that
  never switched it on signs in exactly as before. Codes are 6 digits, single
  use, 10 minutes, 5 attempts, and only their SHA-256 hash is stored
  (`twoFactorChallenges`). While no provider can deliver, the code is shown on
  screen so the flow stays demonstrable; the moment a key is configured the same
  code only goes to the member's chosen channel.
* **Outward delivery** (`backend/notify.js`) — email via Resend, SendGrid or
  Mailgun, SMS/WhatsApp via Twilio, all over built-in `fetch`. Nothing is
  invented when credentials are missing: the full message is recorded in the
  `outbox` collection as `queued` with the reason, which is what the admin
  dashboard's delivery log reads. Adding a key turns those rows into `sent`
  without touching code.
* **Passwords** and verification codes are only ever stored as bcrypt / SHA-256
  hashes; plaintext password rows found at boot are migrated automatically.
  Hashes never leave the server — `/api/state` and `/api/users/:id` return the
  public projection.
* **Sessions** are recorded per sign-in and checked on every authenticated call,
  so a password change, a reset or an explicit "sign out" invalidates the token
  immediately rather than waiting for it to expire.
* **Graceful shutdown**: `SIGTERM`/`SIGINT` finish in-flight requests, close the
  Mongo connection and exit; a 10-second timer forces the exit if something
  hangs. Container stop/restart is therefore clean.
* **Request log**: every response is logged as
  `[ISO time] METHOD path status ms`, which most platforms pick up directly.

## 7. Pre-launch checklist

- [ ] `JWT_SECRET` set to a fresh random value (not the sample string)
- [ ] `NODE_ENV=production`
- [ ] `MONGODB_URI` points at a backed-up database, and `MONGODB_DB` is not the
      development name if you share a server
- [ ] `FRONTEND_URL` and `ALLOWED_ORIGINS` set to the public origin
- [ ] Google OAuth credentials added (or accept the demo consent screen),
      callback URL registered
- [ ] a mail provider wired to `MAIL_PROVIDER` so reset codes are delivered
      instead of displayed — this is the one placeholder left in the recovery
      flow, and `/api/auth/forgot-password` already stops returning codes the
      moment the variable is set
- [ ] at least one key from `RESEND_API_KEY` / `SENDGRID_API_KEY` /
      `MAILGUN_API_KEY` + `MAILGUN_DOMAIN` (and `TWILIO_*` for SMS/WhatsApp) so
      two-step codes and important-task alerts leave the server; until then they
      are complete and readable in the delivery log, marked `queued`
- [ ] `FRONTEND_URL` set to the public origin — it is the link every outward
      message points back to
- [ ] the seeded demo accounts (`123`) changed or removed before the site is
      reachable by the public
- [ ] `GET /api/health` green, and monitored
- [ ] backups scheduled for the database

## 8. Data and reset

`backend/data/*.json` is the seed, imported only when `_meta.seeded` is absent.
To start fresh on a development machine:

```bash
mongosh entrepreneur_network --eval 'db.dropDatabase()'
# then restart the backend — it re-seeds and re-creates the security indexes
```

Sessions, login activity, password resets, two-step challenges and the delivery
log live in five separate collections (`sessions`, `loginActivity`,
`passwordResets`, `twoFactorChallenges`, `outbox`) that are never exposed
through `/api/state`; dropping them only clears history, not app data.

## 9. Known limits, stated plainly

These are the places where the build is honest-but-not-production-perfect, each
with the smallest fix:

* **Reset codes and two-step codes are shown on screen** because no mail provider
  is connected. Set `MAIL_PROVIDER` for the reset flow and one of
  `RESEND_API_KEY` / `SENDGRID_API_KEY` / `MAILGUN_API_KEY` + `MAILGUN_DOMAIN`
  (or `TWILIO_*` for SMS/WhatsApp) for the verification flow — the same code then
  leaves the server instead of appearing in the panel, and the on-screen copy
  disappears by itself. The delivery side is already written:
  `backend/notify.js` holds the provider calls and the `outbox` receipt for every
  message, so this is a configuration step, not a missing feature.
* **The delivery log keeps 500 rows**, oldest pruned first; it is a receipt
  trail, not an archive.
* **The rate limiter is in-memory per process**, which is correct for one API
  instance and approximate behind several. Move it to a shared store (Redis) if
  you scale horizontally.
* **CORS is open by default** so every local setup keeps working; set
  `ALLOWED_ORIGINS` in production.
* **The production bundle is one ~960 kB JS file (≈275 kB gzipped)** — Vite
  warns about it and it is fine for a portfolio/demo deployment. To improve it:
  enable gzip/brotli at the edge (`gzip on;` in nginx, or the host's CDN), and
  split vendors in `frontend/vite.config.js` with
  `build.rollupOptions.output.manualChunks` (e.g. `react`/`react-dom` into their
  own chunk) so the app code re-downloads less often.
* **Session and activity rows are kept**, not pruned; the list reads the newest
  30 and the newest 20 events, so the UI stays small even as the log grows.
* **The seeded demo accounts share the password `123`** — change or remove them
  before anything is publicly reachable.

