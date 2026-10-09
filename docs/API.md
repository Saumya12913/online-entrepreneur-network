# VentureLink API reference

Base URL `http://localhost:4000/api` in development (`/api` on the same host in
production — the front-end only ever calls relative paths).

* Every response is JSON.
* Errors are JSON too: `{ "error": "message" }`, plus `{ "fields": [...] }` on a
  validation failure. A stack trace is never sent to the client.
* Authentication is a bearer token: `Authorization: Bearer <JWT>` returned by
  `POST /api/auth/login` and stored by the site in `localStorage.vl_token`.

## Conventions

| Thing | Behaviour |
| --- | --- |
| Token lifetime | 7 days, and only while its session row is not revoked |
| Revoked session | the token stops working immediately → `401` |
| Password rules (register / reset / change) | 8+ characters, at least one letter and one number. Sign-in does **not** enforce them, so the seeded demo accounts (password `123`) still work |
| Rate limits | `auth` bucket: 20 requests/minute/IP on the credential routes · `recovery` bucket: 5 requests/10 minutes/IP on forgot/reset password · `two-factor` bucket: 12 requests/10 minutes/IP on code issue, resend and verify · `alerts` bucket: 30 requests/minute/IP on the outward-notification routes |
| Body size | 15 MB (`express.json` limit) — larger uploads get `413` |
| Field size limits | title/name 200/120, description/content/message/notes/bio up to 5 000, agreement terms 20 000, attachment data URLs 12 000 000 characters |

## Auth and account security

| Method | Path | Auth | Purpose |
| --- | --- | --- | --- |
| `POST` | `/auth/login` | — | `{ email, password }` → `{ token, user }`; opens a session and writes a sign-in record. If that account has two-step verification on, **no token is issued** — see the next table |
| `POST` | `/auth/register` | — | creates the account, then signs it in |
| `GET` | `/auth/me` | ✔ | `{ user }` for the stored token |
| `POST` | `/auth/oauth/demo` | — | the offline Google-consent stand-in; issues a real token for the chosen identity |
| `GET` | `/auth/google` | — | starts real Google OAuth when `GOOGLE_CLIENT_ID`/`SECRET` are set, otherwise redirects to the demo consent screen |
| `GET` | `/auth/google/callback` | — | provider callback; redirects to `FRONTEND_URL/?oauth_token=…` |
| `POST` | `/auth/forgot-password` | — | `{ email }` → one generic message whether or not the address exists. In development the response also carries `resetCode` (15-minute, single-use); it is **never** returned when `MAIL_PROVIDER` is set or `NODE_ENV=production` |
| `POST` | `/auth/reset-password` | — | `{ resetCode, password }` → sets the new password and signs **every** session out |
| `POST` | `/auth/change-password` | ✔ | `{ currentPassword, newPassword }` → keeps this device signed in, signs out all others |
| `GET` | `/auth/sessions` | ✔ | `{ current, sessions[], activity[] }` — the devices holding a session (ip, user agent, via, started, last seen, revoked) and the last 20 sign-in events |
| `POST` | `/auth/sessions/revoke-others` | ✔ | signs out every session but this one, returns `{ revoked }` |
| `DELETE` | `/auth/sessions/:jti` | ✔ | signs one session out; only the owner's own sessions are addressable |
| `POST` | `/auth/logout` | ✔ | revokes the caller's session and records it |

`via` values in sessions and activity: `password`, `password + code`, `register`,
`google`, `oauth-demo`, `reset-request`, `reset-password`, `change-password`,
`logout`, `two-factor`, `two-factor-enable`, `two-factor-disable`.

## Two-step verification

An account switches it on for itself; accounts that never did sign in exactly as
they always have, and these routes do not appear in their flow. A code is 6
digits, single-use, valid 10 minutes, 5 wrong attempts, at most 3 codes per
sign-in. Only its SHA-256 hash is stored.

| Method | Path | Auth | Purpose |
| --- | --- | --- | --- |
| `POST` | `/auth/login` | — | with 2FA on, answers `200 { twoFactorRequired: true, challengeId, method, dest, expiresMinutes, sends, delivered, provider }` and **no token** |
| `POST` | `/auth/two-factor/verify` | — | `{ challengeId, code }` → the completed sign-in: `{ token, user }` |
| `POST` | `/auth/two-factor/resend` | — | `{ challengeId }` → a fresh code on the same challenge, same shape as above |
| `GET` | `/auth/two-factor` | ✔ | `{ enabled, method, dest, phone, availability }` — `dest` is masked (`m••••@••••••.in`, `+91 ••••• •• 34`) |
| `POST` | `/auth/two-factor/enable` | ✔ | `{ password, method, phone? }` → issues a `purpose: "enable"` code and answers `{ ok, challengeId, dest, message }`; nothing is saved yet |
| `POST` | `/auth/two-factor/confirm` | ✔ | `{ challengeId, code }` → proves the channel, then switches 2FA on |
| `POST` | `/auth/two-factor/disable` | ✔ | `{ password }` → `{ ok, enabled: false, message }`, and a sign-in notice says so |

`devCode`: while no email/SMS/WhatsApp provider is configured the code cannot
leave the server, so — outside `NODE_ENV=production` — the challenge response also
carries `devCode` and the UI shows it with the reason. The moment any provider
key exists, that field disappears from every response.

## Per-resource REST API

Fourteen resources, one path each. `GET /api/resources` returns this same
catalogue at runtime.

| Resource | Path | Owner field | Roles that may create | Required on create |
| --- | --- | --- | --- | --- |
| projects | `/projects` | `ownerId` | entrepreneur, startup_founder, admin | title, ownerId*, description |
| requirements | `/requirements` | `investorId` | investor, admin | title, investorId*, description |
| investments | `/investments` | `investorId` | investor, admin | projectId, investorId*, amount |
| offers | `/offers` | `fromId` | any signed-in role | fromId*, toId, title |
| agreements | `/agreements` | `partyAId` (+ `partyBId`) | any signed-in role | partyAId*, partyBId, type, title |
| meetings | `/meetings` | `partyAId` (+ `partyBId`) | any signed-in role | partyAId*, partyBId, date |
| proposals | `/proposals` | `entrepreneurId` | entrepreneur, startup_founder, freelancer, mentor, admin | requirementId, entrepreneurId* |
| messages | `/messages` | `fromId` (+ `toId`) | any signed-in role | fromId*, toId, content |
| reviews | `/reviews` | `fromId` | any signed-in role | fromId*, toId, rating |
| helpRequests | `/helpRequests` | `founderId` | entrepreneur, startup_founder, admin | founderId*, title, description |
| helpOffers | `/helpOffers` | `helperId` | investor, freelancer, mentor, entrepreneur, admin | requestId, helperId*, message |
| webinars | `/webinars` | `hostId` | admin, mentor | title, description |
| watchlist | `/watchlist` | `userId` | any signed-in role | userId*, projectId |
| recentlyAccessed | `/recentlyAccessed` | `userId` | any signed-in role | userId*, projectId |

\* the owner field is **overwritten from the token** unless the caller is an
admin, so a record cannot be created in someone else's name.

Verbs, for every resource:

| Method | Path | Effect |
| --- | --- | --- |
| `GET` | `/api/<resource>` | list. `?mine=true` narrows to rows you are a party to |
| `GET` | `/api/<resource>/:id` | one row, `404` if absent |
| `POST` | `/api/<resource>` | create → `201` with a generated id (`pro1712…`, prefix + timestamp + random) |
| `PATCH` | `/api/<resource>/:id` | partial update, owner or admin only |
| `DELETE` | `/api/<resource>/:id` | remove, owner or admin only |

Extra account route: `PATCH /api/users/:id` — owner or admin, whitelisted
profile fields only (`name, bio, position, company, location, industry, skills,
experienceList, education, following, followers, photoUrl, resumeName,
resumeDataUrl, verified`). `id, password, role, email, connections,
pendingSent, pendingReceived` are dropped before the write, and the response is
the public projection of the user (no password hash).

Rules the shared validator applies to all of them:

* required fields present and non-empty on create;
* each field matches its declared type (`text`, `longtext`, `num`, `bool`,
  `list`, `object`, `id`, `data`);
* length limits from the table above;
* `id`, `_id` and `password` may never be set through these routes;
* at most 60 fields per item.

Anything failing returns `400` with `{ "error": "Validation failed", "fields": ["title is required.", …] }`.

Visibility: `messages`, `watchlist` and `recentlyAccessed` are private — a list
call only ever returns your own rows, and reading someone else's row by id is
`403`. Everything else is readable by any signed-in member and writable only by
its owner(s) or an admin.

## Generic state API

The site still runs on these (they were the original mechanism and nothing was
moved off them):

| Method | Path | Auth | Effect |
| --- | --- | --- | --- |
| `GET` | `/state` | ✔ | all fifteen collections in one payload, users projected without passwords |
| `GET` | `/state/:collection` | ✔ | one collection |
| `PUT` | `/state/:collection` | ✔ | replace a collection with the posted array (every item needs an `id`); user passwords are preserved or hashed |

Security collections (`sessions`, `loginActivity`, `passwordResets`,
`twoFactorChallenges`, `outbox`) are deliberately absent from `/state` — they are
only reachable through `/auth/*` and `/notifications/*` and never leave the
account they belong to.

## Outward notifications (email, SMS, WhatsApp)

The in-app pop-up and the bell are untouched; this layer adds the copy that
actually leaves the server. `backend/notify.js` calls providers over HTTPS with
Node's built-in `fetch` — **no new dependency**. Recipients, wording and every
figure are rebuilt from the stored record, never taken from the request body, so
a client cannot mail arbitrary text to another member through this platform.

| Method | Path | Auth | Purpose |
| --- | --- | --- | --- |
| `GET` | `/notifications/channels` | ✔ | `{ email, phone, channels, availability }` — which channels this account has on and which can leave this server |
| `PUT` | `/notifications/channels` | ✔ | `{ channels: { email?, sms?, whatsapp? }, phone?, test? }` → saves the switches (and `phone`, international format) — `test` immediately sends one sample alert of that kind and returns its per-channel results |
| `GET` | `/notifications/mine` | ✔ | this account's last 30 outward messages + `availability` |
| `POST` | `/notifications/send` | ✔ | `{ kind, refId }` → looks the record up, checks the caller is a party to it, then alerts the **other** party (or both). `two-factor-code` and `password-reset` are refused here — those come from their own flows |
| `POST` | `/notifications/webinar-invites` | ✔ | `{ webinarId }` or the just-published `{ webinar }` → scores every member against the session and invites the ones who fit, host only (or admin); answers `{ matched, recipients: [{ name, email, score, why[], channels }] }` |
| `GET` | `/notifications/outbox` | admin | `{ outbox[], counts, availability }` — the delivery log the admin dashboard shows |

`kind` is one of: `offer-sent`, `offer-decision`, `agreement-made`,
`meeting-scheduled`, `proposal-received`, `verification-granted`,
`message-received`, `webinar-invite`, `sign-in-alert`, `two-factor-code`,
`password-reset`. The first seven are the important-task alerts and each is
gated on ownership — e.g. only the sender of that offer letter or of that chat
message may notify about it (`403` otherwise), and `message-received` always
goes to the member on the other end of the conversation.

Outbox row: `{ id, kind, channel, to, subject, body, userId, refId, status,
provider, reason, createdAt }`. Status is `sent` (the provider accepted it),
`queued` (no provider configured for that channel), `failed` (no valid address,
or the provider refused) or `skipped` (this account has every channel switched
off). The log keeps its 500 most recent rows.

A provider outage never fails the product action: the offer letter is sent
whether or not the mail went out, so alerts are dispatched after the response
path and their errors only reach the server log.

## Analysis endpoints

| Method | Path | Auth | Effect |
| --- | --- | --- | --- |
| `POST` | `/novelty-check` | ✔ | PatentBot screening of a claim against the platform registry |
| `POST` | `/novelty-report` | ✔ | the printable verification report for a screening |
| `POST` | `/ai/pitch-review` | ✔ | deterministic pitch score, checks and suggested rewrite |
| `POST` | `/ai/summary` | ✔ | one-liner, paragraph, fact tiles and keywords for a project |
| `GET` | `/admin/stats` | admin | platform counters for the admin dashboard |

`/ai/*` and `/novelty-*` are local computations over the project's own record —
no third-party model, no API key, no data leaves the server.

## Operations

| Method | Path | Auth | Effect |
| --- | --- | --- | --- |
| `GET` | `/health` | — | `{ ok, db, uptimeSeconds, collections, resources }`; `503` when MongoDB does not answer the ping |

Unmatched `/api/*` paths return `404` as JSON. When `SERVE_FRONTEND` points at a
built site, any non-`/api` path returns `index.html` instead, so refreshing a
deep link works.

## Example session

```bash
TOKEN=$(curl -s -X POST http://localhost:4000/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"sauEntrepreneur@nec.edu.in","password":"123"}' | jq -r .token)

curl -s -H "Authorization: Bearer $TOKEN" http://localhost:4000/api/projects | jq '.[0].title'

curl -s -X POST http://localhost:4000/api/projects \
  -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' \
  -d '{"title":"Probe","description":"created over REST","fundingRequired":5000}' | jq
# → 201, ownerId forced to the token's user

curl -s -X POST http://localhost:4000/api/projects \
  -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' \
  -d '{}'
# → 400 {"error":"Validation failed","fields":["title is required.","ownerId is required.","description is required."]}

curl -s -X DELETE http://localhost:4000/api/projects/<someone-elses-id> \
  -H "Authorization: Bearer $TOKEN"
# → 403 {"error":"Only the owner or an admin can remove this record."}
```
