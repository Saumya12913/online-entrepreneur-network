// Per-resource REST API: /api/projects, /api/investments, /api/offers …
//
// The app keeps using the generic /api/state/:collection endpoint it was
// built on — nothing here rewires it. These routes are the properly shaped
// alternative: one resource per path, field validation on the way in, and
// ownership or admin checks before anything is written.
import { asyncHandler } from "./security.js";
import { publicUser } from "./auth.js";

const ID = /^[A-Za-z0-9_-]{1,64}$/;

const TYPES = {
  id: v => typeof v === "string" && ID.test(v) || typeof v === "number",
  text: v => typeof v === "string",
  longtext: v => typeof v === "string" && v.length <= 20_000,
  num: v => typeof v === "number" && Number.isFinite(v),
  bool: v => typeof v === "boolean" || v === "yes" || v === "no",
  list: v => Array.isArray(v),
  object: v => v !== null && typeof v === "object" && !Array.isArray(v),
  data: v => typeof v === "string" && v.length <= 12_000_000
};

const LIMITS = { title: 200, name: 120, description: 5000, content: 5000, message: 2000, notes: 2000, terms: 20_000, bio: 2000 };

// Which field carries the owner, which roles may create, and what must exist.
export const RESOURCES = {
  projects: { owner: "ownerId", createRoles: ["entrepreneur", "startup_founder", "admin"], required: { title: "text", ownerId: "id", description: "text" }, types: { industry: "text", status: "text", projectType: "text", fundingRequired: "num", fundedAmount: "num", patented: "bool", patentNumber: "text", patentProofName: "text", noveltyStatus: "text", lifecycle: "text", team: "list", milestones: "list", documents: "list", views: "num", createdAt: "text" } },
  requirements: { owner: "investorId", createRoles: ["investor", "admin"], required: { title: "text", investorId: "id", description: "text" }, types: { industry: "text", budgetRange: "text", status: "text", projectId: "id", attachments: "list", createdAt: "text" } },
  investments: { owner: "investorId", createRoles: ["investor", "admin"], required: { projectId: "id", investorId: "id", amount: "num" }, types: { entrepreneurId: "id", requirementId: "id", status: "text", equity: "num", notes: "text", createdAt: "text" } },
  offers: { owner: "fromId", createRoles: ["any"], required: { fromId: "id", toId: "id", title: "text" }, types: { toRole: "text", description: "text", duration: "text", rate: "num", amount: "num", currency: "text", status: "text", attachmentName: "text", attachmentDataUrl: "data", createdAt: "text" } },
  agreements: { owner: "partyAId", coOwners: ["partyBId"], createRoles: ["any"], required: { partyAId: "id", partyBId: "id", type: "text", title: "text" }, types: { terms: "longtext", amount: "num", duration: "text", projectId: "id", investmentId: "id", status: "text", details: "list", createdAt: "text" } },
  meetings: { owner: "partyAId", coOwners: ["partyBId"], createRoles: ["any"], required: { partyAId: "id", partyBId: "id", date: "text" }, types: { time: "text", mode: "text", notes: "text", status: "text", investmentId: "id", projectId: "id", createdAt: "text" } },
  proposals: { owner: "entrepreneurId", createRoles: ["entrepreneur", "startup_founder", "freelancer", "mentor", "admin"], required: { requirementId: "id", entrepreneurId: "id" }, types: { projectId: "id", investorId: "id", message: "text", rate: "num", status: "text", createdAt: "text" } },
  messages: { owner: "fromId", coOwners: ["toId"], private: true, createRoles: ["any"], required: { fromId: "id", toId: "id", content: "text" }, types: { projectId: "id", requirementId: "id", read: "bool", attachmentName: "text", attachmentDataUrl: "data", timestamp: "text" } },
  reviews: { owner: "fromId", createRoles: ["any"], required: { fromId: "id", toId: "id", rating: "num" }, types: { comment: "text", projectId: "id", collaborationId: "id", createdAt: "text" } },
  helpRequests: { owner: "founderId", createRoles: ["entrepreneur", "startup_founder", "admin"], required: { founderId: "id", title: "text", description: "text" }, types: { category: "text", projectId: "id", status: "text", createdAt: "text" } },
  helpOffers: { owner: "helperId", createRoles: ["investor", "freelancer", "mentor", "entrepreneur", "admin"], required: { requestId: "id", helperId: "id", message: "text" }, types: { status: "text", createdAt: "text" } },
  webinars: { owner: "hostId", createRoles: ["admin", "mentor"], required: { title: "text", description: "text" }, types: { hostId: "id", host: "text", date: "text", time: "text", duration: "text", topic: "text", tags: "list", registeredUserIds: "list", registeredCount: "num", maxAttendees: "num", createdAt: "text" } },
  watchlist: { owner: "userId", private: true, createRoles: ["any"], required: { userId: "id", projectId: "id" }, types: { addedAt: "text" } },
  recentlyAccessed: { owner: "userId", private: true, createRoles: ["any"], required: { userId: "id", projectId: "id" }, types: { viewedAt: "text", title: "text" } }
};

// Profile fields a member may change about themselves. Not mounted as CRUD —
// it is the schema behind PATCH /api/users/:id.
const PROFILE_SPEC = { owner: "id", required: {}, types: { name: "text", bio: "text", position: "text", company: "text", location: "text", industry: "list", skills: "list", experienceList: "list", education: "list", following: "list", followers: "list", photoUrl: "data", resumeName: "text", resumeDataUrl: "data", verified: "bool" } };

export function validateResource(name, body, { partial = false } = {}) {
  const spec = name === "profile" ? PROFILE_SPEC : RESOURCES[name];
  const problems = [];
  if (!spec) return [`Unknown resource: ${name}`];
  if (!body || typeof body !== "object" || Array.isArray(body)) return ["The body must be a JSON object."];
  const check = (field, kind, value) => {
    if (!TYPES[kind](value)) problems.push(`${field} must be of type ${kind}.`);
    else if ((kind === "text" || kind === "longtext") && LIMITS[field] && value.length > LIMITS[field]) problems.push(`${field} is longer than ${LIMITS[field]} characters.`);
  };
  if (!partial) {
    for (const [field, kind] of Object.entries(spec.required)) {
      const v = body[field];
      if (v === undefined || v === null || v === "") { problems.push(`${field} is required.`); continue; }
      check(field, kind, v);
    }
  }
  for (const [field, kind] of Object.entries({ ...spec.types, ...spec.required })) {
    if (body[field] === undefined) continue;
    check(field, kind, body[field]);
  }
  for (const field of ["id", "password", "_id"]) if (body[field] !== undefined) problems.push(`${field} cannot be set through this endpoint.`);
  const size = Object.keys(body).length;
  if (size > 60) problems.push("Too many fields in one item (60 maximum).");
  return problems;
}

// Owner, co-owner (a meeting or agreement has two sides) or an admin.
export function canWrite(spec, item, auth) {
  if (!auth) return false;
  if (auth.role === "admin") return true;
  const ids = [spec.owner, ...(spec.coOwners || [])].filter(Boolean);
  return ids.some(key => String(item[key] ?? "") === String(auth.sub));
}

function makeId(name) {
  return `${name.slice(0, 3)}${Date.now()}${Math.floor(Math.random() * 1000)}`;
}

export function mountResources(app, { store, requireAuth }) {
  const readAll = async name => store.read(name);
  const putAll = async (name, items) => store.write(name, items);

  app.get("/api/resources", (req, res) => {
    res.json(Object.entries(RESOURCES).map(([name, spec]) => ({
      name,
      path: `/api/${name}`,
      methods: spec.private ? ["GET", "POST", "PATCH", "DELETE"] : ["GET", "POST", "PATCH", "DELETE"],
      owner: spec.owner,
      visibleTo: spec.private ? "you only" : "signed-in members",
      createRoles: spec.createRoles,
      required: Object.keys(spec.required)
    })));
  });

  for (const [name, spec] of Object.entries(RESOURCES)) {
    const base = `/api/${name}`;

    // List — private resources (messages, watchlist, recents) only ever show
    // the caller's own rows.
    app.get(base, requireAuth, asyncHandler(async (req, res) => {
      let items = await readAll(name);
      if (spec.private) items = items.filter(i => String(i[spec.owner] ?? "") === String(req.auth.sub));
      if (req.query.mine === "true" && !spec.private) {
        const ids = [spec.owner, ...(spec.coOwners || [])];
        items = items.filter(i => ids.some(k => String(i[k] ?? "") === String(req.auth.sub)));
      }
      res.json(items);
    }));

    app.get(`${base}/:id`, requireAuth, asyncHandler(async (req, res) => {
      const items = await readAll(name);
      const item = items.find(i => String(i.id) === req.params.id);
      if (!item) return res.status(404).json({ error: `${name} not found` });
      if (spec.private && String(item[spec.owner] ?? "") !== String(req.auth.sub)) return res.status(403).json({ error: "This record belongs to another member." });
      res.json(item);
    }));

    app.post(base, requireAuth, asyncHandler(async (req, res) => {
      const roles = spec.createRoles;
      if (roles[0] !== "any" && !roles.includes(req.auth.role)) {
        return res.status(403).json({ error: `Your role cannot create ${name}.` });
      }
      const body = { ...(req.body || {}) };
      // A caller cannot put their name on someone else's record, and only an
      // admin may create on behalf of another id.
      if (req.auth.role !== "admin") body[spec.owner] = req.auth.sub;
      const problems = validateResource(name, body);
      if (problems.length) return res.status(400).json({ error: "Validation failed", fields: problems });
      const item = { id: makeId(name), ...body, createdAt: body.createdAt || new Date().toISOString() };
      const items = await readAll(name);
      await putAll(name, [...items, item]);
      res.status(201).json(item);
    }));

    app.patch(`${base}/:id`, requireAuth, asyncHandler(async (req, res) => {
      const items = await readAll(name);
      const index = items.findIndex(i => String(i.id) === req.params.id);
      if (index < 0) return res.status(404).json({ error: `${name} not found` });
      if (!canWrite(spec, items[index], req.auth)) return res.status(403).json({ error: "Only the owner or an admin can change this record." });
      const body = { ...(req.body || {}) };
      delete body[spec.owner];
      (spec.coOwners || []).forEach(key => { if (req.auth.role !== "admin") delete body[key]; });
      const problems = validateResource(name, body, { partial: true });
      if (problems.length) return res.status(400).json({ error: "Validation failed", fields: problems });
      const updated = { ...items[index], ...body, id: items[index].id };
      const next = [...items];
      next[index] = updated;
      await putAll(name, next);
      res.json(updated);
    }));

    app.delete(`${base}/:id`, requireAuth, asyncHandler(async (req, res) => {
      const items = await readAll(name);
      const item = items.find(i => String(i.id) === req.params.id);
      if (!item) return res.status(404).json({ error: `${name} not found` });
      if (!canWrite(spec, item, req.auth)) return res.status(403).json({ error: "Only the owner or an admin can remove this record." });
      await putAll(name, items.filter(i => String(i.id) !== req.params.id));
      res.json({ ok: true, id: item.id });
    }));
  }

  // The account resource is deliberately narrower: the profile is writable by
  // its owner, the password never is (that goes through /api/auth/change-password).
  app.patch("/api/users/:id", requireAuth, asyncHandler(async (req, res) => {
    const userId = req.params.id;
    if (String(userId) !== String(req.auth.sub) && req.auth.role !== "admin") {
      return res.status(403).json({ error: "You can only edit your own profile." });
    }
    const users = await store.read("users");
    const index = users.findIndex(u => String(u.id) === String(userId));
    if (index < 0) return res.status(404).json({ error: "Account not found" });
    const body = { ...(req.body || {}) };
    ["id", "password", "role", "email", "connections", "pendingSent", "pendingReceived"].forEach(key => delete body[key]);
    const problems = validateResource("profile", body, { partial: true });
    if (problems.length) return res.status(400).json({ error: "Validation failed", fields: problems });
    const next = [...users];
    next[index] = { ...users[index], ...body };
    await store.write("users", next);
    // Never echo a password hash back to the caller.
    res.json(publicUser(next[index]));
  }));
}

export { TYPES as VALUE_TYPES };
