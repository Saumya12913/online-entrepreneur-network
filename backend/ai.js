// ---------------------------------------------------------------------------
// Pitch intelligence — deterministic, in-house text analysis.
//
// Two services, both computed from the project's own words and the platform's
// own records. No third-party model, no API key, nothing leaves the server:
//   reviewPitch()   — scores a pitch against what investors read for and
//                     assembles a tightened rewrite from the founder's facts.
//   summariseProject() — compresses a project into a one-liner, a fact sheet
//                     and a short brief.
// Every `label` returned here is a plain English phrase that the frontend
// renders as its own text node, so the UI translation layer can localise it;
// `value` carries only data (numbers, money, titles) that must not be changed.
// ---------------------------------------------------------------------------

const STOPWORDS = new Set(("a an the and or of for to in on with by is are was were be been this that these those it its " + "as at from into over under using use used via new our your their we they who which that's").split(" "));

const WORD_RE = /[A-Za-z][A-Za-z'-]*/g;

function tokens(text) {
  return (String(text || "").toLowerCase().match(WORD_RE) || []).filter(w => w.length > 2 && !STOPWORDS.has(w));
}

function words(text) {
  return String(text || "").match(WORD_RE) || [];
}

function sentences(text) {
  return String(text || "").split(/(?<=[.!?])\s+|\n+/).map(s => s.trim()).filter(Boolean);
}

const PROBLEM = /problem|pain|struggl|slow|costly|inefficien|manual|fragmented|lack|difficult|wait|barrier|expensive|hard to|unmet|no access|delay|error|fraud|under-?served|complicated/i;
const SOLUTION = /platform|app\b|application|api|model|algorithm|engine|dashboard|tool|system|service|marketplace|assistant|network|protocol|device|sensor|dataset|interface|chatbot|software|portal|sdk|browser|extension/i;
const AUDIENCE = /\bfor\b|patient|student|worker|farmer|nurse|clinic|hospital|business|smb|customer|user|teacher|driver|freelance|gig|retail|bank|insur|school|manufacturer|logistic|manufacturer|enterprise|consumer|employer|renter|traveler|traveller/i;
const DIFFERENCE = /unlike|versus|instead of|competitor|existing|traditional|legacy|faster|cheaper|reduc|cut\b|cuts\b|improv|increase|save|saves|double|tripl|\dx\b|\b\d+x/i;
const MOAT = /patent|proprietar|exclusiv|licens|copyright|trade secret|network effect|regulatory|certif|first-?mover|proprietary data/i;
const USE_OF_FUNDS = /hire|expand|scale|launch|manufactur|enter|open|certif|build|inventory|marketing|distribut|localis|localiz|pilot|roll ?out|series [a-e]|seed/i;
const FIGURE_RE = /\d[\d.,]*\s*(%|x\b|k\b|m\b|bn\b|million|billion|crore|lakh)|\$[\d.,]+\s*[kmb]?\b|\b\d[\d.,]*\s*(users|customers|revenue|schools|countries|cities|partners|orders|transactions|downloads|sessions|claims|beds|clinics|devices|tons|acres|stores)\b|mrr|arr|month[- ]over[- ]month|per month|yo|yoy/gi;
const JARGON = /synerg|disrupt|revolutionar|game-?changer|paradigm|next-?gen|cutting-?edge|seamless|holistic|leverage|empower|innovative solution|state-?of-the-art|world-?class|disruption/i;

const check = (key, value, state, weight) => ({ label: key, value, state, weight });

// ---------------------------------------------------------------------------
// Pitch review
// ---------------------------------------------------------------------------
export function reviewPitch(project, ctx = {}) {
  const { milestones = [], team = [], documents = [], owner = null, lifecycle = null, investments = [] } = ctx;
  const pitch = String(project.description || "").trim();
  const wc = words(pitch).length;
  const sents = sentences(pitch);
  const avgSent = sents.length ? Math.round(wc / sents.length) : 0;
  const figures = [...new Set((pitch.match(FIGURE_RE) || []).map(f => f.trim().replace(/\s+/g, " ")).filter(Boolean))];
  const jargon = (pitch.match(new RegExp(JARGON, "gi")) || []).length;
  const raised = investments.reduce((s, i) => s + (Number(i.amount) || 0), 0);

  const checks = [];

  checks.push(wc < 18
    ? check("The pitch is too short to carry the details", String(wc), "fail", 10)
    : wc <= 120
      ? check("Length is easy to read in one pass", String(wc), "pass", 0)
      : wc <= 200
        ? check("Runs long for a first read", String(wc), "warn", 4)
        : check("Longer than most investors read", String(wc), "warn", 8));

  checks.push(PROBLEM.test(pitch)
    ? check("Names the problem it solves", "", "pass", 0)
    : check("The problem being solved is not stated", "", "fail", 10));

  checks.push(SOLUTION.test(pitch)
    ? check("Explains how the solution works", "", "pass", 0)
    : check("The mechanism of the solution is missing", "", "fail", 10));

  checks.push(AUDIENCE.test(pitch)
    ? check("Identifies who the product serves", "", "pass", 0)
    : check("No reader is named — who pays for this?", "", "fail", 8));

  checks.push(figures.length >= 2
    ? check("Quantified traction figures", String(figures.length), "pass", 0)
    : figures.length === 1
      ? check("Only one supporting number", String(figures.length), "warn", 4)
      : check("No traction numbers at all", "0", "fail", 12));

  checks.push(DIFFERENCE.test(pitch)
    ? check("Says what it does better than the status quo", "", "pass", 0)
    : check("Nothing sets it apart from existing options", "", "warn", 6));

  checks.push(MOAT.test(pitch) || project.patented
    ? check("Defensibility is on the record", project.patented ? project.patentNumber || "" : "", "pass", 0)
    : check("No moat described", "", "warn", 6));

  checks.push(Number(project.fundingRequired) > 0
    ? USE_OF_FUNDS.test(pitch)
      ? check("The raise is explained", "", "pass", 0)
      : check("Say what this round pays for", "", "warn", 4)
    : check("No funding target is set", "", "warn", 4));

  if (jargon > 2) checks.push(check("Too many buzzwords, not enough evidence", String(jargon), "warn", 6));
  if (avgSent > 30) checks.push(check("Sentences run long", String(avgSent), "warn", 4));

  const done = milestones.filter(m => m && m.done).length;
  checks.push(milestones.length
    ? check("Milestones back the pitch", `${done} / ${milestones.length}`, "pass", 0)
    : check("No milestones recorded", "0", "warn", 4));
  checks.push(team.length ? check("The team is listed", String(team.length), "pass", 0) : check("No team is listed", "0", "warn", 4));
  checks.push(documents.length || project.fileName ? check("A document supports the claims", String(documents.length + (project.fileName ? 1 : 0)), "pass", 0) : check("No pitch deck attached", "0", "warn", 4));

  const lost = checks.reduce((s, c) => s + c.weight, 0);
  const score = Math.max(18, Math.min(96, 96 - lost));
  const verdict = score >= 78 ? "strong" : score >= 55 ? "workable" : "thin";

  return {
    projectId: project.id,
    title: project.title,
    score,
    verdict,
    checks,
    strengths: checks.filter(c => c.state === "pass"),
    gaps: checks.filter(c => c.state !== "pass"),
    rewrite: rewritePitch(project, { pitch, figures, owner, lifecycle, investments, raised }),
    headline: `${project.title} — ${project.industry || "venture"}`,
    keywords: topKeywords([project.title, project.industry, pitch]),
    facts: { words: wc, sentences: sents.length, figures: figures.length, jargon, avgSentence: avgSent, raised }
  };
}

function clause(pitch, re) {
  const s = sentences(pitch).find(x => re.test(x));
  return s ? s.replace(/\s+/g, " ").trim().replace(/[.!?]$/, "") : null;
}

// Assembled only from what the founder already wrote and what the platform
// already knows — it is a tightened arrangement, not invented claims.
function rewritePitch(project, { pitch, figures, owner, lifecycle, raised }) {
  const said = text => {
    const t = String(text || "").replace(/\s+/g, " ").trim().replace(/[.]+$/, "");
    return t ? `${t}.` : "";
  };
  const who = AUDIENCE.test(pitch) ? clause(pitch, AUDIENCE) : null;
  const what = clause(pitch, SOLUTION) || sentences(pitch)[0] || "";
  const why = clause(pitch, PROBLEM);
  const vs = clause(pitch, DIFFERENCE);
  const funds = clause(pitch, USE_OF_FUNDS);
  const parts = [];
  const add = text => {
    const s = said(text);
    if (!s) return;
    // The founder's problem and solution often land in the same sentence.
    const head = s.slice(0, 42).toLowerCase();
    if (parts.some(p => p.slice(0, 42).toLowerCase() === head)) return;
    parts.push(s);
  };
  if (why) add(`${why.split(/[;,]/)[0].trim().replace(/^(the |a |an )/i, "")} is the problem this venture takes on`);
  add(what || `${project.title} is a ${String(project.industry || "venture").toLowerCase()} venture`);
  if (vs) add(vs);
  if (who) add(who);
  add(figures.length
    ? `Progress on the record: ${figures.slice(0, 3).join(", ")}${project.fundingRequired ? ` — raising ${formatMoney(project.fundingRequired)}, ${formatMoney(raised)} already in` : ""}`
    : `Progress on the record: ${formatMoney(raised)} raised${project.fundingRequired ? `, target ${formatMoney(project.fundingRequired)}` : ""}. Add your strongest number — revenue, users, retention or cost saved`);
  add(project.patented
    ? `Defensibility: patent ${project.patentNumber || "on file"}${project.noveltyStatus === "cleared" ? ", novelty verified against the platform registry" : ", verification pending"}`
    : "Defensibility is not documented yet — a patent filing, exclusive data or a regulatory head start is the cheapest way to de-risk this round");
  if (funds) add(funds);
  else if (project.fundingRequired) add(`The round funds the next milestone${lifecycle ? ` on the way to ${lifecycleLabel(lifecycle)}` : ""}: name the two or three things the money buys`);
  add(`Led by ${owner ? owner.name : "the founder"}${owner && owner.company ? `, ${owner.company}` : ""}`);
  return parts.join(" ");
}

const STAGE_LABEL = { idea: "Idea", prototype: "Prototype", mvp: "MVP", launched: "Launched", scaling: "Scaling", funded: "Funded" };
function lifecycleLabel(stage) {
  return STAGE_LABEL[String(stage || "").toLowerCase()] || String(stage || "");
}

function topKeywords(texts) {
  const freq = new Map();
  for (const w of tokens(texts.join(" "))) freq.set(w, (freq.get(w) || 0) + 1);
  return [...freq.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).slice(0, 6).map(([w]) => w);
}

export function formatMoney(n) {
  const v = Number(n) || 0;
  if (!v) return "$0";
  const trim = x => String(Number(x.toFixed(2)));
  if (v >= 1e6) return `$${trim(v / 1e6)}M`;
  if (v >= 1e3) return `$${trim(v / 1e3)}K`;
  return `$${v.toLocaleString("en-US")}`;
}

// ---------------------------------------------------------------------------
// Project summary
// ---------------------------------------------------------------------------
export function summariseProject(project, ctx = {}) {
  const { milestones = [], team = [], documents = [], investments = [], owner = null, lifecycle = null, viewers = [] } = ctx;
  const pitch = String(project.description || "");
  const done = milestones.filter(m => m && m.done).length;
  const raised = investments.reduce((s, i) => s + (Number(i.amount) || 0), 0);
  const sought = Number(project.fundingRequired) || 0;
  const pct = sought ? Math.min(100, Math.round(raised / sought * 100)) : 0;
  const backers = new Set(investments.map(i => i.investorId)).size;
  const stage = lifecycleLabel(lifecycle || "");
  const fileCount = documents.length + (project.fileName ? 1 : 0);

  const facts = [
    { label: "Sector", value: project.industry || "" },
    { label: "Stage", value: stage },
    { label: "Raised", value: formatMoney(raised) },
    { label: "Round size", value: sought ? formatMoney(sought) : "" },
    { label: "Funded", value: sought ? `${pct}%` : "" },
    { label: "Backers", value: backers ? String(backers) : "" },
    { label: "Milestones done", value: milestones.length ? `${done} / ${milestones.length}` : "" },
    { label: "Team", value: team.length ? String(team.length) : "" },
    { label: "Documents", value: fileCount ? String(fileCount) : "" },
    { label: "Patent", value: project.patented ? project.patentNumber || "" : "" },
    { label: "Views", value: viewers.length ? String(viewers.length) : "" }
  ].filter(f => f.value !== "");

  const oneLiner = [project.title, project.industry, AUDIENCE.test(pitch) ? "built for named users" : "still to name its users"].filter(Boolean).join(" — ");
  const opener = sentences(pitch)[0] || `${project.title} is a ${String(project.industry || "").toLowerCase()} venture`;

  const paragraph = [
    said`${oneLiner}`,
    said`${opener}`,
    said`${formatMoney(raised)} raised${sought ? ` against a ${formatMoney(sought)} target, ${pct}% funded` : ""}, with ${backers} backer${backers === 1 ? "" : "s"}${stage ? ` at the ${stage} stage` : ""}`,
    project.patented ? said`A patent is claimed${project.patentNumber ? ` (${project.patentNumber})` : ""}${project.noveltyStatus === "cleared" ? " and the platform's novelty screen has cleared it" : ""}` : said`No patent is claimed on this project`,
    said`${team.length ? `A team of ${team.length}` : "No team members are listed yet"}${milestones.length ? `, ${done} of ${milestones.length} milestones done` : ""}${fileCount ? `, ${fileCount} document${fileCount === 1 ? "" : "s"} shared` : ""}`
  ].join(" ");

  return {
    projectId: project.id,
    title: project.title,
    oneLiner,
    paragraph,
    facts,
    keywords: topKeywords([project.title, project.industry, pitch]),
    status: project.status || ""
  };
}

function said(strings, ...values) {
  const text = String(typeof strings === "string" ? strings : strings.reduce((acc, s, i) => acc + (i ? String(values[i - 1] ?? "") : "") + s, "")).replace(/\s+/g, " ").trim().replace(/[.]+$/, "");
  return text ? `${text}.` : "";
}
