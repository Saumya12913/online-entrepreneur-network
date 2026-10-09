// Production security services: signed-in sessions, login activity, password
// reset tokens, request guards and the central error handler. Everything here
// is additive — the app keeps working if these collections are empty.
import crypto from "crypto";

const SESSION_TTL_DAYS = 90;
const TOUCH_EVERY_MS = 60_000; // don't write a timestamp on every request
const RESET_TTL_MS = 15 * 60_000;
const text = v => String(v == null ? "" : v).slice(0, 200);

export function clientIp(req) {
  const fwd = String(req.headers["x-forwarded-for"] || "").split(",")[0].trim();
  return text(fwd || req.ip || req.socket?.remoteAddress || "");
}

export function userAgent(req) {
  return text(req.headers["user-agent"]);
}

const hash = value => crypto.createHash("sha256").update(String(value)).digest("hex");

export function newJti() {
  return crypto.randomUUID();
}

// ---------------------------------------------------------------------------
// Sessions + login activity + password resets, all on the same Mongo database.
// ---------------------------------------------------------------------------
export function createSecurityServices(db) {
  const sessions = () => db.collection("sessions");
  const activity = () => db.collection("loginActivity");
  const resets = () => db.collection("passwordResets");

  async function start({ user, jti, req, via, detail }) {
    const now = new Date().toISOString();
    await sessions().insertOne({
      _id: jti, userId: String(user.id), email: text(user.email), role: text(user.role),
      via: text(via), ip: clientIp(req), userAgent: userAgent(req),
      createdAt: now, lastSeenAt: now, revokedAt: null, _detail: text(detail)
    });
  }

  async function get(jti) {
    if (!jti) return null;
    try {
      return await sessions().findOne({ _id: String(jti) });
    } catch {
      return null; // no sessions collection yet — treat as an unknown session
    }
  }

  async function touch(jti, seenAt) {
    if (Date.now() - new Date(seenAt).getTime() < TOUCH_EVERY_MS) return;
    await sessions().updateOne({ _id: String(jti) }, { $set: { lastSeenAt: new Date().toISOString() } }).catch(() => {});
  }

  async function listFor(userId) {
    const rows = await sessions().find({ userId: String(userId) }).sort({ createdAt: -1 }).limit(30).toArray();
    return rows.map(s => ({
      jti: s._id, email: s.email, role: s.role, via: s.via, ip: s.ip, userAgent: s.userAgent,
      createdAt: s.createdAt, lastSeenAt: s.lastSeenAt, revokedAt: s.revokedAt || null,
      active: !s.revokedAt && new Date(s.createdAt).getTime() > Date.now() - SESSION_TTL_DAYS * 864e5
    }));
  }

  async function revoke(jti, userId) {
    const r = await sessions().updateOne(
      { _id: String(jti), userId: String(userId) },
      { $set: { revokedAt: new Date().toISOString() } });
    return r.modifiedCount > 0;
  }

  // Sign everything out except the request that asked (so the user is not
  // thrown off their own device by "sign out everywhere else").
  async function revokeAllFor(userId, exceptJti) {
    const filter = { userId: String(userId), revokedAt: null };
    if (exceptJti) filter._id = { $ne: String(exceptJti) };
    const r = await sessions().updateMany(filter, { $set: { revokedAt: new Date().toISOString() } });
    return r.modifiedCount || 0;
  }

  async function record({ userId, email, outcome, via, req, detail }) {
    await activity().insertOne({
      _id: newJti(), userId: userId ? String(userId) : null, email: text(email),
      outcome: text(outcome), via: text(via), ip: clientIp(req), userAgent: userAgent(req),
      detail: text(detail), at: new Date().toISOString()
    }).catch(() => {});
  }

  async function activityFor(userId, limit = 20) {
    const rows = await activity().find({ userId: String(userId) }).sort({ at: -1 }).limit(limit).toArray();
    return rows.map(a => ({ at: a.at, outcome: a.outcome, via: a.via, ip: a.ip, userAgent: a.userAgent, detail: a.detail }));
  }

  // Forgot password: the token is stored hashed, so a database leak cannot be
  // replayed. In development the API also returns it, because this project has
  // no mail provider wired up — see README (deployment).
  async function issueReset(userId) {
    const token = crypto.randomBytes(24).toString("base64url");
    await resets().deleteMany({ expiresAt: { $lt: new Date().toISOString() } }).catch(() => {});
    await resets().insertOne({
      _id: hash(token), userId: String(userId), createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + RESET_TTL_MS).toISOString(), usedAt: null
    });
    return token;
  }

  async function consumeReset(token) {
    if (!token || typeof token !== "string") return null;
    const row = await resets().findOne({ _id: hash(token.trim()) }).catch(() => null);
    if (!row || row.usedAt || new Date(row.expiresAt).getTime() < Date.now()) return null;
    await resets().updateOne({ _id: row._id }, { $set: { usedAt: new Date().toISOString() } });
    return row;
  }

  async function ensureIndexes() {
    await sessions().createIndex({ userId: 1, createdAt: -1 }).catch(() => {});
    await activity().createIndex({ userId: 1, at: -1 }).catch(() => {});
    await resets().createIndex({ expiresAt: 1 }).catch(() => {});
  }

  return { start, get, touch, listFor, revoke, revokeAllFor, record, activityFor, issueReset, consumeReset, ensureIndexes };
}

// ---------------------------------------------------------------------------
// Request guards. A tiny in-memory bucket is enough for one API process and
// keeps the dependency list unchanged.
// ---------------------------------------------------------------------------
export function rateLimiter({ windowMs = 60_000, max = 40, name = "default" } = {}) {
  const hits = new Map();
  let lastPrune = Date.now();
  return (req, res, next) => {
    const now = Date.now();
    if (now - lastPrune > windowMs) {
      for (const [key, bucket] of hits) if (now - bucket.start > windowMs) hits.delete(key);
      lastPrune = now;
    }
    const key = `${name}:${clientIp(req)}`;
    let bucket = hits.get(key);
    if (!bucket || now - bucket.start > windowMs) bucket = { start: now, count: 0 };
    bucket.count += 1;
    hits.set(key, bucket);
    if (bucket.count > max) {
      res.setHeader("Retry-After", Math.ceil((bucket.start + windowMs - now) / 1000));
      return res.status(429).json({ error: "Too many attempts from this address. Please wait a minute and try again." });
    }
    next();
  };
}

export function securityHeaders(req, res, next) {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "no-referrer");
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  res.setHeader("Cross-Origin-Resource-Policy", "same-origin");
  if (req.protocol === "https") res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  next();
}

// Express does not catch rejected promises: without this a Mongo error would
// hang the request instead of reaching the error handler.
export const asyncHandler = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

export function notFoundHandler(req, res) {
  res.status(404).json({ error: `No such endpoint: ${req.method} ${req.path}` });
}

// One place that turns anything thrown into a clean JSON error — no stack
// traces or HTML pages leaking to the client.
export function apiErrorHandler(err, req, res, next) {
  if (res.headersSent) return next(err);
  if (err?.type === "entity.too.large") return res.status(413).json({ error: "That upload is too large (15 MB limit)." });
  if (err?.type === "invalid_json" || err instanceof SyntaxError) return res.status(400).json({ error: "The request body is not valid JSON." });
  if (err?.statusCode || err?.status) return res.status(err.statusCode || err.status).json({ error: err.expose === false ? "Request failed" : err.message });
  console.error("[api]", req.method, req.originalUrl, err?.stack || err);
  res.status(err?.status === 422 ? 422 : 500).json({ error: "The server could not complete this request." });
}

// Password rules for the accounts people keep: length plus a letter and a
// number. Login never enforces this, so older demo accounts still sign in.
export function passwordProblem(password) {
  const pw = String(password || "");
  if (pw.length < 8) return "Use at least 8 characters.";
  if (!/[A-Za-z]/.test(pw)) return "Include at least one letter.";
  if (!/\d/.test(pw)) return "Include at least one number.";
  return "";
}
