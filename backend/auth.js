// Authentication helpers: bcrypt password hashing + JWT issuing/verification.
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

// In production set JWT_SECRET via the environment. The fallback keeps local
// development working without any configuration.
export const JWT_SECRET = process.env.JWT_SECRET || "venturelink-dev-secret-change-in-production";
export const TOKEN_TTL = "7d";

export function hashPassword(plain) {
  return bcrypt.hashSync(plain, 10);
}

export function isHashed(pw) {
  return typeof pw === "string" && /^\$2[aby]\$\d{2}\$/.test(pw);
}

export function verifyPassword(plain, stored) {
  if (!stored) return false;
  if (!isHashed(stored)) return plain === stored; // legacy plaintext, migrated on boot
  return bcrypt.compareSync(plain, stored);
}

export function signToken(user, jti) {
  return jwt.sign({ sub: user.id, email: user.email, role: user.role, jti }, JWT_SECRET, { expiresIn: TOKEN_TTL });
}

// Express middleware: requires "Authorization: Bearer <token>".
//
// With a session resolver it also honours sign-out: a token whose `jti` was
// revoked stops working immediately, even inside its validity window. Tokens
// minted before sessions existed carry no jti and keep working, so nobody is
// logged out by this change.
export function createAuthMiddleware({ resolveSession, onSeen } = {}) {
  return async function authMiddleware(req, res, next) {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;
    if (!token) return res.status(401).json({ error: "Missing token" });
    let payload;
    try {
      payload = jwt.verify(token, JWT_SECRET);
    } catch {
      return res.status(401).json({ error: "Invalid or expired token" });
    }
    req.auth = payload;
    if (resolveSession && payload.jti) {
      const session = await resolveSession(payload.jti);
      if (session && session.revokedAt) return res.status(401).json({ error: "This session has been signed out. Please sign in again." });
      if (session && onSeen) {
        Promise.resolve(onSeen(payload.jti, session.lastSeenAt)).catch(() => {});
      }
    }
    next();
  };
}

export const authMiddleware = createAuthMiddleware();

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.auth || !roles.includes(req.auth.role)) return res.status(403).json({ error: "Forbidden" });
    next();
  };
}

// Guarantee every account has the full profile shape the UI renders, so
// accounts created through OAuth (which only carry name/email) never break
// screens like Discover that read industry/skills arrays.
export function withProfileDefaults(u) {
  if (!u) return u;
  const text = v => (typeof v === "string" ? v : "");
  const list = v => (Array.isArray(v) ? v : []);
  return {
    ...u,
    name: text(u.name) || (text(u.email) ? u.email.split("@")[0] : "Member"),
    email: text(u.email),
    role: ["entrepreneur", "investor", "freelancer", "startup_founder", "mentor", "admin"].includes(u.role) ? u.role : "entrepreneur",
    position: text(u.position),
    company: text(u.company),
    bio: text(u.bio),
    location: text(u.location),
    industry: list(u.industry),
    skills: list(u.skills),
    connections: list(u.connections),
    pendingSent: list(u.pendingSent),
    pendingReceived: list(u.pendingReceived),
    // Optional profile depth + social graph additions (older accounts simply
    // don't carry them yet, so they read back as empty lists).
    experienceList: list(u.experienceList),
    education: list(u.education),
    following: list(u.following),
    followers: list(u.followers),
    verified: u.verified === true
  };
}

// Strip the password hash before a user object goes to the client.
export function publicUser(u) {
  if (!u) return u;
  const { password, ...rest } = u;
  return withProfileDefaults(rest);
}
