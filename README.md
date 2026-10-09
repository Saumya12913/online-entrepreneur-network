# Online Entrepreneur Network Portal — Frontend + Backend

Your original frontend, unchanged feature-for-feature. All 15 data collections
(users, messages, webinars, projects, requirements, investments, proposals,
meetings, agreements, offers, helpRequests, helpOffers, reviews,
recentlyAccessed, watchlist) now load
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

None of these are printed on the sign-in screen any more — the sign-in field
offers them as **suggestions while you type** (email and name only, no
password), and this table is where the list lives.

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
  persists in `localStorage`). See `frontend/src/app/i18n.js`, `i18n-catalog-*.js` (492-phrase catalogue)
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

### This round — themes, localised names, and send/agreement confirmations (all additive)

1. **Change-theme option with 12 selectable themes** — a palette button in the header (and on both the
   sign-in and sign-up cards) opens a popover with 9 light and 3 dark themes (Classic Blue, Sky, Indigo,
   Violet, Teal, Emerald, Amber, Rose, Mono, Midnight, Graphite, Aurora). Picking one applies immediately
   and is remembered on that device (`localStorage.vl_theme`) and painted before the first render, so a
   reload never flashes the default colours. Implementation is a scoped CSS-variable re-mapping
   (`frontend/src/app/themes.js` injects one `<style id="vl-theme-style">` block keyed on
   `html[data-vl-theme]`), plus six class rules so `bg-white`, dark text, and the three brand navy
   surfaces follow the accent. No component, layout, or colour constant in any page was touched;
   "Classic Blue" emits an empty stylesheet, which is exactly the original look. Every theme was audited
   for WCAG contrast across 11 colour pairs — the worst ratio equals the original theme's.
2. **Member names now localise with the language** — switching to Tamil, Hindi, Bengali, Punjabi,
   Russian, Chinese or Japanese also rewrites people's names in that script
   (`frontend/src/app/i18n-names.js`), including inside sentences ("Met Priya Sharma last week"). Spanish,
   French, German, Portuguese and Italian keep the Latin spelling on purpose. Project titles, bios,
   patent numbers and uploaded file names remain exactly as their authors wrote them.
3. **"Offer sent" confirmation** — after an offer letter goes out, the pop-up reads **Offer sent** (or
   **Bond sent** for a Bond offer) with a translated "Letter delivered to <name>" line.
4. **"Agreement made" confirmation** — whenever an agreement is created, the pop-up reads
   **Agreement made** with the translated detail line and the investment/project it belongs to.
   Both messages are catalogue phrases, so they appear in all 13 languages.
   File: `frontend/src/app/App.jsx` (`successNotice` toast accepts a title, a detail line and an entity).

### This round — profile depth, trust badges and a follow graph (all additive)

1. **Profile completion percentage** — your own profile now carries a *Profile completion* card: a
   percentage, a progress bar, "Still to add" chips for whatever is missing, a **Complete these steps**
   shortcut into Edit Profile, and *Steps done / Remaining* tiles. It scores 11 independent checks (bio,
   location, position, company, industry, ≥3 skills, experience years, work history, education, a website
   or LinkedIn URL, first connection) in its own card — the existing *Verification & Trust* checklist and
   its request-verification flow are untouched and still work exactly as before.
2. **Experience and education** — Edit Profile gained two entry editors (*Work history*: role, company,
   from, to, note; *Education*: school, degree, from, to) with add and delete per row. Saved entries
   render as **Experience** and **Education** timeline cards on the profile, between About and Skills,
   and hide themselves when a member has none. They are optional fields on the user document, so every
   existing account keeps working unchanged; `backend/auth.js` guarantees the new arrays
   (`experienceList`, `education`, `following`, `followers`) read back as empty lists.
3. **Trust badges** — profiles now show a badge row next to the role: *Verified* (existing), plus
   *Profile complete* (≥90%), *Patent verified* (owns a project whose PatentBot verdict cleared a granted
   patent), *Top rated* (≥4.5 over ≥2 reviews) and *Trusted connector* (≥5 connections). Badges are
   derived from data already on the platform — nothing has to be requested or granted by an admin.
4. **Follow / unfollow and a follower graph** — a **Follow / Following** button on every profile and on
   each connection card, an *Unfollow* / *Follow back* control in the new lists, and **Following** /
   **Followers** tiles on the profile plus two panels on the Connections page. Following is independent
   of connecting: it never touches a connection, a message thread or a pending request.
5. **Recommended for you** — the Connections page gained a ranked list (top 8) of members you are not
   connected to and have no pending request with, each with a **fit %** and up to three explainable
   reason pills: *Mutual connections*, *Shared industry*, *Shared skills*, *Same city*,
   *Invests at your stage*, *Active investor*, *Available for hire*, *Sector match*, *Top rated*.
   Scoring is transparent and additive on top of the existing `calcMatchScore` ideas; the dashboard's
   original "People you may know" panel is unchanged.
6. **Connection management** — each connection card now has View / Message / Follow and a **Remove
   connection** action that drops the link on both sides and confirms with a *Network updated* pop-up.
7. **All of it in 13 languages** — 51 new catalogue rows (492 in total) cover the new labels, badges,
   reasons, editor placeholders and toasts; headings that carry a count ("Recommended for you (4)") have
   their own row, matching how "Your Network (4)" was already handled. Verified live in Tamil: headings,
   badges, buttons, tooltips and member names all localise, while bios, project names and skill lists
   stay as written.
8. **Latent styling repaired** — the precompiled Tailwind sheet (`src/styles/app.css`, no runtime JIT) was
   missing ~90 utilities the newer UI uses (`bottom-6`, `w-64`, `top-full`, `z-30`, the indigo role-badge
   ramp, `divide-slate-100`, `italic`, `space-y-1`, …), so those elements rendered unstyled. They now live
   in `src/styles/added.css`, imported after `app.css`; no markup was changed to do it. A checker script
   confirms every class token used by the interface exists in the built stylesheet.

### This round — a real project page with lifecycle, team, funding, documents and analytics (all additive)

1. **A page per project** — every project now has its own professional page (`project-detail` view) that
   gathers the pitch, team, funding, requirements, documents, patent record and status in one place. It is
   reachable from **View project** on any Browse Projects card, **View page** on a Portfolio row, and from
   the dashboard's *Recently accessed* strip. The old cards, the founder-profile button and every existing
   project flow are unchanged — this is an additional screen, not a replacement.
2. **Project lifecycle: Idea → Prototype → MVP → Launched → Scaling → Funded** — a six-step tracker with
   ticked past stages, a ring on the current one and clickable steps for the owner. Moving a step saves
   immediately and confirms with a *Lifecycle updated* pop-up. Nothing was invented for existing projects:
   a project with no explicit stage is derived from its status (`funded` → Funded, `in_talks` → Scaling,
   otherwise MVP), so old records render sensibly until the founder sets a stage.
3. **Milestones** — owner-editable rows (*title*, *outcome, metric or date*, done/undone) with a
   "Milestones (2/5)" heading and a progress bar; visitors see a read-only timeline with completed items
   struck through.
4. **Team** — an owner-editable roster (name, role, one-line note) shown as initial avatars in a two-column
   grid; empty rows stay visible while the founder is typing them, and visitors only see rows that have
   content.
5. **Documents** — the uploaded pitch deck is listed alongside any number of extra files the founder drops
   in (*Upload document*), each with its size, how long ago it was added and a **Download** link. Files are
   stored on the project exactly the way the patent proof already was, so no new backend work was needed.
   Removing a document is owner-only.
6. **Funding and analytics** — a right-hand rail repeats the funding bar with *Backers* and *Funded* tiles
   and the list of investors behind them, then an *Analytics* card: views, unique visitors, proposals,
   milestone completion, a "Who is looking" breakdown of visitors by role, and when the project was last
   viewed. All of it is computed from data the platform already keeps (`investments`, `proposals`,
   `recentlyAccessed`) — nothing is faked and no new write path exists.
7. **Requirements and patent status in context** — the same rail shows the open investor requirements that
   match the project, and a *Patent* card with the claimed number, the PatentBot verdict (*Novelty cleared /
   flagged / pending*), the proof download and a **Run PatentBot check** button. The chatbot itself is
   untouched.
8. **Owner vs visitor** — editing controls (lifecycle, milestones, team, documents, Edit project) appear
   only for the project's founder and never for an admin; everyone else gets the same page read-only, plus
   **Message founder** and **Verify novelty**.
9. **All of it in 13 languages** — 62 new catalogue rows (554 in total) cover the headings, step labels,
   placeholders, empty states, analytics tiles and toasts, including the count-heading convention
   ("Milestones (2/5)" reads off a `Milestones (` row, with full-width brackets in Chinese and Japanese).
   The posted date is now formatted in the selected language too (`2026年10月` in Chinese). Verified live in
   Tamil, Russian and Chinese.
10. **Data model** — `lifecycle`, `milestones[]`, `team[]` and `documents[]` are optional fields on the
    project document. The generic `PUT /api/state/:collection` route already stores them, so no collection,
    migration or endpoint was added and every existing project record stays valid.

### This round — funding tracker, an investor watchlist, side-by-side deal comparison and explainable match scores (all additive)

1. **Funding Tracker** (new nav item, every non-admin role) — one screen for every live round on the
   platform: four summary tiles (total sought, capital pledged, open rounds, watchlist size), lifecycle-stage
   chips, a sort control (biggest gap / most funded / largest round / newest) and a pipeline of round cards
   showing raised vs. target with the existing progress bar, *Still needed*, *Backers* and the founder with
   their verification badge. Below it, **Recent funding activity** reads the closed cheques as
   "Michael Okafor invested in Saumya · HeathForecast Ai — $6M". Derived entirely from `projects`,
   `investments`, `requirements` and `users` — no new write path except the watchlist itself.
2. **Investor watchlist** — **Watch deal** on any round card, project card, project page or match card adds
   the round to *Your watchlist*, which appears as a panel on the tracker with a one-line status and
   **Unwatch**. Rows persist through the app's existing generic state API: `{ id, userId, projectId, addedAt }`
   in a new `watchlist` collection (the only backend touch this round — one name in `COLLECTIONS`). Empty
   collections read back as `[]`, so there is no seed file and no migration.
3. **Deal comparison** — **Compare** collects up to three rounds and renders a side-by-side table: founder,
   company, sector, stage, round size, raised, still needed, funded %, backers, patent, milestones done,
   team size and posting date, plus **Clear comparison**.
4. **Portfolio breakdown** (Investments page, read-only card) — capital placed *by sector*, exposure *by
   lifecycle stage*, a *Top performer* / *Needs attention* pair from the same growth series the rows already
   use, and a sector-spread count. Existing portfolio rows, edits and growth charts are untouched.
5. **Smart Matching with explainable scores** — a new page, plus `src/app/ai-match.js`. `scoreMatch()` is a
   deterministic, in-browser model (no external service, no API key, no data leaves the tab) that weighs
   sector overlap (investor profile → their posted requirements → the founder's own industry), cheque size vs.
   the stated range or the average of cheques actually written, stage band, patent defensibility with the
   PatentBot verdict, round momentum, traction language in the pitch and network/city proximity, then clamps
   to 5–98. Every point returns a `{ bucket, label, value }` reason or gap, shown as chips —
   *"Invests in HealthTech · Round size fits $2M - $15M · Active at growth stage · Patent novelty verified ·
   Other backers on this round 1"*, with gaps such as *"Outside your sectors … · No patent filed yet"*.
   A **How a fit score is built** panel states the weights, and a footer makes clear it is a decision aid,
   not investment advice. Investors get ranked deals; founders get, per own project, the investors ranked by
   fit with **View Profile / Message / Connect**.
6. **Matching on the project page** — the founder sees *Investors matched to this round* (top three) under
   the lifecycle card, and a visiting investor sees *Your fit with this round* with the same reason chips.
7. **All of it in 13 languages** — 105 new catalogue rows (659 in total) cover both pages, every tile,
   filter, empty state, toast and match reason. Reason labels are catalogued separately from their values, so
   a sector name, cheque range or backer count stays as written while the words around it translate; count
   phrasings (*"7 rounds on the platform"*) are emitted as sibling nodes so the runtime can reorder them.
   Verified live in Tamil, Chinese and Russian.

### This round — AI pitch improvement, project summaries and a printable novelty verification report (all additive)

1. **Pitch intelligence** (new card on the project page, right under *The pitch*) — **Review pitch** scores the
   founder's own pitch text and **Project summary** compresses it. Both call a new deterministic analyser,
   `backend/ai.js`, which reads only this project's record (pitch, requirements, milestones, team, documents,
   patent verdict) — no third-party model, no API key, nothing leaves the server. The review returns a 0–100
   score, a verdict (*Strong / Workable / Thin*) and weighted checks with their measured value:
   *"Names the problem it solves · Quantified traction figures · Defensibility is on the record · Sentences run
   long"*, split into **What works** and **What to strengthen** using the same `{label, value}` chips as Smart
   Matching. **Suggested rewrite** re-assembles the founder's own sentences (plus the recorded numbers) into a
   tighter pitch behind a **Copy** button — it never invents facts, and the card says so. The summary returns a
   one-liner, a short paragraph, fact tiles (Raised, Stage, Round size, Funded, Backers, Milestones done, Team,
   Documents, Patent) and keywords.
2. **PatentBot similarity analysis** — every screening now also shows *Similarity analysis*: the closest work
   already on the registry, word by word, with the overlap %, which side it matched on (title or description),
   the band (*Duplicate risk / Needs manual review / Below threshold*) and the shared claim terms. The chat
   narrates the top three, and the comparison no longer goes silent when nothing crosses the threshold — any
   pair sharing a claim term is listed, so the panel is never inert.
3. **Verification report** (a **Verification report** button in PatentBot and on the patent card of a patented
   project) — `POST /api/novelty-report` returns the screening record: subject block, verdict with the novelty
   score, the investment gate, eight checks (pass / caution / fail) with their values, the prior-art table, the
   screening notes that led to the verdict, and *What this report does not say*. It opens as a modal,
   **Download** saves it as a text file and **Print** prints only the report (`@media print` hides the rest of
   the app through `data-print-report`).
4. **Honesty limits, on the page** — the report states that it compares claims against this platform's
   registry, not worldwide patent databases; that the score is an investor decision aid and not legal advice or
   a patentability opinion; that a cleared verdict grants no rights; and that every figure is recomputed at
   screening time. Nothing in this round fabricates a filing number or upgrades a claim.
5. **All of it in 13 languages** — 110 new catalogue rows (771 in total) cover both cards, every report
   section, check label and limit line, plus the verdict badges. Also fixed this round: the translator now
   re-translates content that renders while the tab is in the background (a timer backstop for
   `requestAnimationFrame`, which browsers suspend in a hidden tab).
   Verified live in English, Tamil and Chinese.

### This round — account security, sessions, a real REST API and production support (all additive)

1. **Forgot password** — a *Forgot password?* link sits on the password label of
   the existing sign-in card (nothing else on that card moved). It opens the
   modal pattern the app already uses: enter the address → a single-use code is
   issued, valid 15 minutes → paste it with a new password twice → done. The
   answer is deliberately the same whether or not the address has an account, so
   the endpoint cannot be used to probe registered emails. Because this build has
   no mail provider, the code is shown in the panel instead (the UI says exactly
   that); `POST /api/auth/forgot-password` stops returning it as soon as
   `MAIL_PROVIDER` or `NODE_ENV=production` is set, so wiring real email later
   needs no code change. A successful reset signs **every** session out.
2. **Change password** — inside the new *Security & sessions* card on the profile
   screen: current, new, confirm. It refuses a wrong current password, a weak new
   one (8+ characters with a letter and a number) and reusing the same password,
   and it keeps *this* device signed in while signing every other one out.
3. **Session management** — `GET /api/auth/sessions` answers "where am I signed
   in?": device (derived from the user agent: *Chrome · Windows*, *Safari ·
   iOS*…), how the session started, IP, when it began and when it was last seen,
   with a **This device** / **Signed out** badge. **Sign out** ends one session,
   **Sign out everywhere else** ends all of them but the current one, and signing
   out the current session routes through the app's own logout so the UI returns
   to the sign-in screen the same way the sidebar button always did. Tokens are
   now checked against their session row on every authenticated request, so a
   revoked token stops working immediately — tokens minted before this existed
   carry no session id and keep working, so nobody is logged out by the upgrade.
4. **Login activity** — the same card lists the last twenty events on the
   account: sign-in, sign-up, Google sign-in, reset code requested, password
   reset, password changed, failures with their reason (e.g. *Current password
   did not match*), each with the address it came from.
5. **Per-resource REST API** — `backend/rest.js` mounts fourteen resources
   (`/api/projects`, `/api/investments`, `/api/offers`, `/api/messages`, …) with
   `GET`/`GET :id`/`POST`/`PATCH :id`/`DELETE :id`, plus `PATCH /api/users/:id`
   for the profile and `GET /api/resources` as a self-describing catalogue. The
   site keeps using the generic `/api/state/:collection` it was built on — this
   is an additional, properly shaped surface, not a rewiring. Shared rules: one
   validator (required fields, per-field types, length limits, 60 fields max) and
   one authoriser (owner, co-owner for two-sided records such as meetings and
   agreements, or admin). The owner id is taken from the token, so a record cannot
   be created or re-assigned in someone else's name; `id`, `_id`, `password` and
   (on the profile route) `role`/`email` are stripped before any write; private
   resources (`messages`, `watchlist`, `recentlyAccessed`) only ever return the
   caller's own rows. Verified by 29 live checks covering validation failures,
   role gates, cross-owner 403s and ownership spoofing.
6. **Production hardening** — `backend/security.js` collects the operational
   pieces: security headers on every response (with HSTS once behind HTTPS,
   `X-Powered-By` off), per-IP rate limits on the credential and recovery
   routes, a `GET /api/health` check that pings MongoDB and answers `503` when it
   is unreachable, one JSON error exit (no stack traces to the client, `413` for
   oversized bodies, `400` for malformed JSON), a request log line per response,
   `trust proxy` so the audit trail records the real client address, and graceful
   shutdown on `SIGTERM`/`SIGINT`. Passwords were already bcrypt-hashed; the
   boot-time migration from plaintext rows stays.
7. **Deployment support** — `backend/.env.example` documents every variable (the
   server reads `backend/.env` with no extra dependency, and real environment
   values always win); a root `Dockerfile` builds the site and runs it next to
   the API through the new opt-in `SERVE_FRONTEND` variable (unset = exactly the
   current local setup), `docker-compose.yml` brings up Mongo plus the app with a
   container health check, `ALLOWED_ORIGINS` pins CORS when you want it, and
   `docs/API.md` + `docs/DEPLOYMENT.md` cover the endpoint reference, an nginx
   sketch, a pre-launch checklist and how to reset the data.
8. **All of it in 13 languages** — 72 new catalogue rows (843 in total) cover the
   recovery modal's three steps, the security card, session and activity labels,
   every error and confirmation, including the count convention
   (*"3 other session(s) signed out."*) split into sibling nodes so the number
   stays where each language wants it, and dates read out in the selected
   language (`10月4日` in Chinese). Verified live in English and Chinese.
9. **Nothing existing moved** — the sign-in card, the OAuth experience, the
   sidebar logout, the profile layout and every earlier feature behave as before.
   The three security collections (`sessions`, `loginActivity`, `passwordResets`)
   are not in the state list, so they never appear in `/api/state` and cannot
   affect the data the screens read.

### This round — Google-shaped sign-in, two-step verification, and messages that really leave the site (all additive)

1. **Sign-in now one question per screen** — the sign-in card walks the same
   three steps Google does: *Email address* → *Welcome / Enter your password* →
   *2-Step Verification*. Each step is a single field, a *Next* button at the
   bottom right, secondary links at the bottom left, and the address shown as a
   chip with a **×** (*Use another address*) so you can back out without
   reloading. It is the same call underneath — `POST /api/auth/login`, the same
   token, the same redirect, the same session record — and the password input is
   still `autocomplete="current-password"`, so the browser's own password saving
   behaves exactly as it did. Nothing about the register flow, the recovery
   modal, the roles or the sidebar changed.
2. **Two-step verification, gated the Google way** — if the address you typed has
   2FA on, the password alone gets you nothing: the server issues a 6-digit code
   on the channel that account chose, shows the **masked destination**
   (`m••••@••••••.in`, `+91 ••••• •• 34`), and only hands out a token after the
   code is proved. Codes are single-use, expire in 10 minutes, allow 5 attempts
   and 3 sends per sign-in, and are stored as SHA-256 hashes. *Try another code*
   and *Back* are on the same screen. Switching it on is deliberately two steps
   (current password, then a code on the new channel) so nobody can enable 2FA on
   an account they cannot already sign into, and it is per account — a member who
   never turns it on signs in exactly as before and never sees these routes.
3. **OAuth that looks like Google's account chooser** — *Continue with Google*
   opens a *"Choose an account / to continue to VentureLink"* sheet: avatar rows
   with name + address, a tick on the selected one, *Use another account* for a
   new address, and the *Demo provider* note that keeps it honest. The flow it
   drives is the one already built (`/api/auth/oauth/demo`, or real Google once
   `GOOGLE_CLIENT_ID`/`SECRET` are set); only the presentation was added, in
   hand-written CSS and VentureLink branding — no third-party markup copied in.
4. **Demo emails and passwords are no longer printed on the login page** —
   instead the accounts this device has signed in are remembered as one-click
   chips under *Saved on this device* (the five seeded logins are offered up
   front, and any real account joins them after you use it). What is stored in
   `localStorage.vl_saved_accounts` is `{ email, name, role, demo }` — **never a
   password**; the password field is left to the browser, which offers to save it
   the normal way. A chip signs you in immediately, **×** forgets just that one,
   and the list caps at 8. The README still documents the seeded logins, so
   nothing was lost — it is only off the sign-in screen.
5. **A webinar that fits your requirements is mailed to you** — when a session is
   published, the backend scores every member against it: words shared with their
   sector/skills, and stronger still with the requirements they posted and the
   projects they own, plus a tag that names their role. Anyone over the fit floor
   is invited, the host is never invited, and each invitation carries **why you
   received this** (`Matches your requirement "…"`) — the same explainable style
   the match scores already use. Nothing is blasted platform-wide: a floor score
   and a cap of 25 per publish.
6. **Important tasks send outward, not just into the bell** — filing an agreement,
   sending an offer letter, replying to one, booking a meeting, a proposal landing
   on your requirement, a verification badge granted, plus sign-in notices,
   password resets and 2FA codes. Each of those now also goes out as an **email**,
   and as **SMS/WhatsApp** for members who switched those on in the new *Alerts by
   email, SMS and WhatsApp* card on the profile (with a phone field and a *send me
   a test* button). The client only ever names the event and the record
   (`{ kind, refId }`) — recipients, wording and every figure are rebuilt
   server-side from the stored record, and only a party to that record may notify
   about it, so the endpoint cannot be used to mail arbitrary text to someone
   else. The in-app pop-up and the bell behave exactly as they always did; this
   layer only adds what leaves the building.
7. **Real delivery, with no new dependency** — `backend/notify.js` talks to
   Resend, SendGrid or Mailgun for email and Twilio for SMS/WhatsApp using Node's
   built-in `fetch`, so `package.json` is untouched. With no keys configured,
   nothing is invented and nothing is lost: every message is written in full to
   the `outbox` collection with status `queued` and the exact reason
   (*No email provider configured on this server.*), which the admin dashboard
   now shows as a **Delivery log** (`sent` / `queued` / `failed` counts, channel,
   address, subject, time). Add a key in `backend/.env` and the same message
   becomes `sent` — no code change. A provider outage can never fail the product
   action: the offer letter was sent whether or not the mail went out.
8. **All of it in 13 languages** — 101 new catalogue rows (944 in total) cover the
   three sign-in steps, the 2FA cards, the chooser, the saved-account chips, the
   alerts card, the delivery log, the ten alert kinds and every provider reason
   that reaches the screen. Verified live in English and Chinese.
9. **Nothing existing moved** — the sign-in card's fields, the register flow, the
   recovery modal, the security & sessions card, the sidebar, the profile layout
   and every earlier feature behave as before. The two new collections
   (`twoFactorChallenges`, `outbox`) join `sessions`, `loginActivity` and
   `passwordResets` outside the state list, so they never appear in
   `/api/state` and cannot affect the data the screens read.

### This round — address suggestions while you type, chat alerts, and roomier pages (all additive)

1. **Saved addresses come back as you type them** — the *Saved on this device*
   row under the sign-in field is no longer printed on the card. Instead, the
   moment you begin typing an address the saved accounts that match drop down
   under the field (name + address + avatar, max 5); clicking one, or using
   **↓ / ↑ then Enter**, fills it in and completes a demo sign-in in that single
   step, and **Escape** or clicking away closes it. What is remembered is exactly
   what last round remembered — `localStorage.vl_saved_accounts` holding
   `{ email, name, role, demo }`, **never a password**, seeded from the demo
   logins, capped at 8, **×** still forgets one row. The three sign-in steps,
   *Continue with Google*, registration, recovery and every earlier flow are
   untouched.
2. **Chat messages now leave the site as well** — an eleventh alert kind,
   `message-received`: when a member sends a message, the other side is mailed
   about it, and gets SMS/WhatsApp too if those channels are switched on in their
   *Alerts* card. As with every other outward alert the browser only names
   `{ kind, refId }`; the backend re-reads the stored message, derives the
   recipient, the sender's name and the preview from it, and answers 403 for
   anyone who is not the sender (an admin may notify on either side of any
   record). Verified end to end: sender → `200` with the recipient's channel and
   an `outbox` row; recipient themself → `403`; a stranger's message → `403`;
   an unknown `refId` → `404`; and `two-factor-code` / `password-reset` stay
   refused on this endpoint.
3. **A brand-new profile fits the visible window** — an account whose details are
   still mostly empty (profile completion at or under 25%) gets a compact header
   (44 px banner and avatar instead of 112/80) and four tabs in the profile
   area — **Verification · Security · Two-step · Alerts** — so what used to
   stretch ~13,600 px down now stands at ~2,700 px. Anyone with a filled-in
   profile sees the original single scroll exactly as before, with nothing moved
   behind a tab. The security card also stops growing the page: it lists the
   latest 8 sign-ins and offers *Show all activity · n* for the rest.
4. **Room to read on every page** — `styles/added.css` restates the rhythm rather
   than editing any design token: white cards go from 20 px to 26 px of padding,
   section headings to 18 px of air below, `gap-4`/`gap-5` grids and `space-y`
   stacks widen, and at ≥1280 px the content columns grow
   (`max-w-3xl` → 52 rem, `max-w-4xl` → 60 rem, `max-w-5xl` → 72 rem). These are
   attribute-selector overrides on the precompiled Tailwind sheet, applied after
   it, so small screens, the login card and every existing class keep behaving
   as they did.
5. **Still 13 languages, still additive** — the new tab labels, the activity
   toggle and the *New message* alert label joined the catalogues (952 keys; the
   coverage and regression harnesses run clean at 10,248 lookups). No earlier
   feature, screen, role, rule or stored field was changed or removed: the two
   backend files touched this round (`notify.js`, `server.js`) only add one alert
   kind and its record builder, and MongoDB data was read, never rewritten.

### This round — the requirements page split in two, and a profile that opens one section at a time (all additive)

1. **Requirements → industry sections + a proposals section** — the page keeps its
   list, its cards and its submit flow, and adds structure around them. *Requirements
   by industry* renders one titled block per industry (count chip beside each, two
   cards per row), and *Submitted proposals* is a separate section below it, split
   into **You submitted** and **Submitted to your requirements** for investors. One
   filter bar drives both: free-text search across requirement, industry and
   investor, a **Show: Both / Requirements / Proposals** segment, a **Proposal
   status: Any / Pending / Invested / Declined** segment, industry chips, an
   *n active* count with **Clear all**, and a footer that reads
   `# requirements · # proposals`. Each proposal row offers **View project** (the
   same `openProject` the project pages use) and **Show this industry**, which jumps
   the filter to that industry. Accept/decline still happens only under
   **Investments**, where the amount and PatentBot gates live — the section says so
   rather than duplicating the decision. The requirement card markup itself was moved
   verbatim, so the agreement-policy acknowledgement, the project picker, the
   disabled *Add a project first* state and `POST /api/proposals` are unchanged.
   Verified against live data: 9 requirements across 8 industries; the investor
   account sees 7 proposals received (5 pending, 2 invested), the entrepreneur sees
   the same 7 as sent (4 pending, 3 invested), and 0 proposals are orphaned from
   their requirement.
2. **Account settings open one section at a time — for every account** — last round's
   compact tabs were limited to brand-new profiles. They now sit under a
   **Account settings / Open one section at a time.** heading for everyone, each tab
   carrying a live status chip: *Verification* (Verified / In progress / Not
   started), *Security* (*n active*), *Two-step* (On / Off), *Alerts* (*n on*). All
   four panels keep every control they had; they are just no longer stacked into one
   endless scroll.
3. **Security, two-step and alerts re-laid out inside their section** — the long
   cards were broken into two-column card grids on wide screens
   (`grid lg:grid-cols-2 gap-5`): *Change password* beside *Active sessions* (the
   device list now scrolls at 24 rem instead of pushing the page), with
   *Recent sign-in activity* as a full-width card under them; *Current status*
   beside the enable/verify/disable form for two-step; *Channels* beside
   *Alerts sent to you*. Every handler is the one already there —
   `handleChangePassword`, `handleRevokeSession`, `handleRevokeOtherSessions`,
   `refreshSecurity`, `apiEnableTwoFactor` / `apiConfirmTwoFactor` /
   `apiDisableTwoFactor`, `handleSaveAlertChannels` — no endpoint, payload or
   permission changed.
4. **Only what actually works is shown** — the profile's website and LinkedIn rows
   are now real links (`target="_blank"`, `rel="noreferrer"`) instead of plain text
   that looked clickable; the company row, the *X at Company* subtitle and the
   *Yrs Exp.* tile render only when that field holds data, so an empty placeholder
   no longer passes for a feature; and in *Alerts* a channel this server cannot
   deliver through is badged **cannot send here**, while the two-step status card
   states per channel whether it *can send from this server* or is *shown on screen
   here*. Nothing was removed — rows without data simply stop pretending.
5. **Still 13 languages, still additive** — 40 catalogue rows joined this round
   (992 keys total) and the coverage plus regression harnesses run clean
   (172 `t()` keys, 0 missing, 10,704 exact and 192 template lookups). Two spacing
   steps the precompiled Tailwind sheet never carried (`space-y-3.5`, `space-y-6`)
   and the new `.vl-panel-tab-hint` chip were added to `styles/added.css`, and the
   class harness now reports **0** unstyled tokens against the built sheet. MongoDB
   was read only — no document was rewritten, and no earlier screen, role, rule or
   stored field was modified.

### This round — the profile cards level with each other (layout only)

1. **Why it looked wrong** — the profile body was one `lg:grid-cols-3` grid with a
   two-thirds column (About → Skills → Industries) beside a one-third sidebar
   (Details → Network → Ratings). Whichever side ran out of content first left the
   other trailing over a long empty stretch, and the profile sat in a `max-w-3xl`
   wrapper while the account panels under it use `max-w-4xl`, so the two did not
   line up. Nothing was missing; the columns were simply uneven.
2. **Four full-width bands instead** — the same cards now read top to bottom in
   bands, and cards inside a band are the same height as each other, so no column
   trails off beside empty space:
   *Profile strength · Details · Network* → *About* (two thirds, or the full width
   when there are no skill or industry chips) *· Skills & Expertise · Industries*
   → *Experience · Education* (a band only when those rows actually hold data) →
   *Company Details* (founder accounts only) *· Ratings & Reviews*.
   Band 1 is three columns on your own profile (`md:grid-cols-2 lg:grid-cols-3`)
   and two on someone else's, because the strength card only belongs to you. The
   wrapper became `max-w-4xl mx-auto px-6 pt-6 lg:pt-8 pb-12`, the same rhythm the
   account panels already use.
3. **Layout only — no feature, no field, no data** — every card's inner markup was
   copied verbatim into its band: same headings, same `InfoRow`s, the same real
   website/LinkedIn links, the same `slice().reverse()` review order and
   `maxHeight: "18rem"` scroll, the same `TimelineCard` components, the same
   `Yrs Exp. · Following · Followers` counts and the same conditional `user.experience &&`
   guard. No handler, prop, role gate or stored field was touched, and the
   Verification · Security · Two-step · Alerts tabs from last round sit below this
   body exactly as they did. MongoDB was read only; nothing was rewritten.
4. **Measured, not eyeballed** — at a 1280 px viewport each band's children were
   measured with `getBoundingClientRect()`: the tallest and shortest card differ by
   **0 px** on your own profile, on an investor's and on a founder's
   (CareConnect), where the previous grid left a multi-hundred-pixel gap. All eight
   headings still render (`Details, Network, About, Skills & Expertise, Industries,
   Company Details, Ratings & Reviews` plus the strength card), and the live data
   behind them is unchanged — 9 open requirements over 8 industries and 7 proposals
   for the seeded accounts.
5. **No new strings, no new utilities** — nothing said changed, so the 13 catalogues
   stay at 992 keys with 0 missing (`t()` coverage 172 keys, regression harness
   clean) and the class harness still reports **0** unstyled tokens against the
   built sheet.

### API endpoints
`POST /api/auth/register` · `POST /api/auth/login` · `GET /api/auth/me` · `GET /api/auth/google` ·
`POST /api/auth/oauth/demo` · `GET /api/state` · `PUT /api/state/:collection` ·
`POST /api/novelty-check` · `POST /api/ai/pitch-review` · `POST /api/ai/summary` ·
`POST /api/novelty-report` · `GET /api/admin/stats` (admin only) — all except register/login/google
require a Bearer JWT.

Added this round (same JWT rules): `POST /api/auth/forgot-password` ·
`POST /api/auth/reset-password` · `POST /api/auth/change-password` ·
`GET /api/auth/sessions` · `POST /api/auth/sessions/revoke-others` ·
`DELETE /api/auth/sessions/:jti` · `POST /api/auth/logout` · `GET /api/health` ·
`GET /api/resources` · `GET/POST/PATCH/DELETE /api/<resource>[/:id]` for the
fourteen resources (`projects`, `requirements`, `investments`, `offers`,
`agreements`, `meetings`, `proposals`, `messages`, `reviews`, `helpRequests`,
`helpOffers`, `webinars`, `watchlist`, `recentlyAccessed`) · `PATCH /api/users/:id`.

Added this round: `POST /api/auth/two-factor/verify` ·
`POST /api/auth/two-factor/resend` · `GET /api/auth/two-factor` ·
`POST /api/auth/two-factor/enable` · `POST /api/auth/two-factor/confirm` ·
`POST /api/auth/two-factor/disable` · `GET/PUT /api/notifications/channels` ·
`GET /api/notifications/mine` · `POST /api/notifications/send` ·
`POST /api/notifications/webinar-invites` · `GET /api/notifications/outbox`
(admin only).
Full reference: `docs/API.md`.
