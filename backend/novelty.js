// Patent novelty screening engine.
// Analyzes a submitted patent claim against every other project on the platform
// (prior-art search), validates the patent number format, and checks that a
// proof document was attached. Returns a structured verdict the PatentBot
// chatbot renders and the investment gate enforces.

const STOPWORDS = new Set(("a an the and or of for to in on with by is are was were be been this that these those it its " + "as at from into over under using use used via new innovative platform system method process app application " + "solution tool software service based through between within without").split(" "));

function normalize(text) {
  return String(text || "").toLowerCase().replace(/[^a-z0-9\s]/g, " ").split(/\s+/).filter(w => w.length > 2 && !STOPWORDS.has(w));
}

function jaccard(a, b) {
  if (!a.length || !b.length) return 0;
  const setB = new Set(b);
  let inter = 0;
  for (const t of new Set(a)) if (setB.has(t)) inter++;
  return inter / (new Set(a).size + new Set(b).size - inter);
}

// Accepts common real-world formats, e.g.:
//   IN 202341012345, 202341012345, 1234/DEL/2015, US11456782B2, US 11,456,782
const PATENT_PATTERNS = [
  /^(IN\s?)?\d{12}$/i,                       // Indian application number (2023+ 12-digit)
  /^\d{1,4}\s?\/\s?[A-Z]{2,5}\s?\/\s?\d{4}(\/\d+)?$/i, // Indian old-style: 1234/DEL/2015
  /^US\s?\d{7,8}([A-Z]\d?)?$/i,             // US patent: US11456782B2
  /^US\s?\d{1,3}(,\d{3})+([A-Z]\d?)?$/i,    // US with comma grouping
  /^EP\s?\d{7}(\s?[A-Z]\d?)?$/i,            // European patent
  /^WO\s?\d{4}\/\d{6}$/i                    // PCT application
];

// Indian filing offices recognised by the Controller General of Patents.
const IN_OFFICES = ["DEL", "MUM", "KOL", "CAL", "CHE", "CHN", "BLR", "BANG", "PAT", "NOIDA", "AHM", "CHD", "GUW"];
const DIGIT_RUNS = ["0123456789", "0000000000", "1111111111", "2222222222", "3333333333", "4444444444", "5555555555", "6666666666", "7777777777", "8888888888", "9999999999", "9876543210"];

function filingYearPlausible(year) {
  const y = Number(year);
  const max = new Date().getFullYear() + 1; // a filing may be dated next January
  return Number.isFinite(y) && y >= 1990 && y <= max;
}

// Beyond the format match, a number must also be structurally possible: a real
// Indian application number begins with its filing year, an Indian old-style
// number names a real office, and a placeholder ("111111111111") is rejected.
function structuralCheck(value) {
  const digits = value.replace(/[^0-9]/g, "");
  if (DIGIT_RUNS.some(run => digits === run.slice(0, digits.length)) || new Set(digits).size <= 2) {
    return `Patent number "${value}" is a repeated or sequential digit string — no patent office issues such a number`;
  }
  if (/^(IN\s?)?\d{12}$/i.test(value)) {
    const year = value.replace(/^in\s*/i, "").slice(0, 4);
    if (!filingYearPlausible(year)) return `Patent number "${value}" encodes filing year ${year}, which is not a valid filing year`;
  }
  if (/^\d{1,4}\s?\/\s?[A-Z]{2,5}\s?\/\s?\d{4}/i.test(value)) {
    const parts = value.toUpperCase().split("/");
    const office = parts[1];
    const year = parts[2];
    if (!IN_OFFICES.includes(office)) return `Patent number "${value}" names filing office "${office}", which is not one of the Indian patent offices`;
    if (!filingYearPlausible(year)) return `Patent number "${value}" encodes filing year ${year}, which is not a valid filing year`;
  }
  return null;
}

export function validatePatentNumber(raw) {
  const value = String(raw || "").trim();
  if (!value) return { ok: false, reason: "No patent number provided" };
  if (/^(test|fake|dummy|sample|demo|xxxx|n\/?a|none|patent[- ]?\d+)/i.test(value)) {
    return { ok: false, reason: `Patent number "${value}" looks like a placeholder, not a real filing number` };
  }
  if (value.length < 6) return { ok: false, reason: `Patent number "${value}" is too short to be a filing number` };
  if (!PATENT_PATTERNS.some(p => p.test(value))) {
    return { ok: false, reason: `Patent number "${value}" does not match any recognised patent office format` };
  }
  const structural = structuralCheck(value);
  if (structural) return { ok: false, reason: structural };
  return { ok: true, reason: `Patent number "${value}" matches a recognised official format and its filing year and office check out` };
}

// `project`  : the submitted project being screened (must have patentNumber / patentProofName)
// `allOthers`: every other project on the platform (prior art pool)
export function screenNovelty(project, allOthers) {
  const reasons = [];
  const hardFails = [];
  const titleTokens = normalize(project.title);
  const descTokens = normalize(project.description);
  let score = 100;

  // --- Prior-art similarity search -----------------------------------------
  const matches = [];
  for (const other of allOthers) {
    if (!other || other.id === project.id) continue;
    const titleSim = jaccard(titleTokens, normalize(other.title));
    const descSim = jaccard(descTokens, normalize(other.description));
    const similarity = Math.max(titleSim, descSim * 0.8);
    if (similarity > 0.25) matches.push({ id: other.id, title: other.title, similarity: Math.round(similarity * 100) });
  }
  matches.sort((a, b) => b.similarity - a.similarity);

  if (matches.length === 0) {
    reasons.push({ level: "pass", text: "No similar prior work found on the platform — the claimed invention appears novel within our registry." });
  } else {
    const top = matches[0];
    if (top.similarity >= 70) {
      score -= 45;
      hardFails.push("claim");
      reasons.push({ level: "fail", text: `Strong overlap (${top.similarity}%) with existing project "${top.title}" — possible duplicate or derivative claim.` });
    } else if (top.similarity >= 45) {
      score -= 20;
      reasons.push({ level: "warn", text: `Moderate overlap (${top.similarity}%) with "${top.title}" — recommend a manual review of the claims.` });
    } else {
      score -= 5;
      reasons.push({ level: "warn", text: `Minor thematic similarity (${top.similarity}%) with "${top.title}" — below the duplication threshold.` });
    }
    if (matches.length > 1) reasons.push({ level: "info", text: `${matches.length} projects share some conceptual ground; only the closest match affects the score.` });
  }

  // --- Same patent number filed twice ---------------------------------------
  const claimNumber = String(project.patentNumber || "").trim();
  if (claimNumber) {
    const clash = allOthers.find(o => o && o.id !== project.id && String(o.patentNumber || "").trim() && String(o.patentNumber).trim().toUpperCase().replace(/\s+/g, "") === claimNumber.toUpperCase().replace(/\s+/g, ""));
    if (clash) {
      score -= 40;
      hardFails.push("number");
      reasons.push({ level: "fail", text: `Patent number "${claimNumber}" is already registered to project "${clash.title}" — one filing cannot back two different projects.` });
    } else {
      reasons.push({ level: "pass", text: "This patent number is not claimed by any other project in the registry." });
    }
  }

  // --- Patent number validation --------------------------------------------
  const patentCheck = validatePatentNumber(project.patentNumber);
  if (patentCheck.ok) reasons.push({ level: "pass", text: patentCheck.reason });
  else {
    score -= 30;
    hardFails.push("number");
    reasons.push({ level: "fail", text: patentCheck.reason });
  }

  // --- Proof of patent ------------------------------------------------------
  if (project.patentProofName || project.patentProofDataUrl) {
    reasons.push({ level: "pass", text: `Proof document attached (${project.patentProofName || "file"}).` });
  } else {
    score -= 25;
    hardFails.push("proof");
    reasons.push({ level: "fail", text: "No proof-of-patent document is attached to this submission." });
  }

  // --- Description substance -------------------------------------------------
  if (descTokens.length < 15) {
    score -= 10;
    reasons.push({ level: "warn", text: "The technical description is thin, which limits how deeply novelty can be assessed." });
  } else {
    reasons.push({ level: "pass", text: "Technical description is detailed enough for a meaningful prior-art comparison." });
  }

  score = Math.max(0, Math.min(100, score));
  // A claim that fails any verification gate cannot be cleared, whatever its
  // similarity score looks like — a fake or unproven patent must report as such.
  if (hardFails.length) score = Math.min(score, 49);
  const status = hardFails.length ? "flagged" : score >= 75 ? "cleared" : score >= 50 ? "review" : "flagged";
  const failed = [...new Set(hardFails)];
  if (failed.length) {
    reasons.push({ level: "info", text: `Verification blocked by: ${failed.map(k => k === "number" ? "patent number / proof of filing" : k === "proof" ? "missing proof document" : "prior-art overlap").join(", ")}.` });
  }
  return { status, score, reasons, matches: matches.slice(0, 3), verified: status === "cleared", blockedBy: failed };
}
