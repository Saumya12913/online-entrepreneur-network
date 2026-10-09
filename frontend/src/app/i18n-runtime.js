// ---------------------------------------------------------------------------
// UI translation runtime.
//
// The phrase catalogue (see i18n.js + i18n-catalog-*.js) maps English UI strings
// to 12 other languages. This module applies it to the *rendered* interface:
// every text node and every placeholder/title/alt the app paints is looked up
// and swapped, and a MutationObserver keeps newly rendered screens translated.
// Strings the catalogue doesn't know — a founder's bio, a project name, an
// email, a patent number — are left exactly as written, and numbers survive the
// swap through "#"-templates and sibling-node joining.
// ---------------------------------------------------------------------------

import { applyNames } from "./i18n-names.js";

const ATTRS = ["placeholder", "title", "alt", "aria-label"];
const NUM_RUN = /\d[\d.,]*/g;
const SKIP_TAGS = new Set(["SCRIPT", "STYLE", "TEXTAREA", "TITLE", "NOSCRIPT"]);

let phraseIndex = null;
let columnFor = null;

function normalise(value) {
  return String(value == null ? "" : value).replace(/\s+/g, " ").trim();
}

// Build once: exact phrase table + a table for strings containing numbers.
export function buildIndex(rows, columns) {
  columnFor = columns;
  const exact = new Map();
  const templates = new Map();
  for (const cells of rows) {
    if (!Array.isArray(cells) || cells.length !== columns.length) continue;
    const en = normalise(cells[0]);
    if (!en) continue;
    // "#" in the English key marks a label that carries a live number.
    if (en.includes("#") || /\d/.test(en)) templates.set(en.replace(NUM_RUN, "#"), cells);
    else if (!exact.has(en)) exact.set(en, cells);
  }
  phraseIndex = { exact, templates };
  return phraseIndex;
}

function cellsFor(text) {
  if (!phraseIndex) return null;
  const hit = phraseIndex.exact.get(text);
  if (hit) return hit;
  if (/\d/.test(text)) return phraseIndex.templates.get(text.replace(NUM_RUN, "#")) || null;
  return null;
}

/** Translate one English UI string; returns the input unchanged when unknown. */
export function translateText(text, lang) {
  if (!lang || lang === "en") return text;
  const trimmed = normalise(text);
  let out = text;
  // 1. the interface phrase, when the catalogue knows it
  const cells = trimmed && phraseIndex ? cellsFor(trimmed) : null;
  if (cells) {
    const col = columnFor.indexOf(lang);
    const target = col > 0 ? cells[col] : null;
    if (target && normalise(target) !== trimmed) {
      out = target;
      if (out.includes("#")) {
        const numbers = trimmed.match(NUM_RUN) || [];
        let i = 0;
        out = out.replace(/#/g, () => numbers[i++] ?? "");
      }
      const lead = /^[\s]*/.exec(text)[0];
      const trail = /[\s]*$/.exec(text)[0];
      out = lead + out + (trail && !out.endsWith(trail) ? trail : "");
    }
  }
  // 2. member names, which are never catalogue phrases
  return applyNames(out, lang);
}

// Node bookkeeping so switching languages back and forth never loses the
// English source React originally rendered.
const SOURCE = new WeakMap(); // text node -> English text we translated from
const WRITTEN = new WeakMap(); // node/attr holder -> last value we wrote
const JOINED = new WeakMap(); // element -> original texts of its text children
const ATTR_SOURCE = new WeakMap(); // element -> {attr: English value}

function currentSource(node) {
  return SOURCE.has(node) && node.nodeValue === WRITTEN.get(node) ? SOURCE.get(node) : node.nodeValue;
}

function writeText(node, value, source) {
  if (node.nodeValue === value) return;
  SOURCE.set(node, source);
  WRITTEN.set(node, value);
  node.nodeValue = value;
}

function translateAttributes(el, lang) {
  let store = ATTR_SOURCE.get(el);
  for (const attr of ATTRS) {
    const rendered = el.getAttribute && el.getAttribute(attr);
    if (rendered == null) continue;
    if (!store) store = {};
    const source = store[attr] !== undefined && rendered === (WRITTEN.get(el) || {})[attr] ? store[attr] : rendered;
    const out = translateText(source, lang);
    if (out !== rendered) {
      store[attr] = source;
      const written = WRITTEN.get(el) || {};
      written[attr] = out;
      WRITTEN.set(el, written);
      el.setAttribute(attr, out);
    }
  }
  if (store && !ATTR_SOURCE.has(el)) ATTR_SOURCE.set(el, store);
}

function skippable(el) {
  if (!el || el.nodeType !== 1) return true;
  if (SKIP_TAGS.has(el.tagName)) return true;
  return !!el.closest('[data-vl-i18n="off"]');
}

/** Translate the text of one element container (its direct text children). */
function translateContainer(el, lang) {
  if (skippable(el)) return;
  translateAttributes(el, lang);
  const kids = [];
  for (const child of el.childNodes) if (child.nodeType === 3) kids.push(child);
  if (!kids.length) return;

  const saved = JOINED.get(el);
  const allText = kids.length === el.childNodes.length;
  const sources = kids.map((node, i) => {
    if (saved && saved.length === kids.length && node.nodeValue === WRITTEN.get(node)) return saved[i];
    return currentSource(node);
  });

  // "5 project(s) found" arrives as several sibling text nodes; translating the
  // joined string keeps word order right for languages that put the number last.
  if (lang !== "en" && allText && kids.length > 1) {
    const joined = sources.join("");
    const out = translateText(joined, lang);
    if (out !== joined) {
      const rebuilt = kids.map((_, i) => (i === 0 ? out : ""));
      kids.forEach((node, i) => writeText(node, rebuilt[i], sources[i]));
      JOINED.set(el, sources);
      return;
    }
    if (saved) {
      kids.forEach((node, i) => writeText(node, saved[i], saved[i]));
      JOINED.delete(el);
    }
  }

  kids.forEach((node, i) => {
    const source = sources[i];
    const out = translateText(source, lang);
    if (out !== source) writeText(node, out, source);
    else if (SOURCE.has(node) && node.nodeValue !== source) writeText(node, source, source);
  });
}

function subtreeElements(root) {
  const list = [];
  if (root.nodeType === 1) list.push(root);
  if (!document.createTreeWalker || root.nodeType !== 1) return list;
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT);
  let node = walker.nextNode();
  while (node) {
    list.push(node);
    node = walker.nextNode();
  }
  return list;
}

/** Translate everything currently rendered under `root`. */
export function translateNow(root, lang) {
  if (!root) return;
  subtreeElements(root).forEach(el => translateContainer(el, lang));
}

/**
 * Keep `root` translated into `lang`. Returns a stop() function so React can
 * clean the observer up — switching language simply restarts it, which also
 * re-translates everything already on screen.
 */
export function startUiTranslator(root, lang) {
  if (!root || typeof MutationObserver === "undefined") return () => {};
  translateNow(root, lang);
  if (lang !== "en" && document.documentElement) document.documentElement.lang = lang;
  if (lang === "en" && document.documentElement && document.documentElement.lang !== "en") {
    document.documentElement.lang = "en";
  }

  const pending = new Set();
  let frame = 0;
  let timer = 0;
  const flush = () => {
    frame = 0;
    timer = 0;
    const work = [...pending];
    pending.clear();
    for (const target of work) {
      if (!target.isConnected) continue;
      if (target.nodeType === 3) {
        const el = target.parentElement;
        if (el) translateContainer(el, lang);
      } else if (target.nodeType === 1) {
        if (SKIP_TAGS.has(target.tagName)) continue;
        translateContainer(target, lang);
        if (target.childNodes.length) subtreeElements(target).forEach(el => translateContainer(el, lang));
      }
    }
  };
  const schedule = node => {
    pending.add(node);
    if (frame || timer) return;
    // An app tab that is not in the foreground never gets an animation frame,
    // so the timer is what keeps screens translated while the user reads them.
    frame = requestAnimationFrame(flush);
    timer = setTimeout(flush, 32);
  };

  const observer = new MutationObserver(records => {
    for (const record of records) {
      if (record.type === "characterData") {
        const node = record.target;
        if (node.nodeValue === WRITTEN.get(node)) continue; // our own write
        schedule(node.parentElement);
      } else if (record.type === "attributes") {
        if (record.target.nodeType !== 1) continue;
        const written = (WRITTEN.get(record.target) || {})[record.attributeName];
        if (written !== undefined && record.target.getAttribute(record.attributeName) === written) continue;
        schedule(record.target);
      } else {
        record.addedNodes.forEach(schedule);
      }
    }
  });
  observer.observe(root, {
    childList: true,
    subtree: true,
    characterData: true,
    attributes: true,
    attributeFilter: ATTRS
  });
  return () => {
    if (frame) cancelAnimationFrame(frame);
    if (timer) clearTimeout(timer);
    observer.disconnect();
  };
}
