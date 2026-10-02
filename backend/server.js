import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import { fileURLToPath, pathToFileURL } from "url";
import { MongoClient } from "mongodb";
import { hashPassword, isHashed, verifyPassword, signToken, authMiddleware, requireRole, publicUser, withProfileDefaults } from "./auth.js";
import { screenNovelty } from "./novelty.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SEED_DIR = path.join(__dirname, "data");

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
  "helpRequests", "helpOffers", "reviews", "recentlyAccessed",
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

export function createApp(store) {
  const app = express();
  app.use(cors());
  app.use(express.json({ limit: "15mb" })); // profile photos / resumes / attachments may be base64 data URLs

  const usersCol = () => store.db.collection("users");
  // Stored emails keep their original casing (e.g. sauEntrepreneur@...) — match case-insensitively.
  const findUserByEmail = email => {
    const esc = String(email || "").trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return usersCol().findOne({ email: new RegExp(`^${esc}$`, "i") });
  };

  // ---- Auth ----------------------------------------------------------------
  app.post("/api/auth/login", async (req, res) => {
    const { email, password } = req.body || {};
    const user = await findUserByEmail(email);
    if (!user || !verifyPassword(String(password || ""), user.password)) {
      return res.status(401).json({ error: "Invalid email or password." });
    }
    res.json({ token: signToken(user), user: publicUser(user) });
  });

  app.post("/api/auth/register", async (req, res) => {
    const body = req.body || {};
    const email = String(body.email || "").toLowerCase().trim();
    if (!body.name || !email || !body.password) return res.status(400).json({ error: "Name, email and password are required." });
    if (String(body.password).length < 8) return res.status(400).json({ error: "Password must be at least 8 characters." });
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
    res.json({ token: signToken(user), user: publicUser(user) });
  });

  app.get("/api/auth/me", authMiddleware, async (req, res) => {
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
    res.json({ token: signToken(user), user: publicUser(user) });
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
      res.redirect(`${FRONTEND_URL}/?oauth_token=${encodeURIComponent(signToken(user))}`);
    } catch (err) {
      console.error(err);
      fail("OAuth sign-in failed. Please try again.");
    }
  });

  // ---- Patent novelty screening (PatentBot) ---------------------------------
  app.post("/api/novelty-check", authMiddleware, async (req, res) => {
    const { projectId } = req.body || {};
    const all = await store.read("projects");
    const project = all.find(p => p.id === projectId);
    if (!project) return res.status(404).json({ error: "Project not found" });
    if (!project.patented) return res.status(400).json({ error: "This project is not marked as patented." });
    res.json({ projectId, projectTitle: project.title, ...screenNovelty(project, all) });
  });

  // ---- Admin dashboard stats -------------------------------------------------
  app.get("/api/admin/stats", authMiddleware, requireRole("admin"), async (req, res) => {
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
  app.get("/api/state", authMiddleware, async (req, res) => {
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

  app.get("/api/state/:collection", authMiddleware, async (req, res) => {
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
  app.put("/api/state/:collection", authMiddleware, async (req, res) => {
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

  app.get("/api/health", (req, res) => res.json({ ok: true }));
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
  const store = createStore(client.db(DB_NAME));
  if (await store.seedIfNeeded()) console.log("Seeded MongoDB from backend/data/*.json");
  const migrated = await store.migratePasswords();
  if (migrated > 0) console.log(`Migrated ${migrated} account(s) to hashed passwords`);
  const PORT = process.env.PORT || 4000;
  createApp(store).listen(PORT, () => {
    console.log(`Connected to MongoDB: ${MONGODB_URI} / database "${DB_NAME}"`);
    console.log(`Backend running on http://localhost:${PORT}`);
    if (!GOOGLE_CLIENT_ID) console.log("Google OAuth: demo mode (set GOOGLE_CLIENT_ID/SECRET for the real flow)");
  });
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main();
