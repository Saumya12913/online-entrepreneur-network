// ---------------------------------------------------------------------------
// Theme engine.
//
// The interface ships one precompiled utility stylesheet whose colours all read
// from CSS variables (--color-blue-600, --color-slate-100, ...). A theme is
// therefore only a re-mapping of those variables — no component, layout or
// feature is touched, and "classic" applies zero overrides so the original look
// is exactly preserved.
//
// The app's own colour vocabulary:
//   blue-*    = the accent (buttons, links, active states, pills)
//   slate-*   = surfaces, borders and grey text
//   emerald / amber / rose / violet / sky = status colours (success, warning,
//              danger, info) — kept as ramps, only re-lightened on dark themes.
//
// Dark themes additionally need one class rule, because a white card (bg-white)
// and white button text (text-white) read the same --color-white.
// ---------------------------------------------------------------------------

const SHADES = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];

// Colour ramps (Tailwind's palette, as hex so any browser renders them).
export const RAMPS = {
  blue: ["#eff6ff", "#dbeafe", "#bfdbfe", "#93c5fd", "#60a5fa", "#3b82f6", "#2563eb", "#1d4ed8", "#1e40af", "#1e3a8a", "#172554"],
  emerald: ["#ecfdf5", "#d1fae5", "#a7f3d0", "#6ee7b7", "#34d399", "#10b981", "#059669", "#047857", "#065f46", "#064e3b", "#022c22"],
  teal: ["#f0fdfa", "#ccfbf1", "#99f6e4", "#5eead4", "#2dd4bf", "#14b8a6", "#0d9488", "#0f766e", "#115e59", "#134e4a", "#042f2e"],
  violet: ["#f5f3ff", "#ede9fe", "#ddd6fe", "#c4b5fd", "#a78bfa", "#8b5cf6", "#7c3aed", "#6d28d9", "#5b21b6", "#4c1d95", "#2e1065"],
  indigo: ["#eef2ff", "#e0e7ff", "#c7d2fe", "#a5b4fc", "#818cf8", "#6366f1", "#4f46e5", "#4338ca", "#3730a3", "#312e81", "#1e1b4b"],
  amber: ["#fffbeb", "#fef3c7", "#fde68a", "#fcd34d", "#fbbf24", "#f59e0b", "#d97706", "#b45309", "#92400e", "#78350f", "#451a03"],
  rose: ["#fff1f2", "#ffe4e6", "#fecdd3", "#fda4af", "#fb7185", "#f43f5e", "#e11d48", "#be123c", "#9f1239", "#881337", "#4c0519"],
  slate: ["#f8fafc", "#f1f5f9", "#e2e8f0", "#cbd5e1", "#94a3b8", "#64748b", "#475569", "#334155", "#1e293b", "#0f172a", "#020617"],
  sky: ["#f0f9ff", "#e0f2fe", "#bae6fd", "#7dd3fc", "#38bdf8", "#0ea5e9", "#0284c7", "#0369a1", "#075985", "#0c4a6e", "#082f49"],
};

// Dark surfaces: page, card, recessed, line, bright text.
const DARK = {
  midnight: { page: "#060c17", card: "#0f1c30", soft: "#0b1524", line: "#1d2d45", text: "#f2f6fc", accent: "sky" },
  graphite: { page: "#0a0a0b", card: "#17181b", soft: "#121316", line: "#26282d", text: "#f4f5f7", accent: "slate" },
  aurora: { page: "#0a0714", card: "#18142f", soft: "#120e22", line: "#2a2450", text: "#f3f0fb", accent: "violet" },
};

export const THEMES = [
  { id: "classic", label: "Classic Blue", swatch: "#2563eb" },
  { id: "emerald", label: "Emerald", swatch: "#059669", accent: "emerald" },
  { id: "teal", label: "Ocean Teal", swatch: "#0d9488", accent: "teal" },
  { id: "violet", label: "Violet", swatch: "#7c3aed", accent: "violet" },
  { id: "indigo", label: "Indigo", swatch: "#4f46e5", accent: "indigo" },
  { id: "sky", label: "Sky", swatch: "#0284c7", accent: "sky" },
  { id: "rose", label: "Rose", swatch: "#e11d48", accent: "rose" },
  { id: "amber", label: "Amber", swatch: "#d97706", accent: "amber", deepen: true },
  { id: "mono", label: "Graphite Light", swatch: "#475569", accent: "slate" },
  { id: "midnight", label: "Midnight", swatch: "#0b1220", dark: true },
  { id: "graphite", label: "Graphite Dark", swatch: "#1a1a1d", dark: true },
  { id: "aurora", label: "Aurora Dark", swatch: "#241a45", dark: true },
];

export const DEFAULT_THEME = "classic";

export function themeById(id) {
  return THEMES.find(t => t.id === id) || THEMES[0];
}

const clamp = n => Math.max(0, Math.min(255, Math.round(n)));
function hex(c) {
  const v = c.replace("#", "");
  const s = v.length === 3 ? v.split("").map(x => x + x).join("") : v;
  return [parseInt(s.slice(0, 2), 16), parseInt(s.slice(2, 4), 16), parseInt(s.slice(4, 6), 16)];
}
// Blend two colours: t = 0 keeps `a`, t = 1 keeps `b`.
function mix(a, b, t) {
  const [x, y] = [hex(a), hex(b)];
  return "#" + [0, 1, 2].map(i => clamp(x[i] + (y[i] - x[i]) * t).toString(16).padStart(2, "0")).join("");
}
const WHITE = "#ffffff";

// The accent the app calls "blue" is re-pointed at another ramp.
function accentRamp(theme) {
  const ramp = RAMPS[theme.accent];
  if (!ramp) return null;
  // Amber is very light at its 600 tone; stepping the button shades one stop
  // deeper keeps white labels readable on them.
  return theme.deepen ? ramp.map((c, i) => i >= 5 && i <= 8 ? ramp[i + 1] : c) : ramp;
}

function accentVars(theme) {
  const ramp = accentRamp(theme);
  if (!ramp) return "";
  return SHADES.map((shade, i) => `--color-blue-${shade}:${ramp[i]};`).join("");
}

// On a dark theme every ramp is re-lightened: pale tints become tinted dark
// pills, and mid/deep tones are lifted so they stay readable on near-black.
function darkRampVars(name, ramp, dark) {
  return SHADES.map((shade, i) => {
    let value;
    if (shade <= 100) value = mix(dark.card, ramp[6], shade === 50 ? 0.16 : 0.24);
    else if (shade === 200) value = mix(dark.card, ramp[6], 0.38);
    else if (shade === 300) value = mix(dark.card, ramp[5], 0.5);
    else if (shade <= 600) value = mix(ramp[i], WHITE, 0.12);
    else if (shade <= 800) value = mix(ramp[i], WHITE, 0.28);
    else value = ramp[i];
    return `--color-${name}-${shade}:${value};`;
  }).join("");
}

function darkVars(dark, accentRamp) {
  return [
    `--background:${dark.page};`,
    `--foreground:${dark.text};`,
    `--color-slate-50:${dark.soft};`,
    `--color-slate-100:${dark.card};`,
    `--color-slate-200:${dark.line};`,
    `--color-slate-300:${dark.line};`,
    `--color-slate-400:#8ea3bd;`,
    `--color-slate-500:#a7b8cf;`,
    `--color-slate-600:#c3d0e1;`,
    `--color-slate-700:#dae4f1;`,
    darkRampVars("blue", accentRamp, dark),
    darkRampVars("emerald", RAMPS.emerald, dark),
    darkRampVars("amber", RAMPS.amber, dark),
    darkRampVars("rose", RAMPS.rose, dark),
    darkRampVars("violet", RAMPS.violet, dark),
    darkRampVars("sky", RAMPS.sky, dark),
    darkRampVars("indigo", RAMPS.indigo, dark),
  ].join("");
}

// bg-white and text-white share --color-white, and slate-900 is used both as
// primary text and as dark chip backgrounds — so those two need class rules
// instead of variable re-mapping.
function darkRules(id, dark) {
  return [
    `html[data-vl-theme="${id}"] body{background-color:${dark.page};color:${dark.text}}`,
    `html[data-vl-theme="${id}"] .bg-white,html[data-vl-theme="${id}"] .hover\\:bg-white:hover{background-color:${dark.card}}`,
    `html[data-vl-theme="${id}"] .text-slate-900,html[data-vl-theme="${id}"] .hover\\:text-slate-800:hover{color:${dark.text}}`,
    `html[data-vl-theme="${id}"] .text-slate-800{color:${dark.text}}`,
  ].join("");
}

// The sidebar, the profile banner and the report buttons are painted with three
// fixed navy classes. Every theme with an accent re-deepens them, so the brand
// surfaces follow the chosen colour instead of clashing with it.
function brandRules(id, ramp) {
  const sidebar = mix(ramp[8], "#000000", 0.42);
  const panel = mix(ramp[9], "#000000", 0.3);
  const hover = mix(ramp[9], WHITE, 0.18);
  return [
    `html[data-vl-theme="${id}"] .bg-\\[\\#1B2D5B\\]{background-color:${sidebar}}`,
    `html[data-vl-theme="${id}"] .bg-\\[\\#0F1E3D\\]{background-color:${panel}}`,
    `html[data-vl-theme="${id}"] .hover\\:bg-\\[\\#14224a\\]:hover{background-color:${hover}}`,
  ].join("");
}

/** The stylesheet for one theme ("" for the built-in look). */
export function themeCss(id) {
  const theme = themeById(id);
  if (theme.id === DEFAULT_THEME) return "";
  const selector = `html[data-vl-theme="${theme.id}"]`;
  if (!theme.dark) {
    const ramp = accentRamp(theme);
    if (!ramp) return "";
    return `${selector}{${accentVars(theme)}}${brandRules(theme.id, ramp)}`;
  }
  const dark = DARK[theme.id] || DARK.midnight;
  const accentRampForDark = RAMPS[dark.accent] || RAMPS.blue;
  return `${selector}{${darkVars(dark, accentRampForDark)}}${darkRules(theme.id, dark)}${brandRules(theme.id, accentRampForDark)}`;
}

/** Paint the theme (and remember it). Safe to call before React mounts. */
export function applyTheme(id) {
  const theme = themeById(id);
  document.documentElement.setAttribute("data-vl-theme", theme.id);
  let tag = document.getElementById("vl-theme-style");
  if (!tag) {
    tag = document.createElement("style");
    tag.id = "vl-theme-style";
    document.head.appendChild(tag);
  }
  tag.textContent = themeCss(theme.id);
  tag.disabled = theme.id === DEFAULT_THEME;
  try {
    localStorage.setItem("vl_theme", theme.id);
  } catch { /* private mode: the theme still applies for this visit */ }
  document.documentElement.style.colorScheme = theme.dark ? "dark" : "light";
  return theme.id;
}

export function storedTheme() {
  try {
    const id = localStorage.getItem("vl_theme");
    return THEMES.some(t => t.id === id) ? id : DEFAULT_THEME;
  } catch {
    return DEFAULT_THEME;
  }
}
