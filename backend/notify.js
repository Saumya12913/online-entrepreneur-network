// Outward delivery: the messages a member must actually receive — email, SMS and
// WhatsApp — on top of the in-app pop-up they already get.
//
// Everything here is additive and dependency-free: providers are called over HTTPS
// with Node's built-in fetch, so the package list stays exactly as it was.
//
//   RESEND_API_KEY      (email)  or  SENDGRID_API_KEY  or  MAILGUN_API_KEY + MAILGUN_DOMAIN
//   TWILIO_ACCOUNT_SID + TWILIO_AUTH_TOKEN   (SMS: TWILIO_SMS_FROM, WhatsApp: TWILIO_WHATSAPP_FROM)
//
// With no credentials configured nothing is invented and nothing is lost: every
// message is written to the `outbox` collection with status "queued", the exact
// text it carries, and the reason it stopped there. Add a key and the same row
// becomes "sent" — no code change.
//
// `outbox` is deliberately NOT in the app's COLLECTIONS list, so it never shows up
// in /api/state and cannot be edited through the generic state API.
import crypto from "crypto";

const OUTBOX_TTL_KEEP = 500; // rows kept before the oldest are pruned
const text = v => String(v == null ? "" : v).slice(0, 2000);

// ---------------------------------------------------------------------------
// Providers
// ---------------------------------------------------------------------------
export function notificationProviders(env = process.env) {
  const email = env.RESEND_API_KEY
    ? { name: "resend", key: env.RESEND_API_KEY, from: env.ALERT_EMAIL_FROM || "VentureLink <alerts@resend.dev>" }
    : env.SENDGRID_API_KEY
      ? { name: "sendgrid", key: env.SENDGRID_API_KEY, from: env.ALERT_EMAIL_FROM || "alerts@venturelink.app" }
      : env.MAILGUN_API_KEY && env.MAILGUN_DOMAIN
        ? { name: "mailgun", key: env.MAILGUN_API_KEY, domain: env.MAILGUN_DOMAIN, from: env.ALERT_EMAIL_FROM || "alerts@venturelink.app" }
        : null;
  const twilio = env.TWILIO_ACCOUNT_SID && env.TWILIO_AUTH_TOKEN
    ? { name: "twilio", sid: env.TWILIO_ACCOUNT_SID, token: env.TWILIO_AUTH_TOKEN }
    : null;
  return {
    email,
    sms: twilio && env.TWILIO_SMS_FROM ? { ...twilio, from: env.TWILIO_SMS_FROM } : null,
    whatsapp: twilio && env.TWILIO_WHATSAPP_FROM ? { ...twilio, from: env.TWILIO_WHATSAPP_FROM } : null,
    brandName: env.ALERT_FROM_NAME || "VentureLink",
    appUrl: env.FRONTEND_URL || "http://localhost:5173"
  };
}

// Which channels can leave this process right now.
export function channelAvailability(providers) {
  return {
    email: providers.email ? providers.email.name : "",
    sms: providers.sms ? providers.sms.name : "",
    whatsapp: providers.whatsapp ? providers.whatsapp.name : "",
    any: !!(providers.email || providers.sms || providers.whatsapp)
  };
}

const isEmail = v => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(v || ""));
// Digits, leading "+" allowed — Twilio wants E.164, and a national-format number
// is still worth queuing so the member sees what was addressed.
const isPhone = v => /^\+?[0-9 ()-]{6,20}$/.test(String(v || "").trim());
const digitsOnly = v => String(v || "").replace(/[^(0-9+)/g, "").replace(/[ ()-]/g, "");

async function httpJson(url, init = {}, timeoutMs = 12_000) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...init, signal: ctrl.signal });
    const body = await res.text();
    let parsed = null;
    try { parsed = JSON.parse(body); } catch { /* providers sometimes answer in plain text */ }
    return { ok: res.ok, status: res.status, body: parsed || body.slice(0, 400) };
  } catch (err) {
    return { ok: false, status: 0, body: { error: err.name === "AbortError" ? "The provider timed out." : err.message } };
  } finally {
    clearTimeout(timer);
  }
}

async function sendEmail(provider, { to, subject, text: plain, html }) {
  if (provider.name === "resend") {
    return httpJson("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${provider.key}` },
      body: JSON.stringify({ from: provider.from, to: [to], subject, text: plain, html })
    });
  }
  if (provider.name === "sendgrid") {
    return httpJson("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${provider.key}` },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: to }] }],
        from: { email: provider.from, name: "VentureLink" },
        subject,
        content: [{ type: "text/plain", value: plain }, { type: "text/html", value: html }]
      })
    });
  }
  if (provider.name === "mailgun") {
    const form = new URLSearchParams({ from: provider.from, to, subject, text: plain, html });
    return httpJson(`https://api.mailgun.net/v3/${encodeURIComponent(provider.domain)}/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${Buffer.from(`api:${provider.key}`).toString("base64")}`
      },
      body: form.toString()
    });
  }
  return { ok: false, status: 0, body: { error: `Unknown email provider: ${provider.name}` } };
}

async function sendTwilio(provider, { to, body, channel }) {
  const form = new URLSearchParams({
    From: channel === "whatsapp" ? (provider.from.startsWith("whatsapp:") ? provider.from : `whatsapp:${provider.from}`) : provider.from,
    To: channel === "whatsapp" ? (String(to).startsWith("whatsapp:") ? to : `whatsapp:${to}`) : to,
    Body: body
  });
  return httpJson(`https://api.twilio.com/2010-04-01/Accounts/${encodeURIComponent(provider.sid)}/Messages.json`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(`${provider.sid}:${provider.token}`).toString("base64")}`
    },
    body: form.toString()
  });
}

// ---------------------------------------------------------------------------
// Message text per event. Short subject + a plain, factual body: what happened,
// the figures as recorded on the platform, and a link back to the app.
// ---------------------------------------------------------------------------
export const ALERT_KINDS = [
  "two-factor-code", "password-reset", "sign-in-alert", "offer-sent", "offer-decision",
  "agreement-made", "meeting-scheduled", "webinar-invite", "verification-granted", "proposal-received",
  "message-received"
];

const clip = (v, n = 140) => {
  const s = String(v == null ? "" : v).replace(/\s+/g, " ").trim();
  return s.length > n ? `${s.slice(0, n - 1)}…` : s;
};
const lines = rows => rows.filter(Boolean).join("\n");

export function renderAlert(kind, ctx = {}, providers = notificationProviders()) {
  const brand = providers.brandName || "VentureLink";
  const link = providers.appUrl || "";
  const footer = `— ${brand}\n${link}`;
  switch (kind) {
    case "two-factor-code":
      return {
        subject: `Your ${brand} verification code`,
        text: lines([
          `${ctx.code} is your ${brand} verification code.`,
          "",
          `It expires in ${ctx.expiresMinutes || 10} minutes and works once.`,
          "If you were not signing in, someone else has your password — change it and sign out everywhere.",
          "",
          footer
        ]),
        sms: `Your ${brand} verification code is ${ctx.code}. It expires in ${ctx.expiresMinutes || 10} minutes. Do not share it.`
      };
    case "password-reset":
      return {
        subject: `Reset your ${brand} password`,
        text: lines([
          `${ctx.code} is your one-time ${brand} reset code.`,
          "",
          `It expires in ${ctx.expiresMinutes || 15} minutes. If you did not request a reset, no action is needed and your password stays as it is.`,
          "",
          footer
        ]),
        sms: `Your ${brand} password reset code is ${ctx.code}. It expires in ${ctx.expiresMinutes || 15} minutes.`
      };
    case "sign-in-alert":
      return {
        subject: `New sign-in to your ${brand} account`,
        text: lines([
          `Your account signed in via ${ctx.via || "password"}.`,
          "",
          `Device: ${clip(ctx.device, 90)}`,
          `Address: ${ctx.ip || "unknown"}`,
          `Time: ${ctx.at || ""}`,
          "",
          "If this was not you, change your password and sign out every other session from your profile.",
          "",
          footer
        ]),
        sms: `New ${brand} sign-in via ${ctx.via || "password"} from ${ctx.ip || "an unknown address"}. Not you? Change your password.`
      };
    case "offer-sent":
      return {
        subject: `An offer letter is waiting for you: ${clip(ctx.title, 60)}`,
        text: lines([
          `${ctx.fromName || "A member"} sent you an offer letter.`,
          "",
          `Title: ${clip(ctx.title, 90)}`,
          ctx.duration ? `Duration: ${clip(ctx.duration, 60)}` : "",
          ctx.rate ? `Compensation: ${clip(ctx.rate, 40)}` : "",
          ctx.projectTitle ? `Project: ${clip(ctx.projectTitle, 90)}` : "",
          ctx.summary ? `\n${clip(ctx.summary, 320)}` : "",
          "",
          `Open ${link} and answer under Offers.`,
          "",
          footer
        ]),
        sms: `${ctx.fromName || "A member"} sent you the offer letter "${clip(ctx.title, 60)}" on ${brand}. Review it in the app: ${link}`
      };
    case "offer-decision":
      return {
        subject: `Your offer letter was ${ctx.decision === "accepted" ? "accepted" : "declined"}`,
        text: lines([
          `${ctx.toName || "The recipient"} ${ctx.decision === "accepted" ? "accepted" : "declined"} your offer letter "${clip(ctx.title, 80)}".`,
          ctx.details ? `\n${clip(ctx.details, 320)}` : "",
          "",
          footer
        ]),
        sms: `Your offer "${clip(ctx.title, 60)}" on ${brand} was ${ctx.decision === "accepted" ? "accepted" : "declined"}.`
      };
    case "agreement-made":
      return {
        subject: `Agreement created: ${clip(ctx.title, 60)}`,
        text: lines([
          `An ${ctx.type === "investment" ? "investment" : "services"} agreement is now on the platform between ${ctx.partyA || "Party A"} and ${ctx.partyB || "Party B"}.`,
          "",
          `Title: ${clip(ctx.title, 90)}`,
          ctx.amount ? `Amount: ${clip(ctx.amount, 30)}` : "",
          ctx.instrument ? `Instrument: ${clip(ctx.instrument, 40)}` : "",
          ctx.term ? `Term: ${clip(ctx.term, 60)}` : "",
          ctx.startDate ? `Effective: ${clip(ctx.startDate, 30)}` : "",
          "",
          `Both parties can open and print it under Agreements: ${link}`,
          "",
          "This notice confirms the record exists on the platform; it is not legal advice.",
          "",
          footer
        ]),
        sms: `${brand}: agreement "${clip(ctx.title, 60)}" created${ctx.amount ? ` for ${clip(ctx.amount, 20)}` : ""}. Open the app to review it.`
      };
    case "meeting-scheduled":
      return {
        subject: `Meeting scheduled: ${clip(ctx.title, 60)}`,
        text: lines([
          `${ctx.withName || "A member"} is meeting you.`,
          "",
          ctx.date ? `Date: ${clip(ctx.date, 30)}` : "",
          ctx.time ? `Time: ${clip(ctx.time, 20)}` : "",
          ctx.mode ? `Mode: ${clip(ctx.mode, 30)}` : "",
          ctx.notes ? `\n${clip(ctx.notes, 240)}` : "",
          "",
          footer
        ]),
        sms: `${brand}: meeting ${clip(ctx.date, 20)} ${clip(ctx.time, 10)} with ${ctx.withName || "a member"}.`
      };
    case "webinar-invite":
      return {
        subject: `Invitation: ${clip(ctx.title, 60)}${ctx.date ? ` on ${clip(ctx.date, 25)}` : ""}`,
        text: lines([
          `${ctx.hostName || "A host"} is running a session that fits what you are looking for.`,
          "",
          `Webinar: ${clip(ctx.title, 90)}`,
          ctx.topic ? `Topic: ${clip(ctx.topic, 60)}` : "",
          ctx.date ? `When: ${clip(ctx.date, 25)}${ctx.time ? ` at ${clip(ctx.time, 15)}` : ""}` : "",
          ctx.duration ? `Length: ${clip(ctx.duration, 25)}` : "",
          ctx.description ? `\n${clip(ctx.description, 420)}` : "",
          ctx.why && ctx.why.length ? `\nWhy you received this: ${ctx.why.join("; ")}` : "",
          "",
          `Register at ${link} under Webinars.`,
          "",
          footer
        ]),
        sms: `${brand} invite: "${clip(ctx.title, 55)}"${ctx.date ? ` on ${clip(ctx.date, 20)}` : ""}. Register in the app: ${link}`
      };
    case "verification-granted":
      return {
        subject: `Your ${brand} profile is now verified`,
        text: lines([
          "An administrator checked your profile details and granted the verification badge.",
          "",
          "Members now see the badge on your profile and in listings.",
          "",
          footer
        ]),
        sms: `Your ${brand} profile is verified. Members can see your badge.`
      };
    case "proposal-received":
      return {
        subject: `A founder responded to your requirement: ${clip(ctx.title, 60)}`,
        text: lines([
          `${ctx.fromName || "A founder"} proposed against "${clip(ctx.title, 80)}".`,
          ctx.message ? `\n${clip(ctx.message, 320)}` : "",
          ctx.rate ? `\nRate: ${clip(ctx.rate, 40)}` : "",
          "",
          `Review it at ${link}.`,
          "",
          footer
        ]),
        sms: `${brand}: new proposal on "${clip(ctx.title, 55)}" from ${ctx.fromName || "a founder"}.`
      };
    case "message-received":
      return {
        subject: `New message from ${clip(ctx.fromName || "a member", 60)}`,
        text: lines([
          `${ctx.fromName || "A member"} sent you a message on ${brand}.`,
          "",
          ctx.content ? `"${clip(ctx.content, 320)}"` : "",
          "",
          `Reply at ${link}.`,
          "",
          footer
        ]),
        sms: `${brand}: new message from ${clip(ctx.fromName || "a member", 40)}${ctx.content ? `: "${clip(ctx.content, 90)}"` : ""}.`
      };
    default:
      return {
        subject: `${brand} notification`,
        text: lines([clip(ctx.summary || ctx.title || "Something happened on your account.", 400), "", footer]),
        sms: `${brand}: ${clip(ctx.summary || ctx.title || "A record changed on your account.", 140)}`
      };
  }
}

// A deliberately small, plain HTML wrapper — the text version above is always sent
// alongside it, so a member with images blocked still gets every figure.
export function emailHtml({ brandName = "VentureLink" } = {}, subject, plain) {
  const esc = s => String(s == null ? "" : s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
  return `<div style="font-family:Arial,Helvetica,sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#0f172a">
  <p style="font-size:13px;letter-spacing:.06em;text-transform:uppercase;color:#1d4ed8;font-weight:bold;margin:0 0 12px">${esc(brandName)}</p>
  <h1 style="font-size:18px;line-height:1.4;margin:0 0 14px">${esc(subject)}</h1>
  <pre style="font-family:inherit;white-space:pre-wrap;font-size:14px;line-height:1.55;margin:0;color:#1e293b">${esc(plain)}</pre>
</div>`;
}

// ---------------------------------------------------------------------------
// Webinar audience matching — the same explainable style as the match scores:
// every invited member comes with the reason they were picked.
// ---------------------------------------------------------------------------
const STOPWORDS = new Set(("the a an and or of for to in on with your our you we is are be this that from at by as it its " +
  "investment investments investor investors funding fund raise raising raised round seed pre seed startup startups " +
  "looking looking-for need wants want help build building built new all any will can should about into over under " +
  "session webinar webinars talk talks masterclass workshop training").split(" "));

export function tokenise(...parts) {
  const out = new Set();
  for (const raw of parts) {
    for (const word of String(raw || "").toLowerCase().split(/[^a-z0-9+#.]+/)) {
      if (word.length < 3 || STOPWORDS.has(word) || /^\d+$/.test(word)) continue;
      out.add(word);
    }
  }
  return out;
}

// Score one member against one webinar. Returns { score, why[] } — never a bare number.
export function webinarFitFor(member, webinar, ctx = {}) {
  const why = [];
  let score = 0;
  const wTokens = tokenise(webinar.title, webinar.description, webinar.topic, (webinar.tags || []).join(" "));
  const memberTokens = tokenise(member.industry, member.skills);
  const overlap = [...wTokens].filter(w => memberTokens.has(w));
  if (overlap.length) {
    score += Math.min(4, overlap.length * 2);
    why.push(`Sectors in common: ${overlap.slice(0, 3).join(", ")}`);
  }
  // Their own posted requirements are the strongest signal.
  const theirReqs = (ctx.requirements || []).filter(r => String(r.investorId) === String(member.id) || String(r.founderId) === String(member.id));
  for (const req of theirReqs) {
    const rTokens = tokenise(req.title, req.description, req.industry);
    const hit = [...wTokens].filter(w => rTokens.has(w));
    if (hit.length >= 2) {
      score += 4;
      why.push(`Matches your requirement "${clip(req.title, 44)}"`);
      break;
    }
  }
  // Projects they own or watch.
  const theirs = (ctx.projects || []).filter(p => String(p.ownerId) === String(member.id));
  for (const p of theirs) {
    const pTokens = tokenise(p.title, p.description, p.industry);
    const hit = [...wTokens].filter(w => pTokens.has(w));
    if (hit.length >= 2) {
      score += 3;
      why.push(`Related to your project "${clip(p.title, 44)}"`);
      break;
    }
  }
  // A tag naming their role is a direct invite.
  const roleWords = tokenise(member.role === "startup_founder" ? "founder startup" : member.role);
  const tagHit = [...tokenise((webinar.tags || []).join(" "), webinar.topic)].filter(w => roleWords.has(w));
  if (tagHit.length) {
    score += 2;
    why.push(`Aimed at ${member.role === "admin" ? "administrators" : clip(String(member.role).replace("_", " "), 20)}s`);
  }
  return { score, why: why.slice(0, 3) };
}

// Everyone worth inviting, with a floor so a loosely-worded session does not mail
// the whole platform. `limit` keeps a single publish bounded.
export function matchWebinarAudience(webinar, ctx = {}, { minScore = 4, limit = 25 } = {}) {
  const rows = [];
  for (const member of ctx.users || []) {
    if (!member || member.role === "admin") continue;
    if (!isEmail(member.email)) continue;
    if (String(member.id) === String(webinar.hostId || "")) continue;
    const { score, why } = webinarFitFor(member, webinar, ctx);
    if (score >= minScore) rows.push({ user: member, score, why });
  }
  rows.sort((a, b) => b.score - a.score || String(a.user.name).localeCompare(String(b.user.name)));
  return rows.slice(0, limit);
}

// ---------------------------------------------------------------------------
// Notifier: send + outbox
// ---------------------------------------------------------------------------
export function createNotifier(db, env = process.env) {
  const providers = notificationProviders(env);
  const col = () => db.collection("outbox");

  async function record(row) {
    const _id = row.id || `ob${Date.now()}${crypto.randomBytes(3).toString("hex")}`;
    await col().insertOne({
      _id,
      id: _id,
      kind: text(row.kind, 40),
      channel: text(row.channel, 20),
      to: text(row.to, 120),
      subject: text(row.subject, 200),
      body: text(row.body, 2000),
      userId: row.userId ? String(row.userId) : null,
      refId: row.refId ? String(row.refId) : null,
      status: text(row.status, 20),
      provider: text(row.provider, 30),
      reason: text(row.reason, 300),
      createdAt: new Date().toISOString()
    }).catch(err => console.error("[outbox]", err.message));
    // Keep the log bounded; delivery receipts are not an archive.
    col().find({}).sort({ _id: -1 }).skip(OUTBOX_TTL_KEEP).toArray()
      .then(old => {
        if (!old.length) return;
        return col().deleteMany({ _id: { $in: old.map(o => o._id) } });
      })
      .catch(() => {});
    return _id;
  }

  // One channel of one message. Never throws — a provider outage must not fail the
  // product action (the offer letter was sent whether or not the mail went out).
  async function deliver({ channel, to, subject, plain, smsBody, kind, userId, refId }) {
    const provider = channel === "email" ? providers.email : channel === "sms" ? providers.sms : channel === "whatsapp" ? providers.whatsapp : null;
    const addressed = channel === "email" ? (isEmail(to) ? String(to).toLowerCase() : "") : digitsOnly(to);
    if (!addressed) {
      await record({ kind, channel, to: text(to), subject, body: plain || smsBody, userId, refId, status: "failed", reason: `No valid ${channel} address on this account.` });
      return { ok: false, status: "failed", reason: "invalid-address" };
    }
    if (!provider) {
      await record({ kind, channel, to: addressed, subject, body: plain || smsBody, userId, refId, status: "queued", reason: `No ${channel} provider configured on this server.` });
      return { ok: false, status: "queued", reason: "no-provider" };
    }
    const res = channel === "email"
      ? await sendEmail(provider, { to: addressed, subject, text: plain, html: emailHtml(providers, subject, plain) })
      : await sendTwilio(provider, { to: addressed, body: smsBody || plain, channel });
    if (res.ok) {
      await record({ kind, channel, to: addressed, subject, body: plain || smsBody, userId, refId, status: "sent", provider: provider.name });
      return { ok: true, status: "sent", provider: provider.name };
    }
    const reason = res.body && res.body.error ? text(res.body.error) : `Provider answered ${res.status}.`;
    await record({ kind, channel, to: addressed, subject, body: plain || smsBody, userId, refId, status: "failed", provider: provider.name, reason });
    return { ok: false, status: "failed", reason };
  }

  // The member-facing rule: which channels does this account actually get?
  // `force` (used for the 2FA code and the enable-confirmation code) bypasses the
  // saved preferences, because that code is the preference being proved.
  function channelsFor(user, { force } = {}) {
    const want = force ? { email: user.twoFactor?.method === "email", sms: user.twoFactor?.method === "sms", whatsapp: user.twoFactor?.method === "whatsapp" } : (user.alertChannels || { email: true });
    const out = [];
    if (want.email && isEmail(user.email)) out.push({ channel: "email", to: user.email });
    if (want.sms && isPhone(user.phone)) out.push({ channel: "sms", to: user.phone });
    if (want.whatsapp && isPhone(user.phone)) out.push({ channel: "whatsapp", to: user.phone });
    return out;
  }

  // Send one alert kind to one member over every channel they allow.
  async function alert(user, kind, vars = {}, { force = null } = {}) {
    const rendered = renderAlert(kind, { ...vars, code: vars.code }, providers);
    const targets = force ? [{ channel: force, to: force === "email" ? user.email : user.phone }] : channelsFor(user);
    const results = [];
    for (const target of targets) {
      results.push({ channel: target.channel, ...(await deliver({ ...target, subject: rendered.subject, plain: rendered.text, smsBody: rendered.sms, kind, userId: user.id, refId: vars.refId })) });
    }
    if (!targets.length) {
      await record({ kind, channel: "none", to: user.email || "", subject: rendered.subject, body: rendered.text, userId: user.id, refId: vars.refId, status: "skipped", reason: "This account has no channel switched on." });
    }
    return { subject: rendered.subject, body: rendered.text, results, attempted: targets.length };
  }

  async function list({ limit = 60, userId = "" } = {}) {
    const filter = userId ? { userId: String(userId) } : {};
    const rows = await col().find(filter).sort({ _id: -1 }).limit(Math.min(Number(limit) || 60, 200)).toArray();
    return rows.map(r => ({
      id: r._id, kind: r.kind, channel: r.channel, to: r.to, subject: r.subject, body: r.body,
      userId: r.userId, refId: r.refId, status: r.status, provider: r.provider, reason: r.reason, at: r.createdAt
    }));
  }

  async function counts() {
    const rows = await col().find({}).limit(OUTBOX_TTL_KEEP).toArray();
    const by = { sent: 0, queued: 0, failed: 0, skipped: 0 };
    for (const r of rows) if (by[r.status] !== undefined) by[r.status] += 1;
    return { total: rows.length, ...by };
  }

  return { providers, availability: () => channelAvailability(providers), alert, deliver, record, list, counts, channelsFor };
}

// A 6-digit code, the way a phone one-time code looks.
export function numericCode() {
  return String(crypto.randomInt(100000, 1000000));
}

// Codes and reset tokens are only ever compared as hashes.
export const hashCode = value => crypto.createHash("sha256").update(String(value)).digest("hex");
