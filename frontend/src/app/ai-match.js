// Explainable project <-> investor matching.
//
// Every point in a score below is traceable to a field that already exists on the
// platform (a profile, a project, an investment, a posted requirement), so the UI can
// always show *why* a match was suggested. No randomness, no hidden model: the same
// inputs always produce the same fit %, which is what makes the number auditable.

export const MATCH_BUCKETS = [{
  key: "sector",
  label: "Sector overlap",
  max: 34
}, {
  key: "ticket",
  label: "Check size",
  max: 24
}, {
  key: "stage",
  label: "Stage fit",
  max: 16
}, {
  key: "defensibility",
  label: "Defensibility",
  max: 12
}, {
  key: "momentum",
  label: "Deal momentum",
  max: 10
}, {
  key: "network",
  label: "Network & location",
  max: 4
}];

const EARLY = ["pre-seed", "preseed", "seed", "angel"];
const MID = ["series a", "series b", "growth"];
const LATE = ["series c", "series d", "late stage", "pe", "buyout"];

function norm(text) {
  return String(text || "").toLowerCase();
}

// "$2M - $15M" / "$50K - $500K" -> { min, max } in dollars.
export function parseMoneyRange(text) {
  const nums = String(text || "").match(/\d+(?:\.\d+)?\s*[km]?/gi) || [];
  const values = nums.map(part => {
    const m = part.match(/^(\d+(?:\.\d+)?)\s*([km]?)/i);
    if (!m) return 0;
    const n = parseFloat(m[1]);
    const unit = norm(m[2]);
    return unit === "m" ? n * 1e6 : unit === "k" ? n * 1e3 : n;
  }).filter(v => v > 0);
  if (!values.length) return null;
  return {
    min: Math.min(...values),
    max: Math.max(...values)
  };
}

function stageBandsOf(investor) {
  // The investor's own words are the most honest source of stage preference:
  // the free-text bio and the investment range both name the stages they write.
  const haystack = `${norm(investor.bio)} ${norm(investor.agreementPolicy)} ${norm(investor.investmentRange)}`;
  const bands = new Set();
  if (EARLY.some(k => haystack.includes(k))) bands.add("early");
  if (MID.some(k => haystack.includes(k))) bands.add("mid");
  if (LATE.some(k => haystack.includes(k))) bands.add("late");
  return bands;
}

function projectStageBand(project, stageKey) {
  const stage = norm(stageKey || project.lifecycle || "");
  if (stage.includes("idea") || stage.includes("prototype")) return "early";
  if (stage.includes("mvp") || stage.includes("launched")) return "early";
  if (stage.includes("scaling")) return "mid";
  if (stage.includes("funded")) return "mid";
  const status = norm(project.status);
  if (status === "funded") return "mid";
  if (status === "in_talks") return "mid";
  return "early";
}

function industryList(userLike) {
  return Array.isArray(userLike?.industry) ? userLike.industry : [];
}

function sharedValues(a, b) {
  const left = new Set((a || []).map(norm).filter(Boolean));
  return (b || []).filter(v => left.has(norm(v)));
}

// Why an investor and a project fit — and, just as importantly, what is missing.
export function scoreMatch(investor, project, ctx = {}) {
  const {
    investments = [],
    requirements = [],
    users = [],
    stageOf = null,
    noveltyOf = null
  } = ctx;
  const lifecycleStage = stageOf ? stageOf(project) : null;
  const noveltyCleared = noveltyOf ? noveltyOf(project) : false;
  const reasons = [];
  const gaps = [];
  let score = 0;

  // --- Sector overlap -------------------------------------------------------
  const owner = users.find(u => u.id === project.ownerId);
  const sectors = industryList(investor);
  const directHit = sharedValues(sectors, [project.industry]);
  const ownerHit = sharedValues(sectors, industryList(owner));
  const reqHit = requirements.filter(r => r.investorId === investor.id).flatMap(r => sharedValues([r.industry], [project.industry]));
  // A reason is always { label, value }: the label is a fixed English phrase the UI
  // looks up in the 13-language catalogue, and value is data (a sector, a cheque
  // range) that stays exactly as the member wrote it — same rule as bios and skills.
  if (directHit.length) {
    score += 34;
    reasons.push({
      bucket: "sector",
      label: "Invests in",
      value: directHit[0]
    });
  } else if (reqHit.length) {
    score += 28;
    reasons.push({
      bucket: "sector",
      label: "Matches your requirement in",
      value: reqHit[0]
    });
  } else if (ownerHit.length) {
    score += 20;
    reasons.push({
      bucket: "sector",
      label: "Founder works in",
      value: ownerHit[0]
    });
  } else {
    gaps.push({
      bucket: "sector",
      label: "Outside your sectors",
      value: sectors.slice(0, 2).join(", ")
    });
  }

  // --- Check size -----------------------------------------------------------
  const range = parseMoneyRange(investor.investmentRange);
  const sought = Number(project.fundingRequired) || 0;
  if (range && sought) {
    if (sought >= range.min && sought <= range.max) {
      score += 24;
      reasons.push({
        bucket: "ticket",
        label: "Round size fits",
        value: investor.investmentRange
      });
    } else if (sought > range.max) {
      score += 4;
      gaps.push({
        bucket: "ticket",
        label: "Above your range of",
        value: investor.investmentRange
      });
    } else {
      score += 12;
      gaps.push({
        bucket: "ticket",
        label: "Smaller than your range of",
        value: investor.investmentRange
      });
    }
  } else if (sought) {
    // No stated range: fall back on the sizes this investor has actually written.
    const written = investments.filter(i => i.investorId === investor.id).map(i => Number(i.amount) || 0).filter(Boolean);
    if (written.length) {
      const avg = written.reduce((s, v) => s + v, 0) / written.length;
      const ratio = sought / avg;
      if (ratio >= 0.4 && ratio <= 3) {
        score += 24;
        reasons.push({
          bucket: "ticket",
          label: "Close to the cheques you have already written"
        });
      } else {
        score += 8;
        gaps.push({
          bucket: "ticket",
          label: "Round size differs from your usual cheque"
        });
      }
    }
  }

  // --- Stage fit ------------------------------------------------------------
  const bands = stageBandsOf(investor);
  const band = projectStageBand(project, lifecycleStage);
  if (bands.size) {
    if (bands.has(band)) {
      score += 16;
      reasons.push({
        bucket: "stage",
        label: band === "early" ? "Writes early-stage deals" : band === "mid" ? "Active at growth stage" : "Late-stage specialist"
      });
    } else {
      gaps.push({
        bucket: "stage",
        label: "Different stage from your usual deals"
      });
    }
  } else {
    score += 8;
  }

  // --- Defensibility --------------------------------------------------------
  if (project.patented) {
    score += 12;
    reasons.push({
      bucket: "defensibility",
      label: noveltyCleared ? "Patent novelty verified" : "Claims a patent"
    });
  } else {
    gaps.push({
      bucket: "defensibility",
      label: "No patent filed yet"
    });
  }

  // --- Deal momentum --------------------------------------------------------
  const backers = investments.filter(i => i.projectId === project.id);
  if (backers.length) {
    score += Math.min(10, backers.length * 5);
    reasons.push({
      bucket: "momentum",
      label: "Other backers on this round",
      value: String(backers.length)
    });
  }
  const traction = /\$\s?\d|[\d.]+\s?(m|k)\b|\d+\s?(%|mo mrr|users|customers|learners)/i.exec(String(project.description || ""));
  if (traction) {
    score += 5;
    reasons.push({
      bucket: "momentum",
      label: "Traction numbers in the pitch"
    });
  }

  // --- Network & location ---------------------------------------------------
  const cityOf = loc => String(loc || "").split(",")[0].trim();
  if (owner && investor.id === owner.id) {
    gaps.push({
      bucket: "network",
      label: "This is your own project"
    });
  } else if (owner && (owner.connections || []).includes(investor.id)) {
    score += 4;
    reasons.push({
      bucket: "network",
      label: "You are already connected with the founder"
    });
  } else if (owner && cityOf(owner.location) && cityOf(owner.location) === cityOf(investor.location)) {
    score += 3;
    reasons.push({
      bucket: "network",
      label: "Same city",
      value: cityOf(investor.location)
    });
  }

  const raised = backers.reduce((s, i) => s + (Number(i.amount) || 0), 0);
  const pctFunded = sought ? Math.min(100, Math.round(raised / sought * 100)) : 0;
  return {
    score: Math.max(5, Math.min(98, Math.round(score + pctFunded * 0.1))),
    reasons: reasons.slice(0, 5),
    gaps: gaps.slice(0, 3),
    facts: {
      raised,
      sought,
      pctFunded,
      backers: backers.length,
      stageBand: band
    }
  };
}

// Rank projects for one investor (or one project's worth of investors).
export function rankProjectsForInvestor(investor, projects, ctx) {
  return projects.filter(p => p.ownerId !== investor.id).map(p => ({
    project: p,
    ...scoreMatch(investor, p, ctx)
  })).sort((a, b) => b.score - a.score || a.project.title.localeCompare(b.project.title));
}

export function rankInvestorsForProject(project, investors, ctx) {
  return investors.map(inv => ({
    investor: inv,
    ...scoreMatch(inv, project, ctx)
  })).sort((a, b) => b.score - a.score || a.investor.name.localeCompare(b.investor.name));
}

// A short, factual sentence a founder can put in front of an investor.
export function matchSummary(match) {
  if (!match.reasons.length) return match.gaps.map(g => g.label).join(" · ");
  return match.reasons.map(r => r.label).join(" · ");
}
