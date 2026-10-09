// Two-step verification: the second factor a member switches on for their own
// account, and the gate it puts in front of every sign-in.
//
// Shape of the flow (the same one a member knows from any large provider):
//   password ok -> if the account has 2FA, no token is issued. A 6-digit code is
//   sent over the channel the account chose and the client must present it before
//   a session exists. Codes are stored hashed, work once, expire in 10 minutes and
//   burn the challenge after five wrong attempts.
//
// Like `sessions` and `outbox`, `twoFactorChallenges` is deliberately NOT in the
// app's COLLECTIONS list — it never appears in /api/state and cannot be written
// through the generic state API.
import crypto from "crypto";

const CODE_TTL_MS = 10 * 60_000;
const MAX_ATTEMPTS = 5;
const MAX_SENDS = 3; // a member can ask for a fresh code three times per challenge
const METHODS = ["email", "sms", "whatsapp"];
const text = v => String(v == null ? "" : v).slice(0, 300);

const sha = v => crypto.createHash("sha256").update(String(v)).digest("hex");
const newCode = () => String(crypto.randomInt(100000, 1_000_000));
// Constant-time compare of two hex strings of the same length.
const sameHash = (a, b) => {
  const x = String(a || ""), y = String(b || "");
  if (x.length !== y.length) return false;
  try { return crypto.timingSafeEqual(Buffer.from(x), Buffer.from(y)); } catch { return false; }
};

export function twoFactorMethodLabel(method) {
  return method === "sms" ? "text message" : method === "whatsapp" ? "WhatsApp" : "email";
}

export function createTwoFactor(db, { notifier, usersCol } = {}) {
  const col = () => db.collection("twoFactorChallenges");

  async function get(jti) {
    try { return await col().findOne({ _id: String(jti) }); } catch { return null; }
  }

  // Where a code would go for this account + method.
  function destinationOf(user, method) {
    if (method === "sms" || method === "whatsapp") return text(user.phone);
    return text(user.email);
  }

  async function issue({ user, purpose, method, req, challengeId = "" }) {
    if (!METHODS.includes(method)) method = "email";
    const code = newCode();
    const id = challengeId || crypto.randomUUID();
    const dest = destinationOf(user, method);
    const doc = {
      userId: String(user.id),
      email: text(user.email),
      purpose: text(purpose), // signin | enable
      method,
      dest,
      codeHash: sha(code),
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + CODE_TTL_MS).toISOString(),
      attempts: 0,
      consumedAt: null
    };
    if (challengeId) {
      // A resend rotates the code on the request the member is already looking at.
      const existing = await get(id);
      if (!existing) return { error: "That verification request no longer exists. Sign in again." };
      if (Number(existing.sends) >= MAX_SENDS) {
        await col().updateOne({ _id: id }, { $set: { consumedAt: new Date().toISOString() } });
        return { error: "Too many codes were requested for this sign-in. Start again." };
      }
      doc.sends = Number(existing.sends) + 1;
      await col().updateOne({ _id: id }, { $set: doc });
    } else {
      doc.sends = 1;
      await col().insertOne({ _id: id, ...doc });
      col().deleteMany({ expiresAt: { $lt: new Date(Date.now() - 60 * 60_000).toISOString() } }).catch(() => {});
    }

    // Actually send it. `devCode` is only revealed when the code could not leave
    // this server, and never in production — the same rule the password reset uses.
    const outcome = await notifier.alert(user, "two-factor-code", { code, expiresMinutes: CODE_TTL_MS / 60_000, refId: id, req }, { force: method });
    const undelivered = outcome.results.length === 0 || outcome.results.every(r => r.status !== "sent");
    const payload = {
      challengeId: id,
      method,
      dest: dest ? maskAddress(dest) : "",
      expiresMinutes: CODE_TTL_MS / 60_000,
      sends: doc.sends,
      delivered: !undelivered,
      provider: outcome.results.find(r => r.status === "sent")?.provider || ""
    };
    if (undelivered && process.env.NODE_ENV !== "production") payload.devCode = code;
    return payload;
  }

  // Verify a code. Returns { ok, user?, error?, remaining? }.
  async function verify({ challengeId, code, purpose, userId = "" }) {
    const row = await get(challengeId);
    if (!row) return { ok: false, error: "That verification request no longer exists. Sign in again." };
    if (row.consumedAt) return { ok: false, error: "That code has already been used. Sign in again." };
    if (new Date(row.expiresAt).getTime() < Date.now()) return { ok: false, error: "That code expired. Sign in again to get a fresh one." };
    if (purpose && row.purpose !== purpose) return { ok: false, error: "That code was issued for a different step." };
    if (userId && String(row.userId) !== String(userId)) return { ok: false, error: "That code belongs to another account." };
    if (Number(row.attempts) >= MAX_ATTEMPTS) return { ok: false, error: "Too many incorrect codes. Sign in again." };
    if (!/^\d{6}$/.test(String(code || "").trim())) {
      return { ok: false, error: "Enter the 6-digit code.", remaining: MAX_ATTEMPTS - Number(row.attempts) };
    }
    if (!sameHash(sha(String(code).trim()), row.codeHash)) {
      const attempts = Number(row.attempts) + 1;
      await col().updateOne({ _id: row._id }, { $set: { attempts } });
      const left = MAX_ATTEMPTS - attempts;
      return {
        ok: false,
        error: left > 0 ? `That code is not correct. ${left} attempt${left === 1 ? "" : "s"} left.` : "Too many incorrect codes. Sign in again.",
        remaining: Math.max(0, left)
      };
    }
    await col().updateOne({ _id: row._id }, { $set: { consumedAt: new Date().toISOString() } });
    const user = await usersCol().findOne({ _id: String(row.userId) });
    if (!user) return { ok: false, error: "Account not found" };
    return { ok: true, user, method: row.method };
  }

  // ---- account settings ------------------------------------------------------
  // Enabling is only persisted once the member proves they received the code.
  async function armEnable({ user, method, phone }) {
    if (method === "sms" || method === "whatsapp") {
      if (!/^\+?[0-9 ()-]{6,20}$/.test(String(phone || "").trim())) return { error: "Enter the phone number the code should be sent to, including the country code." };
      await usersCol().updateOne({ _id: String(user.id) }, { $set: { phone: text(phone, 24) } });
      user.phone = text(phone, 24);
    }
    return { ok: true };
  }

  async function enable(challengeId, user) {
    const row = await get(challengeId);
    if (!row) return { error: "That verification request no longer exists. Start again." };
    await usersCol().updateOne({ _id: String(user.id) }, {
      $set: {
        twoFactor: {
          enabled: true,
          method: METHODS.includes(row.method) ? row.method : "email",
          phone: text(user.phone, 24),
          updatedAt: new Date().toISOString()
        }
      }
    });
    return { ok: true, method: row.method };
  }

  async function disable(userId) {
    await usersCol().updateOne({ _id: String(userId) }, { $set: { twoFactor: { enabled: false, updatedAt: new Date().toISOString() } } });
  }

  // A code arrives before a session exists, so the address on screen is masked:
  // "s•••••@nec.edu.in", "+91 98•••• ••21".
  function maskAddress(value) {
    const s = String(value || "");
    const at = s.indexOf("@");
    if (at > 0) return `${s.slice(0, 1)}${"•".repeat(Math.max(2, Math.min(5, at - 1)))}${s.slice(at)}`;
    const digits = s.replace(/\D/g, "");
    if (digits.length < 4) return s;
    return `${s.slice(0, Math.min(3, s.length))} ${"•".repeat(4)} ${digits.slice(-2)}`;
  }

  return { get, issue, verify, armEnable, enable, disable, METHODS, maskAddress, twoFactorMethodLabel };
}
