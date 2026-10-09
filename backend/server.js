import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import { fileURLToPath, pathToFileURL } from "url";
import { MongoClient } from "mongodb";
import { hashPassword, isHashed, verifyPassword, signToken, createAuthMiddleware, requireRole, publicUser, withProfileDefaults } from "./auth.js";
import { screenNovelty, buildVerificationReport } from "./novelty.js";
import { reviewPitch, summariseProject } from "./ai.js";
import { createSecurityServices, securityHeaders, rateLimiter, asyncHandler, notFoundHandler, apiErrorHandler, passwordProblem, newJti, clientIp, userAgent } from "./security.js";
import { mountResources, RESOURCES, validateResource } from "./rest.js";
import { createNotifier, renderAlert, matchWebinarAudience, ALERT_KINDS } from "./notify.js";
import { createTwoFactor } from "./twofactor.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SEED_DIR = path.join(__dirname, "data");

// A .env file next to server.js is read without any dependency (real
// deployments set variables in the platform instead). Values already in the
// environment always win.
(function loadDotEnv() {
  const fp = path.join(__dirname, ".env");
  if (!fs.existsSync(fp)) return;
  for (const line of fs.readFileSync(fp, "utf8").split(/\r?\n/)) {
    const m = /^\s*([A-Za-z0-9_]+)\s*=\s*(.*)$/.exec(line);
    if (!m || process.env[m[1]] !== undefined) continue;
    process.env[m[1]] = m[2].trim().replace(/^["'](.*)["']$/, "$1");
  }
})();

const JWT_SECRET_IS_SET = !!process.env.JWT_SECRET;

// Use 127.0.0.1 (not "localhost"): on newer Node versions "localhost" can resolve to
// IPv6 (::1), while MongoDB listens on IPv4 by default -> ECONNREFUSED.
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017";
const DB_NAME = process.env.MONGODB_DB || "entrepreneur_network";

// OAuth (optional): set GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET to enable the real
// Google sign-in flow. Without them the app falls back to the built-in demo
// consent screen so the OAuth experience is still fully demonstrable offline.
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "";
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || "";
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

const COLLECTIONS = [
  "users", "messages", "webinars", "projects", "requirements",
  "investments", "proposals", "meetings", "agreements", "offers",
  "helpRequests", "helpOffers", "reviews", "recentlyAccessed", "watchlist",
];

// ---------------------------------------------------------------------------
// Storage layer. Each item of each collection is one MongoDB document:
//   { _id: <item.id>, ...item, _order: <position in the array> }
// `_order` keeps the array order the frontend relies on (e.g. newest-first lists).
// The frontend keeps every collection as one array and saves the whole array back,
// so writing = upsert changed items + delete removed ones.
// ---------------------------------------------------------------------------
export function createStore(db) {
  const cache = {};   // name -> Map(id -> serialized item + order) of what's in MongoDB
  const queues = {};  // name -> promise chain, so saves to one collection run in order

  async function read(name) {
    const docs = await db.collection(name).find({}).sort({ _order: 1 }).toArray();
    const map = new Map();
    const items = docs.map(({ _id, _order, ...item }, idx) => {
      map.set(String(item.id ?? _id), JSON.stringify(item) + "|" + idx);
      return item;
    });
    cache[name] = map;
    return items;
  }

  async function doWrite(name, items) {
    const col = db.collection(name);
    const known = cache[name] || new Map();
    const next = new Map();
    const ops = [];
    items.forEach((item, idx) => {
      const id = String(item.id);
      const sig = JSON.stringify(item) + "|" + idx;
      next.set(id, sig);
      if (known.get(id) !== sig) {
        ops.push({ replaceOne: { filter: { _id: id }, replacement: { ...item, _id: id, _order: idx }, upsert: true } });
      }
    });
    const ids = items.map(i => String(i.id));
    ops.push({ deleteMany: { filter: { _id: { $nin: ids } } } });
    await col.bulkWrite(ops, { ordered: true });
    cache[name] = next;
  }

  function write(name, items) {
    const run = (queues[name] || Promise.resolve()).then(() => doWrite(name, items));
    queues[name] = run.catch(() => {});
    return run;
  }

  // One-time import of the JSON files in backend/data/ (the app's seed data).
  async function seedIfNeeded() {
    const meta = db.collection("_meta");
    if (await meta.findOne({ _id: "seeded" })) return false;
    for (const name of COLLECTIONS) {
      const fp = path.join(SEED_DIR, `${name}.json`);
      if (!fs.existsSync(fp)) continue;
      const raw = fs.readFileSync(fp, "utf8").trim();
      if (!raw) continue;
      const items = JSON.parse(raw);
      if (Array.isArray(items) && items.length) await doWrite(name, items);
    }
    await meta.replaceOne({ _id: "seeded" }, { _id: "seeded", at: new Date().toISOString() }, { upsert: true });
    return true;
  }

  // One-time migration: existing accounts stored plaintext passwords — hash them.
  async function migratePasswords() {
    const col = db.collection("users");
    const plain = await col.find({ password: { $not: /^\$2[aby]\$/ } }).toArray();
    for (const u of plain) {
      await col.updateOne({ _id: u._id }, { $set: { password: hashPassword(u.password) } });
    }
    return plain.length;
  }

  return { read, write, seedIfNeeded, migratePasswords, db };
}

export function createApp(store, { security, notifier, twoFactor } = {}) {
  const app = express();
  const startedAt = Date.now();
  app.set("trust proxy", 1); // behind a hosting proxy the real client IP matters for the audit trail
  app.disable("x-powered-by");
  app.use(securityHeaders);
  app.use((req, res, next) => {
    res.on("finish", () => console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} ${res.statusCode} ${Date.now() - req._t0}ms`));
    req._t0 = Date.now();
    next();
  });
  // Cross-origin stays as open as every local run has always been. Set
  // ALLOWED_ORIGINS in production to pin it to your own front-end hosts.
  const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || "").split(",").map(s => s.trim()).filter(Boolean);
  app.use(ALLOWED_ORIGINS.length ? cors({ origin: ALLOWED_ORIGINS }) : cors());
  app.use(express.json({ limit: "15mb" })); // profile photos / resumes / attachments may be base64 data URLs

  // Session-aware authentication: a revoked token stops working at once.
  const requireAuth = createAuthMiddleware(security ? {
    resolveSession: jti => security.get(jti),
    onSeen: (jti, seenAt) => security.touch(jti, seenAt)
  } : {});

  // Brute-force guard for the credential endpoints.
  const authLimiter = rateLimiter({ windowMs: 60_000, max: 20, name: "auth" });
  const recoveryLimiter = rateLimiter({ windowMs: 10 * 60_000, max: 5, name: "recovery" });

  const usersCol = () => store.db.collection("users");
  // Stored emails keep their original casing (e.g. sauEntrepreneur@...) — match case-insensitively.
  const findUserByEmail = email => {
    const esc = String(email || "").trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return usersCol().findOne({ email: new RegExp(`^${esc}$`, "i") });
  };

  // ---- Auth ----------------------------------------------------------------
  // Every successful sign-in mints a token with a session id and records the
  // event, so "where am I signed in?" can be answered later.
  //
  // An account with two-step verification switched on does not get a token here.
  // The password is only the first factor: a code goes to the channel the member
  // chose and /api/auth/two-factor/verify finishes the sign-in.
  async function signIn(res, user, req, via, { pastTwoFactor = false } = {}) {
    if (!pastTwoFactor && twoFactor && user?.twoFactor?.enabled) {
      const method = ["email", "sms", "whatsapp"].includes(user.twoFactor.method) ? user.twoFactor.method : "email";
      const challenge = await twoFactor.issue({ user, purpose: "signin", method, req });
      if (challenge.error) {
        if (security) await security.record({ userId: user.id, email: user.email, outcome: "failure", via, req, detail: challenge.error }).catch(() => {});
        return res.status(400).json({ error: challenge.error });
      }
      if (security) await security.record({ userId: user.id, email: user.email, outcome: "success", via, req, detail: `1 of 2 - code sent by ${method}` }).catch(() => {});
      return res.json({ twoFactorRequired: true, ...challenge });
    }
    const jti = newJti();
    if (security) {
      await security.start({ user, jti, req, via }).catch(err => console.error("[session]", err.message));
      await security.record({ userId: user.id, email: user.email, outcome: "success", via, req }).catch(() => {});
    }
    // The "new sign-in" notice is outward delivery on top of the session record;
    // it never blocks or changes the response the client already handles.
    if (notifier) notifyQuietly(user, "sign-in-alert", { via, device: userAgent(req), ip: clientIp(req), at: new Date().toISOString(), refId: "" });
    res.json({ token: signToken(user, jti), user: publicUser(user) });
  }

  // A member's saved preferences decide whether this goes anywhere at all, and a
  // provider outage must never fail the action that triggered it.
  function notifyQuietly(user, kind, vars = {}) {
    if (!notifier || !user) return Promise.resolve(null);
    return notifier.alert(user, kind, vars).catch(err => {
      console.error("[notify]", kind, err.message);
      return null;
    });
  }

  async function failedSignIn(user, req, email, detail) {
    if (!security) return;
    await security.record({ userId: user ? user.id : null, email: email || "", outcome: "failure", via: "password", req, detail }).catch(() => {});
  }

  app.post("/api/auth/login", authLimiter, async (req, res, next) => {
    try {
      const { email, password } = req.body || {};
      const user = await findUserByEmail(email);
      if (!user || !verifyPassword(String(password || ""), user.password)) {
        await failedSignIn(user, req, email, user ? "Wrong password" : "No such account");
        return res.status(401).json({ error: "Invalid email or password." });
      }
      return await signIn(res, user, req, "password");
    } catch (err) { return next(err); }
  });

  app.post("/api/auth/register", async (req, res) => {
    const body = req.body || {};
    const email = String(body.email || "").toLowerCase().trim();
    if (!body.name || !email || !body.password) return res.status(400).json({ error: "Name, email and password are required." });
    const weak = passwordProblem(body.password);
    if (weak) return res.status(400).json({ error: weak });
    if (await findUserByEmail(email)) return res.status(409).json({ error: "An account with this email already exists." });
    const { password, id, ...profile } = body;
    const user = withProfileDefaults({
      id: `u${Date.now()}`,
      ...profile,
      email,
      password: hashPassword(String(password)),
      role: profile.role || "entrepreneur",
      connections: [], pendingSent: [], pendingReceived: [],
      verified: false,
      createdAt: new Date().toISOString().split("T")[0]
    });
    await usersCol().insertOne({ ...user, _id: user.id, _order: Date.now() });
    await signIn(res, user, req, "register");
  });

  // ---- Password recovery, change and sessions --------------------------------
  // Answers "I forgot my password", "I want to change it", "where am I signed
  // in?" and "sign that device out" without touching the sign-in screen design.
  app.post("/api/auth/forgot-password", recoveryLimiter, async (req, res, next) => {
    try {
      const email = String((req.body || {}).email || "").trim();
      // The same answer whether or not the address exists: no account probing.
      const generic = { ok: true, message: "If that address has an account, a reset code has been issued. It expires in 15 minutes." };
      const user = email ? await findUserByEmail(email) : null;
      if (!user || !security) return res.json(generic);
      const token = await security.issueReset(user.id);
      const payload = { ...generic, resetCode: token };
      // The code is now mailed for real when an email provider is configured
      // (see backend/notify.js). It is returned to the UI only while that is not
      // the case, so local development stays possible with no account anywhere.
      if (notifier) {
        const out = await notifier.alert(withProfileDefaults(user), "password-reset", { code: token, expiresMinutes: 15, refId: "" });
        if (out.results.some(r => r.status === "sent")) delete payload.resetCode;
      }
      if (process.env.MAIL_PROVIDER) delete payload.resetCode;
      if (process.env.NODE_ENV === "production") delete payload.resetCode;
      await security.record({ userId: user.id, email, outcome: "success", via: "reset-request", req }).catch(() => {});
      return res.json(payload);
    } catch (err) { return next(err); }
  });

  app.post("/api/auth/reset-password", recoveryLimiter, async (req, res, next) => {
    try {
      const { resetCode, password } = req.body || {};
      if (!resetCode) return res.status(400).json({ error: "The reset code is required." });
      const weak = passwordProblem(password);
      if (weak) return res.status(400).json({ error: weak });
      const row = await security?.consumeReset(resetCode);
      if (!row) return res.status(400).json({ error: "That reset code is not valid, or it has expired. Request a new one." });
      const user = await usersCol().findOne({ _id: row.userId });
      if (!user) return res.status(404).json({ error: "Account not found" });
      await usersCol().updateOne({ _id: user._id }, { $set: { password: hashPassword(String(password)) } });
      // A password reset means every old session is no longer trustworthy.
      const revoked = await security.revokeAllFor(user.id, null);
      await security.record({ userId: user.id, email: user.email, outcome: "success", via: "reset-password", req, detail: `${revoked} other session(s) signed out` }).catch(() => {});
      res.json({ ok: true, message: "Your password has been updated. Please sign in again.", signedOut: revoked });
    } catch (err) { return next(err); }
  });

  app.post("/api/auth/change-password", requireAuth, authLimiter, async (req, res, next) => {
    try {
      const { currentPassword, newPassword } = req.body || {};
      const user = await usersCol().findOne({ _id: req.auth.sub });
      if (!user) return res.status(404).json({ error: "Account not found" });
      if (!verifyPassword(String(currentPassword || ""), user.password)) {
        await security?.record({ userId: user.id, email: user.email, outcome: "failure", via: "change-password", req, detail: "Current password did not match" });
        return res.status(401).json({ error: "Your current password is not correct." });
      }
      const weak = passwordProblem(newPassword);
      if (weak) return res.status(400).json({ error: weak });
      if (verifyPassword(String(newPassword), user.password)) return res.status(400).json({ error: "Choose a password you have not used before." });
      await usersCol().updateOne({ _id: user._id }, { $set: { password: hashPassword(String(newPassword)) } });
      // Keep this device signed in, sign every other one out.
      const revoked = security ? await security.revokeAllFor(user.id, req.auth.jti) : 0;
      if (security) await security.record({ userId: user.id, email: user.email, outcome: "success", via: "change-password", req, detail: `${revoked} other session(s) signed out` }).catch(() => {});
      // Members should hear about a password change on the channels they use.
      await notifyQuietly(withProfileDefaults(user), "sign-in-alert", { via: "password change", device: userAgent(req), ip: clientIp(req), at: new Date().toISOString() });
      res.json({ ok: true, message: "Password changed.", signedOut: revoked });
    } catch (err) { return next(err); }
  });

  app.get("/api/auth/sessions", requireAuth, async (req, res, next) => {
    try {
      if (!security) return res.json({ sessions: [], activity: [] });
      const [sessions, activity] = await Promise.all([security.listFor(req.auth.sub), security.activityFor(req.auth.sub)]);
      res.json({
        current: req.auth.jti || null,
        sessions: sessions.map(s => ({ ...s, current: s.jti === req.auth.jti })),
        activity
      });
    } catch (err) { return next(err); }
  });

  app.post("/api/auth/sessions/revoke-others", requireAuth, async (req, res, next) => {
    try {
      const revoked = security ? await security.revokeAllFor(req.auth.sub, req.auth.jti) : 0;
      res.json({ ok: true, revoked });
    } catch (err) { return next(err); }
  });

  app.delete("/api/auth/sessions/:jti", requireAuth, async (req, res, next) => {
    try {
      const removed = security ? await security.revoke(req.params.jti, req.auth.sub) : false;
      if (!removed) return res.status(404).json({ error: "That session is not yours, or it is already signed out." });
      res.json({ ok: true, self: req.params.jti === req.auth.jti });
    } catch (err) { return next(err); }
  });

  app.post("/api/auth/logout", requireAuth, async (req, res, next) => {
    try {
      if (security && req.auth.jti) {
        await security.revoke(req.auth.jti, req.auth.sub).catch(() => {});
        await security.record({ userId: req.auth.sub, email: req.auth.email, outcome: "success", via: "logout", req }).catch(() => {});
      }
      res.json({ ok: true });
    } catch (err) { return next(err); }
  });


  // ---- Two-step verification -------------------------------------------------
  // Nothing here changes how a normal account signs in: an account that has not
  // switched 2FA on never sees these routes. A gated account gets a code on the
  // channel it chose, and only /verify hands out the token.
  const twoFactorLimiter = rateLimiter({ windowMs: 10 * 60_000, max: 12, name: "two-factor" });

  app.post("/api/auth/two-factor/verify", twoFactorLimiter, async (req, res, next) => {
    try {
      if (!twoFactor) return res.status(503).json({ error: "Two-step verification is not available on this server." });
      const { challengeId, code } = req.body || {};
      const done = await twoFactor.verify({ challengeId, code, purpose: "signin" });
      if (!done.ok) {
        await security?.record({ userId: null, email: "", outcome: "failure", via: "two-factor", req, detail: done.error });
        return res.status(400).json({ error: done.error });
      }
      await security?.record({ userId: done.user.id, email: done.user.email, outcome: "success", via: "two-factor", req, detail: `2 of 2 - ${done.method}` });
      // The second factor is proved, so this call completes the sign-in instead of
      // asking for the code again.
      return await signIn(res, done.user, req, `password + code`, { pastTwoFactor: true });
    } catch (err) { return next(err); }
  });

  app.post("/api/auth/two-factor/resend", twoFactorLimiter, async (req, res, next) => {
    try {
      if (!twoFactor?.get) return res.status(503).json({ error: "Two-step verification is not available on this server." });
      const row = await twoFactor.get(String((req.body || {}).challengeId || ""));
      if (!row) return res.status(400).json({ error: "That verification request no longer exists. Sign in again." });
      if (row.consumedAt || new Date(row.expiresAt).getTime() < Date.now()) {
        return res.status(400).json({ error: "That request has closed. Sign in again to get a fresh code." });
      }
      const user = await usersCol().findOne({ _id: String(row.userId) });
      if (!user) return res.status(404).json({ error: "Account not found" });
      const challenge = await twoFactor.issue({ user, purpose: row.purpose, method: row.method, req, challengeId: String(row._id) });
      if (challenge.error) return res.status(429).json({ error: challenge.error });
      res.json(challenge);
    } catch (err) { return next(err); }
  });

  // Switching 2FA on is a security change, so it asks for the password and then
  // for a code on the new channel before anything is saved.
  app.post("/api/auth/two-factor/enable", requireAuth, authLimiter, async (req, res, next) => {
    try {
      if (!twoFactor) return res.status(503).json({ error: "Two-step verification is not available on this server." });
      const body = req.body || {};
      const user = await usersCol().findOne({ _id: req.auth.sub });
      if (!user) return res.status(404).json({ error: "Account not found" });
      if (!verifyPassword(String(body.password || ""), user.password)) {
        await security?.record({ userId: user.id, email: user.email, outcome: "failure", via: "two-factor-enable", req, detail: "Current password did not match" });
        return res.status(401).json({ error: "Your current password is not correct." });
      }
      const method = twoFactor.METHODS.includes(body.method) ? body.method : "email";
      const armed = await twoFactor.armEnable({ user, method, phone: body.phone });
      if (armed.error) return res.status(400).json({ error: armed.error });
      const challenge = await twoFactor.issue({ user, purpose: "enable", method, req });
      if (challenge.error) return res.status(429).json({ error: challenge.error });
      res.json({ ok: true, ...challenge, message: `A 6-digit code was sent to ${challenge.dest}. Enter it to switch two-step verification on.` });
    } catch (err) { return next(err); }
  });

  app.post("/api/auth/two-factor/confirm", requireAuth, twoFactorLimiter, async (req, res, next) => {
    try {
      const { challengeId, code } = req.body || {};
      const done = await twoFactor.verify({ challengeId, code, purpose: "enable", userId: req.auth.sub });
      if (!done.ok) return res.status(400).json({ error: done.error });
      const saved = await twoFactor.enable(challengeId, done.user);
      if (saved.error) return res.status(400).json({ error: saved.error });
      await security?.record({ userId: done.user.id, email: done.user.email, outcome: "success", via: "two-factor-enable", req, detail: `2-step on via ${saved.method}` });
      res.json({ ok: true, enabled: true, method: saved.method, message: "Two-step verification is on. Every sign-in now asks for a code." });
    } catch (err) { return next(err); }
  });

  app.post("/api/auth/two-factor/disable", requireAuth, authLimiter, async (req, res, next) => {
    try {
      const user = await usersCol().findOne({ _id: req.auth.sub });
      if (!user) return res.status(404).json({ error: "Account not found" });
      if (!verifyPassword(String((req.body || {}).password || ""), user.password)) {
        return res.status(401).json({ error: "Your current password is not correct." });
      }
      await twoFactor.disable(user.id);
      await notifyQuietly(user, "sign-in-alert", { via: "two-step turned off", device: userAgent(req), ip: clientIp(req), at: new Date().toISOString() });
      await security?.record({ userId: user.id, email: user.email, outcome: "success", via: "two-factor-disable", req, detail: "2-step turned off" });
      res.json({ ok: true, enabled: false, message: "Two-step verification is off. Your password is the only factor again." });
    } catch (err) { return next(err); }
  });

  app.get("/api/auth/two-factor", requireAuth, async (req, res, next) => {
    try {
      const user = await usersCol().findOne({ _id: req.auth.sub });
      if (!user) return res.status(404).json({ error: "Account not found" });
      const method = user.twoFactor?.method || "email";
      res.json({
        enabled: !!user.twoFactor?.enabled,
        method,
        dest: user.twoFactor?.enabled ? twoFactor.maskAddress(method === "email" ? user.email : user.phone) : "",
        phone: user.phone || "",
        availability: notifier ? notifier.availability() : { email: "", sms: "", whatsapp: "", any: false }
      });
    } catch (err) { return next(err); }
  });

  // ---- Outward alerts: email, SMS and WhatsApp --------------------------------
  // The in-app pop-up and the bell stay exactly as they are; these routes add the
  // copy that leaves the building. Recipients, wording and figures are rebuilt
  // server-side from the stored record, so a client cannot mail arbitrary text to
  // another member through this platform.
  const alerts = rateLimiter({ windowMs: 60_000, max: 30, name: "alerts" });

  app.get("/api/notifications/channels", requireAuth, async (req, res, next) => {
    try {
      const user = await usersCol().findOne({ _id: req.auth.sub });
      if (!user) return res.status(404).json({ error: "Account not found" });
      res.json({
        email: user.email,
        phone: user.phone || "",
        channels: { email: true, sms: false, whatsapp: false, ...(user.alertChannels || {}) },
        availability: notifier ? notifier.availability() : { email: "", sms: "", whatsapp: "", any: false }
      });
    } catch (err) { return next(err); }
  });

  app.put("/api/notifications/channels", requireAuth, async (req, res, next) => {
    try {
      const body = req.body || {};
      const problems = [];
      const want = body.channels && typeof body.channels === "object" ? body.channels : {};
      const channels = {};
      for (const key of ["email", "sms", "whatsapp"]) {
        if (want[key] === undefined) continue;
        if (typeof want[key] !== "boolean") { problems.push(`channels.${key} must be true or false.`); continue; }
        channels[key] = want[key];
      }
      const hasPhone = body.phone !== undefined;
      const phone = hasPhone ? String(body.phone || "").trim() : "";
      if (hasPhone && phone && !/^\+?[0-9 ()-]{6,20}$/.test(phone)) problems.push("phone must be a number in international format, e.g. +91 98765 43210.");
      if (problems.length) return res.status(400).json({ error: "Validation failed", fields: problems });
      const user = await usersCol().findOne({ _id: req.auth.sub });
      if (!user) return res.status(404).json({ error: "Account not found" });
      const savedChannels = { ...(user.alertChannels || {}), ...channels };
      const patch = { alertChannels: savedChannels };
      if (hasPhone) patch.phone = phone.slice(0, 24);
      await usersCol().updateOne({ _id: user._id }, { $set: patch });
      const saved = { ...user, ...patch };
      // A channel opt-in is only real once it has been proved, so the panel can
      // ask for a test message on the same call.
      if (body.test && notifier) {
        const kind = ALERT_KINDS.includes(String(body.test)) && !["two-factor-code", "password-reset"].includes(String(body.test)) ? String(body.test) : "sign-in-alert";
        const out = await notifier.alert(saved, kind, { via: "a test you asked for", device: userAgent(req), ip: clientIp(req), at: new Date().toISOString() });
        return res.json({ ok: true, channels: savedChannels, phone: (patch.phone ?? user.phone) || "", test: out.results });
      }
      res.json({ ok: true, channels: savedChannels, phone: (patch.phone ?? user.phone) || "" });
    } catch (err) { return next(err); }
  });

  app.get("/api/notifications/mine", requireAuth, async (req, res, next) => {
    try {
      const rows = notifier ? await notifier.list({ limit: 30, userId: req.auth.sub }) : [];
      res.json({ alerts: rows, availability: notifier ? notifier.availability() : { email: "", sms: "", whatsapp: "", any: false } });
    } catch (err) { return next(err); }
  });

  // kind + the id of the record it is about. Everything else is looked up.
  app.post("/api/notifications/send", requireAuth, alerts, async (req, res, next) => {
    try {
      if (!notifier) return res.status(503).json({ error: "Alert delivery is not available on this server." });
      const { kind, refId } = req.body || {};
      if (!ALERT_KINDS.includes(String(kind))) return res.status(400).json({ error: "Choose one of the alert kinds this platform knows." });
      if (["two-factor-code", "password-reset"].includes(kind)) {
        return res.status(400).json({ error: "Codes are issued by the sign-in and reset flows, not by this endpoint." });
      }
      if (!refId) return res.status(400).json({ error: "refId (the record this alert is about) is required." });
      const built = await buildAlertFromRecord(kind, String(refId), req.auth);
      if (built.error) return res.status(built.status || 400).json({ error: built.error });
      const outcomes = [];
      for (const { user, ctx } of built.recipients) {
        const out = await notifier.alert(user, kind, { ...ctx, refId: built.refId });
        outcomes.push({
          userId: user.id, name: user.name, hasEmail: !!user.email, hasPhone: !!user.phone,
          channels: out.results.map(r => ({ channel: r.channel, status: r.status, provider: r.provider || "", reason: r.reason || "" }))
        });
      }
      const flat = outcomes.flatMap(o => o.channels);
      res.json({
        ok: true, kind, subject: built.subject || "", recipients: outcomes,
        summary: {
          sent: flat.filter(c => c.status === "sent").length,
          queued: flat.filter(c => c.status === "queued").length,
          failed: flat.filter(c => c.status === "failed").length,
          skipped: flat.filter(c => c.status === "skipped").length
        }
      });
    } catch (err) { return next(err); }
  });

  // A published webinar that fits someone's requirement (or sector, or project)
  // is mailed to them — with the reason the platform matched them to it.
  app.post("/api/notifications/webinar-invites", requireAuth, alerts, async (req, res, next) => {
    try {
      if (!notifier) return res.status(503).json({ error: "Alert delivery is not available on this server." });
      const [webinars, requirements, projects, usersAll] = await Promise.all([store.read("webinars"), store.read("requirements"), store.read("projects"), store.read("users")]);
      const body = req.body || {};
      let webinar = null;
      if (body.webinarId) webinar = webinars.find(w => String(w.id) === String(body.webinarId));
      if (!webinar && body.webinar) {
        // The client sends the webinar it just published, id and all. Only the
        // fields are checked — an id it already generated is not being created here.
        const { id: offeredId, ...fields } = body.webinar;
        const problems = validateResource("webinars", fields, { partial: true });
        if (problems.length) return res.status(400).json({ error: "Validation failed", fields: problems });
        webinar = { id: offeredId, ...fields };
      }
      if (!webinar) return res.status(404).json({ error: "Webinar not found" });
      const ownedByHost = !webinar.hostId || String(webinar.hostId) === String(req.auth.sub);
      if (!ownedByHost && req.auth.role !== "admin") {
        return res.status(403).json({ error: "Only the host of this webinar can invite members to it." });
      }
      const audience = matchWebinarAudience(webinar, { users: usersAll.map(u => withProfileDefaults(u)), requirements, projects }, { minScore: Number(body.minScore) || 4 });
      const host = usersAll.find(u => String(u.id) === String(webinar.hostId || ""));
      const sent = [];
      for (const row of audience) {
        const out = await notifier.alert(row.user, "webinar-invite", {
          title: webinar.title, description: webinar.description, topic: webinar.topic,
          date: webinar.date, time: webinar.time, duration: webinar.duration,
          hostName: host?.name || webinar.host || "A host", why: row.why, refId: String(webinar.id || "")
        });
        sent.push({
          userId: row.user.id, name: row.user.name, email: row.user.email, score: row.score, why: row.why,
          channels: out.results.map(r => ({ channel: r.channel, status: r.status, provider: r.provider || "", reason: r.reason || "" }))
        });
      }
      const flat = sent.flatMap(s => s.channels);
      res.json({
        ok: true, webinarId: webinar.id, webinarTitle: webinar.title, matched: sent.length, recipients: sent,
        summary: {
          sent: flat.filter(c => c.status === "sent").length,
          queued: flat.filter(c => c.status === "queued").length,
          failed: flat.filter(c => c.status === "failed").length
        }
      });
    } catch (err) { return next(err); }
  });

  app.get("/api/notifications/outbox", requireAuth, requireRole("admin"), async (req, res, next) => {
    try {
      const rows = notifier ? await notifier.list({ limit: Number(req.query.limit) || 60 }) : [];
      res.json({ outbox: rows, counts: notifier ? await notifier.counts() : {}, availability: notifier ? notifier.availability() : { email: "", sms: "", whatsapp: "", any: false } });
    } catch (err) { return next(err); }
  });

  // Everything an alert needs comes from the stored record, never from the caller.
  async function buildAlertFromRecord(kind, refId, auth) {
    const [offers, agreements, meetings, proposals, requirements, projects, usersAll, messages] = await Promise.all([
      store.read("offers"), store.read("agreements"), store.read("meetings"),
      store.read("proposals"), store.read("requirements"), store.read("projects"), store.read("users"), store.read("messages")
    ]);
    const byId = rows => rows.find(r => String(r.id) === refId);
    const person = id => usersAll.find(u => String(u.id) === String(id));
    const publicPerson = id => { const u = person(id); return u ? withProfileDefaults(u) : null; };
    const push = (list, id, ctx) => { const u = publicPerson(id); if (u) list.push({ user: u, ctx }); };
    const mine = id => String(id) === String(auth.sub) || auth.role === "admin";

    if (kind === "offer-sent") {
      const offer = byId(offers);
      if (!offer) return { error: "Offer not found", status: 404 };
      if (!mine(offer.fromId)) return { error: "Only the sender of this offer letter can notify about it.", status: 403 };
      const project = offer.projectId ? byId(projects) : null;
      const list = [];
      push(list, offer.toId, {
        fromName: person(offer.fromId)?.name, title: offer.title, duration: offer.duration,
        rate: offer.rate, projectTitle: project?.title, summary: offer.description
      });
      return { recipients: list, subject: renderAlert(kind, { title: offer.title }, notifier.providers).subject, refId: offer.id };
    }
    if (kind === "offer-decision") {
      const offer = byId(offers);
      if (!offer) return { error: "Offer not found", status: 404 };
      if (!mine(offer.toId)) return { error: "Only the recipient of this offer letter can notify about it.", status: 403 };
      const list = [];
      push(list, offer.fromId, { title: offer.title, decision: offer.status, toName: person(offer.toId)?.name });
      return { recipients: list, subject: renderAlert(kind, { title: offer.title, decision: offer.status }, notifier.providers).subject, refId: offer.id };
    }
    if (kind === "agreement-made") {
      const ag = byId(agreements);
      if (!ag) return { error: "Agreement not found", status: 404 };
      if (!mine(ag.partyAId) && !mine(ag.partyBId)) return { error: "Only a party to this agreement can notify about it.", status: 403 };
      const details = Array.isArray(ag.details) ? ag.details : [];
      const findDetail = label => (details.find(d => String(d.label || "").toLowerCase().includes(label)) || {}).value || "";
      const ctx = {
        type: ag.type, title: ag.title, amount: ag.amount ? `$${ag.amount}` : "",
        instrument: findDetail("instrument"), term: findDetail("term"),
        startDate: findDetail("effective") || findDetail("start")
      };
      const a = person(ag.partyAId)?.name, b = person(ag.partyBId)?.name;
      const list = [];
      push(list, ag.partyAId, { ...ctx, partyA: a, partyB: b });
      push(list, ag.partyBId, { ...ctx, partyA: a, partyB: b });
      return { recipients: list, subject: renderAlert(kind, ctx, notifier.providers).subject, refId: ag.id };
    }
    if (kind === "meeting-scheduled") {
      const mt = byId(meetings);
      if (!mt) return { error: "Meeting not found", status: 404 };
      if (!mine(mt.partyAId) && !mine(mt.partyBId)) return { error: "Only a participant can notify about this meeting.", status: 403 };
      const list = [];
      push(list, mt.partyAId, { withName: person(mt.partyBId)?.name, date: mt.date, time: mt.time, mode: mt.mode, notes: mt.notes });
      push(list, mt.partyBId, { withName: person(mt.partyAId)?.name, date: mt.date, time: mt.time, mode: mt.mode, notes: mt.notes });
      // A stored meeting has no title of its own, so the subject names the pair.
      const who = [person(mt.partyAId)?.name, person(mt.partyBId)?.name].filter(Boolean).join(" and ") || "your meeting";
      return { recipients: list, subject: renderAlert(kind, { title: mt.title || who }, notifier.providers).subject, refId: mt.id };
    }
    if (kind === "proposal-received") {
      const pr = byId(proposals);
      if (!pr) return { error: "Proposal not found", status: 404 };
      if (!mine(pr.entrepreneurId)) return { error: "Only the founder who sent this proposal can notify about it.", status: 403 };
      const req = requirements.find(r => String(r.id) === String(pr.requirementId));
      const list = [];
      push(list, pr.investorId || req?.investorId, { title: req?.title || "your requirement", fromName: person(pr.entrepreneurId)?.name, message: pr.message, rate: pr.rate });
      return { recipients: list, subject: renderAlert(kind, { title: req?.title }, notifier.providers).subject, refId: pr.id };
    }
    if (kind === "message-received") {
      const msg = byId(messages);
      if (!msg) return { error: "Message not found", status: 404 };
      if (!mine(msg.fromId)) return { error: "Only the sender of this message can notify about it.", status: 403 };
      const list = [];
      push(list, msg.toId, { fromName: person(msg.fromId)?.name, content: msg.content });
      if (!list.length) return { error: "Recipient not found", status: 404 };
      return { recipients: list, subject: renderAlert(kind, { fromName: person(msg.fromId)?.name }, notifier.providers).subject, refId: msg.id };
    }
    if (kind === "verification-granted") {
      if (auth.role !== "admin") return { error: "Only an administrator can notify a member about verification.", status: 403 };
      const list = [];
      push(list, refId, {});
      if (!list.length) return { error: "Account not found", status: 404 };
      return { recipients: list, subject: renderAlert(kind, {}, notifier.providers).subject, refId };
    }
    return { error: `This endpoint does not send "${kind}".` };
  }

  app.get("/api/auth/me", requireAuth, async (req, res) => {
    const user = await usersCol().findOne({ _id: req.auth.sub });
    if (!user) return res.status(404).json({ error: "Account not found" });
    res.json({ user: publicUser(user) });
  });

  // Demo OAuth consent screen handler: used when no Google app credentials are
  // configured. It plays the role of the provider: the user picks/enters the
  // identity to authorise, and we issue our own JWT for it (creating the
  // account on first sign-in, exactly like a real OAuth flow would).
  app.post("/api/auth/oauth/demo", async (req, res) => {
    const { email, name, role } = req.body || {};
    const cleanEmail = String(email || "").toLowerCase().trim();
    if (!cleanEmail) return res.status(400).json({ error: "An email is required to authorise." });
    let user = await findUserByEmail(cleanEmail);
    if (!user) {
      user = withProfileDefaults({
        id: `u${Date.now()}`,
        name: String(name || cleanEmail.split("@")[0]).trim(),
        email: cleanEmail,
        password: hashPassword(`oauth-${Date.now()}`), // unusable random password; OAuth-only account
        role: ["entrepreneur", "investor", "freelancer", "startup_founder", "mentor", "admin"].includes(role) ? role : "entrepreneur",
        connections: [], pendingSent: [], pendingReceived: [],
        verified: true,
        createdAt: new Date().toISOString().split("T")[0]
      });
      await usersCol().insertOne({ ...user, _id: user.id, _order: Date.now() });
    }
    await signIn(res, user, req, "oauth-demo");
  });

  // ---- Google OAuth 2.0 (authorization-code flow) ---------------------------
  // Active when GOOGLE_CLIENT_ID + GOOGLE_CLIENT_SECRET are set; otherwise
  // /api/auth/google reports demo mode and the app renders its own consent
  // screen. Both paths end with the browser back on the app carrying the JWT.
  const readCookie = (req, name) => {
    const raw = req.headers.cookie || "";
    const hit = raw.split(/;\s*/).find(pair => pair.startsWith(`${name}=`));
    return hit ? decodeURIComponent(hit.slice(name.length + 1)) : "";
  };
  const googleRedirectUri = req => `${req.protocol}://${req.get("host")}/api/auth/google/callback`;

  app.get("/api/auth/google", (req, res) => {
    if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) return res.json({ demo: true });
    // Anti-CSRF state, kept in an httpOnly cookie and re-checked on the callback.
    const state = crypto.randomBytes(16).toString("hex");
    res.setHeader("Set-Cookie", `vl_oauth_state=${state}; HttpOnly; Path=/; SameSite=Lax; Max-Age=600`);
    const url = "https://accounts.google.com/o/oauth2/v2/auth" +
      `?client_id=${encodeURIComponent(GOOGLE_CLIENT_ID)}` +
      `&redirect_uri=${encodeURIComponent(googleRedirectUri(req))}` +
      `&state=${state}` +
      "&response_type=code&scope=openid%20email%20profile&access_type=offline";
    // JSON, not a redirect: the caller is a fetch() from the SPA, and following a
    // cross-origin redirect from fetch would break the flow. The SPA navigates.
    res.json({ demo: false, url });
  });

  app.get("/api/auth/google/callback", async (req, res) => {
    const fail = reason => res.redirect(`${FRONTEND_URL}/?oauth_error=${encodeURIComponent(reason)}`);
    if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) return fail("Google OAuth is not configured on this server.");
    const expectedState = readCookie(req, "vl_oauth_state");
    if (!expectedState || req.query.state !== expectedState) return fail("Sign-in was interrupted (invalid OAuth state). Please try again.");
    if (req.query.error) return fail(req.query.error === "access_denied" ? "You cancelled the Google sign-in." : `Google rejected the sign-in: ${req.query.error}`);
    try {
      const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          code: String(req.query.code || ""), client_id: GOOGLE_CLIENT_ID,
          client_secret: GOOGLE_CLIENT_SECRET, redirect_uri: googleRedirectUri(req), grant_type: "authorization_code"
        })
      });
      const tokens = await tokenRes.json();
      if (!tokenRes.ok || !tokens.access_token) return fail(tokens.error_description || "Google did not return an access token.");
      const infoRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
        headers: { Authorization: `Bearer ${tokens.access_token}` }
      });
      const info = await infoRes.json();
      const email = String(info.email || "").toLowerCase();
      if (!email) return fail("Google account did not expose an email address.");
      let user = await findUserByEmail(email);
      if (!user) {
        user = withProfileDefaults({
          id: `u${Date.now()}`, name: info.name || email.split("@")[0], email,
          password: hashPassword(`oauth-${Date.now()}`), role: "entrepreneur",
          photoUrl: info.picture || "",
          connections: [], pendingSent: [], pendingReceived: [], verified: true,
          createdAt: new Date().toISOString().split("T")[0]
        });
        await usersCol().insertOne({ ...user, _id: user.id, _order: Date.now() });
      }
      res.setHeader("Set-Cookie", "vl_oauth_state=; HttpOnly; Path=/; Max-Age=0");
      // Two-step verification applies to a provider sign-in too: the browser comes
      // back with the challenge id and the app asks for the code before it has a token.
      if (twoFactor && user.twoFactor?.enabled) {
        const method = ["email", "sms", "whatsapp"].includes(user.twoFactor.method) ? user.twoFactor.method : "email";
        const challenge = await twoFactor.issue({ user, purpose: "signin", method, req });
        if (challenge.error) return fail(challenge.error);
        if (security) await security.record({ userId: user.id, email: user.email, outcome: "success", via: "google", req, detail: `1 of 2 - code sent by ${method}` }).catch(() => {});
        return res.redirect(`${FRONTEND_URL}/?oauth_2fa=${encodeURIComponent(challenge.challengeId)}&method=${encodeURIComponent(method)}&dest=${encodeURIComponent(challenge.dest || "")}`);
      }
      const jti = newJti();
      if (security) {
        await security.start({ user, jti, req, via: "google" }).catch(() => {});
        await security.record({ userId: user.id, email: user.email, outcome: "success", via: "google", req }).catch(() => {});
      }
      res.redirect(`${FRONTEND_URL}/?oauth_token=${encodeURIComponent(signToken(user, jti))}`);
    } catch (err) {
      console.error(err);
      fail("OAuth sign-in failed. Please try again.");
    }
  });

  // ---- Patent novelty screening (PatentBot) ---------------------------------
  app.post("/api/novelty-check", requireAuth, async (req, res) => {
    const { projectId } = req.body || {};
    const all = await store.read("projects");
    const project = all.find(p => p.id === projectId);
    if (!project) return res.status(404).json({ error: "Project not found" });
    if (!project.patented) return res.status(400).json({ error: "This project is not marked as patented." });
    res.json({ projectId, projectTitle: project.title, ...screenNovelty(project, all) });
  });

  // ---- Pitch intelligence and the patent verification report (all additive) --
  // Deterministic text analysis, computed on the server from the project's own
  // record: nothing is forwarded to a third party and nothing is invented.
  const STAGE_FROM_STATUS = { funded: "funded", in_talks: "scaling" };

  function readProjectId(req, res) {
    const projectId = String((req.body || {}).projectId || "").trim().slice(0, 64);
    if (!projectId) {
      res.status(400).json({ error: "projectId is required" });
      return null;
    }
    return projectId;
  }

  async function projectContext(projectId) {
    const [projects, users, investments, activity] = await Promise.all(
      ["projects", "users", "investments", "recentlyAccessed"].map(n => store.read(n)));
    const project = projects.find(p => p.id === projectId);
    if (!project) return null;
    return {
      project,
      projects,
      users,
      owner: users.find(u => u.id === project.ownerId) || null,
      investments: investments.filter(i => String(i.projectId) === String(project.id)),
      viewers: activity.filter(a => String(a.projectId) === String(project.id)),
      lifecycle: project.lifecycle || STAGE_FROM_STATUS[project.status] || "mvp",
      milestones: project.milestones || [],
      team: project.team || [],
      documents: project.documents || []
    };
  }

  app.post("/api/ai/pitch-review", requireAuth, async (req, res) => {
    const projectId = readProjectId(req, res);
    if (!projectId) return;
    const ctx = await projectContext(projectId);
    if (!ctx) return res.status(404).json({ error: "Project not found" });
    res.json(reviewPitch(ctx.project, ctx));
  });

  app.post("/api/ai/summary", requireAuth, async (req, res) => {
    const projectId = readProjectId(req, res);
    if (!projectId) return;
    const ctx = await projectContext(projectId);
    if (!ctx) return res.status(404).json({ error: "Project not found" });
    res.json(summariseProject(ctx.project, ctx));
  });

  // A printed record of what PatentBot screened, how close the nearest prior
  // work is, and which checks moved the verdict. Uses the same engine as
  // /api/novelty-check, so a report can never disagree with the chatbot.
  app.post("/api/novelty-report", requireAuth, async (req, res) => {
    const projectId = readProjectId(req, res);
    if (!projectId) return;
    const ctx = await projectContext(projectId);
    if (!ctx) return res.status(404).json({ error: "Project not found" });
    const verdict = screenNovelty(ctx.project, ctx.projects);
    const screener = ctx.users.find(u => u.id === req.auth.sub) || null;
    res.json(buildVerificationReport(ctx.project, ctx.projects, verdict, {
      screenedBy: { name: screener ? screener.name : "", role: req.auth.role || "" },
      founder: ctx.owner ? ctx.owner.name : "",
      company: ctx.owner ? ctx.owner.company || "" : ""
    }));
  });

  // ---- Admin dashboard stats -------------------------------------------------
  app.get("/api/admin/stats", requireAuth, requireRole("admin"), async (req, res) => {
    const [users, projects, offers, investments, proposals, agreements] = await Promise.all(
      ["users", "projects", "offers", "investments", "proposals", "agreements"].map(n => store.read(n)));
    const byRole = {};
    for (const u of users) byRole[u.role] = (byRole[u.role] || 0) + 1;
    res.json({
      users: { total: users.length, byRole },
      projects: { total: projects.length, patented: projects.filter(p => p.patented).length, saas: projects.filter(p => p.projectType !== "product").length, product: projects.filter(p => p.projectType === "product").length },
      offers: { total: offers.length, pending: offers.filter(o => o.status === "pending").length },
      investments: { total: investments.length, amount: investments.reduce((s, i) => s + (i.amount || 0), 0) },
      proposals: { total: proposals.length, pending: proposals.filter(p => p.status === "pending").length },
      agreements: agreements.length
    });
  });

  // ---- State (JWT-protected) --------------------------------------------------
  app.get("/api/state", requireAuth, async (req, res) => {
    try {
      const state = {};
      for (const name of COLLECTIONS) state[name] = await store.read(name);
      // Never send password hashes to the client.
      state.users = state.users.map(publicUser);
      res.json(state);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Database error" });
    }
  });

  app.get("/api/state/:collection", requireAuth, async (req, res) => {
    const { collection } = req.params;
    if (!COLLECTIONS.includes(collection)) {
      return res.status(404).json({ error: `Unknown collection: ${collection}` });
    }
    try {
      const items = await store.read(collection);
      res.json(collection === "users" ? items.map(publicUser) : items);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Database error" });
    }
  });

  // PUT /api/state/:collection -> replace a collection with the full array
  app.put("/api/state/:collection", requireAuth, async (req, res) => {
    const { collection } = req.params;
    if (!COLLECTIONS.includes(collection)) {
      return res.status(404).json({ error: `Unknown collection: ${collection}` });
    }
    let value = req.body;
    if (!Array.isArray(value)) {
      return res.status(400).json({ error: "Body must be a JSON array" });
    }
    if (value.some(item => !item || item.id === undefined || item.id === null)) {
      return res.status(400).json({ error: "Every item needs an id" });
    }
    try {
      if (collection === "users") {
        // The client never receives password hashes, so when it writes users back,
        // restore each account's existing hash (or hash a plaintext new password).
        const existing = new Map((await usersCol().find({}).toArray()).map(d => [String(d._id), d.password]));
        value = value.map(u => u.password
          ? (isHashed(u.password) ? u : { ...u, password: hashPassword(u.password) })
          : { ...u, password: existing.get(String(u.id)) });
      }
      await store.write(collection, value);
      res.json({ ok: true });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Database error" });
    }
  });

  // ---- Proper REST API (alongside the generic /api/state above) --------------
  mountResources(app, { store, requireAuth });

  // ---- Health, 404 and the single error exit ---------------------------------
  app.get("/api/health", asyncHandler(async (req, res) => {
    let db = "up";
    try {
      await store.db.command({ ping: 1 });
    } catch {
      db = "down";
    }
    res.status(db === "up" ? 200 : 503).json({
      ok: db === "up", db, uptimeSeconds: Math.round((Date.now() - startedAt) / 1000),
      collections: COLLECTIONS.length, resources: Object.keys(RESOURCES).length
    });
  }));

  // Optional single-container deploy: SERVE_FRONTEND=<path to frontend/dist> makes
  // this process also host the built site. Unset means unset — the normal setup
  // (Vite on 5173 proxying /api here) is completely untouched.
  const SERVE_DIST = process.env.SERVE_FRONTEND ? path.resolve(process.env.SERVE_FRONTEND) : "";
  if (SERVE_DIST && fs.existsSync(path.join(SERVE_DIST, "index.html"))) {
    app.use(express.static(SERVE_DIST));
    // Any non-/api path returns the SPA shell so a refresh on a deep link works.
    app.get(/^(?!\/api).*/, (req, res) => res.sendFile(path.join(SERVE_DIST, "index.html")));
    console.log(`Serving the built frontend from ${SERVE_DIST}`);
  }

  app.use(notFoundHandler);
  app.use(apiErrorHandler);
  return app;
}

async function main() {
  const client = new MongoClient(MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
  try {
    await client.connect();
    await client.db(DB_NAME).command({ ping: 1 });
  } catch (err) {
    console.error(`\nCould not connect to MongoDB at ${MONGODB_URI}`);
    console.error("Make sure MongoDB is running (the 'MongoDB Server' Windows service) and that");
    console.error("MongoDB Compass can connect to the same address. Details:", err.message, "\n");
    process.exit(1);
  }
  const db = client.db(DB_NAME);
  const store = createStore(db);
  const security = createSecurityServices(db);
  const notifier = createNotifier(db);
  const twoFactor = createTwoFactor(db, { notifier, usersCol: () => db.collection("users") });
  await security.ensureIndexes();
  if (await store.seedIfNeeded()) console.log("Seeded MongoDB from backend/data/*.json");
  const migrated = await store.migratePasswords();
  if (migrated > 0) console.log(`Migrated ${migrated} account(s) to hashed passwords`);
  if (process.env.NODE_ENV === "production" && !process.env.JWT_SECRET) {
    console.error("Refusing to start in production with the development JWT secret. Set JWT_SECRET.");
    process.exit(1);
  }
  const PORT = process.env.PORT || 4000;
  const server = createApp(store, { security, notifier, twoFactor }).listen(PORT, () => {
    console.log(`Connected to MongoDB: ${MONGODB_URI} / database "${DB_NAME}"`);
    console.log(`Backend running on http://localhost:${PORT}`);
    console.log(`REST resources: ${Object.keys(RESOURCES).length} collections · health check: /api/health`);
    if (!GOOGLE_CLIENT_ID) console.log("Google OAuth: demo mode (set GOOGLE_CLIENT_ID/SECRET for the real flow)");
    if (!JWT_SECRET_IS_SET) console.log("JWT_SECRET: development fallback in use (set it before deploying)");
    const live = notifier.availability();
    const off = ["email", "sms", "whatsapp"].filter(c => !live[c]);
    console.log(live.any
      ? `Alert delivery: live via ${["email", "sms", "whatsapp"].filter(c => live[c]).map(c => `${c}(${live[c]})`).join(", ")}${off.length ? ` · ${off.join(", ")} queued to the outbox` : ""}`
      : "Alert delivery: no provider configured — every email/SMS/WhatsApp is written to the outbox instead (set RESEND_API_KEY, SENDGRID_API_KEY, MAILGUN_API_KEY or TWILIO_ACCOUNT_SID)");
  });

  // Deployments get a clean stop: finish the requests in flight, then close
  // the database connection, and force-quit if something hangs.
  const shutdown = signal => {
    console.log(`${signal}: shutting down`);
    server.close(() => {
      client.close().then(() => process.exit(0)).catch(() => process.exit(0));
    });
    setTimeout(() => process.exit(1), 10_000).unref();
  };
  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("unhandledRejection", err => console.error("[unhandled rejection]", err));
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main();
