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
  // A two-step account gets a challenge instead of a token: nothing is stored
  // until the code is verified.
  if (data.twoFactorRequired) return { twoFactor: data };
  setToken(data.token);
  return { user: data.user };
}

// ---- Two-step verification ----
export const apiTwoFactorStatus = () => getJson("/auth/two-factor");
export const apiVerifyTwoFactor = async (challengeId, code) => {
  const data = await postJson("/auth/two-factor/verify", { challengeId, code });
  if (data.twoFactorRequired) return { twoFactor: data };
  setToken(data.token);
  return { user: data.user };
};
export const apiResendTwoFactor = challengeId => postJson("/auth/two-factor/resend", { challengeId });
export const apiEnableTwoFactor = payload => postJson("/auth/two-factor/enable", payload);
export const apiConfirmTwoFactor = (challengeId, code) => postJson("/auth/two-factor/confirm", { challengeId, code });
export const apiDisableTwoFactor = password => postJson("/auth/two-factor/disable", { password });

// ---- Outward alerts: email, SMS, WhatsApp ----
export const apiAlertChannels = () => getJson("/notifications/channels");
export const apiSaveAlertChannels = payload => fetch(`${BASE}/notifications/channels`, {
  method: "PUT",
  headers: authHeaders({ "Content-Type": "application/json" }),
  body: JSON.stringify(payload || {})
}).then(async r => { const d = await r.json().catch(() => ({})); if (expired(r)) throw expired(r); if (!r.ok) throw new Error(d.error || `Could not save the alert settings (${r.status})`); return d; });
export const apiMyAlerts = () => getJson("/notifications/mine");
export const apiOutbox = () => getJson("/notifications/outbox");

// Tell a member about something that just happened, out of the app. The platform
// rebuilds the wording from the stored record, so this only ever reports a real
// event the caller is party to — and it never blocks the action it follows.
export const apiNotifyImportant = (kind, refId) => postJson("/notifications/send", { kind, refId });
export const apiWebinarInvites = payload => postJson("/notifications/webinar-invites", payload);

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
  if (data.twoFactorRequired) return { twoFactor: data };
  setToken(data.token);
  return { user: data.user };
}

export function takeOauthTokenFromUrl() {
  return takeParamFromUrl("oauth_token");
}

// A provider sign-in for an account with two-step verification comes back with
// ?oauth_2fa=<challengeId> and no token; the app asks for the code next.
export function takeOauthTwoFactorFromUrl() {
  const params = new URLSearchParams(window.location.search);
  if (!params.get("oauth_2fa")) return null;
  const out = {
    challengeId: params.get("oauth_2fa") || "",
    method: params.get("method") || "email",
    dest: params.get("dest") || ""
  };
  ["oauth_2fa", "method", "dest"].forEach(k => params.delete(k));
  window.history.replaceState({}, "", window.location.pathname + (params.toString() ? `?${params.toString()}` : ""));
  return out;
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

async function postAnalysis(path, body, fallback) {
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `${fallback} (${res.status})`);
  return data;
}

// Pitch intelligence and the patent verification report: server-computed,
// deterministic analyses of a project the user can already see.
export const apiPitchReview = projectId =>
  postAnalysis("/ai/pitch-review", { projectId }, "Pitch review failed");
export const apiProjectSummary = projectId =>
  postAnalysis("/ai/summary", { projectId }, "Summary failed");
export const apiNoveltyReport = projectId =>
  postAnalysis("/novelty-report", { projectId }, "Report failed");

export async function apiAdminStats() {
  const res = await fetch(`${BASE}/admin/stats`, { headers: authHeaders() });
  if (!res.ok) throw new Error(`Admin stats unavailable (${res.status})`);
  return res.json();
}

// ---------------------------------------------------------------------------
// Account security: password recovery, change password, sessions, activity.
// ---------------------------------------------------------------------------

// A 401 on one of the signed-in security calls means the stored session is no
// longer accepted — that is a different message from "wrong password", so it is
// worded here instead of passing the raw API text into the panel.
function expired(res) {
  return res.status === 401 ? new Error("Session expired — please sign in again.") : null;
}

async function getJson(url) {
  const res = await fetch(`${BASE}${url}`, { headers: authHeaders() });
  const data = await res.json().catch(() => ({}));
  if (expired(res)) throw expired(res);
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
}

async function postSec(url, body) {
  const res = await fetch(`${BASE}${url}`, {
    method: "POST",
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(body || {}),
  });
  const data = await res.json().catch(() => ({}));
  if (expired(res)) throw expired(res);
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
}

export const apiSessions = () => getJson("/auth/sessions");
export const apiRevokeSession = jti =>
  fetch(`${BASE}/auth/sessions/${encodeURIComponent(jti)}`, { method: "DELETE", headers: authHeaders() })
    .then(async r => { const d = await r.json().catch(() => ({})); if (expired(r)) throw expired(r); if (!r.ok) throw new Error(d.error || `Revoke failed (${r.status})`); return d; });
export const apiRevokeOtherSessions = () => postSec("/auth/sessions/revoke-others", {});
export const apiLogout = () => postSec("/auth/logout", {}).catch(() => ({ ok: false }));
export const apiChangePassword = (currentPassword, newPassword) =>
  postSec("/auth/change-password", { currentPassword, newPassword });
export const apiForgotPassword = email => postJson("/auth/forgot-password", { email });
export const apiResetPassword = (resetCode, password) => postJson("/auth/reset-password", { resetCode, password });
