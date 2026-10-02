// Thin wrapper around the backend API.
// Everything here is additive — it does not change any app feature or behavior,
// it only moves where the data collections are read from / written to, and
// attaches the JWT session token to every request.

const BASE = "/api";

const TOKEN_KEY = "vl_token";

export function getToken() {
  return localStorage.getItem(TOKEN_KEY) || "";
}

export function setToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

function authHeaders(extra = {}) {
  const token = getToken();
  return token ? { ...extra, Authorization: `Bearer ${token}` } : extra;
}

export async function loadState() {
  const res = await fetch(`${BASE}/state`, { headers: authHeaders() });
  if (res.status === 401) throw new Error("Session expired — please sign in again.");
  if (!res.ok) throw new Error(`Failed to load state: ${res.status}`);
  return res.json();
}

// Debounce each collection's saves slightly so rapid successive updates
// (e.g. typing) don't fire a network request per keystroke.
const timers = {};

export function saveCollection(name, value) {
  if (timers[name]) clearTimeout(timers[name]);
  timers[name] = setTimeout(() => {
    fetch(`${BASE}/state/${name}`, {
      method: "PUT",
      headers: authHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify(value),
    }).catch(() => {
      // Network/backend hiccup: state stays correct in the UI (React state),
      // it just won't have persisted this particular change to disk.
      console.warn(`Could not save "${name}" to backend`);
    });
  }, 300);
}

// ---------------------------------------------------------------------------
// Auth (JWT + OAuth)
// ---------------------------------------------------------------------------

async function postJson(url, body) {
  const res = await fetch(`${BASE}${url}`, {
    method: "POST",
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
}

export async function apiLogin(email, password) {
  const data = await postJson("/auth/login", { email, password });
  setToken(data.token);
  return data.user;
}

export async function apiRegister(payload) {
  const data = await postJson("/auth/register", payload);
  setToken(data.token);
  return data.user;
}

export async function apiMe() {
  const res = await fetch(`${BASE}/auth/me`, { headers: authHeaders() });
  if (!res.ok) return null;
  return res.json();
}

// OAuth: with GOOGLE_CLIENT_ID configured the backend does a real Google flow;
// otherwise it runs the built-in demo provider. Either way the browser ends up
// back on the app with ?oauth_token=<jwt> in the URL.
export function startGoogleLogin() {
  const token = getToken();
  return fetch(`${BASE}/auth/google`, { headers: authHeaders() })
    .then(r => r.json())
    .then(data => {
      if (data.demo) {
        // Demo mode: open the simulated consent screen (App.jsx renders it).
        return { demo: true };
      }
      window.location.href = data.url;
      return { demo: false };
    });
}

export async function apiOauthDemo(email, name, role) {
  const data = await postJson("/auth/oauth/demo", { email, name, role });
  setToken(data.token);
  return data.user;
}

export function takeOauthTokenFromUrl() {
  return takeParamFromUrl("oauth_token");
}

// A failed real-Google redirect comes back as ?oauth_error=<reason>; surface it on
// the sign-in card instead of silently dropping the user on a blank login page.
export function takeOauthErrorFromUrl() {
  return takeParamFromUrl("oauth_error");
}

function takeParamFromUrl(name) {
  const params = new URLSearchParams(window.location.search);
  const value = params.get(name);
  if (value) {
    if (name === "oauth_token") setToken(value);
    params.delete(name);
    const qs = params.toString();
    window.history.replaceState({}, "", window.location.pathname + (qs ? `?${qs}` : ""));
  }
  return value;
}

// ---------------------------------------------------------------------------
// Feature APIs
// ---------------------------------------------------------------------------

export async function apiNoveltyCheck(projectId) {
  const res = await fetch(`${BASE}/novelty-check`, {
    method: "POST",
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify({ projectId }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Novelty check failed (${res.status})`);
  return data;
}

export async function apiAdminStats() {
  const res = await fetch(`${BASE}/admin/stats`, { headers: authHeaders() });
  if (!res.ok) throw new Error(`Admin stats unavailable (${res.status})`);
  return res.json();
}
