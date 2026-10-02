# Online Entrepreneur Network Portal — Frontend + Backend

Your original frontend, unchanged feature-for-feature. All 13 data collections
(users, messages, webinars, projects, requirements, investments, proposals,
meetings, agreements, offers, helpRequests, helpOffers, reviews) now load
from and save to a real backend instead of living only in React state.

## What changed (and what didn't)

- **Not touched:** every component, handler, screen, and piece of UI logic in
  `src/app/App.jsx`. All the seed data (`initialUsers`, `initialMessages`, etc.)
  is still right there in the file, untouched — it's the fallback the app
  shows instantly on load and now also the exact data that seeds the backend.
- **Added:** `src/api.js` (a small fetch wrapper), 14 lines of `useEffect`
  in `App.jsx` to load state on mount and auto-save each collection when it
  changes, and a `backend/` folder (Express + one JSON file per collection).
- The Vite dev server proxies `/api/*` to the backend, so nothing in the
  frontend needs a hardcoded backend URL.

## Run it

**1. Start the backend first:**
```
cd backend
npm install
npm start
```
This runs on `http://localhost:4000` and serves/persists the JSON files in
`backend/data/`.

**2. In a second terminal, start the frontend:**
```
cd frontend
npm install
npm run dev
```
Open the URL Vite prints — `http://localhost:5173`, or `http://localhost:5174` if 5173 is already
taken by another copy of the app. Check the terminal, not the bookmark, so you are looking at this
project.

Both need to be running — if you only start the frontend, requests to
`/api/state/*` will fail with `ECONNREFUSED` (that's exactly what the error
log you shared earlier meant: the backend just wasn't running).

## Notes

- Every change in the app (new message, new investment, editing a profile,
  etc.) now persists to `backend/data/*.json`, so it survives a page refresh
  or restart — a real improvement over the old React-only state, with zero
  feature changes.
- Saves are debounced (300ms) per collection so rapid updates don't spam
  the backend.
- If the backend is ever unreachable, the frontend still works using its
  built-in seed data — it just won't persist changes until the backend is
  back up.

## Latest changes

- **Edit projects:** Edit button on every project card (Portfolio page); saves in place.
- **Live demo link:** optional link box next to the project file option; shown wherever the file link shows.
- **Agreements:** no default 30-day term. Making an investment or accepting an offer first asks for the agreement details; the agreement text and report are generated from them.
- **Investor requirements:** optional image/document with the project details.
- **Offer letters:** optional image/file attachment shared with the offer.


## MongoDB (view it in MongoDB Compass)

The backend now stores everything in MongoDB instead of JSON files. The API the
frontend uses is unchanged, so no frontend changes were needed.

1. Install **MongoDB Community Server** and **MongoDB Compass**. On Windows the
   installer sets MongoDB up as a service that starts automatically.
2. Open Compass and connect to `mongodb://127.0.0.1:27017`.
3. Start the backend (`cd backend`, `npm install`, `npm start`). You should see
   `Connected to MongoDB ...`. On first run it imports the seed data from
   `backend/data/*.json` once.
4. In Compass, refresh: the database is `entrepreneur_network`, with one collection per
   data type (users, projects, requirements, offers, agreements, ...). Each item is a document.

Notes:
- Use `127.0.0.1`, not `localhost`, in the connection string (avoids an IPv6 connection error).
- To use another server (e.g. Atlas) or database name, set `MONGODB_URI` / `MONGODB_DB`
  before `npm start`. Windows cmd: `set MONGODB_URI=your-uri&& npm start`.
- Changes you make in Compass show up in the app after a page refresh.
- To reset to the seed data, drop the `entrepreneur_network` database in Compass and restart the backend.
- The JSON files in `backend/data/` are now only the one-time seed.

## Authentication, roles & new features

All earlier screens and flows are unchanged; the items below were added on top.

### JWT authentication + OAuth
- Every account stores a **bcrypt-hashed** password; login returns a **JWT** (7-day expiry) that the
  frontend keeps in `localStorage` (`vl_token`) and sends as `Authorization: Bearer <jwt>`.
- All `/api/state/*` reads/writes and action endpoints are JWT-protected (no token → `401`).
- **Sign in with Google** via OAuth 2.0 authorization-code flow. Set `GOOGLE_CLIENT_ID`,
  `GOOGLE_CLIENT_SECRET` and `FRONTEND_URL` for the real provider; without them the app runs a
  built-in demo consent screen that issues the same JWT flow.

### Demo / seeded accounts (all password: `123`)
| Role | Name | Email |
|---|---|---|
| Entrepreneur | Saumya | sauEntrepreneur@nec.edu.in |
| Investor | Michael Okafor | sauInvestor@nec.edu.in |
| Freelancer | Alex Rivera | sauFreelancer@nec.edu.in |
| Startup Founder | Priya Sharma | sauStartup@nec.edu.in |
| Mentor | Rachel Thompson | sauMentor@nec.edu.in |
| Administrator | Arjun Verma | admin@venturelink.app |

Five more realistic users (James Wu, Maria Santos, David Kim, Ahmed Hassan, Lisa Park) round out the
network — 11 accounts total. No placeholder/sample rows.

### Admin dashboard
Sign in as the administrator to get an **Admin Dashboard** page backed by `GET /api/admin/stats`:
platform-wide stat cards, a User Management table (role, auth method, connections, verified toggle
that persists), and a recent-projects overview with patent/novelty badges.

### PatentBot — novelty screening before investing
- When a founder submits a **patented** project, the investor's proposal card locks the Invest button
  until PatentBot verifies it ("Run novelty check").
- PatentBot is an investor-side chatbot (`POST /api/novelty-check`) that validates the patent-number
  format, checks the attached proof document, and runs a Jaccard **prior-art comparison** against every
  other project on the platform (`backend/novelty.js`).
- Verdicts: **CLEARED** (score ≥ 75) unlocks investing; **REVIEW/FLAGGED** keeps it locked so fake or
  duplicate patents cannot receive investment.

### Project filters, offer terminology, languages, recents
- **Browse Projects** now splits into **SaaS** and **Product** sections with an "All Types / SaaS /
  Product" filter — selecting one shows only those projects.
- Project submission asks for patent status, **patent/application number**, and proof document.
- Engagement documents adapt to the recipient: freelancers see **Offer / Package**, everyone else
  (employees, mentors, co-founders) sees **Bond / LPA** — in the form, the letter, notices and lists.
- **Multi-lingual UI**: 13 languages (English, தமிழ், हिन्दी, বাংলা, ਪੰਜਾਬੀ, Español, Français, Deutsch,
  Português, Italiano, Русский, 中文, 日本語) in the header **and** on the sign-in / sign-up cards, so
  the language can be picked before you log in. Choosing one re-translates the whole rendered interface
  — nav, cards, forms, buttons, placeholders, tooltips, titles — not just a few labels (preference
  persists in `localStorage`). See `frontend/src/app/i18n.js`, `i18n-catalog-*.js` (430-phrase catalogue)
  and `i18n-runtime.js` (the translator). Names, bios, project titles, patent numbers and uploaded file
  names are user content and are deliberately left as written.

### This round — the 12 requested changes (all additive)

1. **Requirements are editable after publishing** — an Edit button on every requirement you posted; the
   saved edit persists like any other change.
2. **Remove button for projects and requirements** — delete your own project or requirement.
3. **PatentBot verifies properly** — the check now validates the patent/application number format,
   requires a proof document, and compares the description against every other project on the platform.
4. **A false patent is reported as false** — bad format, missing proof, or a number already used by
   another project returns a clear "not verified" verdict with the reason; investing stays locked.
5. **PatentBot closes without a refresh** — a close button, Escape, and clicking outside all dismiss it,
   and re-opening starts a fresh chat.
6. **No overlap with the logo** — the PatentBot launcher sits in the bottom-right of the content area,
   clear of the header and the site logo.
7. **13-language interface** — see the bullet above.
8. **OAuth corrected and made to look original** — a single shared demo-consent flow on both sign-in and
   sign-up, state-checked redirect, JSON `{demo, url}` response, `?oauth_error=` handled on the login
   page, and no password is ever set on a real Google account.
9. **Browse Projects filter redesigned** — the filter is now one clean card row (type / status /
   industry / sort) instead of the scattered chips.
10. **Offer letter wording** — freelancers are offered a **Payment** (Package); every other role is
    offered a **Bond** quoted in **LPA**.
11. **Investments are editable** — investors can edit the amount, type, date and notes of an investment
    from the Investments page.
12. **Extras that don't disturb the flow** — confirmation pop-ups when an offer letter or agreement is
    sent, and the language preference is remembered across sessions.
- **Recently accessed**: the dashboard shows your last-visited profiles (per user, persisted to the
  `recentlyAccessed` collection).

### API endpoints
`POST /api/auth/register` · `POST /api/auth/login` · `GET /api/auth/me` · `GET /api/auth/google` ·
`POST /api/auth/oauth/demo` · `GET /api/state` · `PUT /api/state/:collection` ·
`POST /api/novelty-check` · `GET /api/admin/stats` (admin only) — all except register/login/google
require a Bearer JWT.
