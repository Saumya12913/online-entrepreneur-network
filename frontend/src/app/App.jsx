import { useState, useRef, useEffect } from "react";
import { Home, Search, Users, MessageCircle, Video, User, LogOut, Plus, Send, X, Check, MapPin, Edit2, Save, Calendar, Globe, TrendingUp, Menu, Bell, Clock, Zap, CheckCircle, UserPlus, Building2, Wallet, ChevronLeft, Briefcase, DollarSign, Link2, Star, ShieldCheck, ChevronRight, Filter, Trash2 } from "./icons";
import { loadState, saveCollection, apiLogin, apiRegister, apiMe, apiOauthDemo, apiNoveltyCheck, apiAdminStats, startGoogleLogin, takeOauthTokenFromUrl, takeOauthErrorFromUrl, getToken, setToken } from "../api.js";
import { UI_LANGS, enableUiLanguage } from "./i18n.js";

// ======================== TYPES ========================

// ======================== SEED DATA ========================
const initialUsers = [{
  id: "u1",
  name: "Sarah Chen",
  email: "sauEntrepreneur@nec.edu.in",
  password: "123",
  role: "entrepreneur",
  bio: "Serial entrepreneur building the future of financial inclusion. Previously co-founded two fintech startups with successful exits. Passionate about AI-powered financial services for the underbanked. NovaPay is processing $2M+ in transactions monthly.",
  location: "San Francisco, CA",
  industry: ["FinTech", "AI/ML", "Financial Services"],
  skills: ["Product Strategy", "Fundraising", "Team Building", "Go-to-Market"],
  company: "NovaPay",
  position: "Co-Founder & CEO",
  fundingStage: "Series A",
  experience: "8 years",
  website: "novapay.io",
  linkedin: "linkedin.com/in/sarahchen",
  connections: ["u2", "u5"],
  pendingReceived: ["u3"],
  pendingSent: [],
  joinedDate: "2024-01-15",
  verified: true
}, {
  id: "u2",
  name: "Michael Okafor",
  email: "sauInvestor@nec.edu.in",
  password: "123",
  role: "investor",
  bio: "Partner at Apex Ventures with a focus on Series A/B investments in FinTech, HealthTech, and Enterprise SaaS. Board member at 6 portfolio companies. Former Goldman Sachs investment banker with 14 years of deal experience.",
  location: "New York, NY",
  industry: ["FinTech", "HealthTech", "Enterprise SaaS"],
  skills: ["Due Diligence", "Board Advisory", "Portfolio Management", "M&A"],
  company: "Apex Ventures",
  position: "General Partner",
  investmentRange: "$2M - $15M",
  portfolioCompanies: 24,
  agreementPolicy: "Apex Ventures invests via preferred equity or convertible notes. Standard terms: 1x non-participating liquidation preference, pro-rata rights in subsequent rounds, and a board observer seat for investments above $5M. Founders must provide a data room with financials, cap table, and IP assignment documentation before term sheet issuance. All submissions are reviewed within 10 business days.",
  experience: "14 years",
  website: "apexventures.com",
  linkedin: "linkedin.com/in/michaelokafor",
  connections: ["u1", "u4"],
  pendingReceived: [],
  pendingSent: ["u6"],
  joinedDate: "2024-01-10",
  verified: true
}, {
  id: "u3",
  name: "Alex Rivera",
  email: "sauFreelancer@nec.edu.in",
  password: "123",
  role: "freelancer",
  bio: "Full-stack developer with 7 years building scalable web applications. React, Node.js, and AWS specialist. Built products used by 2M+ users. Available for short and long-term engagements with fast turnaround.",
  location: "Austin, TX",
  industry: ["Software Development", "Web3", "SaaS"],
  skills: ["React", "Node.js", "TypeScript", "AWS", "PostgreSQL", "GraphQL"],
  company: "Self-Employed",
  position: "Full-Stack Developer",
  hourlyRate: "$120/hr",
  availableFor: "Contract & Project-based",
  experience: "7 years",
  website: "alexrivera.dev",
  linkedin: "linkedin.com/in/alexrivera",
  connections: [],
  pendingReceived: [],
  pendingSent: ["u1"],
  joinedDate: "2024-02-01",
  verified: false
}, {
  id: "u4",
  name: "Priya Sharma",
  email: "sauStartup@nec.edu.in",
  password: "123",
  role: "startup_founder",
  bio: "Building the next generation of personalized healthcare. CareConnect uses AI to match patients with the right specialists, cutting wait times by 60%. Ex-Google PM. Forbes 30 Under 30. Currently raising $5M Seed round.",
  location: "Boston, MA",
  industry: ["HealthTech", "AI/ML", "Consumer Health"],
  skills: ["Product Management", "Healthcare Ops", "AI Strategy", "Fundraising"],
  company: "CareConnect",
  position: "Founder & CEO",
  fundingStage: "Seed",
  companyDetails: {
    founded: "2022",
    headquarters: "Boston, MA, USA",
    teamSize: "12 employees",
    registrationNumber: "US-MA-8821340"
  },
  experience: "5 years",
  website: "careconnect.health",
  linkedin: "linkedin.com/in/priyasharma",
  connections: ["u2"],
  pendingReceived: ["u5"],
  pendingSent: [],
  joinedDate: "2024-01-20",
  verified: true
}, {
  id: "u5",
  name: "James Wu",
  email: "james@example.com",
  password: "123",
  role: "investor",
  bio: "Angel investor and LP at multiple venture funds. 40+ investments across EdTech, Climate Tech, and Consumer. Former VP at Stripe. Writing checks $50K–$500K. Passionate about mission-driven founders building the next generation of transformative companies.",
  location: "Chicago, IL",
  industry: ["EdTech", "Climate Tech", "Consumer", "FinTech"],
  skills: ["Angel Investing", "Startup Mentoring", "Payments", "Go-to-Market"],
  company: "Wu Capital",
  position: "Angel Investor",
  investmentRange: "$50K - $500K",
  portfolioCompanies: 41,
  agreementPolicy: "Wu Capital invests at pre-seed and seed stage via SAFE or convertible note instruments. Terms follow standard YC-posted SAFE conventions with a valuation cap agreed at term sheet. No board seat required; quarterly investor updates expected. Strong preference for founders with demonstrated traction and a clear path to revenue within 18 months.",
  experience: "10 years",
  website: "wucapital.co",
  linkedin: "linkedin.com/in/jameswu",
  connections: ["u1"],
  pendingReceived: [],
  pendingSent: ["u4"],
  joinedDate: "2024-01-08",
  verified: true
}, {
  id: "u6",
  name: "Maria Santos",
  email: "maria@example.com",
  password: "123",
  role: "entrepreneur",
  bio: "Transforming education in Latin America through adaptive learning technology. EduBridge has helped 500K+ students improve academic outcomes. Raised $3M seed round. Seeking Series A to expand to 5 new countries.",
  location: "Miami, FL",
  industry: ["EdTech", "Latin America", "Consumer"],
  skills: ["EdTech", "Community Building", "Curriculum Design", "Partnerships"],
  company: "EduBridge",
  position: "Co-Founder & CTO",
  fundingStage: "Series A",
  experience: "6 years",
  website: "edubridge.com",
  linkedin: "linkedin.com/in/mariasantos",
  connections: [],
  pendingReceived: ["u2"],
  pendingSent: [],
  joinedDate: "2024-02-05",
  verified: false
}, {
  id: "u7",
  name: "David Kim",
  email: "david@example.com",
  password: "123",
  role: "freelancer",
  bio: "Product designer with 9 years crafting digital experiences for startups and Fortune 500 companies. Specialized in design systems, mobile apps, and brand identity. 50+ clients served across 12 countries.",
  location: "Seattle, WA",
  industry: ["Product Design", "Mobile Apps", "Branding"],
  skills: ["Figma", "UI/UX Design", "Design Systems", "Prototyping", "User Research", "Branding"],
  company: "Self-Employed",
  position: "Product Designer",
  hourlyRate: "$150/hr",
  availableFor: "Long-term projects preferred",
  experience: "9 years",
  website: "davidkim.design",
  linkedin: "linkedin.com/in/davidkimdesign",
  connections: [],
  pendingReceived: [],
  pendingSent: [],
  joinedDate: "2024-02-10",
  verified: false
}, {
  id: "u8",
  name: "Ahmed Hassan",
  email: "ahmed@example.com",
  password: "123",
  role: "startup_founder",
  bio: "Building AgriFlow to modernize agricultural supply chains across MENA. Using IoT and blockchain to reduce food waste by 40%. Pre-seed funded. Looking for a technical co-founder and Series A investors who believe in sustainable food systems.",
  location: "Dubai, UAE",
  industry: ["AgriTech", "Supply Chain", "Blockchain", "IoT"],
  skills: ["AgriTech", "Supply Chain Management", "Business Development", "Arabic Markets"],
  company: "AgriFlow",
  position: "Founder",
  fundingStage: "Pre-seed",
  companyDetails: {
    founded: "2023",
    headquarters: "Dubai, UAE",
    teamSize: "6 employees",
    registrationNumber: "AE-DXB-5598712"
  },
  experience: "4 years",
  website: "agriflow.ae",
  linkedin: "linkedin.com/in/ahmedhassan",
  connections: [],
  pendingReceived: [],
  pendingSent: [],
  joinedDate: "2024-02-15",
  verified: false
}, {
  id: "u9",
  name: "Lisa Park",
  email: "lisa@example.com",
  password: "123",
  role: "investor",
  bio: "Managing Partner at GreenHorizon Capital — a $50M impact fund focused on climate tech, sustainable agriculture, and clean energy. Previously at Sequoia and Accel. Committed to generating competitive returns while driving measurable environmental impact.",
  location: "Singapore",
  industry: ["Climate Tech", "AgriTech", "Clean Energy", "Sustainability"],
  skills: ["Impact Investing", "ESG Analysis", "Climate Finance", "Due Diligence"],
  company: "GreenHorizon Capital",
  position: "Managing Partner",
  investmentRange: "$500K - $5M",
  portfolioCompanies: 18,
  agreementPolicy: "GreenHorizon Capital invests exclusively in climate-positive ventures at seed and Series A. We lead or co-invest via preferred equity, targeting 10-20% ownership. Requirements: measurable environmental impact metrics, an ESG screening completed before diligence, and annual impact reporting post-investment. Diligence takes 4-6 weeks; term sheets include standard protective provisions and anti-dilution protection.",
  experience: "12 years",
  website: "greenhorizoncap.com",
  linkedin: "linkedin.com/in/lisapark",
  connections: [],
  pendingReceived: [],
  pendingSent: [],
  joinedDate: "2024-01-25",
  verified: true
}, {
  id: "u10",
  name: "Rachel Thompson",
  email: "sauMentor@nec.edu.in",
  password: "123",
  role: "mentor",
  bio: "Startup mentor and 3x founder. Sold my last company for $45M. Now helping early-stage founders avoid the costly mistakes I made. Specializing in go-to-market strategy, team dynamics, and founder mental health.",
  location: "London, UK",
  industry: ["SaaS", "Consumer", "Marketplace"],
  skills: ["GTM Strategy", "Leadership", "Fundraising", "M&A", "Team Building"],
  company: "Independent",
  position: "Startup Advisor & Mentor",
  experience: "16 years",
  website: "rachelthompson.co",
  linkedin: "linkedin.com/in/rachelthompson",
  connections: [],
  pendingReceived: [],
  pendingSent: [],
  joinedDate: "2024-01-05",
  verified: true
}];
const initialMessages = [{
  id: "m1",
  fromId: "u1",
  toId: "u2",
  content: "Hi Michael! I saw your portfolio includes FinTech companies. I'd love to discuss NovaPay's Series A round with you.",
  timestamp: "2024-03-01T10:00:00Z",
  read: true
}, {
  id: "m2",
  fromId: "u2",
  toId: "u1",
  content: "Hi Sarah! Absolutely, your traction looks impressive. Can we schedule a call next week to discuss the opportunity?",
  timestamp: "2024-03-01T11:30:00Z",
  read: true
}, {
  id: "m3",
  fromId: "u1",
  toId: "u2",
  content: "That would be great! I am free Tuesday or Thursday afternoon.",
  timestamp: "2024-03-01T12:00:00Z",
  read: true
}, {
  id: "m4",
  fromId: "u2",
  toId: "u1",
  content: "Let's do Thursday at 3pm EST. I will send a calendar invite. Could you share your deck beforehand?",
  timestamp: "2024-03-01T13:15:00Z",
  read: true
}, {
  id: "m5",
  fromId: "u4",
  toId: "u2",
  content: "Hi Michael, Priya here from CareConnect. I noticed Apex Ventures has invested in HealthTech before. Would love to connect!",
  timestamp: "2024-03-02T09:00:00Z",
  read: true
}, {
  id: "m6",
  fromId: "u2",
  toId: "u4",
  content: "Hi Priya! Yes, HealthTech is absolutely in our focus. Tell me more about CareConnect — what is your current MRR?",
  timestamp: "2024-03-02T10:30:00Z",
  read: true
}, {
  id: "m7",
  fromId: "u4",
  toId: "u2",
  content: "We are at $85K MRR, growing 20% month over month. Happy to share the full metrics deck!",
  timestamp: "2024-03-02T11:00:00Z",
  read: false
}, {
  id: "m8",
  fromId: "u5",
  toId: "u1",
  content: "Sarah, James here. Heard great things about NovaPay from a mutual connection. Would love to learn more about your vision.",
  timestamp: "2024-03-03T09:00:00Z",
  read: true
}, {
  id: "m9",
  fromId: "u1",
  toId: "u5",
  content: "James! Thanks so much. I would love to chat. Our focus is financial inclusion for gig workers — a massive underserved market.",
  timestamp: "2024-03-03T10:30:00Z",
  read: false
}];
const initialProjects = [{
  id: "p1",
  ownerId: "u1",
  title: "NovaPay — Gig Worker Banking",
  description: "AI-underwritten banking and instant-pay accounts built for gig and freelance workers. Processing $2M+ monthly, seeking Series A to scale to new metro markets.",
  industry: "FinTech",
  status: "in_talks",
  fundingRequired: 8000000,
  projectType: "saas",
  patented: false,
  createdAt: "2024-02-01"
}, {
  id: "p2",
  ownerId: "u4",
  title: "CareConnect — Specialist Matching",
  description: "AI matching engine that pairs patients with the right specialist in under 5 minutes, cutting average wait times by 60%. $85K MRR, growing 20% MoM.",
  industry: "HealthTech",
  status: "open",
  fundingRequired: 5000000,
  projectType: "product",
  patented: true,
  patentProofName: "CareConnect-Matching-Patent-US11456782.pdf",
  createdAt: "2024-02-10"
}, {
  id: "p3",
  ownerId: "u6",
  title: "EduBridge — Adaptive Learning Platform",
  description: "Adaptive learning technology for Latin American students, currently serving 500K+ learners. Raised $3M seed, mapping expansion into 5 new countries.",
  industry: "EdTech",
  status: "open",
  fundingRequired: 4000000,
  projectType: "saas",
  patented: true,
  patentProofName: "EduBridge-Adaptive-Engine-Patent.pdf",
  createdAt: "2024-02-20"
}];
const initialRequirements = [{
  id: "r1",
  investorId: "u2",
  title: "Series A FinTech opportunities (LatAm/US)",
  description: "Apex Ventures is actively looking for FinTech founders with $50K+ MRR and clear regulatory strategy for a Series A check between $2M–$8M.",
  industry: "FinTech",
  budgetRange: "$2M - $8M",
  createdAt: "2024-02-05"
}, {
  id: "r2",
  investorId: "u5",
  title: "Early-stage Climate & EdTech bets",
  description: "James Wu is writing angel checks for mission-driven founders in Climate Tech and EdTech at pre-seed to seed stage.",
  industry: "Climate Tech",
  budgetRange: "$50K - $500K",
  createdAt: "2024-02-12"
}];
const initialInvestments = [{
  id: "iv1",
  investorId: "u2",
  entrepreneurId: "u1",
  projectId: "p1",
  requirementId: "r1",
  amount: 3200000,
  createdAt: "2024-03-04"
}, {
  id: "iv2",
  investorId: "u5",
  entrepreneurId: "u6",
  projectId: "p3",
  amount: 250000,
  createdAt: "2024-02-25"
}];
const initialProposals = [{
  id: "pr1",
  requirementId: "r1",
  projectId: "p1",
  entrepreneurId: "u1",
  investorId: "u2",
  status: "invested",
  createdAt: "2024-02-28"
}];
const initialMeetings = [];
const initialAgreements = [];
const initialOffers = [];
const initialHelpRequests = [{
  id: "hr1",
  founderId: "u4",
  title: "Need go-to-market advice for CareConnect",
  description: "We just crossed $85K MRR and want to expand into a second city. Looking for guidance from an experienced entrepreneur or investor on GTM sequencing.",
  category: "Go-to-Market",
  createdAt: "2024-03-05"
}];
const initialHelpOffers = [];
const initialReviews = [{
  id: "rv1",
  fromId: "u2",
  toId: "u1",
  rating: 5,
  comment: "Sarah and the NovaPay team were sharp, transparent, and moved fast through diligence. A pleasure to back.",
  createdAt: "2024-03-10"
}, {
  id: "rv2",
  fromId: "u1",
  toId: "u2",
  rating: 5,
  comment: "Michael brought real FinTech operating experience to the table, not just capital. Highly recommend Apex Ventures.",
  createdAt: "2024-03-11"
}, {
  id: "rv3",
  fromId: "u5",
  toId: "u6",
  rating: 4,
  comment: "Maria is building something real in LatAm EdTech. Great communicator, clear metrics, a bit slow on legal turnaround.",
  createdAt: "2024-02-27"
}];
const initialWebinars = [{
  id: "w1",
  hostId: "u2",
  title: "Navigating the 2026 Funding Landscape: What Investors Really Want",
  description: "Join Michael Okafor from Apex Ventures for an inside look at what top-tier investors are looking for in today's challenging funding environment. We cover due diligence red flags, pitch deck essentials, and how to build lasting relationships with the right VCs.",
  date: "2026-08-15",
  time: "2:00 PM EST",
  duration: "90 min",
  topic: "Fundraising",
  registeredCount: 247,
  maxAttendees: 500,
  tags: ["Fundraising", "Venture Capital", "Pitch Deck"],
  registeredUserIds: []
}, {
  id: "w2",
  hostId: "u1",
  title: "Building a FinTech Startup from Zero to Series A",
  description: "Sarah Chen shares the complete NovaPay journey from idea to a fully funded Series A. Topics include regulatory navigation, building trust with financial institutions, product-market fit validation, and assembling a world-class team on a limited budget.",
  date: "2026-08-22",
  time: "11:00 AM PST",
  duration: "60 min",
  topic: "Entrepreneurship",
  registeredCount: 183,
  maxAttendees: 300,
  tags: ["FinTech", "Startups", "Series A"],
  registeredUserIds: []
}, {
  id: "w3",
  hostId: "u4",
  title: "Product-Market Fit in HealthTech: Lessons from the Trenches",
  description: "Priya Sharma from CareConnect discusses the unique challenges of achieving product-market fit in healthcare. Learn how to navigate HIPAA compliance, work with healthcare providers, and build products that patients and doctors actually use and love.",
  date: "2026-09-05",
  time: "3:00 PM EST",
  duration: "75 min",
  topic: "Product",
  registeredCount: 112,
  maxAttendees: 200,
  tags: ["HealthTech", "Product-Market Fit", "Healthcare"],
  registeredUserIds: []
}, {
  id: "w4",
  hostId: "u10",
  title: "Founder Mental Health: Thriving Under Pressure",
  description: "Rachel Thompson, 3x founder, discusses the psychological challenges of startup building. Coping strategies, maintaining perspective through adversity, knowing when to pivot vs persist, and building resilient team cultures that last.",
  date: "2026-09-12",
  time: "4:00 PM BST",
  duration: "60 min",
  topic: "Leadership",
  registeredCount: 89,
  maxAttendees: 150,
  tags: ["Leadership", "Mental Health", "Founders"],
  registeredUserIds: []
}];

// ======================== CONSTANTS ========================
const ROLE_LABELS = {
  entrepreneur: "Entrepreneur",
  investor: "Investor",
  freelancer: "Freelancer",
  startup_founder: "Startup Founder",
  mentor: "Mentor",
  admin: "Administrator"
};
const DEMO_ACCOUNTS = [{
  role: "entrepreneur",
  name: "Saumya",
  email: "sauEntrepreneur@nec.edu.in"
}, {
  role: "investor",
  name: "Michael Okafor",
  email: "sauInvestor@nec.edu.in"
}, {
  role: "freelancer",
  name: "Alex Rivera",
  email: "sauFreelancer@nec.edu.in"
}, {
  role: "startup_founder",
  name: "Priya Sharma",
  email: "sauStartup@nec.edu.in"
}, {
  role: "mentor",
  name: "Rachel Thompson",
  email: "sauMentor@nec.edu.in"
}, {
  role: "admin",
  name: "Arjun Verma",
  email: "admin@venturelink.app"
}];
// Terminology for a proposed engagement, based on the *recipient's* role:
// freelancers are paid per engagement, so their letter speaks of a "Payment";
// every other role is employed, so the letter quotes "LPA" (lakhs per annum).
function offerTerms(recipientRole) {
  const freelance = recipientRole === "freelancer";
  return {
    noun: freelance ? "Offer" : "Bond",
    nounLower: freelance ? "offer" : "bond",
    docTitle: freelance ? "Offer Letter" : "Bond Letter",
    subject: freelance ? "Offer of Engagement" : "Bond of Engagement",
    sendBtn: freelance ? "Send Offer Letter" : "Send Bond Letter",
    packageLabel: freelance ? "Payment" : "Compensation (LPA)",
    rateKey: freelance ? "Payment" : "Compensation (LPA)",
    packagePlaceholder: freelance ? "e.g. $60/hr or $5,000 total" : "e.g. 12 LPA (₹12,00,000 per year)",
    detailsTitle: freelance ? "Offer Details" : "Bond Details",
    offerDateLabel: freelance ? "Offer Date" : "Bond Date",
    offerStatusLabel: freelance ? "Offer Status" : "Bond Status",
    payWord: freelance ? "payment" : "compensation"
  };
}
// LPA is only ever quoted for non-freelancer engagements, and the letter must
// state it even when the sender typed a bare number ("12" -> "12 LPA").
function formatCompensation(rate, freelance) {
  const v = (rate || "").trim();
  if (!v) return "";
  if (freelance) return v;
  return /\blpa\b|per\s+annum|p\.?a\.?$/i.test(v) ? v : `${v} LPA`;
}
const ROLE_BADGE = {
  entrepreneur: "bg-violet-100 text-violet-700 border border-violet-200",
  investor: "bg-emerald-100 text-emerald-700 border border-emerald-200",
  freelancer: "bg-amber-100 text-amber-700 border border-amber-200",
  startup_founder: "bg-indigo-100 text-indigo-700 border border-indigo-200",
  mentor: "bg-sky-100 text-sky-700 border border-sky-200",
  admin: "bg-slate-800 text-white border border-slate-700"
};
// Multi-lingual UI: 13 languages. Phrases live in i18n.js + i18n-catalog-*.js; the
// runtime translator (i18n-runtime.js) rewrites the rendered interface into the chosen one.
const I18N_LANGS = UI_LANGS; // en, ta, hi, bn, pa, es, fr, de, pt, it, ru, zh, ja
const AVATAR_COLORS = ["bg-violet-500", "bg-emerald-500", "bg-amber-600", "bg-rose-500", "bg-sky-500", "bg-blue-600", "bg-teal-500", "bg-pink-500", "bg-orange-500", "bg-cyan-600"];function getAvatarColor(id) {
  const num = parseInt(id.replace(/\D/g, "")) || 0;
  return AVATAR_COLORS[num % AVATAR_COLORS.length];
}
function getInitials(name) {
  return name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
}
function calcMatchScore(a, b) {
  const overlap = a.industry.filter(i => b.industry.includes(i)).length;
  const total = new Set([...a.industry, ...b.industry]).size;
  const industryPct = total > 0 ? overlap / total : 0;
  const idA = parseInt(a.id.replace(/\D/g, "")) || 1;
  const idB = parseInt(b.id.replace(/\D/g, "")) || 1;
  const bonus = (idA * 7 + idB * 3) % 20;
  return Math.min(98, Math.max(40, Math.round(industryPct * 55 + 30 + bonus)));
}
function formatTime(ts) {
  return new Date(ts).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit"
  });
}
function formatShortDate(ts) {
  return new Date(ts).toLocaleDateString([], {
    month: "short",
    day: "numeric"
  });
}

// ---- Deterministic daily portfolio growth (seeded so it's stable across renders) ----
function seededDailyChange(seed, dayIndex) {
  // Simple deterministic pseudo-random hash -> value in [-1.5%, +3%], biased upward.
  let x = Math.sin(seed * 12.9898 + dayIndex * 78.233) * 43758.5453;
  x = x - Math.floor(x);
  return x * 0.045 - 0.015;
}
function getInvestmentGrowthSeries(investment) {
  const seed = (parseInt(investment.id.replace(/\D/g, "")) || 1) + investment.amount;
  const start = new Date(investment.createdAt);
  const today = new Date();
  let dayCount = Math.floor((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  dayCount = Math.max(1, Math.min(dayCount, 60));
  const series = [];
  let value = investment.amount;
  for (let i = 0; i < dayCount; i++) {
    const change = i === 0 ? 0 : seededDailyChange(seed, i);
    value = value * (1 + change);
    const date = new Date(start.getTime());
    date.setDate(date.getDate() + i);
    series.push({
      date: date.toISOString().split("T")[0],
      value,
      changePercent: change * 100,
      status: change > 0.001 ? "up" : change < -0.001 ? "down" : "flat"
    });
  }
  return series;
}

// ======================== SMALL COMPONENTS ========================
function UserAvatar({
  user,
  size = "md"
}) {
  const sz = {
    xs: "w-6 h-6 text-[10px]",
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-14 h-14 text-lg",
    xl: "w-20 h-20 text-2xl"
  }[size];
  return <div className={`${sz} ${getAvatarColor(user.id)} rounded-full flex items-center justify-center text-white font-bold flex-shrink-0`}>
      {getInitials(user.name)}
    </div>;
}
function RoleBadge({
  role
}) {
  return <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${ROLE_BADGE[role]}`}>
      {ROLE_LABELS[role]}
    </span>;
}

// ---- Verification / Trust badge ----
function VerifiedBadge({
  size = "sm"
}) {
  const dims = size === "lg" ? "w-4 h-4" : "w-3 h-3";
  return <span title="Verified member" className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-700 border border-emerald-200 px-1.5 py-0.5 rounded-full text-[10px] font-bold flex-shrink-0">
      <ShieldCheck className={dims} /> Verified
    </span>;
}

// ---- Startup Funding Progress Tracker ----
function FundingProgressBar({
  required,
  received
}) {
  const pct = required > 0 ? Math.min(100, Math.round(received / required * 100)) : 0;
  const barColor = pct >= 75 ? "#059669" : pct >= 35 ? "#2563a8" : "#d97706";
  return <div>
      <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-1">
        <span>${received.toLocaleString()} raised</span>
        <span>{pct}% of ${required.toLocaleString()}</span>
      </div>
      <div className="w-full bg-slate-100 rounded-full overflow-hidden" style={{
      height: "8px"
    }}>
        <div style={{
        width: `${pct}%`,
        height: "8px",
        backgroundColor: barColor,
        transition: "width 0.4s ease"
      }} />
      </div>
    </div>;
}

// ---- Ratings & Reviews star display ----
function StarRating({
  value,
  count,
  size = "sm",
  showValue = true
}) {
  const dims = size === "lg" ? "w-5 h-5" : "w-3.5 h-3.5";
  if (value === null || value === undefined) {
    return <span className="text-xs text-slate-400">No reviews yet</span>;
  }
  const rounded = Math.round(value);
  return <span className="inline-flex items-center gap-1">
      <span className="flex items-center text-amber-500">
        {[1, 2, 3, 4, 5].map(i => <Star key={i} filled={i <= rounded} className={dims} />)}
      </span>
      {showValue && <span className="text-xs font-semibold text-slate-600">{value.toFixed(1)}{count !== undefined && <span className="text-slate-400 font-normal"> ({count})</span>}</span>}
    </span>;
}

// ======================== PROFILE VIEW ========================
function ProfileView({
  user,
  isOwnProfile,
  onEdit,
  onConnect,
  onMessage,
  connectionStatus,
  matchScore,
  avgRating,
  reviewCount,
  reviewsList = []
}) {
  return <div className="p-6 lg:p-8 max-w-3xl mx-auto pb-12">
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden mb-5">
        <div className="h-28 bg-gradient-to-r from-[#0F1E3D] via-[#1B2D5B] to-[#22345E]" />
        <div className="px-6 pb-6">
          <div className="flex items-end justify-between -mt-10 mb-4">
            <div className={`w-20 h-20 ${getAvatarColor(user.id)} rounded-2xl flex items-center justify-center text-white text-2xl font-bold border-4 border-white shadow-lg`}>
              {getInitials(user.name)}
            </div>
            <div className="flex gap-2 mt-10">
              {isOwnProfile && <button onClick={onEdit} className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors">
                  <Edit2 className="w-3.5 h-3.5" /> Edit Profile
                </button>}
              {!isOwnProfile && connectionStatus === "none" && <button onClick={onConnect} className="flex items-center gap-2 px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-sm font-semibold transition-colors">
                  <UserPlus className="w-3.5 h-3.5" /> Connect
                </button>}
              {!isOwnProfile && connectionStatus === "connected" && <button onClick={onMessage} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold transition-colors">
                  <MessageCircle className="w-3.5 h-3.5" /> Message
                </button>}
              {!isOwnProfile && connectionStatus === "pending" && <span className="px-4 py-2 bg-slate-100 text-slate-400 rounded-xl text-sm font-semibold">Request Sent</span>}
              {!isOwnProfile && connectionStatus === "received" && <button onClick={onConnect} className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-sm font-semibold transition-colors">
                  <Check className="w-3.5 h-3.5" /> Accept Request
                </button>}
            </div>
          </div>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">{user.role === "startup_founder" ? user.company : user.name}</h1>
              <p className="text-slate-500 mt-0.5 text-sm">
                {user.role === "startup_founder" ? <>Founded by <span className="font-semibold text-slate-700">{user.name}</span>{user.position && <> · {user.position}</>}</> : <>{user.position} <span className="text-slate-400">at</span> <span className="font-semibold text-slate-700">{user.company}</span></>}
              </p>
              <div className="flex items-center gap-3 mt-2 flex-wrap">
                <RoleBadge role={user.role} />
                {user.verified && <VerifiedBadge />}
                {avgRating !== null && avgRating !== undefined && <StarRating value={avgRating} count={reviewCount} />}
                {user.location && <span className="flex items-center gap-1 text-sm text-slate-500">
                    <MapPin className="w-3.5 h-3.5" />{user.location}
                  </span>}
                {user.experience && <span className="flex items-center gap-1 text-sm text-slate-500">
                    <Clock className="w-3.5 h-3.5" />{user.experience} experience
                  </span>}
              </div>
            </div>
            {matchScore !== undefined && <div className="text-center bg-gradient-to-br from-blue-50 to-slate-100 border border-blue-100 rounded-2xl px-5 py-3 flex-shrink-0">
                <div className={`text-3xl font-bold ${matchScore >= 70 ? "text-emerald-600" : matchScore >= 50 ? "text-amber-600" : "text-slate-500"}`}>
                  {matchScore}%
                </div>
                <div className="text-xs text-slate-500 font-semibold mt-0.5">Match Score</div>
              </div>}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-5">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <h3 className="font-bold text-slate-900 mb-3">About</h3>
            <p className="text-sm text-slate-600 leading-relaxed">{user.bio || "No bio provided yet."}</p>
          </div>
          {user.role === "startup_founder" && <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <h3 className="font-bold text-slate-900 mb-4">Company Details</h3>
              <div className="space-y-3">
                <InfoRow icon={<Building2 className="w-4 h-4 text-blue-500" />} text={user.company} />
                {user.companyDetails?.founded && <InfoRow icon={<Calendar className="w-4 h-4 text-slate-400" />} text={`Founded ${user.companyDetails.founded}`} />}
                {user.companyDetails?.headquarters && <InfoRow icon={<MapPin className="w-4 h-4 text-slate-400" />} text={`HQ: ${user.companyDetails.headquarters}`} />}
                {user.companyDetails?.teamSize && <InfoRow icon={<Users className="w-4 h-4 text-slate-400" />} text={user.companyDetails.teamSize} />}
                {user.companyDetails?.registrationNumber && <InfoRow icon={<ShieldCheck className="w-4 h-4 text-emerald-500" />} text={`Reg. No: ${user.companyDetails.registrationNumber}`} />}
                {user.fundingStage && <InfoRow icon={<TrendingUp className="w-4 h-4 text-violet-500" />} text={`${user.fundingStage} stage`} />}
                {user.website && <InfoRow icon={<Globe className="w-4 h-4 text-slate-400" />} text={user.website} accent />}
                {!user.companyDetails?.founded && !user.companyDetails?.headquarters && !user.companyDetails?.teamSize && !user.companyDetails?.registrationNumber && <p className="text-xs text-slate-400">No additional company details added yet.</p>}
              </div>
            </div>}
          {user.skills.length > 0 && <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <h3 className="font-bold text-slate-900 mb-3">Skills & Expertise</h3>
              <div className="flex flex-wrap gap-2">
                {user.skills.map(s => <span key={s} className="px-3 py-1.5 bg-blue-50 text-blue-800 rounded-xl text-sm font-medium">{s}</span>)}
              </div>
            </div>}
          {user.industry.length > 0 && <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <h3 className="font-bold text-slate-900 mb-3">Industries</h3>
              <div className="flex flex-wrap gap-2">
                {user.industry.map(i => <span key={i} className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-xl text-sm">{i}</span>)}
              </div>
            </div>}
        </div>

        <div className="space-y-5">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <h3 className="font-bold text-slate-900 mb-4">Details</h3>
            <div className="space-y-3">
              <InfoRow icon={<Building2 className="w-4 h-4 text-slate-400" />} text={user.company} />
              {user.fundingStage && <InfoRow icon={<TrendingUp className="w-4 h-4 text-violet-500" />} text={`${user.fundingStage} stage`} />}
              {user.investmentRange && <InfoRow icon={<Wallet className="w-4 h-4 text-emerald-500" />} text={user.investmentRange} />}
              {user.portfolioCompanies !== undefined && <InfoRow icon={<Briefcase className="w-4 h-4 text-slate-400" />} text={`${user.portfolioCompanies} portfolio companies`} />}
              {user.hourlyRate && <InfoRow icon={<DollarSign className="w-4 h-4 text-amber-500" />} text={user.hourlyRate} />}
              {user.availableFor && <InfoRow icon={<CheckCircle className="w-4 h-4 text-emerald-500" />} text={user.availableFor} />}
              {user.website && <InfoRow icon={<Globe className="w-4 h-4 text-slate-400" />} text={user.website} accent />}
              {user.linkedin && <InfoRow icon={<Link2 className="w-4 h-4 text-slate-400" />} text="LinkedIn Profile" accent />}
              <InfoRow icon={<Calendar className="w-4 h-4 text-slate-300" />} text={`Joined ${new Date(user.joinedDate).toLocaleDateString([], {
              month: "long",
              year: "numeric"
            })}`} muted />
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <h3 className="font-bold text-slate-900 mb-4">Network</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center bg-slate-50 rounded-xl py-3">
                <div className="text-xl font-bold text-slate-900">{user.connections.length}</div>
                <div className="text-xs text-slate-500">Connections</div>
              </div>
              <div className="text-center bg-slate-50 rounded-xl py-3">
                <div className="text-xl font-bold text-slate-900">{user.experience?.replace(" years", "") || "—"}</div>
                <div className="text-xs text-slate-500">Yrs Exp.</div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-slate-900">Ratings & Reviews</h3>
              {avgRating !== null && avgRating !== undefined && <StarRating value={avgRating} count={reviewCount} />}
            </div>
            {reviewsList.length === 0 ? <p className="text-xs text-slate-400">No reviews yet — reviews appear here after a collaboration.</p> : <div className="space-y-3 overflow-y-auto" style={{
            maxHeight: "18rem"
          }}>
                {reviewsList.slice().reverse().map((r, idx) => <div key={r.id} className={idx < reviewsList.length - 1 ? "border-b border-slate-50 pb-3" : ""}>
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-xs font-semibold text-slate-800">{r.fromName}</span>
                      <StarRating value={r.rating} showValue={false} />
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed">{r.comment}</p>
                  </div>)}
              </div>}
          </div>
        </div>
      </div>
    </div>;
}
function InfoRow({
  icon,
  text,
  accent,
  muted
}) {
  return <div className="flex items-center gap-2.5 text-sm">
      <span className="flex-shrink-0">{icon}</span>
      <span className={muted ? "text-slate-400 text-xs" : accent ? "text-blue-700" : "text-slate-600"}>{text}</span>
    </div>;
}

// ---- Attachment / link helpers ----
function normalizeLink(raw) {
  const v = (raw || "").trim();
  if (!v) return "";
  return /^https?:\/\//i.test(v) ? v : `https://${v}`;
}
function openAttachment(dataUrl) {
  try {
    const [head, b64] = dataUrl.split(",");
    const mime = (head.match(/data:([^;]*)/) || [])[1] || "application/octet-stream";
    const bin = atob(b64);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    window.open(URL.createObjectURL(new Blob([bytes], { type: mime })), "_blank");
  } catch (err) {
    console.warn("Could not open attachment", err);
  }
}
function AttachmentView({ name, dataUrl, className = "" }) {
  if (!dataUrl) return null;
  const isImage = /^data:image\//.test(dataUrl);
  return <div className={className}>
      {isImage && <img src={dataUrl} alt={name || "attachment"} className="rounded-xl border border-slate-200 w-full mb-2" style={{ maxHeight: 240, objectFit: "contain", background: "#f8fafc" }} />}
      <div className="flex flex-wrap items-center text-xs font-semibold" style={{ gap: "6px 14px" }}>
        <span className="inline-flex items-center gap-1.5 text-slate-600"><Link2 className="w-3.5 h-3.5" /> {name || "Attachment"}</span>
        <button type="button" onClick={() => openAttachment(dataUrl)} className="text-blue-700 hover:underline">View</button>
        <a href={dataUrl} download={name} className="text-blue-700 hover:underline">Download</a>
      </div>
    </div>;
}
function ProjectLinks({ project, className = "mt-3" }) {
  if (!project.fileDataUrl && !project.liveLink) return null;
  return <div className={`${className} flex flex-wrap items-center`} style={{ gap: "6px 16px" }}>
      {project.fileDataUrl && <a href={project.fileDataUrl} download={project.fileName} className="inline-flex items-center gap-1.5 text-xs text-blue-700 font-semibold hover:underline">
          <Link2 className="w-3.5 h-3.5" /> {project.fileName}
        </a>}
      {project.liveLink && <a href={project.liveLink} target="_blank" rel="noreferrer" title={project.liveLink} className="inline-flex items-center gap-1.5 text-xs text-blue-700 font-semibold hover:underline">
          <Globe className="w-3.5 h-3.5" /> Live demo
        </a>}
    </div>;
}

// ---- Agreement content builders (terms + report rows come from what the user enters) ----
function stripEndPunct(str) {
  return String(str || "").trim().replace(/[.\s]+$/, "");
}
function formatLongDate(iso) {
  if (!iso) return "";
  const d = new Date(`${iso}T00:00:00`);
  return isNaN(d.getTime()) ? iso : d.toLocaleDateString([], { month: "long", day: "numeric", year: "numeric" });
}
const INVESTMENT_INSTRUMENTS = ["Equity", "Convertible Note", "SAFE", "Revenue Share", "Debt / Loan", "Other"];
const EMPTY_AGREEMENT_FORM = {
  instrument: "",
  equityPercent: "",
  valuation: "",
  term: "",
  startDate: "",
  disbursement: "",
  scope: "",
  rate: "",
  paymentSchedule: "",
  deliverables: "",
  conditions: ""
};
function buildInvestmentAgreementContent({ investor, founder, project, amount, details }) {
  const d = details || {};
  const projectLabel = project ? `"${project.title}"` : "the founder's venture";
  const clauses = [];
  clauses.push(`Engagement. ${investor.name} (${investor.company || "Investor"}) agrees to invest $${amount.toLocaleString()} into ${projectLabel}, owned by ${founder?.name || "the founder"}, structured as ${d.instrument || "an investment"}${d.equityPercent && d.equityPercent.trim() ? ` for ${d.equityPercent.trim()} equity/ownership` : ""}${d.valuation && d.valuation.trim() ? ` at a valuation of ${d.valuation.trim()}` : ""}.`);
  if (d.term && d.term.trim()) clauses.push(`Term. The agreed term of this Agreement is ${stripEndPunct(d.term)}.`);
  if (d.startDate) clauses.push(`Effective Date. This Agreement takes effect on ${formatLongDate(d.startDate)}.`);
  if (d.disbursement && d.disbursement.trim()) clauses.push(`Disbursement. Payment / disbursement shall occur as follows: ${stripEndPunct(d.disbursement)}.`);
  if (d.conditions && d.conditions.trim()) clauses.push(`Additional Terms. ${stripEndPunct(d.conditions)}.`);
  clauses.push(`Good Faith. This Agreement records the mutual, good-faith understanding of the Parties and was generated via VentureLink.`);
  const terms = clauses.map((c, i) => `${i + 1}. ${c}`).join("\n\n");
  const rows = [];
  if (d.instrument) rows.push({ label: "Investment Type", value: d.instrument });
  if (d.equityPercent && d.equityPercent.trim()) rows.push({ label: "Equity / Ownership", value: d.equityPercent.trim() });
  if (d.valuation && d.valuation.trim()) rows.push({ label: "Valuation", value: d.valuation.trim() });
  if (d.startDate) rows.push({ label: "Effective Date", value: formatLongDate(d.startDate) });
  if (d.disbursement && d.disbursement.trim()) rows.push({ label: "Payment / Disbursement Terms", value: d.disbursement.trim() });
  if (d.conditions && d.conditions.trim()) rows.push({ label: "Additional Terms & Conditions", value: d.conditions.trim() });
  return { terms, rows, duration: (d.term || "").trim() || undefined };
}
function buildFreelanceAgreementContent({ freelancer, client, offer, details }) {
  const d = details || {};
  const clauses = [];
  clauses.push(`Engagement. ${freelancer?.name || "the freelancer"} agrees to provide services to ${client?.name || "the client"} on "${offer.title}"${d.term && d.term.trim() ? ` for a duration of ${stripEndPunct(d.term)}` : ""}${d.rate && d.rate.trim() ? ` at a rate of ${stripEndPunct(d.rate)}` : ""}.`);
  if (d.scope && d.scope.trim()) clauses.push(`Scope of Work. ${stripEndPunct(d.scope)}.`);
  if (d.startDate) clauses.push(`Effective Date. Work under this Agreement begins on ${formatLongDate(d.startDate)}.`);
  if (d.paymentSchedule && d.paymentSchedule.trim()) clauses.push(`Payment Schedule. ${stripEndPunct(d.paymentSchedule)}.`);
  if (d.deliverables && d.deliverables.trim()) clauses.push(`Deliverables. ${stripEndPunct(d.deliverables)}.`);
  if (d.conditions && d.conditions.trim()) clauses.push(`Additional Terms. ${stripEndPunct(d.conditions)}.`);
  clauses.push(`Good Faith. Both Parties agree to the terms of this working agreement generated via VentureLink.`);
  const terms = clauses.map((c, i) => `${i + 1}. ${c}`).join("\n\n");
  const rows = [];
  if (d.scope && d.scope.trim()) rows.push({ label: "Scope of Work", value: d.scope.trim() });
  if (d.rate && d.rate.trim()) rows.push({ label: "Payment / Rate", value: d.rate.trim() });
  if (d.startDate) rows.push({ label: "Start Date", value: formatLongDate(d.startDate) });
  if (d.paymentSchedule && d.paymentSchedule.trim()) rows.push({ label: "Payment Schedule", value: d.paymentSchedule.trim() });
  if (d.deliverables && d.deliverables.trim()) rows.push({ label: "Deliverables", value: d.deliverables.trim() });
  if (d.conditions && d.conditions.trim()) rows.push({ label: "Additional Terms & Conditions", value: d.conditions.trim() });
  return { terms, rows, duration: (d.term || "").trim() || undefined };
}

// ======================== MAIN APP ========================
export default function App() {
  const [users, setUsers] = useState(initialUsers);
  const [messages, setMessages] = useState(initialMessages);
  const [webinars, setWebinars] = useState(initialWebinars);
  const [projects, setProjects] = useState(initialProjects);
  const [requirements, setRequirements] = useState(initialRequirements);
  const [investments, setInvestments] = useState(initialInvestments);
  const [proposals, setProposals] = useState(initialProposals);
  const [meetings, setMeetings] = useState(initialMeetings);
  const [agreements, setAgreements] = useState(initialAgreements);
  const [offers, setOffers] = useState(initialOffers);
  const [helpRequests, setHelpRequests] = useState(initialHelpRequests);
  const [helpOffers, setHelpOffers] = useState(initialHelpOffers);
  const [reviews, setReviews] = useState(initialReviews);
  const [recentlyAccessed, setRecentlyAccessed] = useState([]);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [view, setView] = useState("login");
  const [viewingUserId, setViewingUserId] = useState(null);
  const [activeConvoId, setActiveConvoId] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [lang, setLang] = useState(() => localStorage.getItem("vl_lang") || "en");
  useEffect(() => { localStorage.setItem("vl_lang", lang); }, [lang]);
  // Translating the rendered interface (not just a few labels) means the whole
  // app switches language, including screens added later.
  useEffect(() => enableUiLanguage(document.getElementById("root") || document.body, lang), [lang]);
  const t = key => key;
  const [showNotifPopup, setShowNotifPopup] = useState(false);
  const [notifPreview, setNotifPreview] = useState([]);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [authPending, setAuthPending] = useState(false);
  const [oauthModalOpen, setOauthModalOpen] = useState(false);
  const [oauthEmail, setOauthEmail] = useState("");
  const [oauthName, setOauthName] = useState("");
  const [oauthRole, setOauthRole] = useState("entrepreneur");
  const [oauthError, setOauthError] = useState("");
  const [adminStats, setAdminStats] = useState(null);
  const [patentBotOpen, setPatentBotOpen] = useState(false);
  const [patentBotProjectId, setPatentBotProjectId] = useState(null);
  const [patentBotProposalId, setPatentBotProposalId] = useState(null);
  const [patentBotLog, setPatentBotLog] = useState([]);
  const [patentBotInput, setPatentBotInput] = useState("");
  const [patentBotBusy, setPatentBotBusy] = useState(false);
  const patentBotEndRef = useRef(null);
  const [regForm, setRegForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "entrepreneur",
    bio: "",
    location: "",
    company: "",
    position: "",
    experience: "",
    industry: "",
    skills: "",
    website: "",
    linkedin: "",
    fundingStage: "",
    investmentRange: "",
    portfolioCompanies: "",
    hourlyRate: "",
    agreementPolicy: "",
    companyFounded: "",
    companySize: "",
    companyHeadquarters: "",
    companyRegistration: ""
  });
  const [regError, setRegError] = useState("");
  const [editingProfile, setEditingProfile] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [discoverSearch, setDiscoverSearch] = useState("");
  const [discoverRoleFilter, setDiscoverRoleFilter] = useState("all");
  const [projectSearch, setProjectSearch] = useState("");
  const [projectIndustryFilter, setProjectIndustryFilter] = useState("all");
  const [projectStatusFilter, setProjectStatusFilter] = useState("all");
  const [projectTypeFilter, setProjectTypeFilter] = useState("all");
  const [projectSort, setProjectSort] = useState("newest");
  const [reviewTargetId, setReviewTargetId] = useState(null);
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    comment: ""
  });
  const [verifyMessage, setVerifyMessage] = useState("");
  const [calendarMonthOffset, setCalendarMonthOffset] = useState(0);
  const [selectedCalendarDate, setSelectedCalendarDate] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const [showWebinarForm, setShowWebinarForm] = useState(false);
  const [webinarForm, setWebinarForm] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    duration: "60 min",
    topic: "",
    tags: ""
  });
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [projectForm, setProjectForm] = useState({
    title: "",
    description: "",
    industry: "",
    fundingRequired: "",
    liveLink: "",
    projectType: "saas",
    patented: "no",
    patentNumber: ""
  });
  const [editingProjectId, setEditingProjectId] = useState(null);
  const [pendingProjectFile, setPendingProjectFile] = useState(null);
  const [pendingPatentFile, setPendingPatentFile] = useState(null);
  const [resumeUploadName, setResumeUploadName] = useState("");
  const [showRequirementForm, setShowRequirementForm] = useState(false);
  const [requirementForm, setRequirementForm] = useState({
    title: "",
    description: "",
    industry: "",
    budgetRange: ""
  });
  const [pendingRequirementFile, setPendingRequirementFile] = useState(null);
  const [editingRequirementId, setEditingRequirementId] = useState(null);
  const [editingInvestmentId, setEditingInvestmentId] = useState(null);
  const [investmentEdit, setInvestmentEdit] = useState({ amount: "", note: "" });
  const [removeTarget, setRemoveTarget] = useState(null); // { kind: "project" | "requirement", id, title }
  const [pendingOfferFile, setPendingOfferFile] = useState(null);
  const [agreementModal, setAgreementModal] = useState(null);
  const [agreementForm, setAgreementForm] = useState(EMPTY_AGREEMENT_FORM);
  const [submitToRequirementId, setSubmitToRequirementId] = useState(null);
  const [submitProjectId, setSubmitProjectId] = useState("");
  const [policyAcknowledged, setPolicyAcknowledged] = useState(false);
  const [investAmountInputs, setInvestAmountInputs] = useState({});
  const [scheduleModal, setScheduleModal] = useState(null);
  const [scheduleForm, setScheduleForm] = useState({
    mode: "online",
    date: "",
    time: "",
    notes: ""
  });
  const [showOfferForm, setShowOfferForm] = useState(false);
  const [offerForm, setOfferForm] = useState({
    title: "",
    description: "",
    duration: "",
    rate: ""
  });
  const [successNotice, setSuccessNotice] = useState("");
  const [expandedOffers, setExpandedOffers] = useState([]);
  const [showHelpForm, setShowHelpForm] = useState(false);
  const [helpForm, setHelpForm] = useState({
    title: "",
    description: "",
    category: ""
  });
  const [helpOfferInputs, setHelpOfferInputs] = useState({});
  const [helpInvestOpenId, setHelpInvestOpenId] = useState(null);
  const [growthOpenId, setGrowthOpenId] = useState(null);
  const [helpInvestInputs, setHelpInvestInputs] = useState({});
  const messagesEndRef = useRef(null);
  const projectFileInputRef = useRef(null);
  const projectFormRef = useRef(null);
  const patentBotClosedAtRef = useRef(0);
  const requirementFormRef = useRef(null);
  const patentFileInputRef = useRef(null);
  const requirementFileInputRef = useRef(null);
  const offerFileInputRef = useRef(null);
  const resumeFileInputRef = useRef(null);
  const logoFileInputRef = useRef(null);
  const sigCanvasRef = useRef(null);
  const [isDrawingSig, setIsDrawingSig] = useState(false);
  const [sigHasStrokes, setSigHasStrokes] = useState(false);
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth"
    });
  }, [messages, activeConvoId]);
  useEffect(() => {
    if (view === "messages" && activeConvoId && latestCu) {
      setMessages(prev => prev.map(m => m.fromId === activeConvoId && m.toId === latestCu.id && !m.read ? {
        ...m,
        read: true
      } : m));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view, activeConvoId]);
  useEffect(() => {
    setShowOfferForm(false);
    setPendingOfferFile(null);
    setOfferForm({
      title: "",
      description: "",
      duration: "",
      rate: ""
    });
    setReviewTargetId(null);
    setReviewForm({
      rating: 5,
      comment: ""
    });
  }, [viewingUserId]);

  // ---- Backend sync: load all collections for the signed-in session, then keep each in sync ----
  function applyState(state) {
    if (!state) return;
    if (state.users) setUsers(state.users);
    if (state.messages) setMessages(state.messages);
    if (state.webinars) setWebinars(state.webinars);
    if (state.projects) setProjects(state.projects);
    if (state.requirements) setRequirements(state.requirements);
    if (state.investments) setInvestments(state.investments);
    if (state.proposals) setProposals(state.proposals);
    if (state.meetings) setMeetings(state.meetings);
    if (state.agreements) setAgreements(state.agreements);
    if (state.offers) setOffers(state.offers);
    if (state.helpRequests) setHelpRequests(state.helpRequests);
    if (state.helpOffers) setHelpOffers(state.helpOffers);
    if (state.reviews) setReviews(state.reviews);
    if (state.recentlyAccessed) setRecentlyAccessed(state.recentlyAccessed);
    setDataLoaded(true);
  }

  // First load always shows the sign-in page. The only exception is a fresh
  // OAuth redirect that arrives with ?oauth_token=<jwt> in the URL.
  useEffect(() => {
    let cancelled = false;
    const oauthFailure = takeOauthErrorFromUrl(); // a real-Google redirect that came back without a token
    if (oauthFailure) setLoginError(oauthFailure);
    const freshOauthToken = takeOauthTokenFromUrl(); // picks up ?oauth_token=<jwt> after a Google redirect
    if (!freshOauthToken) {
      setToken(""); // never auto-login from a previously stored session
      return; // login screen needs no backend data; saves stay gated off
    }
    apiMe().then(me => {
      if (cancelled || !me?.user) {
        setToken("");
        return;
      }
      loadState().then(state => {
        if (cancelled) return;
        applyState(state);
        const fresh = state?.users?.find(u => u.id === me.user.id) || me.user;
        setCurrentUser(fresh);
        setView(fresh.role === "admin" ? "admin" : "dashboard");
      }).catch(() => {
        if (!cancelled) setCurrentUser(me.user);
      });
    }).catch(() => {});
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { if (dataLoaded) saveCollection("users", users); }, [users, dataLoaded]);
  useEffect(() => { if (dataLoaded) saveCollection("messages", messages); }, [messages, dataLoaded]);
  useEffect(() => { if (dataLoaded) saveCollection("webinars", webinars); }, [webinars, dataLoaded]);
  useEffect(() => { if (dataLoaded) saveCollection("projects", projects); }, [projects, dataLoaded]);
  useEffect(() => { if (dataLoaded) saveCollection("requirements", requirements); }, [requirements, dataLoaded]);
  useEffect(() => { if (dataLoaded) saveCollection("investments", investments); }, [investments, dataLoaded]);
  useEffect(() => { if (dataLoaded) saveCollection("proposals", proposals); }, [proposals, dataLoaded]);
  useEffect(() => { if (dataLoaded) saveCollection("meetings", meetings); }, [meetings, dataLoaded]);
  useEffect(() => { if (dataLoaded) saveCollection("agreements", agreements); }, [agreements, dataLoaded]);
  useEffect(() => { if (dataLoaded) saveCollection("offers", offers); }, [offers, dataLoaded]);
  useEffect(() => { if (dataLoaded) saveCollection("helpRequests", helpRequests); }, [helpRequests, dataLoaded]);
  useEffect(() => { if (dataLoaded) saveCollection("helpOffers", helpOffers); }, [helpOffers, dataLoaded]);
  useEffect(() => { if (dataLoaded) saveCollection("reviews", reviews); }, [reviews, dataLoaded]);
  useEffect(() => { if (dataLoaded) saveCollection("recentlyAccessed", recentlyAccessed); }, [recentlyAccessed, dataLoaded]);

  // Admin dashboard stats (kept with the other top-level hooks so hook order is stable)
  useEffect(() => {
    if (view === "admin" && currentUser?.role === "admin") {
      apiAdminStats().then(setAdminStats).catch(() => setAdminStats(null));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view, currentUser?.role]);

  const latestCu = currentUser ? users.find(u => u.id === currentUser.id) || currentUser : null;

  // ---- Auth ----
  function checkUnreadOnLogin(user) {
    const unread = messages.filter(m => m.toId === user.id && !m.read);
    if (unread.length > 0) {
      setNotifPreview(unread.map(m => ({
        id: m.id,
        senderName: users.find(u => u.id === m.fromId)?.name || "Someone",
        content: m.content
      })));
      setShowNotifPopup(true);
    }
  }
  function loginAsUser(user) {
    setCurrentUser(user);
    setView(user.role === "admin" ? "admin" : "dashboard");
    setLoginError("");
    checkUnreadOnLogin(user);
  }

  // After any successful authentication: pull the backend state and sign in.
  async function finishAuth(user) {
    try {
      const state = await loadState();
      applyState(state);
      const fresh = state?.users?.find(u => u.id === user.id) || user;
      loginAsUser(fresh);
    } catch {
      loginAsUser(user);
    }
  }

  async function handleLogin(e) {
    e.preventDefault();
    setAuthPending(true);
    setLoginError("");
    try {
      const user = await apiLogin(loginEmail, loginPassword);
      setLoginPassword("");
      await finishAuth(user);
    } catch (err) {
      setLoginError(err.message || "Unable to sign in.");
    } finally {
      setAuthPending(false);
    }
  }
  async function handleDemoLogin(email) {
    setAuthPending(true);
    setLoginError("");
    try {
      const user = await apiLogin(email, "123");
      await finishAuth(user);
    } catch {
      setLoginError("Demo account unavailable.");
    } finally {
      setAuthPending(false);
    }
  }

  // ---- Google OAuth sign-in ----
  // With GOOGLE_CLIENT_ID configured the backend redirects to real Google;
  // otherwise the built-in demo provider renders the consent modal below.
  function handleGoogleSignIn() {
    setOauthError("");
    startGoogleLogin().then(res => {
      if (res?.demo) {
        const known = DEMO_ACCOUNTS.find(d => d.email.toLowerCase() === loginEmail.trim().toLowerCase());
        setOauthEmail(known ? known.email : loginEmail.includes("@") ? loginEmail : "");
        setOauthName(known ? known.name : "");
        setOauthRole(known ? known.role : "entrepreneur");
        setOauthModalOpen(true);
      }
    }).catch(() => setLoginError("Could not reach the authentication service."));
  }
  async function handleOauthDemoConfirm() {
    const email = oauthEmail.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
      setOauthError("Enter a valid Google email address.");
      return;
    }
    setAuthPending(true);
    setOauthError("");
    try {
      const known = DEMO_ACCOUNTS.find(d => d.email.toLowerCase() === email);
      const user = await apiOauthDemo(email, known ? known.name : oauthName.trim(), known ? known.role : oauthRole);
      setOauthModalOpen(false);
      await finishAuth(user);
    } catch (err) {
      setOauthError(err.message || "Google sign-in failed.");
    } finally {
      setAuthPending(false);
    }
  }

  async function handleRegister(e) {
    e.preventDefault();
    if (!regForm.name || !regForm.email || !regForm.password) {
      setRegError("Please fill in all required fields.");
      return;
    }
    setAuthPending(true);
    setRegError("");
    const newUser = {
      name: regForm.name,
      email: regForm.email,
      password: regForm.password,
      role: regForm.role,
      bio: regForm.bio,
      location: regForm.location,
      company: regForm.company,
      position: regForm.position,
      experience: regForm.experience,
      industry: regForm.industry.split(",").map(s => s.trim()).filter(Boolean),
      skills: regForm.skills.split(",").map(s => s.trim()).filter(Boolean),
      website: regForm.website,
      linkedin: regForm.linkedin,
      fundingStage: regForm.fundingStage || undefined,
      investmentRange: regForm.investmentRange || undefined,
      portfolioCompanies: regForm.portfolioCompanies ? parseInt(regForm.portfolioCompanies) : undefined,
      hourlyRate: regForm.hourlyRate || undefined,
      agreementPolicy: regForm.agreementPolicy || undefined,
      companyDetails: regForm.role === "startup_founder" ? {
        founded: regForm.companyFounded || undefined,
        headquarters: regForm.companyHeadquarters || undefined,
        teamSize: regForm.companySize || undefined,
        registrationNumber: regForm.companyRegistration || undefined
      } : undefined,
      joinedDate: new Date().toISOString().split("T")[0]
    };
    try {
      const user = await apiRegister(newUser);
      await finishAuth(user);
    } catch (err) {
      setRegError(err.message || "Registration failed.");
    } finally {
      setAuthPending(false);
    }
  }
  function handleLogout() {
    setToken("");
    setDataLoaded(false);
    setCurrentUser(null);
    setView("login");
    setLoginEmail("");
    setLoginPassword("");
    setAdminStats(null);
    setPatentBotOpen(false);
    setPatentBotLog([]);
  }

  // ---- Connections ----
  function sendConnectionRequest(toId) {
    if (!latestCu) return;
    const fromId = latestCu.id;
    setUsers(prev => prev.map(u => {
      if (u.id === fromId) return {
        ...u,
        pendingSent: [...u.pendingSent, toId]
      };
      if (u.id === toId) return {
        ...u,
        pendingReceived: [...u.pendingReceived, fromId]
      };
      return u;
    }));
    setCurrentUser(prev => prev ? {
      ...prev,
      pendingSent: [...prev.pendingSent, toId]
    } : prev);
  }
  function acceptConnection(fromId) {
    if (!latestCu) return;
    const myId = latestCu.id;
    setUsers(prev => prev.map(u => {
      if (u.id === myId) return {
        ...u,
        connections: [...u.connections, fromId],
        pendingReceived: u.pendingReceived.filter(id => id !== fromId)
      };
      if (u.id === fromId) return {
        ...u,
        connections: [...u.connections, myId],
        pendingSent: u.pendingSent.filter(id => id !== myId)
      };
      return u;
    }));
    setCurrentUser(prev => prev ? {
      ...prev,
      connections: [...prev.connections, fromId],
      pendingReceived: prev.pendingReceived.filter(id => id !== fromId)
    } : prev);
  }
  function declineConnection(fromId) {
    if (!latestCu) return;
    const myId = latestCu.id;
    setUsers(prev => prev.map(u => {
      if (u.id === myId) return {
        ...u,
        pendingReceived: u.pendingReceived.filter(id => id !== fromId)
      };
      if (u.id === fromId) return {
        ...u,
        pendingSent: u.pendingSent.filter(id => id !== myId)
      };
      return u;
    }));
    setCurrentUser(prev => prev ? {
      ...prev,
      pendingReceived: prev.pendingReceived.filter(id => id !== fromId)
    } : prev);
  }

  // ---- Messages ----
  function sendMessage() {
    if (!latestCu || !activeConvoId || !newMessage.trim()) return;
    const msg = {
      id: `m${Date.now()}`,
      fromId: latestCu.id,
      toId: activeConvoId,
      content: newMessage.trim(),
      timestamp: new Date().toISOString(),
      read: false
    };
    setMessages(prev => [...prev, msg]);
    setNewMessage("");
  }
  function markConversationRead(withUserId) {
    if (!latestCu) return;
    setMessages(prev => prev.map(m => m.fromId === withUserId && m.toId === latestCu.id && !m.read ? {
      ...m,
      read: true
    } : m));
  }

  // ---- Profile Edit ----
  function startEditProfile() {
    if (!latestCu) return;
    setEditForm({
      ...latestCu
    });
    setEditingProfile(true);
  }
  function saveProfile() {
    if (!latestCu) return;
    setUsers(prev => prev.map(u => u.id === latestCu.id ? {
      ...u,
      ...editForm
    } : u));
    setCurrentUser(prev => prev ? {
      ...prev,
      ...editForm
    } : prev);
    setEditingProfile(false);
  }

  // ---- Webinars ----
  function postWebinar(e) {
    e.preventDefault();
    if (!latestCu) return;
    const w = {
      id: `w${Date.now()}`,
      hostId: latestCu.id,
      title: webinarForm.title,
      description: webinarForm.description,
      date: webinarForm.date,
      time: webinarForm.time,
      duration: webinarForm.duration,
      topic: webinarForm.topic,
      registeredCount: 0,
      maxAttendees: 200,
      registeredUserIds: [],
      tags: webinarForm.tags.split(",").map(s => s.trim()).filter(Boolean)
    };
    setWebinars(prev => [w, ...prev]);
    setWebinarForm({
      title: "",
      description: "",
      date: "",
      time: "",
      duration: "60 min",
      topic: "",
      tags: ""
    });
    setShowWebinarForm(false);
  }
  function toggleWebinarRegistration(webinarId) {
    if (!latestCu) return;
    setWebinars(prev => prev.map(w => {
      if (w.id !== webinarId) return w;
      const isRegistered = w.registeredUserIds.includes(latestCu.id);
      return isRegistered ? {
        ...w,
        registeredUserIds: w.registeredUserIds.filter(id => id !== latestCu.id),
        registeredCount: Math.max(0, w.registeredCount - 1)
      } : {
        ...w,
        registeredUserIds: [...w.registeredUserIds, latestCu.id],
        registeredCount: w.registeredCount + 1
      };
    }));
  }
  function viewUserProfile(userId) {
    recordRecentAccess(userId, "user");
    setViewingUserId(userId);
    setView("view-profile");
  }
  // ---- Recently accessed (per-user, persisted to /api/state/recentlyAccessed) ----
  function recordRecentAccess(targetId, targetType = "user") {
    if (!latestCu || !targetId) return;
    const viewer = latestCu.id;
    setRecentlyAccessed(prev => {
      const entry = {
        id: `ra${Date.now()}`,
        userId: viewer,
        targetId,
        targetType,
        at: new Date().toISOString()
      };
      const deduped = prev.filter(e => !(e.userId === viewer && e.targetId === targetId));
      return [...deduped, entry].slice(-200);
    });
  }
  function formatAgo(iso) {
    const mins = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    if (mins < 1440) return `${Math.round(mins / 60)}h ago`;
    return `${Math.round(mins / 1440)}d ago`;
  }
  function openMessage(userId) {
    setActiveConvoId(userId);
    setView("messages");
  }

  // ---- Startup Funding Progress ----
  function getProjectFundingReceived(projectId) {
    return investments.filter(i => i.projectId === projectId).reduce((sum, i) => sum + i.amount, 0);
  }

  // ---- Verification / Trust System ----
  function getVerificationChecklist(u) {
    return [{
      label: "Bio added",
      done: !!(u.bio && u.bio.trim().length > 20)
    }, {
      label: "Company & position added",
      done: !!(u.company && u.position)
    }, {
      label: "Website or LinkedIn added",
      done: !!(u.website || u.linkedin)
    }, {
      label: "At least 1 connection made",
      done: u.connections.length >= 1
    }];
  }
  function isEligibleForVerification(u) {
    return getVerificationChecklist(u).every(c => c.done);
  }
  function requestVerification() {
    if (!latestCu) return;
    if (latestCu.verified) return;
    if (!isEligibleForVerification(latestCu)) {
      setVerifyMessage("Complete the checklist below before requesting verification.");
      return;
    }
    setUsers(prev => prev.map(u => u.id === latestCu.id ? {
      ...u,
      verified: true
    } : u));
    setCurrentUser(prev => prev ? {
      ...prev,
      verified: true
    } : prev);
    setVerifyMessage("You're verified! A trust badge now appears on your profile.");
  }

  // ---- Ratings & Reviews (after collaboration) ----
  function getUserReviews(userId) {
    return reviews.filter(r => r.toId === userId);
  }
  function getAvgRating(userId) {
    const list = getUserReviews(userId);
    if (list.length === 0) return null;
    return list.reduce((sum, r) => sum + r.rating, 0) / list.length;
  }
  function hasCollaboratedWith(otherId) {
    if (!latestCu) return false;
    // Reviewing is allowed only after completed work between both parties:
    // a concluded investment, or an offer that was accepted (either direction).
    const sharedInvestment = investments.some(i => i.investorId === latestCu.id && i.entrepreneurId === otherId || i.investorId === otherId && i.entrepreneurId === latestCu.id);
    const acceptedOffer = offers.some(o => o.status === "accepted" && (o.fromId === latestCu.id && o.toId === otherId || o.fromId === otherId && o.toId === latestCu.id));
    return sharedInvestment || acceptedOffer;
  }
  function hasAlreadyReviewed(otherId) {
    if (!latestCu) return false;
    return reviews.some(r => r.fromId === latestCu.id && r.toId === otherId);
  }
  function submitReview(toId) {
    if (!latestCu || !reviewForm.comment.trim()) return;
    const review = {
      id: `rv${Date.now()}`,
      fromId: latestCu.id,
      toId,
      rating: reviewForm.rating,
      comment: reviewForm.comment.trim(),
      createdAt: new Date().toISOString().split("T")[0]
    };
    setReviews(prev => [...prev, review]);
    setReviewForm({
      rating: 5,
      comment: ""
    });
    setReviewTargetId(null);
  }

  // ---- Resume upload ----
  function handleResumeFileChange(e) {
    const file = e.target.files?.[0];
    if (!file || !latestCu) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result;
      setUsers(prev => prev.map(u => u.id === latestCu.id ? {
        ...u,
        resumeFileName: file.name,
        resumeDataUrl: dataUrl
      } : u));
      setCurrentUser(prev => prev ? {
        ...prev,
        resumeFileName: file.name,
        resumeDataUrl: dataUrl
      } : prev);
      setResumeUploadName(file.name);
    };
    reader.readAsDataURL(file);
  }

  // ---- Company logo upload ----
  function handleLogoFileChange(e) {
    const file = e.target.files?.[0];
    if (!file || !latestCu) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result;
      setUsers(prev => prev.map(u => u.id === latestCu.id ? {
        ...u,
        companyLogoDataUrl: dataUrl
      } : u));
      setCurrentUser(prev => prev ? {
        ...prev,
        companyLogoDataUrl: dataUrl
      } : prev);
    };
    reader.readAsDataURL(file);
  }

  // ---- E-signature pad ----
  function getSigCanvasPoint(e) {
    const canvas = sigCanvasRef.current;
    if (!canvas) return {
      x: 0,
      y: 0
    };
    const rect = canvas.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  }
  function sigPointerDown(e) {
    const canvas = sigCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    setIsDrawingSig(true);
    const {
      x,
      y
    } = getSigCanvasPoint(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
  }
  function sigPointerMove(e) {
    if (!isDrawingSig) return;
    const canvas = sigCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const {
      x,
      y
    } = getSigCanvasPoint(e);
    ctx.strokeStyle = "#0F1E3D";
    ctx.lineWidth = 2.2;
    ctx.lineCap = "round";
    ctx.lineTo(x, y);
    ctx.stroke();
    setSigHasStrokes(true);
  }
  function sigPointerUp() {
    setIsDrawingSig(false);
  }
  function clearSignaturePad() {
    const canvas = sigCanvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (canvas && ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
    setSigHasStrokes(false);
  }
  function saveSignature() {
    const canvas = sigCanvasRef.current;
    if (!canvas || !latestCu || !sigHasStrokes) return;
    const dataUrl = canvas.toDataURL("image/png");
    setUsers(prev => prev.map(u => u.id === latestCu.id ? {
      ...u,
      signatureDataUrl: dataUrl
    } : u));
    setCurrentUser(prev => prev ? {
      ...prev,
      signatureDataUrl: dataUrl
    } : prev);
  }

  // ---- Project upload ----
  function handleProjectFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setPendingProjectFile({
        name: file.name,
        dataUrl: reader.result
      });
    };
    reader.readAsDataURL(file);
  }
  function handlePatentFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setPendingPatentFile({
        name: file.name,
        dataUrl: reader.result
      });
    };
    reader.readAsDataURL(file);
  }
  function resetProjectForm() {
    setProjectForm({
      title: "",
      description: "",
      industry: "",
      fundingRequired: "",
      liveLink: "",
      projectType: "saas",
      patented: "no",
      patentNumber: ""
    });
    setPendingProjectFile(null);
    setPendingPatentFile(null);
    setEditingProjectId(null);
    if (projectFileInputRef.current) projectFileInputRef.current.value = "";
    if (patentFileInputRef.current) patentFileInputRef.current.value = "";
  }
  function toggleProjectForm() {
    if (editingProjectId) {
      // was editing: switch the open form back to a fresh "add" form
      resetProjectForm();
      setShowProjectForm(true);
      return;
    }
    setShowProjectForm(!showProjectForm);
  }
  function startEditProject(p) {
    setEditingProjectId(p.id);
    setProjectForm({
      title: p.title || "",
      description: p.description || "",
      industry: p.industry || "",
      fundingRequired: p.fundingRequired ? String(p.fundingRequired) : "",
      liveLink: p.liveLink || "",
      projectType: p.projectType === "product" ? "product" : "saas",
      patented: p.patented ? "yes" : "no",
      patentNumber: p.patentNumber || ""
    });
    setPendingProjectFile(p.fileDataUrl ? {
      name: p.fileName,
      dataUrl: p.fileDataUrl
    } : null);
    setPendingPatentFile(p.patentProofDataUrl ? {
      name: p.patentProofName,
      dataUrl: p.patentProofDataUrl
    } : null);
    if (projectFileInputRef.current) projectFileInputRef.current.value = "";
    if (patentFileInputRef.current) patentFileInputRef.current.value = "";
    setShowProjectForm(true);
    setTimeout(() => projectFormRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start"
    }), 50);
  }
  function addProject(e) {
    e.preventDefault();
    if (!latestCu || !projectForm.title.trim()) return;
    const liveLink = normalizeLink(projectForm.liveLink);
    const isPatented = projectForm.patented === "yes";
    const patentProofName = isPatented ? pendingPatentFile?.name : undefined;
    const patentProofDataUrl = isPatented ? pendingPatentFile?.dataUrl : undefined;
    const patentNumber = isPatented ? projectForm.patentNumber.trim() : undefined;
    if (editingProjectId) {
      // save edits to an already-posted project (id, owner, status, date stay as they were)
      setProjects(prev => prev.map(p => p.id === editingProjectId && p.ownerId === latestCu.id ? {
        ...p,
        title: projectForm.title,
        description: projectForm.description,
        industry: projectForm.industry,
        fundingRequired: parseFloat(projectForm.fundingRequired) || 0,
        fileName: pendingProjectFile?.name,
        fileDataUrl: pendingProjectFile?.dataUrl,
        liveLink,
        projectType: projectForm.projectType === "product" ? "product" : "saas",
        patented: isPatented,
        patentNumber,
        patentProofName,
        patentProofDataUrl
      } : p));
      resetProjectForm();
      setShowProjectForm(false);
      return;
    }
    const p = {
      id: `p${Date.now()}`,
      ownerId: latestCu.id,
      title: projectForm.title,
      description: projectForm.description,
      industry: projectForm.industry,
      fundingRequired: parseFloat(projectForm.fundingRequired) || 0,
      fileName: pendingProjectFile?.name,
      fileDataUrl: pendingProjectFile?.dataUrl,
      liveLink,
      projectType: projectForm.projectType === "product" ? "product" : "saas",
      patented: isPatented,
      patentNumber,
      patentProofName,
      patentProofDataUrl,
      status: "open",
      createdAt: new Date().toISOString().split("T")[0]
    };
    setProjects(prev => [p, ...prev]);
    resetProjectForm();
    setShowProjectForm(false);
  }

  // ---- Investor requirements ----
  function handleRequirementFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setPendingRequirementFile({
        name: file.name,
        dataUrl: reader.result
      });
    };
    reader.readAsDataURL(file);
  }
  function startEditRequirement(r) {
    setEditingRequirementId(r.id);
    setRequirementForm({
      title: r.title || "",
      description: r.description || "",
      industry: r.industry || "",
      budgetRange: r.budgetRange || ""
    });
    setPendingRequirementFile(r.fileDataUrl ? {
      name: r.fileName,
      dataUrl: r.fileDataUrl
    } : null);
    if (requirementFileInputRef.current) requirementFileInputRef.current.value = "";
    setShowRequirementForm(true);
    requirementFormRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  }
  function resetRequirementForm() {
    setEditingRequirementId(null);
    setRequirementForm({
      title: "",
      description: "",
      industry: "",
      budgetRange: ""
    });
    setPendingRequirementFile(null);
    if (requirementFileInputRef.current) requirementFileInputRef.current.value = "";
  }
  function postRequirement(e) {
    e.preventDefault();
    if (!latestCu || !requirementForm.title.trim()) return;
    if (editingRequirementId) {
      // save edits to a published requirement (investor, id and date stay as they were)
      setRequirements(prev => prev.map(r => r.id === editingRequirementId && r.investorId === latestCu.id ? {
        ...r,
        title: requirementForm.title,
        description: requirementForm.description,
        industry: requirementForm.industry,
        budgetRange: requirementForm.budgetRange,
        fileName: pendingRequirementFile?.name,
        fileDataUrl: pendingRequirementFile?.dataUrl
      } : r));
      resetRequirementForm();
      setShowRequirementForm(false);
      setSuccessNotice(t("Requirement updated successfully."));
      setTimeout(() => setSuccessNotice(""), 5000);
      return;
    }
    const r = {
      id: `r${Date.now()}`,
      investorId: latestCu.id,
      title: requirementForm.title,
      description: requirementForm.description,
      industry: requirementForm.industry,
      budgetRange: requirementForm.budgetRange,
      fileName: pendingRequirementFile?.name,
      fileDataUrl: pendingRequirementFile?.dataUrl,
      createdAt: new Date().toISOString().split("T")[0]
    };
    setRequirements(prev => [r, ...prev]);
    resetRequirementForm();
    setShowRequirementForm(false);
  }

  // ---- Investor: editing a recorded investment ----
  function startEditInvestment(inv) {
    setEditingInvestmentId(inv.id);
    setInvestmentEdit({
      amount: String(inv.amount ?? ""),
      date: inv.createdAt || ""
    });
  }
  function cancelEditInvestment() {
    setEditingInvestmentId(null);
    setInvestmentEdit({
      amount: "",
      date: ""
    });
  }
  function saveInvestmentEdit(inv) {
    if (!latestCu) return;
    const amount = parseFloat(investmentEdit.amount);
    if (!(amount > 0)) return;
    const createdAt = /^\d{4}-\d{2}-\d{2}$/.test(investmentEdit.date) ? investmentEdit.date : inv.createdAt;
    // id, investor, entrepreneur, project and requirement links stay as they were
    setInvestments(prev => prev.map(x => x.id === inv.id && x.investorId === latestCu.id ? {
      ...x,
      amount,
      createdAt
    } : x));
    cancelEditInvestment();
    setSuccessNotice(t("Investment updated."));
    setTimeout(() => setSuccessNotice(""), 5000);
  }

  // ---- Removing your own projects / requirements (two-step confirm) ----
  function confirmRemove(kind, id) {
    if (removeTarget?.kind !== kind || removeTarget?.id !== id) {
      setRemoveTarget({
        kind,
        id
      });
      return;
    }
    if (kind === "project") {
      setProjects(prev => prev.filter(p => !(p.id === id && p.ownerId === latestCu.id)));
      setProposals(prev => prev.filter(pr => pr.projectId !== id));
      setSuccessNotice(t("Project removed."));
    } else {
      setRequirements(prev => prev.filter(r => !(r.id === id && r.investorId === latestCu.id)));
      setProposals(prev => prev.filter(pr => pr.requirementId !== id));
      setSuccessNotice(t("Requirement removed."));
    }
    setRemoveTarget(null);
    setTimeout(() => setSuccessNotice(""), 5000);
  }

  // ---- Proposals (entrepreneur submits a project against a requirement) ----
  function submitProposal(requirementId, projectId) {
    if (!latestCu) return;
    const req = requirements.find(r => r.id === requirementId);
    const proj = projects.find(p => p.id === projectId);
    if (!req || !proj) return;
    const proposal = {
      id: `pr${Date.now()}`,
      requirementId,
      projectId,
      entrepreneurId: latestCu.id,
      investorId: req.investorId,
      status: "pending",
      createdAt: new Date().toISOString().split("T")[0]
    };
    setProposals(prev => [proposal, ...prev]);
    setProjects(prev => prev.map(p => p.id === projectId ? {
      ...p,
      status: "in_talks"
    } : p));
    const msg = {
      id: `m${Date.now()}`,
      fromId: latestCu.id,
      toId: req.investorId,
      content: `I've submitted "${proj.title}" in response to your requirement "${req.title}". Excited to explore working together!`,
      timestamp: new Date().toISOString(),
      read: false
    };
    setMessages(prev => [...prev, msg]);
    setSubmitToRequirementId(null);
    setSubmitProjectId("");
  }

  // ---- Investments ----
  function makeInvestment(proposal, amountStr, details) {
    if (!latestCu) return;
    const amount = parseFloat(amountStr.replace(/[^0-9.]/g, ""));
    if (!amount || amount <= 0) return;
    const proj = projects.find(p => p.id === proposal.projectId);
    const counterparty = users.find(u => u.id === proposal.entrepreneurId);
    const inv = {
      id: `iv${Date.now()}`,
      investorId: latestCu.id,
      entrepreneurId: proposal.entrepreneurId,
      projectId: proposal.projectId,
      requirementId: proposal.requirementId,
      amount,
      createdAt: new Date().toISOString().split("T")[0]
    };
    setInvestments(prev => [...prev, inv]);
    setProposals(prev => prev.map(p => p.id === proposal.id ? {
      ...p,
      status: "invested"
    } : p));
    setProjects(prev => prev.map(p => p.id === proposal.projectId ? {
      ...p,
      status: "funded"
    } : p));
    // auto-connect both parties if not already connected
    setUsers(prev => prev.map(u => {
      if (u.id === latestCu.id && !u.connections.includes(proposal.entrepreneurId)) return {
        ...u,
        connections: [...u.connections, proposal.entrepreneurId]
      };
      if (u.id === proposal.entrepreneurId && !u.connections.includes(latestCu.id)) return {
        ...u,
        connections: [...u.connections, latestCu.id]
      };
      return u;
    }));
    setCurrentUser(prev => prev && !prev.connections.includes(proposal.entrepreneurId) ? {
      ...prev,
      connections: [...prev.connections, proposal.entrepreneurId]
    } : prev);
    const msg = {
      id: `m${Date.now()}`,
      fromId: latestCu.id,
      toId: proposal.entrepreneurId,
      content: `Great news — we'd like to invest $${amount.toLocaleString()} in "${proj?.title || "your project"}". Let's set up a call to finalize the terms.`,
      timestamp: new Date().toISOString(),
      read: false
    };
    setMessages(prev => [...prev, msg]);
    setInvestAmountInputs(prev => ({
      ...prev,
      [proposal.id]: ""
    }));

    // generate the investment agreement from the details the investor entered
    const built = buildInvestmentAgreementContent({
      investor: latestCu,
      founder: counterparty,
      project: proj,
      amount,
      details
    });
    const agreement = {
      id: `ag${Date.now()}`,
      type: "investment",
      partyAId: latestCu.id,
      partyBId: proposal.entrepreneurId,
      title: `Investment Agreement — ${proj?.title || "Untitled Project"}`,
      terms: built.terms,
      amount,
      duration: built.duration,
      details: built.rows,
      createdAt: new Date().toISOString().split("T")[0]
    };
    setAgreements(prev => [...prev, agreement]);
    setSuccessNotice(`Investment agreement for "${proj?.title || "the project"}" has been created and sent.`);
    setTimeout(() => setSuccessNotice(""), 6000);

    // prompt to schedule a call/meeting with the counterparty
    setScheduleModal({
      investmentId: inv.id,
      partyAId: latestCu.id,
      partyBId: proposal.entrepreneurId,
      context: "investment"
    });
    setScheduleForm({
      mode: "online",
      date: "",
      time: "",
      notes: ""
    });
  }

  // ---- Proceeding further after offering help to a startup founder ----
  // Once a helper (investor, entrepreneur, or mentor) has offered advice on a
  // founder's help request, they can keep going: schedule a meeting directly,
  // or — for investors — invest in one of that founder's projects right there,
  // which auto-generates and sends the investment document just like a normal
  // investment does.
  function scheduleMeetingWith(userId) {
    if (!latestCu) return;
    setScheduleModal({
      investmentId: null,
      partyAId: latestCu.id,
      partyBId: userId,
      context: "meeting"
    });
    setScheduleForm({
      mode: "online",
      date: "",
      time: "",
      notes: ""
    });
  }
  function investInFounderFromHelp(founderId, projectId, amountStr, details) {
    if (!latestCu) return;
    const amount = parseFloat(amountStr.replace(/[^0-9.]/g, ""));
    if (!amount || amount <= 0) return;
    const proj = projects.find(p => p.id === projectId);
    const counterparty = users.find(u => u.id === founderId);
    const inv = {
      id: `iv${Date.now()}`,
      investorId: latestCu.id,
      entrepreneurId: founderId,
      projectId: projectId || undefined,
      amount,
      createdAt: new Date().toISOString().split("T")[0]
    };
    setInvestments(prev => [...prev, inv]);
    if (proj) setProjects(prev => prev.map(p => p.id === projectId ? {
      ...p,
      status: "funded"
    } : p));
    setUsers(prev => prev.map(u => {
      if (u.id === latestCu.id && !u.connections.includes(founderId)) return {
        ...u,
        connections: [...u.connections, founderId]
      };
      if (u.id === founderId && !u.connections.includes(latestCu.id)) return {
        ...u,
        connections: [...u.connections, latestCu.id]
      };
      return u;
    }));
    setCurrentUser(prev => prev && !prev.connections.includes(founderId) ? {
      ...prev,
      connections: [...prev.connections, founderId]
    } : prev);
    const msg = {
      id: `m${Date.now()}`,
      fromId: latestCu.id,
      toId: founderId,
      content: `Great news — we'd like to invest $${amount.toLocaleString()}${proj ? ` in "${proj.title}"` : ""}. Let's set up a call to finalize the terms.`,
      timestamp: new Date().toISOString(),
      read: false
    };
    setMessages(prev => [...prev, msg]);

    // generate and send the investment document from the details the investor entered
    const built = buildInvestmentAgreementContent({
      investor: latestCu,
      founder: counterparty,
      project: proj,
      amount,
      details
    });
    const agreement = {
      id: `ag${Date.now()}`,
      type: "investment",
      partyAId: latestCu.id,
      partyBId: founderId,
      title: `Investment Agreement — ${proj?.title || "Untitled Project"}`,
      terms: built.terms,
      amount,
      duration: built.duration,
      details: built.rows,
      createdAt: new Date().toISOString().split("T")[0]
    };
    setAgreements(prev => [...prev, agreement]);
    setSuccessNotice(`Investment agreement for "${proj?.title || "the project"}" has been created and sent.`);
    setTimeout(() => setSuccessNotice(""), 6000);
    setScheduleModal({
      investmentId: inv.id,
      partyAId: latestCu.id,
      partyBId: founderId,
      context: "investment"
    });
    setScheduleForm({
      mode: "online",
      date: "",
      time: "",
      notes: ""
    });
    setHelpInvestInputs(prev => ({
      ...prev,
      [founderId]: {
        projectId: "",
        amount: ""
      }
    }));
    setHelpInvestOpenId(null);
  }
  function confirmScheduleMeeting() {
    if (!scheduleModal || !scheduleForm.date || !scheduleForm.time) return;
    const meeting = {
      id: `mt${Date.now()}`,
      investmentId: scheduleModal.investmentId,
      partyAId: scheduleModal.partyAId,
      partyBId: scheduleModal.partyBId,
      mode: scheduleForm.mode,
      date: scheduleForm.date,
      time: scheduleForm.time,
      notes: scheduleForm.notes,
      createdAt: new Date().toISOString()
    };
    setMeetings(prev => [...prev, meeting]);
    const partyB = users.find(u => u.id === scheduleModal.partyBId);
    if (latestCu && partyB) {
      const msg = {
        id: `m${Date.now()}`,
        fromId: latestCu.id,
        toId: partyB.id,
        content: `I've scheduled a ${scheduleForm.mode} meeting on ${scheduleForm.date} at ${scheduleForm.time} to discuss next steps.${scheduleForm.notes ? ` Note: ${scheduleForm.notes}` : ""}`,
        timestamp: new Date().toISOString(),
        read: false
      };
      setMessages(prev => [...prev, msg]);
    }
    setScheduleModal(null);
  }
  function declineProposal(proposalId) {
    setProposals(prev => prev.map(p => p.id === proposalId ? {
      ...p,
      status: "declined"
    } : p));
  }

  // ---- Freelance offer letters ----
  // Two directions are both allowed: anyone willing to hire can send a job
  // offer letter to a freelancer, AND a freelancer can send an offer letter
  // pitching their services to an investor.
  function sendOfferLetter(toId) {
    if (!latestCu || !offerForm.title.trim()) return;
    const recipient = users.find(u => u.id === toId);
    const clientToFreelancer = recipient?.role === "freelancer" && latestCu.id !== toId;
    const freelancerToInvestor = latestCu.role === "freelancer" && recipient?.role === "investor";
    if (!clientToFreelancer && !freelancerToInvestor) return;
    const offer = {
      id: `of${Date.now()}`,
      fromId: latestCu.id,
      toId,
      title: offerForm.title,
      description: offerForm.description,
      duration: offerForm.duration,
      rate: offerForm.rate,
      attachmentName: pendingOfferFile?.name,
      attachmentDataUrl: pendingOfferFile?.dataUrl,
      status: "pending",
      createdAt: new Date().toISOString().split("T")[0]
    };
    setOffers(prev => [...prev, offer]);
    const terms = offerTerms(recipient?.role);
    const msg = {
      id: `m${Date.now()}`,
      fromId: latestCu.id,
      toId,
      content: `I've sent you an ${terms.nounLower} letter for "${offerForm.title}"${offerForm.duration ? ` (${offerForm.duration})` : ""}. Please review it under Offers.`,
      timestamp: new Date().toISOString(),
      read: false
    };
    setMessages(prev => [...prev, msg]);
    setOfferForm({
      title: "",
      description: "",
      duration: "",
      rate: ""
    });
    setPendingOfferFile(null);
    if (offerFileInputRef.current) offerFileInputRef.current.value = "";
    setShowOfferForm(false);
    setSuccessNotice(`${terms.noun} letter sent successfully to ${recipient.name}.`);
    setTimeout(() => setSuccessNotice(""), 5000);
  }
  function handleOfferFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setPendingOfferFile({
        name: file.name,
        dataUrl: reader.result
      });
    };
    reader.readAsDataURL(file);
  }
  function respondToOffer(offerId, accept, details) {
    if (!latestCu) return;
    const offer = offers.find(o => o.id === offerId);
    if (!offer) return;
    setOffers(prev => prev.map(o => o.id === offerId ? {
      ...o,
      status: accept ? "accepted" : "declined"
    } : o));
    if (accept) {
      setUsers(prev => prev.map(u => {
        if (u.id === offer.fromId && !u.connections.includes(offer.toId)) return {
          ...u,
          connections: [...u.connections, offer.toId]
        };
        if (u.id === offer.toId && !u.connections.includes(offer.fromId)) return {
          ...u,
          connections: [...u.connections, offer.fromId]
        };
        return u;
      }));
      setCurrentUser(prev => prev && !prev.connections.includes(offer.fromId) ? {
        ...prev,
        connections: [...prev.connections, offer.fromId]
      } : prev);
      const sender = users.find(u => u.id === offer.fromId);
      const freelancerParty = sender?.role === "freelancer" ? sender : latestCu.role === "freelancer" ? latestCu : sender;
      const clientParty = sender?.role === "freelancer" ? latestCu : sender;
      const built = buildFreelanceAgreementContent({
        freelancer: freelancerParty,
        client: clientParty,
        offer,
        details
      });
      const agreement = {
        id: `ag${Date.now()}`,
        type: "freelance",
        partyAId: offer.fromId,
        partyBId: offer.toId,
        title: `Freelance Agreement — ${offer.title}`,
        terms: built.terms,
        duration: built.duration,
        details: built.rows,
        createdAt: new Date().toISOString().split("T")[0]
      };
      setAgreements(prev => [...prev, agreement]);
      setSuccessNotice(`Agreement for "${offer.title}" has been created and sent.`);
      setTimeout(() => setSuccessNotice(""), 6000);
      const msg = {
        id: `m${Date.now()}`,
        fromId: latestCu.id,
        toId: offer.fromId,
        content: `I've accepted your offer letter for "${offer.title}". Our working agreement has been generated — you can view it under Agreements.`,
        timestamp: new Date().toISOString(),
        read: false
      };
      setMessages(prev => [...prev, msg]);
    }
  }

  // ---- PatentBot: investor-side novelty screening chatbot ----
  function pushBotMsg(text) {
    setPatentBotLog(prev => [...prev, { from: "bot", text, ts: new Date().toISOString() }]);
  }
  // Closing then immediately re-clicking the same spot (the launcher sits in the
  // corner the panel just vacated) must not silently re-open the panel.
  function closePatentBot() {
    patentBotClosedAtRef.current = Date.now();
    setPatentBotOpen(false);
  }
  function openPatentBotFromLauncher() {
    if (Date.now() - patentBotClosedAtRef.current < 400) return;
    openPatentBot(null, null);
  }
  function openPatentBot(projectId, proposalId) {
    const proj = projects.find(p => p.id === projectId);
    setPatentBotProjectId(projectId);
    setPatentBotProposalId(proposalId || null);
    setPatentBotLog([]);
    setPatentBotOpen(true);
    setTimeout(() => {
      pushBotMsg(`Hello! I'm PatentBot, VentureLink's patent novelty screener.${proj ? ` You asked about "${proj.title}".` : ""}`);
      setTimeout(() => pushBotMsg("Before an investor can fund a patented project, I verify the patent is genuine: I validate the patent-number format, check the proof document, and run a prior-art comparison against every other project on the platform. Press “Run novelty check” to begin."), 350);
    }, 100);
  }
  function runPatentNoveltyCheck() {
    if (!patentBotProjectId || patentBotBusy) return;
    const proj = projects.find(p => p.id === patentBotProjectId);
    setPatentBotBusy(true);
    pushBotMsg(`Screening "${proj?.title || "project"}" against the platform registry and patent-office formats…`);
    apiNoveltyCheck(patentBotProjectId).then(result => {
      setTimeout(() => {
        pushBotMsg(`Prior-art scan complete. Novelty score: ${result.score}/100 — verdict: ${result.status.toUpperCase()}.`);
        result.reasons.forEach((r, i) => setTimeout(() => pushBotMsg(`${r.level === "pass" ? "✅" : r.level === "warn" ? "⚠️" : r.level === "fail" ? "❌" : "ℹ️"} ${r.text}`), 400 * (i + 1)));
        const finish = 400 * (result.reasons.length + 1);
        if (result.status === "cleared") {
          setTimeout(() => {
            pushBotMsg(`✅ VERIFIED — "${proj?.title || "this claim"}" passes every check: the patent number is a real filing format, the proof document is attached, and no earlier project on the platform anticipates it. Close me and press Invest to fund this proposal.`);
            if (patentBotProposalId) {
              setProposals(prev => prev.map(p => p.id === patentBotProposalId ? { ...p, noveltyStatus: "cleared", noveltyScore: result.score, noveltyCheckedAt: new Date().toISOString() } : p));
            }
            setProjects(prev => prev.map(p => p.id === patentBotProjectId ? { ...p, noveltyStatus: "cleared" } : p));
          }, finish);
        } else if (result.status === "review") {
          setTimeout(() => pushBotMsg(`⚠️ NOT VERIFIED YET — the format and proof pass, but the claim is close enough to existing work that it needs manual review. Invest stays locked until the founder clarifies the claims and I am run again.`), finish);
        } else {
          const cause = (result.blockedBy || []).map(k => k === "number" ? "the patent number is not a valid filing number" : k === "proof" ? "no proof-of-patent document is attached" : "the claim duplicates work already on the platform").join(" and ");
          setTimeout(() => pushBotMsg(`❌ NOT A VALID PATENT — ${cause || "the screening did not pass"}. This claim is reported as unverified and investing remains blocked until the founder corrects it and I am run again.`), finish);
        }
      }, 500);
    }).catch(err => {
      pushBotMsg(`Sorry — the screening service could not run: ${err.message}`);
    }).finally(() => setPatentBotBusy(false));
  }
  function askPatentBot(text) {
    const q = text.toLowerCase();
    setPatentBotLog(prev => [...prev, { from: "user", text, ts: new Date().toISOString() }]);
    setTimeout(() => {
      if (/novel|check|screen|verify|fake|genuine/.test(q) && patentBotProjectId) runPatentNoveltyCheck();
      else if (/invest|fund|lock|unlock/.test(q)) pushBotMsg("Patented projects stay investment-locked until I verify their novelty. Run a check and if the verdict is CLEARED, the Invest button unlocks automatically.");
      else if (/score|similar|overlap|prior/.test(q)) pushBotMsg("I compare each project's title and description against every other project on the platform (prior-art search). High overlap with an existing project lowers your novelty score — it may mean a copied or derivative claim.");
      else if (/lpa|package|bond|offer|payment/.test(q)) pushBotMsg("That's the offer-letter side of VentureLink, not my desk — but briefly: a letter to a freelancer states the payment for the engagement, while a letter to any other role states compensation in LPA (lakhs per annum). Ask me about “novelty”, “prior art”, or press “Run novelty check”.");
      else if (/hello|hi|hey/.test(q)) pushBotMsg("Hi! Pick a patented proposal under Requirements and press “Run novelty check”, or ask me anything about how patent verification works.");
      else pushBotMsg("I verify patent novelty for investment decisions. Ask me about “novelty”, “prior art”, “score”, or press “Run novelty check” on the project in view.");
    }, 400);
  }
  useEffect(() => {
    if (patentBotOpen) patentBotEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [patentBotLog, patentBotOpen]);

  // Escape always closes the chatbot, whichever control has focus.
  useEffect(() => {
    if (!patentBotOpen) return undefined;
    const onKey = e => {
      if (e.key === "Escape") closePatentBot();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [patentBotOpen]);

  // ---- Agreement details prompt ----
  // Whenever an agreement is about to be made (an investment, or accepting an offer
  // letter), the person making it is asked for the agreement's details first. The
  // agreement (and its report) is generated from exactly what they enter.
  function requestInvestmentAgreement(proposal, amountStr) {
    if (!latestCu) return;
    const amount = parseFloat(String(amountStr).replace(/[^0-9.]/g, ""));
    if (!amount || amount <= 0) return;
    setAgreementForm(EMPTY_AGREEMENT_FORM);
    setAgreementModal({
      kind: "investment",
      proposal,
      amountStr,
      amount,
      projectId: proposal.projectId,
      otherId: proposal.entrepreneurId
    });
  }
  function requestHelpInvestmentAgreement(founderId, projectId, amountStr) {
    if (!latestCu) return;
    const amount = parseFloat(String(amountStr).replace(/[^0-9.]/g, ""));
    if (!amount || amount <= 0) return;
    setAgreementForm(EMPTY_AGREEMENT_FORM);
    setAgreementModal({
      kind: "help-investment",
      founderId,
      projectId,
      amountStr,
      amount,
      otherId: founderId
    });
  }
  function requestOfferAcceptance(offerId) {
    const offer = offers.find(o => o.id === offerId);
    if (!offer) return;
    setAgreementForm({
      ...EMPTY_AGREEMENT_FORM,
      scope: offer.description || "",
      term: offer.duration || "",
      rate: offer.rate || ""
    });
    setAgreementModal({
      kind: "offer",
      offerId,
      otherId: offer.fromId
    });
  }
  function isAgreementFormValid() {
    if (!agreementModal) return false;
    if (agreementModal.kind === "offer") {
      return agreementForm.scope.trim() && agreementForm.term.trim() && agreementForm.rate.trim();
    }
    return agreementForm.instrument && agreementForm.term.trim();
  }
  function confirmAgreementDetails() {
    if (!agreementModal || !isAgreementFormValid()) return;
    const m = agreementModal;
    const details = {
      ...agreementForm
    };
    setAgreementModal(null);
    if (m.kind === "investment") makeInvestment(m.proposal, m.amountStr, details);else if (m.kind === "help-investment") investInFounderFromHelp(m.founderId, m.projectId, m.amountStr, details);else if (m.kind === "offer") respondToOffer(m.offerId, true, details);
  }

  // ---- Startup founder help requests ----
  function postHelpRequest(e) {
    e.preventDefault();
    if (!latestCu || !helpForm.title.trim()) return;
    const hr = {
      id: `hr${Date.now()}`,
      founderId: latestCu.id,
      title: helpForm.title,
      description: helpForm.description,
      category: helpForm.category,
      createdAt: new Date().toISOString().split("T")[0]
    };
    setHelpRequests(prev => [hr, ...prev]);
    setHelpForm({
      title: "",
      description: "",
      category: ""
    });
    setShowHelpForm(false);
  }
  function offerHelp(requestId, message) {
    if (!latestCu || !message.trim()) return;
    const req = helpRequests.find(r => r.id === requestId);
    if (!req) return;
    const ho = {
      id: `ho${Date.now()}`,
      requestId,
      helperId: latestCu.id,
      message: message.trim(),
      createdAt: new Date().toISOString().split("T")[0]
    };
    setHelpOffers(prev => [...prev, ho]);
    const msg = {
      id: `m${Date.now()}`,
      fromId: latestCu.id,
      toId: req.founderId,
      content: `Re: "${req.title}" — ${message.trim()}`,
      timestamp: new Date().toISOString(),
      read: false
    };
    setMessages(prev => [...prev, msg]);
    setHelpOfferInputs(prev => ({
      ...prev,
      [requestId]: ""
    }));
  }

  // ---- Agreement report generation ----
  function escapeHtml(str) {
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
  }
  function openAgreementReport(agreement) {
    const partyA = users.find(u => u.id === agreement.partyAId);
    const partyB = users.find(u => u.id === agreement.partyBId);
    if (!partyA || !partyB) return;
    const win = window.open("", "_blank", "width=860,height=1120");
    if (!win) {
      alert("Please allow pop-ups for this site to view the agreement report.");
      return;
    }
    const logoHtml = partyA.companyLogoDataUrl ? `<img src="${partyA.companyLogoDataUrl}" alt="logo" style="width:56px;height:56px;object-fit:contain;border-radius:12px;border:1px solid #e2e8f0;" />` : `<div style="width:56px;height:56px;border-radius:12px;background:#0F1E3D;color:#fff;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:22px;font-family:'Plus Jakarta Sans',sans-serif;">${escapeHtml((partyA.company || partyA.name).charAt(0).toUpperCase())}</div>`;
    function sigBlock(user) {
      if (user.signatureDataUrl) {
        return `<img src="${user.signatureDataUrl}" style="height:60px;max-width:220px;object-fit:contain;" />`;
      }
      return `<div style="font-family:'Dancing Script',cursive;font-size:32px;color:#0F1E3D;">${escapeHtml(user.name)}</div>`;
    }
    const html = `<!doctype html><html><head><title>${escapeHtml(agreement.title)}</title><meta charset="utf-8"/>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@600&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
  * { box-sizing: border-box; }
  body { font-family: 'Plus Jakarta Sans', sans-serif; margin:0; padding:48px 16px; color:#1e293b; background:#f1f5f9; }
  .sheet { max-width: 720px; margin: 0 auto; background:#fff; padding: 56px; border-radius: 6px; box-shadow: 0 1px 3px rgba(0,0,0,.08); }
  .header { display:flex; align-items:center; gap:16px; border-bottom: 2px solid #0F1E3D; padding-bottom:20px; margin-bottom:28px; }
  .company-name { font-size: 20px; font-weight: 800; color:#0F1E3D; }
  .platform-tag { font-size:11px; letter-spacing:.08em; text-transform:uppercase; color:#94a3b8; font-weight:700; margin-top:2px;}
  .doc-type { font-size: 15px; text-transform:uppercase; letter-spacing:.12em; color:#0F1E3D; font-weight:800; margin-bottom: 6px; text-align:center;}
  .doc-subtitle { font-size: 13px; color:#64748b; text-align:center; margin-bottom: 22px; font-weight:600;}
  .meta { font-size: 12px; color:#64748b; margin-bottom: 24px; text-align:center;}
  .preamble { font-size: 13.5px; line-height:1.75; color:#334155; margin-bottom: 20px; }
  .parties { display:flex; gap:24px; margin-bottom:24px;}
  .party { flex:1; background:#f8fafc; border:1px solid #e2e8f0; border-radius:12px; padding:16px 18px;}
  .party-label { font-size:10px; text-transform:uppercase; letter-spacing:.08em; color:#94a3b8; font-weight:700; margin-bottom:6px;}
  .party-name { font-weight:700; font-size:15px; color:#0f172a;}
  .party-sub { font-size:12px; color:#64748b; margin-top:2px;}
  .recitals-title { font-size:12px; font-weight:800; letter-spacing:.1em; color:#0F1E3D; margin: 8px 0 10px; text-transform:uppercase;}
  .whereas { font-size: 13px; line-height:1.7; color:#334155; margin-bottom: 8px; }
  .nowtherefore { font-size: 13px; line-height:1.7; color:#334155; margin: 12px 0 8px; font-weight:600;}
  .clause { font-size: 13px; line-height:1.7; color:#334155; margin-bottom: 12px; }
  .clause-num { font-weight: 800; color:#0F1E3D; }
  .details-title { font-size:10px; text-transform:uppercase; letter-spacing:.08em; color:#94a3b8; font-weight:700; margin:20px 0 8px;}
  .details { width:100%; border-collapse:collapse; margin-bottom: 24px; font-size:13px;}
  .details th { text-align:left; width:34%; padding:10px 12px; background:#f8fafc; border:1px solid #e2e8f0; color:#64748b; font-size:11px; text-transform:uppercase; letter-spacing:.05em; vertical-align:top;}
  .details td { padding:10px 12px; border:1px solid #e2e8f0; color:#334155; line-height:1.55; white-space:pre-wrap;}
  .figures { display:flex; gap:32px; margin-bottom: 28px;}
  .figure-label { font-size:10px; text-transform:uppercase; letter-spacing:.06em; color:#94a3b8; font-weight:700;}
  .figure-value { font-size:16px; font-weight:800; color:#0F1E3D; margin-top:2px;}
  .witness { font-size: 13px; font-weight:700; color:#0F1E3D; margin-top: 28px; }
  .signatures { display:flex; gap:40px; margin-top: 28px; }
  .sig-block { flex:1; }
  .sig-line { border-top: 1.5px solid #94a3b8; margin-top: 6px; padding-top: 6px; }
  .sig-name { font-size: 13px; font-weight:700; color:#0f172a; }
  .sig-role { font-size: 11px; color:#94a3b8; }
  .sig-canvas-holder { height: 64px; display:flex; align-items:flex-end; }
  .sig-date { font-size: 11px; color:#94a3b8; margin-top: 12px; }
  .footer { margin-top: 40px; text-align:center; font-size:10.5px; color:#cbd5e1; }
  .actions { max-width:720px; margin: 20px auto 0; display:flex; gap:10px; justify-content:flex-end;}
  button { font-family: inherit; font-size:13px; font-weight:700; padding:10px 18px; border-radius:10px; border:none; cursor:pointer;}
  .btn-primary { background:#1d4ed8; color:#fff; }
  .btn-secondary { background:#e2e8f0; color:#334155; }
  @media print { .actions { display:none; } body { background:#fff; padding:0;} .sheet{ box-shadow:none; } }
</style></head>
<body>
  <div class="sheet">
    <div class="header">
      ${logoHtml}
      <div>
        <div class="company-name">${escapeHtml(partyA.company || partyA.name)}</div>
        <div class="platform-tag">Generated via VentureLink</div>
      </div>
    </div>

    <div class="doc-type">${agreement.type === "investment" ? "Investment Agreement" : "Freelance Services Agreement"}</div>
    <div class="doc-subtitle">${escapeHtml(agreement.title)}</div>
    <div class="meta">Document ID: ${agreement.id.toUpperCase()} &middot; Effective Date: ${new Date(agreement.createdAt).toLocaleDateString([], { month: "long", day: "numeric", year: "numeric" })}</div>

    <div class="preamble">This ${agreement.type === "investment" ? "Investment" : "Freelance Services"} Agreement (this "<strong>Agreement</strong>") is made and entered into as of <strong>${new Date(agreement.createdAt).toLocaleDateString([], { month: "long", day: "numeric", year: "numeric" })}</strong> (the "<strong>Effective Date</strong>"), by and between the Parties identified below. Each of the undersigned may be referred to individually as a "<strong>Party</strong>" and collectively as the "<strong>Parties</strong>".</div>

    <div class="parties">
      <div class="party">
        <div class="party-label">Party A</div>
        <div class="party-name">${escapeHtml(partyA.name)}</div>
        <div class="party-sub">${escapeHtml(ROLE_LABELS[partyA.role])}${partyA.company ? " &middot; " + escapeHtml(partyA.company) : ""}</div>
      </div>
      <div class="party">
        <div class="party-label">Party B</div>
        <div class="party-name">${escapeHtml(partyB.name)}</div>
        <div class="party-sub">${escapeHtml(ROLE_LABELS[partyB.role])}${partyB.company ? " &middot; " + escapeHtml(partyB.company) : ""}</div>
      </div>
    </div>

    <div class="recitals-title">Recitals</div>
    <div class="whereas"><strong>WHEREAS</strong>, ${agreement.type === "investment" ? "Party A desires to invest in, and Party B owns and operates, the venture referenced in this Agreement" : "Party A desires to engage, and Party B is willing to provide, the professional services referenced in this Agreement"};</div>
    <div class="whereas"><strong>WHEREAS</strong>, the Parties wish to set forth in writing the terms and conditions governing ${agreement.type === "investment" ? "the proposed investment" : "the provision of such services"};</div>
    <div class="nowtherefore"><strong>NOW, THEREFORE</strong>, in consideration of the mutual covenants and agreements set forth herein, and for other good and valuable consideration, the receipt and sufficiency of which are hereby acknowledged, the Parties agree as follows:</div>

    ${(agreement.terms || "").split("\n\n").filter(Boolean).map(clause => {
      const m = clause.match(/^(\d+)\.\s*(.*)$/);
      if (m) return `<div class="clause"><span class="clause-num">${m[1]}.</span> ${escapeHtml(m[2])}</div>`;
      return `<div class="clause">${escapeHtml(clause)}</div>`;
    }).join("")}

    ${agreement.details && agreement.details.length ? `<div class="details-title">Schedule A &mdash; Agreement Details</div>
    <table class="details">${agreement.details.map(d => `<tr><th>${escapeHtml(d.label)}</th><td>${escapeHtml(d.value)}</td></tr>`).join("")}</table>` : ""}

    ${agreement.amount != null || agreement.duration ? `<div class="figures">
      ${agreement.amount != null ? `<div><div class="figure-label">Investment Amount</div><div class="figure-value">$${agreement.amount.toLocaleString()}</div></div>` : ""}
      ${agreement.duration ? `<div><div class="figure-label">Duration</div><div class="figure-value">${escapeHtml(agreement.duration)}</div></div>` : ""}
    </div>` : ""}

    <div class="witness">IN WITNESS WHEREOF, the Parties have executed this Agreement as of the Effective Date first written above.</div>

    <div class="signatures">
      <div class="sig-block">
        <div class="sig-canvas-holder">${sigBlock(partyA)}</div>
        <div class="sig-line">
          <div class="sig-name">${escapeHtml(partyA.name)}</div>
          <div class="sig-role">${escapeHtml(ROLE_LABELS[partyA.role])}${partyA.company ? " &middot; " + escapeHtml(partyA.company) : ""}</div>
        </div>
        <div class="sig-date">Date: ____________________</div>
      </div>
      <div class="sig-block">
        <div class="sig-canvas-holder">${sigBlock(partyB)}</div>
        <div class="sig-line">
          <div class="sig-name">${escapeHtml(partyB.name)}</div>
          <div class="sig-role">${escapeHtml(ROLE_LABELS[partyB.role])}${partyB.company ? " &middot; " + escapeHtml(partyB.company) : ""}</div>
        </div>
        <div class="sig-date">Date: ____________________</div>
      </div>
    </div>

    <div class="footer">This document was generated electronically via VentureLink and represents a preliminary, good-faith record of agreement between the Parties.</div>
  </div>
  <div class="actions">
    <button class="btn-secondary" onclick="window.close()">Close</button>
    <button class="btn-primary" onclick="window.print()">Print / Save as PDF</button>
  </div>
</body></html>`;
    win.document.write(html);
    win.document.close();
  }

  // ---- Offer letter generation (professional letter format) ----
  function openOfferLetter(offer) {
    const sender = users.find(u => u.id === offer.fromId);
    const recipient = users.find(u => u.id === offer.toId);
    if (!sender || !recipient) return;
    const terms = offerTerms(recipient.role);
    const freelance = recipient.role === "freelancer";
    const win = window.open("", "_blank", "width=860,height=1120");
    if (!win) {
      alert(`Please allow pop-ups for this site to view the ${terms.nounLower} letter.`);
      return;
    }
    const logoHtml = sender.companyLogoDataUrl ? `<img src="${sender.companyLogoDataUrl}" alt="logo" style="width:56px;height:56px;object-fit:contain;border-radius:12px;border:1px solid #e2e8f0;" />` : `<div style="width:56px;height:56px;border-radius:12px;background:#0F1E3D;color:#fff;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:22px;font-family:'Plus Jakarta Sans',sans-serif;">${escapeHtml((sender.company || sender.name).charAt(0).toUpperCase())}</div>`;
    const senderOrg = sender.company || sender.name;
    const letterRows = [];
    letterRows.push({ label: "Position / Project", value: offer.title });
    if (offer.duration && offer.duration.trim()) letterRows.push({ label: "Duration", value: offer.duration.trim() });
    if (offer.rate && offer.rate.trim()) letterRows.push({ label: terms.packageLabel, value: formatCompensation(offer.rate, freelance) });
    letterRows.push({ label: terms.offerDateLabel, value: new Date(offer.createdAt).toLocaleDateString([], { month: "long", day: "numeric", year: "numeric" }) });
    letterRows.push({ label: terms.offerStatusLabel, value: offer.status === "accepted" ? "Accepted" : offer.status === "declined" ? "Declined" : "Pending" });
    const html = `<!doctype html><html><head><title>${terms.docTitle} - ${escapeHtml(offer.title)}</title><meta charset="utf-8"/>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@600&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
  * { box-sizing: border-box; }
  body { font-family: 'Plus Jakarta Sans', sans-serif; margin:0; padding:48px 16px; color:#1e293b; background:#f1f5f9; }
  .sheet { max-width: 720px; margin: 0 auto; background:#fff; padding: 56px; border-radius: 6px; box-shadow: 0 1px 3px rgba(0,0,0,.08); }
  .letterhead { display:flex; align-items:center; gap:16px; border-bottom: 2px solid #0F1E3D; padding-bottom:24px; margin-bottom:32px; }
  .letterhead-name { font-size: 22px; font-weight: 800; color:#0F1E3D; }
  .letterhead-sub { font-size:11px; letter-spacing:.08em; text-transform:uppercase; color:#94a3b8; font-weight:700; margin-top:2px;}
  .doc-title { font-size: 12px; text-transform:uppercase; letter-spacing:.1em; color:#2C4A8C; font-weight:800; margin-bottom: 24px; text-align:center;}
  .date-line { font-size: 13px; color:#334155; margin-bottom: 20px; }
  .recipient { font-size: 13px; line-height:1.6; color:#334155; margin-bottom: 24px; }
  .recipient .rname { font-weight:700; color:#0f172a; }
  .subject { font-size: 14px; font-weight:700; color:#0F1E3D; margin-bottom: 20px; }
  .body-text { font-size: 13.5px; line-height:1.75; color:#334155; margin-bottom: 16px; }
  .details-title { font-size:10px; text-transform:uppercase; letter-spacing:.08em; color:#94a3b8; font-weight:700; margin:8px 0 8px;}
  .details { width:100%; border-collapse:collapse; margin-bottom: 24px; font-size:13px;}
  .details th { text-align:left; width:34%; padding:10px 12px; background:#f8fafc; border:1px solid #e2e8f0; color:#64748b; font-size:11px; text-transform:uppercase; letter-spacing:.05em; vertical-align:top;}
  .details td { padding:10px 12px; border:1px solid #e2e8f0; color:#334155; line-height:1.55; white-space:pre-wrap;}
  .closing { font-size: 13.5px; line-height:1.75; color:#334155; margin-top: 8px; }
  .sig { margin-top: 40px; }
  .sig-name { font-family:'Dancing Script',cursive; font-size:30px; color:#0F1E3D; }
  .sig-line { border-top: 1.5px solid #94a3b8; margin-top: 6px; padding-top: 6px; max-width: 280px;}
  .sig-role { font-size: 11px; color:#94a3b8; }
  .footer { margin-top: 40px; text-align:center; font-size:10.5px; color:#cbd5e1; }
  .actions { max-width:720px; margin: 20px auto 0; display:flex; gap:10px; justify-content:flex-end;}
  button { font-family: inherit; font-size:13px; font-weight:700; padding:10px 18px; border-radius:10px; border:none; cursor:pointer;}
  .btn-primary { background:#1d4ed8; color:#fff; }
  .btn-secondary { background:#e2e8f0; color:#334155; }
  @media print { .actions { display:none; } body { background:#fff; padding:0;} .sheet{ box-shadow:none; } }
</style></head>
<body>
  <div class="sheet">
    <div class="letterhead">
      ${logoHtml}
      <div>
        <div class="letterhead-name">${escapeHtml(senderOrg)}</div>
        <div class="letterhead-sub">${terms.subject} &middot; via VentureLink</div>
      </div>
    </div>

    <div class="doc-title">${terms.docTitle}</div>

    <div class="date-line">${new Date(offer.createdAt).toLocaleDateString([], { month: "long", day: "numeric", year: "numeric" })}</div>

    <div class="recipient">
      <div class="rname">${escapeHtml(recipient.name)}</div>
      <div>${escapeHtml(ROLE_LABELS[recipient.role])}${recipient.company ? " &middot; " + escapeHtml(recipient.company) : ""}</div>
    </div>

    <div class="subject">Subject: ${terms.subject} &mdash; ${escapeHtml(offer.title)}</div>

    <div class="body-text">Dear ${escapeHtml(recipient.name.split(" ")[0])},</div>
    <div class="body-text">We are pleased to extend to you a ${terms.nounLower} to engage on <strong>${escapeHtml(offer.title)}</strong>${offer.duration && offer.duration.trim() ? ` for a duration of <strong>${escapeHtml(offer.duration.trim())}</strong>` : ""}${offer.rate && offer.rate.trim() ? ` at a ${terms.payWord} of <strong>${escapeHtml(formatCompensation(offer.rate, freelance))}</strong>${freelance ? ", payable against the agreed milestones for this engagement" : ", quoted on an annual (per annum) basis"}` : ""}.</div>
    ${offer.description && offer.description.trim() ? `<div class="body-text"><strong>Scope of work:</strong> ${escapeHtml(offer.description.trim())}</div>` : ""}
    <div class="body-text">We believe your expertise is a strong match for this engagement and we would be delighted to have you on board. Please review the details below and indicate your acceptance through the VentureLink platform.</div>

    <div class="details-title">${terms.detailsTitle}</div>
    <table class="details">${letterRows.map(d => `<tr><th>${escapeHtml(d.label)}</th><td>${escapeHtml(d.value)}</td></tr>`).join("")}</table>

    <div class="closing">We look forward to working with you.</div>
    <div class="closing">Sincerely,</div>

    <div class="sig">
      <div class="sig-name">${escapeHtml(sender.name)}</div>
      <div class="sig-line">
        <div class="sig-role">${escapeHtml(ROLE_LABELS[sender.role])}${sender.company ? " &middot; " + escapeHtml(sender.company) : ""}</div>
      </div>
    </div>

    <div class="footer">This ${terms.nounLower} letter was generated electronically via VentureLink.</div>
  </div>
  <div class="actions">
    <button class="btn-secondary" onclick="window.close()">Close</button>
    <button class="btn-primary" onclick="window.print()">Print / Save as PDF</button>
  </div>
</body></html>`;
    win.document.write(html);
    win.document.close();
  }
  const OFFER_DESC_LIMIT = 180;
  function truncateOfferText(text) {
    if (!text) return "";
    if (text.length <= OFFER_DESC_LIMIT) return text;
    return text.slice(0, OFFER_DESC_LIMIT).trimEnd() + "…";
  }
  function toggleOfferExpanded(id) {
    setExpandedOffers(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  }

  // Shown on the sign-in and sign-up cards too, so the interface language can
  // be chosen before an account exists.
  const langPicker = <div className="flex items-center gap-1.5 text-slate-400">
      <Globe className="w-4 h-4" />
      <select data-vl-i18n="off" value={lang} onChange={e => setLang(e.target.value)} className="text-xs font-semibold text-slate-600 border border-slate-200 rounded-lg px-2 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 cursor-pointer" title="Language / மொழி / भाषा">
        {I18N_LANGS.map(l => <option key={l.code} value={l.code}>{l.label}</option>)}
      </select>
    </div>;

  // ======================== AUTH PAGES ========================
  if (!latestCu) {
    if (view === "login") {
      return <div className="min-h-screen bg-gradient-to-br from-slate-900 via-[#1B2D5B] to-blue-950 flex items-center justify-center p-4" style={{
        fontFamily: "var(--font-family)"
      }}>
          <div className="w-full max-w-md">
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/40">
                  <Zap className="w-7 h-7 text-white" />
                </div>
                <span className="text-3xl font-bold text-white tracking-tight">VentureLink</span>
              </div>
              <p className="text-slate-400">The professional network for building and funding ventures.</p>
            </div>
            <div className="bg-white rounded-2xl shadow-2xl p-8">
              <div className="flex items-start justify-between gap-4 mb-6">
                <h2 className="text-2xl font-bold text-slate-900">Sign in to your account</h2>
                {langPicker}
              </div>
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Email address</label>
                  <input type="email" autoComplete="off" name="ven-login-email" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 text-slate-900 bg-slate-50 focus:bg-white transition-colors text-sm" placeholder="you@example.com" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Password</label>
                  <input type="password" autoComplete="new-password" name="ven-login-password" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 text-slate-900 bg-slate-50 focus:bg-white transition-colors text-sm" placeholder="••••••••" />
                </div>
                {loginError && <p className="text-rose-600 text-sm font-medium">{loginError}</p>}
                <button type="submit" disabled={authPending} className="w-full bg-blue-700 hover:bg-blue-800 text-white font-bold py-3 rounded-xl transition-colors shadow-sm shadow-blue-200 text-sm disabled:opacity-60 disabled:cursor-not-allowed">
                  {authPending ? "Signing in…" : "Sign in"}
                </button>
              </form>
              <div className="flex items-center gap-3 my-4">
                <div className="flex-1 h-px bg-slate-100" />
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">or</span>
                <div className="flex-1 h-px bg-slate-100" />
              </div>
              <button type="button" onClick={handleGoogleSignIn} disabled={authPending} className="w-full flex items-center justify-center gap-2.5 border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold py-3 rounded-xl transition-colors text-sm disabled:opacity-60">
                <svg className="w-4.5 h-4.5" width="18" height="18" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.6 20.5H42V24H24v8h11.3C33.7 36.4 29.3 40 24 40c-8.8 0-16-7.2-16-16s7.2-16 16-16c4.1 0 7.8 1.6 10.7 4.1l5.7-5.7C36.6 2.9 30.6 0.8 24 0.8 11.2.8.8 11.2.8 24S11.2 47.2 24 47.2 47.2 36.8 47.2 24c0-1.2-.1-2.3-.4-3.5z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.3 19 12 24 12c3.3 0 6.3 1.3 8.5 3.3l6.1-6.1C34.9 6 29.7 3.8 24 3.8c-7.6 0-14.2 4.3-17.7 10.9z"/><path fill="#4CAF50" d="M24 47.2c5.6 0 10.7-2.1 14.6-5.5l-6.7-5.7c-2.2 1.6-5 2.6-7.9 2.6-5.2 0-9.6-3.4-11.2-8.1l-6.6 5.1C8 41.3 15.3 47.2 24 47.2z"/><path fill="#1976D2" d="M43.6 20.5H42V24H24v8h11.3c-.8 2.2-2.1 4.1-3.8 5.6l6.7 5.7C42.1 44.5 47.2 37 47.2 24c0-1.2-.1-2.3-.4-3.5z"/></svg>
                Continue with Google
              </button>
              <p className="text-center text-sm text-slate-500 mt-6">
                New to VentureLink?{" "}
                <button onClick={() => setView("register")} className="text-blue-700 font-bold hover:underline">Create account</button>
              </p>
              <div className="mt-6 pt-6 border-t border-slate-100">
                <p className="text-center text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Demo accounts (password 123)</p>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {DEMO_ACCOUNTS.map(d => <button key={d.email} type="button" onClick={() => handleDemoLogin(d.email)} className="px-3 py-2 rounded-xl text-xs font-semibold border border-slate-200 text-slate-600 hover:border-blue-300 hover:text-blue-700 hover:bg-blue-50 transition-colors text-left">
                      <span className="block truncate">{d.name}</span>
                      <span className="block text-[10px] font-normal text-slate-400">{ROLE_LABELS[d.role]}</span>
                    </button>)}
                </div>
              </div>
            </div>
          </div>
          {/* Simulated Google consent screen — active when no real Google app credentials are configured */}
          {oauthModalOpen && <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center z-50 p-4" onClick={() => setOauthModalOpen(false)}>
              <div className="bg-white rounded-3xl shadow-2xl max-w-[420px] w-full p-7 sm:p-8 max-h-[92vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                <div className="flex items-center gap-2 mb-6">
                  <svg width="20" height="20" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.6 20.5H42V24H24v8h11.3C33.7 36.4 29.3 40 24 40c-8.8 0-16-7.2-16-16s7.2-16 16-16c4.1 0 7.8 1.6 10.7 4.1l5.7-5.7C36.6 2.9 30.6 0.8 24 0.8 11.2.8.8 11.2.8 24S11.2 47.2 24 47.2 47.2 36.8 47.2 24c0-1.2-.1-2.3-.4-3.5z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.3 19 12 24 12c3.3 0 6.3 1.3 8.5 3.3l6.1-6.1C34.9 6 29.7 3.8 24 3.8c-7.6 0-14.2 4.3-17.7 10.9z"/><path fill="#4CAF50" d="M24 47.2c5.6 0 10.7-2.1 14.6-5.5l-6.7-5.7c-2.2 1.6-5 2.6-7.9 2.6-5.2 0-9.6-3.4-11.2-8.1l-6.6 5.1C8 41.3 15.3 47.2 24 47.2z"/><path fill="#1976D2" d="M43.6 20.5H42V24H24v8h11.3c-.8 2.2-2.1 4.1-3.8 5.6l6.7 5.7C42.1 44.5 47.2 37 47.2 24c0-1.2-.1-2.3-.4-3.5z"/></svg>
                  <p className="text-sm font-semibold text-slate-700">Sign in with Google</p>
                  <span className="ml-auto text-[10px] font-bold text-amber-600 bg-amber-50 border border-amber-200 rounded-full px-2 py-0.5">Demo provider</span>
                </div>
                <h3 className="text-[22px] leading-snug text-slate-800 mb-1">Choose an account</h3>
                <p className="text-sm text-slate-600 mb-5">to continue to <span className="font-semibold text-slate-800">VentureLink</span></p>
                <div className="divide-y divide-slate-100">
                  {DEMO_ACCOUNTS.map((d, i) => <button key={d.email} onClick={() => {
                setOauthEmail(d.email);
                setOauthName(d.name);
                setOauthRole(d.role);
              }} className={`w-full flex items-center gap-4 px-2 py-2.5 text-left rounded-lg transition-colors ${oauthEmail.toLowerCase() === d.email.toLowerCase() ? "bg-blue-50" : "hover:bg-slate-50"}`}>
                      <span className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0 ${getAvatarColor("u" + (i + 1))}`}>{getInitials(d.name)}</span>
                      <span className="min-w-0">
                        <span className="block text-sm font-medium text-slate-800 truncate">{d.name}</span>
                        <span className="block text-xs text-slate-500 truncate">{d.email}</span>
                      </span>
                      {oauthEmail.toLowerCase() === d.email.toLowerCase() && <Check className="w-4 h-4 text-blue-700 ml-auto flex-shrink-0" />}
                    </button>)}
                  <button onClick={() => {
                setOauthEmail("");
                setOauthName("");
                setOauthRole("entrepreneur");
              }} className={`w-full flex items-center gap-4 px-2 py-2.5 text-left rounded-lg transition-colors ${oauthEmail === "" ? "bg-blue-50" : "hover:bg-slate-50"}`}>
                    <span className="w-9 h-9 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 flex-shrink-0">
                      <UserPlus className="w-4 h-4" />
                    </span>
                    <span className="text-sm font-medium text-slate-700">Use another account</span>
                  </button>
                </div>
                {oauthEmail === "" && <div className="mt-3 bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-2">
                    <input type="email" value={oauthEmail} onChange={e => setOauthEmail(e.target.value)} placeholder="Google email address" className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white" />
                    <input type="text" value={oauthName} onChange={e => setOauthName(e.target.value)} placeholder="Display name (new account)" className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white" />
                    <div className="flex items-center gap-2">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">Join as</p>
                      <select value={oauthRole} onChange={e => setOauthRole(e.target.value)} className="flex-1 px-3 py-2 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-600">
                        {Object.keys(ROLE_LABELS).filter(k => k !== "admin").map(k => <option key={k} value={k}>{ROLE_LABELS[k]}</option>)}
                      </select>
                    </div>
                    <p className="text-[10px] text-slate-400">An existing VentureLink account for this address always signs in with its own saved profile and role.</p>
                  </div>}
                {oauthError && <p className="text-rose-600 text-sm font-medium mt-3">{oauthError}</p>}
                <div className="flex items-center justify-between mt-6">
                  <button onClick={() => setOauthModalOpen(false)} className="text-sm font-semibold text-blue-700 hover:bg-blue-50 px-4 py-2.5 rounded-xl transition-colors">Cancel</button>
                  <button onClick={handleOauthDemoConfirm} disabled={authPending} className="bg-blue-700 hover:bg-blue-800 disabled:opacity-60 text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition-colors">
                    {authPending ? "Authorising…" : "Continue"}
                  </button>
                </div>
                <div className="flex items-center gap-4 mt-6 pt-4 border-t border-slate-100">
                  <p className="flex items-center gap-1.5 text-[11px] text-slate-400">
                    <Globe className="w-3.5 h-3.5" /> English (United Kingdom)
                  </p>
                  <p className="ml-auto text-[11px] text-slate-400">Help · Privacy · Terms</p>
                </div>
                <p className="text-[10px] text-slate-400 mt-3 leading-relaxed">Sign-in is OAuth find-or-create; a new address is created with the role chosen above. Set <code>GOOGLE_CLIENT_ID</code> and <code>GOOGLE_CLIENT_SECRET</code> on the backend to route this through real Google instead of this demo provider.</p>
              </div>
            </div>}
        </div>;
    }

    // Register Page
    return <div className="min-h-screen bg-gradient-to-br from-slate-900 via-[#1B2D5B] to-blue-950 flex items-center justify-center p-4 py-12" style={{
      fontFamily: "var(--font-family)"
    }}>
        <div className="w-full max-w-lg">
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 mb-2">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-white">VentureLink</span>
            </div>
            <p className="text-slate-400 text-sm">Join the entrepreneur ecosystem</p>
          </div>
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            <div className="flex items-start justify-between gap-4 mb-6">
              <h2 className="text-xl font-bold text-slate-900">Create your account</h2>
              {langPicker}
            </div>
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-2 uppercase tracking-wider">I am a...</label>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {["entrepreneur", "investor", "freelancer", "startup_founder", "mentor"].map(r => <button key={r} type="button" onClick={() => setRegForm(f => ({
                  ...f,
                  role: r
                }))} className={`px-3 py-2 rounded-xl text-xs font-semibold border-2 transition-all ${regForm.role === r ? "border-blue-600 bg-blue-50 text-blue-800" : "border-slate-200 text-slate-500 hover:border-blue-200"}`}>
                      {ROLE_LABELS[r]}
                    </button>)}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name *</label>
                  <input value={regForm.name} onChange={e => setRegForm(f => ({
                  ...f,
                  name: e.target.value
                }))} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm bg-slate-50 focus:bg-white" placeholder="Jane Doe" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Location</label>
                  <input value={regForm.location} onChange={e => setRegForm(f => ({
                  ...f,
                  location: e.target.value
                }))} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm bg-slate-50 focus:bg-white" placeholder="City, Country" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email *</label>
                <input type="email" value={regForm.email} onChange={e => setRegForm(f => ({
                ...f,
                email: e.target.value
              }))} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm bg-slate-50 focus:bg-white" placeholder="you@example.com" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Password *</label>
                <input type="password" value={regForm.password} onChange={e => setRegForm(f => ({
                ...f,
                password: e.target.value
              }))} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm bg-slate-50 focus:bg-white" placeholder="Min. 8 characters" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Company / Org</label>
                  <input value={regForm.company} onChange={e => setRegForm(f => ({
                  ...f,
                  company: e.target.value
                }))} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm bg-slate-50 focus:bg-white" placeholder="Your company" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Position / Title</label>
                  <input value={regForm.position} onChange={e => setRegForm(f => ({
                  ...f,
                  position: e.target.value
                }))} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm bg-slate-50 focus:bg-white" placeholder="CEO / CTO / etc." />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Bio</label>
                <textarea value={regForm.bio} onChange={e => setRegForm(f => ({
                ...f,
                bio: e.target.value
              }))} rows={3} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm resize-none bg-slate-50 focus:bg-white" placeholder="Tell the community about yourself..." />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Industries</label>
                  <input value={regForm.industry} onChange={e => setRegForm(f => ({
                  ...f,
                  industry: e.target.value
                }))} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm bg-slate-50 focus:bg-white" placeholder="FinTech, AI/ML" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Skills</label>
                  <input value={regForm.skills} onChange={e => setRegForm(f => ({
                  ...f,
                  skills: e.target.value
                }))} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm bg-slate-50 focus:bg-white" placeholder="React, Product" />
                </div>
              </div>
              {(regForm.role === "entrepreneur" || regForm.role === "startup_founder") && <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Funding Stage</label>
                  <select value={regForm.fundingStage} onChange={e => setRegForm(f => ({
                ...f,
                fundingStage: e.target.value
              }))} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm bg-white">
                    <option value="">Select stage...</option>
                    {["Pre-idea", "Pre-seed", "Seed", "Series A", "Series B", "Series C+", "Bootstrapped"].map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>}
              {regForm.role === "startup_founder" && <div>
                  <p className="text-xs font-bold text-slate-700 mb-2">Company Details</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Founded Year</label>
                      <input value={regForm.companyFounded} onChange={e => setRegForm(f => ({
                    ...f,
                    companyFounded: e.target.value
                  }))} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm bg-slate-50 focus:bg-white" placeholder="2022" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Team Size</label>
                      <input value={regForm.companySize} onChange={e => setRegForm(f => ({
                    ...f,
                    companySize: e.target.value
                  }))} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm bg-slate-50 focus:bg-white" placeholder="e.g. 12 employees" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Headquarters</label>
                      <input value={regForm.companyHeadquarters} onChange={e => setRegForm(f => ({
                    ...f,
                    companyHeadquarters: e.target.value
                  }))} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm bg-slate-50 focus:bg-white" placeholder="City, Country" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Registration No.</label>
                      <input value={regForm.companyRegistration} onChange={e => setRegForm(f => ({
                    ...f,
                    companyRegistration: e.target.value
                  }))} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm bg-slate-50 focus:bg-white" placeholder="Company registration number" />
                    </div>
                  </div>
                </div>}
              {regForm.role === "investor" && <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Investment Range</label>
                    <input value={regForm.investmentRange} onChange={e => setRegForm(f => ({
                  ...f,
                  investmentRange: e.target.value
                }))} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm bg-slate-50" placeholder="$50K - $500K" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Portfolio Size</label>
                    <input type="number" value={regForm.portfolioCompanies} onChange={e => setRegForm(f => ({
                  ...f,
                  portfolioCompanies: e.target.value
                }))} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm bg-slate-50" placeholder="10" />
                  </div>
                </div>}
              {regForm.role === "investor" && <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Agreement Policy</label>
                  <textarea value={regForm.agreementPolicy} onChange={e => setRegForm(f => ({
                ...f,
                agreementPolicy: e.target.value
              }))} rows={3} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm resize-none bg-slate-50" placeholder="Describe your investment agreement policy — terms, equity expectations, conditions founders must accept before submitting projects..." />
                  <p className="text-xs text-slate-400 mt-1">This policy is shown to founders before they submit a project to your requirements.</p>
                </div>}
              {regForm.role === "freelancer" && <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Hourly Rate</label>
                  <input value={regForm.hourlyRate} onChange={e => setRegForm(f => ({
                ...f,
                hourlyRate: e.target.value
              }))} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm bg-slate-50" placeholder="$100/hr" />
                </div>}
              {regError && <p className="text-rose-600 text-sm font-medium">{regError}</p>}
              <button type="submit" disabled={authPending} className="w-full bg-blue-700 hover:bg-blue-800 text-white font-bold py-3 rounded-xl transition-colors text-sm disabled:opacity-60 disabled:cursor-not-allowed">
                {authPending ? "Creating account…" : "Create Account"}
              </button>
            </form>
            <p className="text-center text-sm text-slate-500 mt-4">
              Already have an account?{" "}
              <button onClick={() => setView("login")} className="text-blue-700 font-bold hover:underline">Sign in</button>
            </p>
          </div>
        </div>
      </div>;
  }

  // ======================== MAIN APP ========================
  const cu = latestCu;
  const connectedUsers = users.filter(u => cu.connections.includes(u.id));
  const allConvoUsers = connectedUsers;
  const activeConvoMessages = activeConvoId ? messages.filter(m => m.fromId === cu.id && m.toId === activeConvoId || m.fromId === activeConvoId && m.toId === cu.id) : [];
  const activeConvoUser = activeConvoId ? users.find(u => u.id === activeConvoId) : null;
  const unreadCount = messages.filter(m => m.toId === cu.id && !m.read).length;
  const unreadMsgList = messages.filter(m => m.toId === cu.id && !m.read).slice().reverse().map(m => ({
    ...m,
    senderName: users.find(u => u.id === m.fromId)?.name || "Someone"
  }));
  const myProjects = projects.filter(p => p.ownerId === cu.id);
  const myProposals = proposals.filter(p => p.entrepreneurId === cu.id);
  const myInvestments = investments.filter(i => i.investorId === cu.id);
  const totalInvested = myInvestments.reduce((sum, i) => sum + i.amount, 0);
  const myInvestmentGrowth = myInvestments.map(inv => ({
    investment: inv,
    series: getInvestmentGrowthSeries(inv)
  }));
  const currentPortfolioValue = myInvestmentGrowth.reduce((sum, g) => sum + g.series[g.series.length - 1].value, 0);
  const portfolioGrowthPercent = totalInvested > 0 ? (currentPortfolioValue - totalInvested) / totalInvested * 100 : 0;
  const myRequirements = requirements.filter(r => r.investorId === cu.id);
  const proposalsForMyRequirements = proposals.filter(p => p.investorId === cu.id);
  const myReceivedOffers = offers.filter(o => o.toId === cu.id);
  const mySentOffers = offers.filter(o => o.fromId === cu.id);
  const myAgreements = agreements.filter(a => a.partyAId === cu.id || a.partyBId === cu.id);
  const myHelpRequests = helpRequests.filter(r => r.founderId === cu.id);
  const myWebinarRegistrations = webinars.filter(w => w.registeredUserIds.includes(cu.id)).map(w => w.id);
  const pendingOfferCount = myReceivedOffers.filter(o => o.status === "pending").length;
  const showPortfolioNav = cu.role === "entrepreneur" || cu.role === "startup_founder" || cu.role === "freelancer" || cu.role === "mentor";
  const showInvestmentsNav = cu.role === "investor";
  const showOffersNav = cu.role === "freelancer" || cu.role === "investor" || mySentOffers.length > 0 || myReceivedOffers.length > 0;
  const showHelpNav = cu.role === "startup_founder" || cu.role === "entrepreneur" || cu.role === "investor" || cu.role === "mentor";
  const navItems = [{
    id: "dashboard",
    icon: Home,
    label: t("Dashboard")
  }, ...(cu.role === "admin" ? [{
    id: "admin",
    icon: ShieldCheck,
    label: t("Admin Dashboard")
  }] : []), {
    id: "discover",
    icon: Search,
    label: t("Discover")
  }, {
    id: "projects",
    icon: Filter,
    label: t("Browse Projects")
  }, {
    id: "connections",
    icon: Users,
    label: t("Connections"),
    badge: cu.pendingReceived.length
  }, {
    id: "messages",
    icon: MessageCircle,
    label: t("Messages"),
    badge: unreadCount
  }, ...(showPortfolioNav ? [{
    id: "portfolio",
    icon: Briefcase,
    label: t("Portfolio")
  }] : []), ...(showPortfolioNav ? [{
    id: "requirements",
    icon: DollarSign,
    label: t("Requirements")
  }] : []), ...(showInvestmentsNav ? [{
    id: "investments",
    icon: Wallet,
    label: t("Investments")
  }] : []), ...(showOffersNav ? [{
    id: "offers",
    icon: Send,
    label: t("Offers"),
    badge: pendingOfferCount
  }] : []), ...(showHelpNav ? [{
    id: "help",
    icon: Zap,
    label: cu.role === "startup_founder" ? t("Get Help") : t("Help Founders")
  }] : []), ...(cu.role !== "mentor" ? [{
    id: "agreements",
    icon: CheckCircle,
    label: t("Agreements")
  }] : []), {
    id: "calendar",
    icon: Calendar,
    label: t("My Meetings")
  }, {
    id: "webinars",
    icon: Video,
    label: t("Webinars")
  }, {
    id: "profile",
    icon: User,
    label: t("My Profile")
  }];
  const getConnectionStatus = userId => {
    if (cu.connections.includes(userId)) return "connected";
    if (cu.pendingSent.includes(userId)) return "pending";
    if (cu.pendingReceived.includes(userId)) return "received";
    return "none";
  };

  // ---- Admin: user management ----
  function toggleUserVerified(userId) {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, verified: !u.verified } : u));
  }
  function renderAdminDashboard() {
    const stats = adminStats;
    const statCard = (label, value, sub, cls) => <div className={`bg-white rounded-2xl border border-slate-100 shadow-sm p-5 ${cls || ""}`}>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{label}</p>
            <p className="text-3xl font-bold text-slate-900 mt-1">{value}</p>
            {sub && <p className="text-xs text-slate-500 mt-1">{sub}</p>}
          </div>;
    return <div className="p-6 lg:p-8 max-w-6xl mx-auto pb-12">
          <div className="mb-8 flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-6 h-6 text-slate-800" /> Platform Administration
              </h1>
              <p className="text-slate-500 mt-1 text-sm">Live metrics computed by the backend from MongoDB — JWT-protected, admin-only endpoint.</p>
            </div>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-2.5 py-1">GET /api/admin/stats</span>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {statCard("Total Users", stats ? stats.users.total : users.length, stats ? Object.entries(stats.users.byRole).map(([r, n]) => `${ROLE_LABELS[r] || r}: ${n}`).join(" · ") : null)}
            {statCard("Projects", stats ? stats.projects.total : projects.length, stats ? `${stats.projects.saas} SaaS · ${stats.projects.product} Product · ${stats.projects.patented} patented` : null)}
            {statCard("Offers & Agreements", stats ? stats.offers.total + stats.agreements : offers.length + agreements.length, stats ? `${stats.offers.pending} offers pending` : null)}
            {statCard("Capital Invested", stats ? `$${(stats.investments.amount / 1000000).toFixed(2)}M` : `$${(investments.reduce((s, i) => s + i.amount, 0) / 1000000).toFixed(2)}M`, stats ? `${stats.investments.total} investments · ${stats.proposals.total} proposals` : null)}
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden mb-8">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-900">User Management</h3>
              <p className="text-xs text-slate-400">{users.length} accounts · password hashes never leave the server</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="text-left text-xs text-slate-400 uppercase tracking-wider border-b border-slate-100">
                      <th className="px-5 py-3">User</th>
                      <th className="px-5 py-3">Role</th>
                      <th className="px-5 py-3">Company</th>
                      <th className="px-5 py-3">Auth</th>
                      <th className="px-5 py-3">Connections</th>
                      <th className="px-5 py-3">Verified</th>
                    </tr></thead>
                <tbody>
                  {users.map(u => <tr key={u.id} className="border-b border-slate-50 hover:bg-slate-50">
                        <td className="px-5 py-3">
                          <p className="font-semibold text-slate-900">{u.name}</p>
                          <p className="text-xs text-slate-400">{u.email}</p>
                        </td>
                        <td className="px-5 py-3"><RoleBadge role={u.role} /></td>
                        <td className="px-5 py-3 text-slate-600">{u.company || "—"}</td>
                        <td className="px-5 py-3 text-xs">{u.password ? <span className="text-slate-500">Password</span> : <span className="text-blue-700 font-semibold">OAuth</span>}</td>
                        <td className="px-5 py-3 text-slate-600">{(u.connections || []).length}</td>
                        <td className="px-5 py-3">
                          <button onClick={() => toggleUserVerified(u.id)} className={`text-xs font-semibold rounded-full px-3 py-1 border transition-colors ${u.verified ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100" : "bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100"}`}>
                            {u.verified ? "Verified ✓" : "Unverified"}
                          </button>
                        </td>
                      </tr>)}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-900">Recent Projects</h3>
            </div>
            <div className="divide-y divide-slate-50">
              {projects.slice(-6).reverse().map(p => {
              const owner = users.find(u => u.id === p.ownerId);
              const isPatented = p.patented === true || p.patented === "yes";
              return <div key={p.id} className="px-5 py-3 flex items-center gap-3">
                    <span className={`w-2 h-2 rounded-full flex-shrink-0 ${isPatented ? "bg-emerald-500" : "bg-slate-300"}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-900 truncate">{p.title}</p>
                      <p className="text-xs text-slate-400 truncate">{owner?.name || "Unknown"} · {p.industry} · {p.projectType === "product" ? "Product" : "SaaS"}</p>
                    </div>
                    {isPatented && <span className="text-[10px] font-bold text-violet-700 bg-violet-50 border border-violet-200 rounded-full px-2 py-0.5 flex-shrink-0">Patent {p.patentNumber ? p.patentNumber : "filed"}</span>}
                    {p.noveltyStatus && <span className={`text-[10px] font-bold rounded-full px-2 py-0.5 flex-shrink-0 border ${p.noveltyStatus === "cleared" ? "text-emerald-700 bg-emerald-50 border-emerald-200" : p.noveltyStatus === "flagged" ? "text-rose-700 bg-rose-50 border-rose-200" : "text-amber-700 bg-amber-50 border-amber-200"}`}>{p.noveltyStatus}</span>}
                  </div>;
            })}
            </div>
          </div>
        </div>;
  }

  function renderContent() {
    switch (view) {
      // ======================== ADMIN DASHBOARD ========================
      case "admin":
        return renderAdminDashboard();

      // ======================== DASHBOARD ========================
      case "dashboard":
        {
          const isFounderRole = cu.role === "startup_founder" || cu.role === "entrepreneur";
          const isInvestorRole = cu.role === "investor";
          const founderProjects = projects.filter(p => p.ownerId === cu.id);
          const founderFundingRequired = founderProjects.reduce((sum, p) => sum + (p.fundingRequired || 0), 0);
          const founderFundingReceived = founderProjects.reduce((sum, p) => sum + getProjectFundingReceived(p.id), 0);
          const founderFundingPct = founderFundingRequired > 0 ? Math.min(100, Math.round(founderFundingReceived / founderFundingRequired * 100)) : 0;
          const founderProposals = proposals.filter(p => p.entrepreneurId === cu.id);
          const interestedInvestorIds = new Set();
          investments.filter(i => i.entrepreneurId === cu.id).forEach(i => interestedInvestorIds.add(i.investorId));
          founderProposals.forEach(p => interestedInvestorIds.add(p.investorId));
          cu.connections.forEach(id => {
            const u = users.find(u => u.id === id);
            if (u && u.role === "investor") interestedInvestorIds.add(id);
          });
          if (founderProjects.length > 0) {
            requirements.forEach(r => {
              const industryMatch = founderProjects.some(p => p.industry === r.industry) || cu.industry.includes(r.industry);
              if (industryMatch) interestedInvestorIds.add(r.investorId);
            });
          }
          const topInterestedInvestors = Array.from(interestedInvestorIds).map(id => users.find(u => u.id === id)).filter(Boolean).map(inv => ({
            user: inv,
            score: calcMatchScore(cu, inv)
          })).sort((a, b) => b.score - a.score).slice(0, 5);
          const recommendedStartups = isInvestorRole ? projects.filter(p => p.ownerId !== cu.id && !myInvestments.some(i => i.projectId === p.id)).map(p => {
            const owner = users.find(u => u.id === p.ownerId);
            return owner ? {
              project: p,
              owner,
              score: calcMatchScore(cu, owner)
            } : null;
          }).filter(Boolean).sort((a, b) => b.score - a.score).slice(0, 4) : [];
          const investorPendingProposals = proposalsForMyRequirements.filter(p => p.status === "pending").length;
          return <div className="p-6 lg:p-8 max-w-5xl mx-auto pb-12">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-slate-900">{t("Hello")}, {cu.name.split(" ")[0]} 👋</h1>
            <p className="text-slate-500 mt-1 text-sm">{t("Here is what is happening in your network today.")}</p>
          </div>

          {(() => {
            const recent = recentlyAccessed.filter(e => e.userId === cu.id).slice(-6).reverse().map(e => {
              const u = users.find(x => x.id === e.targetId);
              return u && u.id !== cu.id ? {
                e,
                u
              } : null;
            }).filter(Boolean);
            if (recent.length === 0) return null;
            return <div className="mb-8 bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="w-4 h-4 text-blue-700" />
                  <h3 className="font-bold text-slate-900 text-sm">{t("Recently accessed")}</h3>
                  <span className="text-[10px] text-slate-400 font-medium">your last visited profiles, newest first</span>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {recent.map(({e, u}) => <button key={e.id} onClick={() => viewUserProfile(u.id)} className="flex items-center gap-2 pl-1.5 pr-3 py-1.5 rounded-full border border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition-colors">
                        <UserAvatar user={u} size="xs" />
                        <span className="text-xs font-semibold text-slate-700">{u.name}</span>
                        <span className="text-[10px] text-slate-400">{formatAgo(e.at)}</span>
                      </button>)}
                </div>
              </div>;
          })()}

          {isFounderRole && <div className="mb-8 bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-bold text-slate-900 flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-blue-700" /> Startup Overview
                </h3>
                <button onClick={() => setView("portfolio")} className="text-xs text-blue-700 font-semibold hover:underline">Manage projects</button>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
                <div className="bg-slate-50 rounded-xl p-4">
                  <div className="text-xs text-slate-500 font-semibold mb-1">Funding Required</div>
                  <div className="text-xl font-bold text-slate-900">${founderFundingRequired.toLocaleString()}</div>
                </div>
                <div className="bg-slate-50 rounded-xl p-4">
                  <div className="text-xs text-slate-500 font-semibold mb-1">Funding Received</div>
                  <div className="text-xl font-bold text-emerald-600">${founderFundingReceived.toLocaleString()}</div>
                </div>
                <div className="bg-slate-50 rounded-xl p-4">
                  <div className="text-xs text-slate-500 font-semibold mb-1">Investor Interest</div>
                  <div className="text-xl font-bold text-slate-900">{interestedInvestorIds.size}</div>
                </div>
                <div className="bg-slate-50 rounded-xl p-4">
                  <div className="text-xs text-slate-500 font-semibold mb-1">Proposals · Connections</div>
                  <div className="text-xl font-bold text-slate-900">{founderProposals.length} <span className="text-slate-300">/</span> {cu.connections.length}</div>
                </div>
              </div>
              {founderFundingRequired > 0 && <div className="mb-5">
                  <FundingProgressBar required={founderFundingRequired} received={founderFundingReceived} />
                </div>}
              <h4 className="text-sm font-bold text-slate-900 mb-3">Top Interested Investors</h4>
              {topInterestedInvestors.length === 0 ? <p className="text-xs text-slate-400">No investor interest yet — publish a project to attract investors.</p> : <div className="space-y-2">
                  {topInterestedInvestors.map(({
                user: inv,
                score
              }) => <div key={inv.id} className="flex items-center gap-3 bg-slate-50 rounded-xl p-3">
                      <UserAvatar user={inv} size="sm" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-semibold text-slate-900 truncate">{inv.name}</span>
                          {inv.verified && <VerifiedBadge />}
                        </div>
                        <p className="text-xs text-slate-400 truncate">{inv.company}</p>
                      </div>
                      <span className="text-xs font-bold text-emerald-600 flex-shrink-0">{score}% match</span>
                      <button onClick={() => viewUserProfile(inv.id)} className="text-xs px-3 py-1.5 border border-slate-200 rounded-lg hover:bg-white text-slate-600 font-semibold flex-shrink-0">View</button>
                    </div>)}
                </div>}
            </div>}

          {isInvestorRole && <div className="mb-8 bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-bold text-slate-900 flex items-center gap-2">
                  <Wallet className="w-4 h-4 text-emerald-600" /> Investor Dashboard
                </h3>
                <button onClick={() => setView("investments")} className="text-xs text-blue-700 font-semibold hover:underline">View investments</button>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-slate-50 rounded-xl p-4">
                  <div className="text-xs text-slate-500 font-semibold mb-1">Total Invested</div>
                  <div className="text-xl font-bold text-slate-900">${totalInvested.toLocaleString()}</div>
                </div>
                <div className="bg-slate-50 rounded-xl p-4">
                  <div className="text-xs text-slate-500 font-semibold mb-1">Active Investments</div>
                  <div className="text-xl font-bold text-slate-900">{myInvestments.length}</div>
                </div>
                <div className="bg-slate-50 rounded-xl p-4">
                  <div className="text-xs text-slate-500 font-semibold mb-1">Portfolio Value</div>
                  <div className="text-xl font-bold text-emerald-600">${Math.round(currentPortfolioValue).toLocaleString()}</div>
                </div>
                <div className="bg-slate-50 rounded-xl p-4">
                  <div className="text-xs text-slate-500 font-semibold mb-1">Pending Proposals</div>
                  <div className="text-xl font-bold text-amber-600">{investorPendingProposals}</div>
                </div>
              </div>
              <h4 className="text-sm font-bold text-slate-900 mb-3">Recommended Startups</h4>
              {recommendedStartups.length === 0 ? <p className="text-xs text-slate-400">No new recommendations right now — check back soon.</p> : <div className="grid md:grid-cols-2 gap-3">
                  {recommendedStartups.map(({
                project: p,
                owner,
                score
              }) => <div key={p.id} className="flex items-center gap-3 bg-slate-50 rounded-xl p-3">
                      <UserAvatar user={owner} size="sm" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-semibold text-slate-900 truncate">{p.industry || owner.company}</span>
                          {owner.verified && <VerifiedBadge />}
                        </div>
                        <p className="text-xs text-slate-400 truncate">{p.title}</p>
                      </div>
                      <span className="text-xs font-bold text-emerald-600 flex-shrink-0">{score}% Match</span>
                      <button onClick={() => viewUserProfile(owner.id)} className="text-xs px-3 py-1.5 border border-slate-200 rounded-lg hover:bg-white text-slate-600 font-semibold flex-shrink-0">View</button>
                    </div>)}
                </div>}
            </div>}

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[{
              label: "Connections",
              value: cu.connections.length,
              icon: Users,
              color: "text-blue-700 bg-blue-50"
            }, {
              label: "Pending Requests",
              value: cu.pendingReceived.length,
              icon: UserPlus,
              color: "text-amber-600 bg-amber-50"
            }, {
              label: "Messages",
              value: messages.filter(m => m.toId === cu.id).length,
              icon: MessageCircle,
              color: "text-emerald-600 bg-emerald-50"
            }, {
              label: "Webinars Available",
              value: webinars.length,
              icon: Video,
              color: "text-slate-700 bg-slate-100"
            }].map(stat => <div key={stat.label} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.color} mb-3`}>
                  <stat.icon className="w-5 h-5" />
                </div>
                <div className="text-2xl font-bold text-slate-900">{stat.value}</div>
                <div className="text-xs text-slate-500 mt-0.5">{stat.label}</div>
              </div>)}
          </div>

          {cu.pendingReceived.length > 0 && <div className="mb-6 bg-amber-50 border border-amber-200 rounded-2xl p-5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-amber-600 flex-shrink-0" />
                <div>
                  <p className="font-bold text-amber-900 text-sm">
                    You have {cu.pendingReceived.length} pending connection request{cu.pendingReceived.length > 1 ? "s" : ""}
                  </p>
                  <p className="text-amber-700 text-xs mt-0.5">Review and respond to grow your network</p>
                </div>
              </div>
              <button onClick={() => setView("connections")} className="text-sm bg-amber-600 text-white px-4 py-2 rounded-xl hover:bg-amber-700 transition-colors font-semibold flex-shrink-0">
                Review
              </button>
            </div>}

          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm">
              <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                <h3 className="font-bold text-slate-900">People you may know</h3>
                <button onClick={() => setView("discover")} className="text-xs text-blue-700 font-semibold hover:underline">See all</button>
              </div>
              <div className="divide-y divide-slate-50">
                {users.filter(u => u.id !== cu.id && !cu.connections.includes(u.id)).slice(0, 5).map(u => <div key={u.id} className="flex items-center gap-3 p-4 hover:bg-slate-50 transition-colors">
                    <UserAvatar user={u} size="md" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-slate-900 text-sm">{u.name}</p>
                        <RoleBadge role={u.role} />
                      </div>
                      <p className="text-xs text-slate-500 truncate mt-0.5">{u.position} · {u.company}</p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => viewUserProfile(u.id)} className="text-xs px-3 py-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600 transition-colors font-medium">View</button>
                      {!cu.pendingSent.includes(u.id) ? <button onClick={() => sendConnectionRequest(u.id)} className="text-xs px-3 py-1.5 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition-colors font-medium">Connect</button> : <span className="text-xs px-3 py-1.5 bg-slate-100 text-slate-400 rounded-lg font-medium">Pending</span>}
                    </div>
                  </div>)}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
              <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                <h3 className="font-bold text-slate-900">Upcoming Webinars</h3>
                <button onClick={() => setView("webinars")} className="text-xs text-blue-700 font-semibold hover:underline">See all</button>
              </div>
              <div className="divide-y divide-slate-50">
                {webinars.slice(0, 4).map(w => {
                  const host = users.find(u => u.id === w.hostId);
                  return <div key={w.id} className="p-4 hover:bg-slate-50 transition-colors">
                      <p className="text-sm font-semibold text-slate-900 leading-snug mb-1.5">{w.title}</p>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-2">
                        <Calendar className="w-3 h-3" />
                        <span>{formatShortDate(w.date)} · {w.time}</span>
                      </div>
                      {host && <div className="flex items-center gap-2">
                          <UserAvatar user={host} size="xs" />
                          <span className="text-xs text-slate-500">{host.name}</span>
                        </div>}
                    </div>;
                })}
              </div>
            </div>
          </div>
        </div>;
        }

      // ======================== PROJECTS (advanced search & filtering) ========================
      case "projects":
        {
          const projectIndustries = Array.from(new Set(projects.map(p => p.industry).filter(Boolean)));
          let filteredProjects = projects.filter(p => {
            if (projectTypeFilter === "saas" && p.projectType === "product") return false;
            if (projectTypeFilter === "product" && p.projectType !== "product") return false;
            if (projectIndustryFilter !== "all" && p.industry !== projectIndustryFilter) return false;
            if (projectStatusFilter !== "all" && p.status !== projectStatusFilter) return false;
            if (projectSearch) {
              const q = projectSearch.toLowerCase();
              const owner = users.find(u => u.id === p.ownerId);
              return p.title.toLowerCase().includes(q) || (p.description || "").toLowerCase().includes(q) || (p.industry || "").toLowerCase().includes(q) || (owner && (owner.name.toLowerCase().includes(q) || owner.company.toLowerCase().includes(q)));
            }
            return true;
          });
          filteredProjects = filteredProjects.slice().sort((a, b) => {
            if (projectSort === "newest") return new Date(b.createdAt) - new Date(a.createdAt);
            if (projectSort === "oldest") return new Date(a.createdAt) - new Date(b.createdAt);
            if (projectSort === "funding") {
              const pctA = a.fundingRequired ? getProjectFundingReceived(a.id) / a.fundingRequired : 0;
              const pctB = b.fundingRequired ? getProjectFundingReceived(b.id) / b.fundingRequired : 0;
              return pctB - pctA;
            }
            return 0;
          });
          return <div className="p-6 lg:p-8 max-w-5xl mx-auto pb-12">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-slate-900">Browse Projects</h1>
              <p className="text-slate-500 mt-1 text-sm">Search and filter startups, projects, and funding opportunities across the network</p>
            </div>

            {(() => {
              const segBase = "flex items-center gap-1 rounded-xl bg-slate-100 p-1";
              const segOpt = active => `px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${active ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"}`;
              const activeFilters = (projectTypeFilter !== "all" ? 1 : 0) + (projectIndustryFilter !== "all" ? 1 : 0) + (projectStatusFilter !== "all" ? 1 : 0);
              return <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-6">
                <div className="flex items-center justify-between gap-3 mb-3.5 flex-wrap">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center"><Filter className="w-4 h-4" /></span>
                    <p className="text-sm font-bold text-slate-900">Refine projects</p>
                    {activeFilters > 0 && <span className="text-[11px] bg-blue-700 text-white px-2 py-0.5 rounded-full font-bold">{activeFilters} active</span>}
                  </div>
                  {activeFilters > 0 && <button onClick={() => {
                  setProjectTypeFilter("all");
                  setProjectIndustryFilter("all");
                  setProjectStatusFilter("all");
                }} className="text-xs font-semibold text-slate-500 hover:text-blue-700 underline underline-offset-2">Clear all</button>}
                </div>
                <div className="flex flex-col lg:flex-row gap-3 lg:gap-4 lg:items-end">
                  <div className="flex-1 relative min-w-0">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input value={projectSearch} onChange={e => setProjectSearch(e.target.value)} placeholder="Search by title, founder, company, industry..." className="w-full pl-10 pr-9 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white text-sm" />
                    {projectSearch && <button onClick={() => setProjectSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500"><X className="w-4 h-4" /></button>}
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <div className="flex flex-col gap-1">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pl-1">Type</p>
                      <div className={segBase}>
                        {[["all", "All"], ["saas", "SaaS"], ["product", "Product"]].map(([val, label]) => <button key={val} onClick={() => setProjectTypeFilter(val)} className={segOpt(projectTypeFilter === val)}>{label}</button>)}
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pl-1">Status</p>
                      <div className={segBase}>
                        {[["all", "Any"], ["open", "Open"], ["in_talks", "In talks"], ["funded", "Funded"]].map(([val, label]) => <button key={val} onClick={() => setProjectStatusFilter(val)} className={segOpt(projectStatusFilter === val)}>{label}</button>)}
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pl-1">Sort</p>
                      <select value={projectSort} onChange={e => setProjectSort(e.target.value)} className="px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 font-semibold text-slate-600 h-[34px]">
                        <option value="newest">Newest first</option>
                        <option value="oldest">Oldest first</option>
                        <option value="funding">Most funded</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div className="mt-3.5">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 pl-1">Industry</p>
                  <div className="flex gap-1.5 overflow-x-auto pb-1">
                    {[["all", "All industries"], ...projectIndustries.map(i => [i, i])].map(([val, label]) => <button key={val} onClick={() => setProjectIndustryFilter(val)} className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all whitespace-nowrap ${projectIndustryFilter === val ? "bg-blue-700 text-white border-blue-700 shadow-sm" : "bg-white text-slate-600 border-slate-200 hover:border-blue-400 hover:text-blue-700"}`}>
                        {label}
                      </button>)}
                  </div>
                </div>
                <p className="text-xs text-slate-400 font-semibold mt-3.5 pt-3 border-t border-slate-100">{filteredProjects.length} project{filteredProjects.length !== 1 ? "s" : ""} found</p>
              </div>;
            })()}

            {(() => {
              const saasProjects = filteredProjects.filter(p => p.projectType !== "product");
              const productProjects = filteredProjects.filter(p => p.projectType === "product");
              const renderProjectCard = p => {
                const owner = users.find(u => u.id === p.ownerId);
                if (!owner) return null;
                return <div key={p.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h4 className="font-bold text-slate-900 leading-snug">{p.title}</h4>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${p.status === "funded" ? "bg-emerald-100 text-emerald-700" : p.status === "in_talks" ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-600"}`}>
                        {p.status === "funded" ? "Funded" : p.status === "in_talks" ? "In talks" : "Open"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <UserAvatar user={owner} size="xs" />
                      <span className="text-xs text-slate-500 truncate">{owner.name} · {owner.company}</span>
                      {owner.verified && <VerifiedBadge />}
                    </div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {p.industry && <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-medium">{p.industry}</span>}
                      {p.patented && <span className="text-xs bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full font-semibold">Patented</span>}
                    </div>
                    <p className="text-sm text-slate-600 mt-2 leading-relaxed line-clamp-2">{p.description || "No description yet."}</p>
                    {p.fundingRequired && <div className="mt-3">
                        <FundingProgressBar required={p.fundingRequired} received={getProjectFundingReceived(p.id)} />
                      </div>}
                    <button onClick={() => viewUserProfile(owner.id)} className="mt-4 w-full text-sm py-2 border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-700 font-semibold transition-colors">
                      View Founder Profile
                    </button>
                  </div>;
              };
              return <>
                {(projectTypeFilter === "all" || projectTypeFilter === "saas") && <div className="mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <h2 className="font-bold text-slate-900">SaaS Projects</h2>
                    <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-semibold">{saasProjects.length}</span>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    {saasProjects.map(renderProjectCard)}
                    {saasProjects.length === 0 && <div className="col-span-2 py-12 text-center text-slate-400 bg-white rounded-2xl border border-slate-100">
                        <Filter className="w-10 h-10 mx-auto mb-3 opacity-20" />
                        <p className="font-semibold">No SaaS projects found</p>
                        <p className="text-sm mt-1">Try adjusting your search or filters</p>
                      </div>}
                  </div>
                </div>}

                {(projectTypeFilter === "all" || projectTypeFilter === "product") && <div className="mb-2">
                  <div className="flex items-center gap-2 mb-3">
                    <h2 className="font-bold text-slate-900">Product Projects</h2>
                    <span className="text-xs bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full font-semibold">{productProjects.length}</span>
                  </div>
                  <p className="text-xs text-slate-500 mb-3">All patentable products appear in this section.</p>
                  <div className="grid md:grid-cols-2 gap-4">
                    {productProjects.map(renderProjectCard)}
                    {productProjects.length === 0 && <div className="col-span-2 py-12 text-center text-slate-400 bg-white rounded-2xl border border-slate-100">
                        <Filter className="w-10 h-10 mx-auto mb-3 opacity-20" />
                        <p className="font-semibold">No product projects found</p>
                        <p className="text-sm mt-1">Try adjusting your search or filters</p>
                      </div>}
                  </div>
                </div>}
              </>;
            })()}
          </div>;
        }

      // ======================== DISCOVER ========================
      case "discover":
        {
          const filteredUsers = users.filter(u => {
            if (u.id === cu.id) return false;
            if (discoverRoleFilter !== "all" && u.role !== discoverRoleFilter) return false;
            if (discoverSearch) {
              const q = discoverSearch.toLowerCase();
              return u.name.toLowerCase().includes(q) || u.bio.toLowerCase().includes(q) || u.industry.some(i => i.toLowerCase().includes(q)) || u.skills.some(s => s.toLowerCase().includes(q)) || u.location.toLowerCase().includes(q) || u.company.toLowerCase().includes(q);
            }
            return true;
          });
          return <div className="p-6 lg:p-8 max-w-5xl mx-auto pb-12">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-slate-900">Discover</h1>
              <p className="text-slate-500 mt-1 text-sm">Find and connect with the right people for your journey</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mb-5">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input value={discoverSearch} onChange={e => setDiscoverSearch(e.target.value)} placeholder="Search by name, skill, industry, company..." className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white text-sm" />
              </div>
              <div className="flex gap-1.5 flex-wrap">
                {[["all", "All"], ["entrepreneur", "Entrepreneurs"], ["investor", "Investors"], ["freelancer", "Freelancers"], ["startup_founder", "Founders"], ["mentor", "Mentors"]].map(([val, label]) => <button key={val} onClick={() => setDiscoverRoleFilter(val)} className={`px-3 py-2.5 text-xs font-semibold rounded-xl border transition-all whitespace-nowrap ${discoverRoleFilter === val ? "bg-blue-700 text-white border-blue-700" : "bg-white text-slate-600 border-slate-200 hover:border-blue-300"}`}>
                    {label}
                  </button>)}
              </div>
            </div>

            {cu.role === "entrepreneur" && discoverRoleFilter === "all" && <div className="mb-4 p-3 bg-blue-50 border border-blue-100 rounded-xl text-sm text-blue-800 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 flex-shrink-0" />
                <span>Tip: Filter by <strong>Investors</strong> to see your profile match scores!</span>
              </div>}
            {cu.role === "startup_founder" && discoverRoleFilter === "all" && <div className="mb-4 p-3 bg-amber-50 border border-amber-100 rounded-xl text-sm text-amber-700 flex items-center gap-2">
                <Zap className="w-4 h-4 flex-shrink-0" />
                <span>Tip: Filter by <strong>Freelancers</strong> to find talented professionals for your startup!</span>
              </div>}

            <div className="grid md:grid-cols-2 gap-4">
              {filteredUsers.map(u => {
                const status = getConnectionStatus(u.id);
                const showMatch = (cu.role === "entrepreneur" || cu.role === "startup_founder") && u.role === "investor";
                const matchScore = showMatch ? calcMatchScore(cu, u) : null;
                return <div key={u.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 hover:shadow-md transition-shadow">
                    <div className="flex items-start gap-3 mb-3">
                      <UserAvatar user={u} size="lg" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <h3 className="font-bold text-slate-900 leading-tight flex items-center gap-1.5">{u.name} {u.verified && <VerifiedBadge />}</h3>
                            <p className="text-xs text-slate-500 mt-0.5 truncate">{u.position} · {u.company}</p>
                          </div>
                          {matchScore !== null && <div className="flex-shrink-0 text-center bg-gradient-to-br from-blue-50 to-slate-100 border border-blue-100 rounded-xl px-2.5 py-1.5">
                              <div className={`text-base font-bold leading-none ${matchScore >= 70 ? "text-emerald-600" : matchScore >= 50 ? "text-amber-600" : "text-slate-500"}`}>
                                {matchScore}%
                              </div>
                              <div className="text-[10px] text-slate-400 mt-0.5">match</div>
                            </div>}
                        </div>
                        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                          <RoleBadge role={u.role} />
                          {getAvgRating(u.id) !== null && <StarRating value={getAvgRating(u.id)} showValue={false} />}
                          {u.location && <span className="flex items-center gap-1 text-xs text-slate-400">
                              <MapPin className="w-3 h-3" />{u.location}
                            </span>}
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-slate-600 line-clamp-2 mb-3 leading-relaxed">{u.bio}</p>
                    {u.role === "investor" && <div className="flex gap-3 mb-3 text-xs text-slate-500">
                        {u.investmentRange && <span className="flex items-center gap-1"><Wallet className="w-3 h-3 text-emerald-500" />{u.investmentRange}</span>}
                        {u.portfolioCompanies && <span className="flex items-center gap-1"><Briefcase className="w-3 h-3" />{u.portfolioCompanies} investments</span>}
                      </div>}
                    {u.role === "freelancer" && <div className="flex gap-3 mb-3 text-xs text-slate-500">
                        {u.hourlyRate && <span className="flex items-center gap-1"><DollarSign className="w-3 h-3 text-amber-500" />{u.hourlyRate}</span>}
                        {u.experience && <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{u.experience}</span>}
                      </div>}
                    <div className="flex flex-wrap gap-1 mb-4">
                      {u.industry.slice(0, 3).map(i => <span key={i} className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{i}</span>)}
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => viewUserProfile(u.id)} className="flex-1 text-sm py-2 border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-700 font-semibold transition-colors">
                        View Profile
                      </button>
                      {status === "none" && <button onClick={() => sendConnectionRequest(u.id)} className="flex-1 text-sm py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-xl font-semibold transition-colors flex items-center justify-center gap-1">
                          <UserPlus className="w-3.5 h-3.5" /> Connect
                        </button>}
                      {status === "pending" && <span className="flex-1 text-sm py-2 bg-slate-100 text-slate-400 rounded-xl font-semibold text-center">Pending</span>}
                      {status === "connected" && <button onClick={() => openMessage(u.id)} className="flex-1 text-sm py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold transition-colors flex items-center justify-center gap-1">
                          <MessageCircle className="w-3.5 h-3.5" /> Message
                        </button>}
                      {status === "received" && <button onClick={() => acceptConnection(u.id)} className="flex-1 text-sm py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-semibold transition-colors">
                          Accept Request
                        </button>}
                    </div>
                  </div>;
              })}
              {filteredUsers.length === 0 && <div className="col-span-2 py-20 text-center text-slate-400">
                  <Search className="w-12 h-12 mx-auto mb-3 opacity-20" />
                  <p className="font-semibold">No members found</p>
                  <p className="text-sm mt-1">Try adjusting your search or filters</p>
                </div>}
            </div>
          </div>;
        }

      // ======================== CONNECTIONS ========================
      case "connections":
        {
          const pendingFrom = users.filter(u => cu.pendingReceived.includes(u.id));
          const connected = users.filter(u => cu.connections.includes(u.id));
          const pendingSentTo = users.filter(u => cu.pendingSent.includes(u.id));
          return <div className="p-6 lg:p-8 max-w-4xl mx-auto pb-12">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-slate-900">Connections</h1>
              <p className="text-slate-500 mt-1 text-sm">Manage your network and connection requests</p>
            </div>

            {pendingFrom.length > 0 && <div className="mb-8">
                <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">
                  Incoming Requests ({pendingFrom.length})
                </h2>
                <div className="space-y-3">
                  {pendingFrom.map(u => <div key={u.id} className="bg-white rounded-2xl border border-amber-200 shadow-sm p-4 flex items-center gap-4">
                      <UserAvatar user={u} size="md" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <p className="font-bold text-slate-900">{u.name}</p>
                          <RoleBadge role={u.role} />
                        </div>
                        <p className="text-xs text-slate-500">{u.position} · {u.company}</p>
                        <p className="text-xs text-slate-400">{u.location}</p>
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        <button onClick={() => declineConnection(u.id)} className="p-2.5 border border-slate-200 rounded-xl hover:bg-rose-50 hover:border-rose-200 text-slate-400 hover:text-rose-600 transition-colors">
                          <X className="w-4 h-4" />
                        </button>
                        <button onClick={() => acceptConnection(u.id)} className="px-4 py-2.5 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-sm font-semibold transition-colors flex items-center gap-1.5">
                          <Check className="w-3.5 h-3.5" /> Accept
                        </button>
                      </div>
                    </div>)}
                </div>
              </div>}

            <div className="mb-8">
              <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">
                Your Network ({connected.length})
              </h2>
              {connected.length === 0 ? <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center text-slate-400">
                  <Users className="w-10 h-10 mx-auto mb-3 opacity-20" />
                  <p className="font-semibold">No connections yet</p>
                  <button onClick={() => setView("discover")} className="mt-2 text-sm text-blue-700 hover:underline font-medium">Start discovering people</button>
                </div> : <div className="grid md:grid-cols-2 gap-3">
                  {connected.map(u => <div key={u.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex items-center gap-3">
                      <UserAvatar user={u} size="md" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-bold text-slate-900 text-sm">{u.name}</p>
                          <RoleBadge role={u.role} />
                        </div>
                        <p className="text-xs text-slate-500 truncate">{u.position} · {u.company}</p>
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        <button onClick={() => viewUserProfile(u.id)} className="p-2.5 border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-500 transition-colors" title="View Profile">
                          <User className="w-4 h-4" />
                        </button>
                        <button onClick={() => openMessage(u.id)} className="p-2.5 bg-blue-50 rounded-xl hover:bg-blue-100 text-blue-700 transition-colors" title="Send Message">
                          <MessageCircle className="w-4 h-4" />
                        </button>
                      </div>
                    </div>)}
                </div>}
            </div>

            {pendingSentTo.length > 0 && <div>
                <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">
                  Sent Requests ({pendingSentTo.length})
                </h2>
                <div className="space-y-2">
                  {pendingSentTo.map(u => <div key={u.id} className="bg-white rounded-xl border border-slate-100 p-4 flex items-center gap-3 opacity-70">
                      <UserAvatar user={u} size="sm" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-900">{u.name}</p>
                        <p className="text-xs text-slate-400">{u.position}</p>
                      </div>
                      <span className="text-xs text-amber-600 bg-amber-50 border border-amber-100 px-2.5 py-1 rounded-lg font-medium flex-shrink-0">Awaiting response</span>
                    </div>)}
                </div>
              </div>}
          </div>;
        }

      // ======================== MESSAGES ========================
      case "messages":
        return <div className="flex" style={{
          height: "calc(100vh - 57px)"
        }}>
          <div className="w-72 flex-shrink-0 border-r border-slate-100 bg-white flex flex-col overflow-hidden">
            <div className="p-4 border-b border-slate-100">
              <h2 className="font-bold text-slate-900">Messages</h2>
              <p className="text-xs text-slate-400 mt-0.5">Connected contacts only</p>
            </div>
            <div className="flex-1 overflow-y-auto">
              {allConvoUsers.length === 0 ? <div className="p-6 text-center text-slate-400 text-sm py-12">
                  <MessageCircle className="w-10 h-10 mx-auto mb-3 opacity-20" />
                  <p className="font-medium">No conversations yet</p>
                  <p className="text-xs mt-1">Connect with people to start chatting</p>
                </div> : allConvoUsers.map(u => {
                const convoMsgs = messages.filter(m => m.fromId === cu.id && m.toId === u.id || m.fromId === u.id && m.toId === cu.id);
                const lastMsg = convoMsgs[convoMsgs.length - 1];
                return <button key={u.id} onClick={() => setActiveConvoId(u.id)} className={`w-full flex items-center gap-3 p-4 hover:bg-slate-50 transition-colors text-left border-b border-slate-50 ${activeConvoId === u.id ? "bg-blue-50 border-r-2 border-blue-600" : ""}`}>
                      <UserAvatar user={u} size="md" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-900 truncate">{u.name}</p>
                        <p className="text-xs text-slate-400 truncate">{lastMsg ? lastMsg.content : "Say hello!"}</p>
                      </div>
                      {lastMsg && <span className="text-xs text-slate-300 flex-shrink-0">{formatTime(lastMsg.timestamp)}</span>}
                    </button>;
              })}
            </div>
          </div>

          <div className="flex-1 flex flex-col bg-slate-50 overflow-hidden">
            {activeConvoUser ? <>
                <div className="bg-white border-b border-slate-100 p-4 flex items-center gap-3 flex-shrink-0">
                  <UserAvatar user={activeConvoUser} size="md" />
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-900">{activeConvoUser.name}</p>
                    <div className="flex items-center gap-2">
                      <RoleBadge role={activeConvoUser.role} />
                      <span className="text-xs text-slate-400">{activeConvoUser.company}</span>
                    </div>
                  </div>
                  <button onClick={() => viewUserProfile(activeConvoUser.id)} className="text-xs text-blue-700 font-semibold hover:underline flex-shrink-0">
                    View Profile
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {activeConvoMessages.length === 0 && <div className="text-center text-slate-400 py-12 text-sm">
                      <p>Start the conversation with {activeConvoUser.name}!</p>
                    </div>}
                  {activeConvoMessages.map(msg => {
                  const isMe = msg.fromId === cu.id;
                  return <div key={msg.id} className={`flex items-end gap-2 ${isMe ? "justify-end" : "justify-start"}`}>
                        {!isMe && <UserAvatar user={activeConvoUser} size="xs" />}
                        <div>
                          <div className={`px-4 py-3 rounded-2xl text-sm max-w-xs lg:max-w-md ${isMe ? "bg-blue-700 text-white rounded-br-sm" : "bg-white text-slate-900 shadow-sm rounded-bl-sm border border-slate-100"}`}>
                            {msg.content}
                          </div>
                          <p className={`text-xs text-slate-400 mt-1 ${isMe ? "text-right" : "text-left"}`}>
                            {formatTime(msg.timestamp)}
                          </p>
                        </div>
                        {isMe && <UserAvatar user={cu} size="xs" />}
                      </div>;
                })}
                  <div ref={messagesEndRef} />
                </div>
                <div className="bg-white border-t border-slate-100 p-4 flex-shrink-0">
                  <div className="flex gap-3">
                    <input value={newMessage} onChange={e => setNewMessage(e.target.value)} onKeyDown={e => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }} placeholder={`Message ${activeConvoUser.name}...`} className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm" />
                    <button onClick={sendMessage} className="bg-blue-700 hover:bg-blue-800 text-white p-3 rounded-xl transition-colors flex-shrink-0">
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </> : <div className="flex-1 flex items-center justify-center text-slate-400">
                <div className="text-center">
                  <MessageCircle className="w-16 h-16 mx-auto mb-4 opacity-10" />
                  <p className="font-semibold text-slate-500">Select a conversation</p>
                  <p className="text-sm mt-1">Choose from your connections on the left</p>
                </div>
              </div>}
          </div>
        </div>;

      // ======================== PORTFOLIO (entrepreneur/founder/freelancer/mentor) ========================
      case "portfolio":
        {
          return <div className="p-6 lg:p-8 max-w-4xl mx-auto pb-12">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-slate-900">Portfolio &amp; Resume</h1>
              <p className="text-slate-500 mt-1 text-sm">Showcase your projects and resume, and respond to investor requirements</p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 mb-6">
              <h3 className="font-bold text-slate-900 mb-3">Resume</h3>
              {cu.resumeFileName ? <div className="flex items-center justify-between gap-3 bg-slate-50 border border-slate-100 rounded-xl p-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    <a href={cu.resumeDataUrl} download={cu.resumeFileName} className="text-sm font-medium text-blue-700 truncate hover:underline">{cu.resumeFileName}</a>
                  </div>
                  <button onClick={() => resumeFileInputRef.current?.click()} className="text-xs px-3 py-1.5 border border-slate-200 rounded-lg hover:bg-slate-100 text-slate-600 font-semibold flex-shrink-0">
                    Replace
                  </button>
                </div> : <button onClick={() => resumeFileInputRef.current?.click()} className="flex items-center gap-2 px-4 py-2.5 border-2 border-dashed border-slate-200 rounded-xl text-sm text-slate-500 hover:border-blue-300 hover:text-blue-700 transition-colors w-full justify-center font-medium">
                  <Plus className="w-4 h-4" /> Upload your resume (PDF, DOC, etc.)
                </button>}
              <input ref={resumeFileInputRef} type="file" className="hidden" onChange={handleResumeFileChange} />
            </div>

            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-slate-900">My Projects</h3>
              <button onClick={toggleProjectForm} className="flex items-center gap-2 bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded-xl font-semibold transition-colors text-sm">
                <Plus className="w-4 h-4" /> Add Project
              </button>
            </div>

            {showProjectForm && <form ref={projectFormRef} onSubmit={addProject} className="bg-white rounded-2xl border-2 border-blue-200 shadow-sm p-6 mb-6">
                {editingProjectId && <h4 className="font-bold text-slate-900 mb-4">Edit Project</h4>}
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Project Title *</label>
                    <input required value={projectForm.title} onChange={e => setProjectForm(f => ({
                    ...f,
                    title: e.target.value
                  }))} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm bg-slate-50 focus:bg-white" placeholder="e.g. NovaPay Mobile App" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Description</label>
                    <textarea value={projectForm.description} onChange={e => setProjectForm(f => ({
                    ...f,
                    description: e.target.value
                  }))} rows={3} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm resize-none bg-slate-50 focus:bg-white" placeholder="What does this project do? What problem does it solve?" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Industry</label>
                    <input value={projectForm.industry} onChange={e => setProjectForm(f => ({
                    ...f,
                    industry: e.target.value
                  }))} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm bg-slate-50 focus:bg-white" placeholder="FinTech" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Project Type *</label>
                    <div className="grid grid-cols-2 gap-3">
                      {[{ value: "saas", label: "SaaS", hint: "Software as a Service" }, { value: "product", label: "Product", hint: "Physical / patentable product" }].map(t => <button key={t.value} type="button" onClick={() => setProjectForm(f => ({
                      ...f,
                      projectType: t.value
                    }))} className={`px-4 py-2.5 rounded-xl border-2 text-left transition-colors ${projectForm.projectType === t.value ? "border-blue-600 bg-blue-50" : "border-slate-200 hover:border-slate-300"}`}>
                          <div className={`text-sm font-bold ${projectForm.projectType === t.value ? "text-blue-700" : "text-slate-700"}`}>{t.label}</div>
                          <div className="text-xs text-slate-400">{t.hint}</div>
                        </button>)}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Is this project already patented?</label>
                    <div className="grid grid-cols-2 gap-3">
                      {[{ value: "no", label: "Not patented" }, { value: "yes", label: "Yes, patented" }].map(opt => <button key={opt.value} type="button" onClick={() => setProjectForm(f => ({
                      ...f,
                      patented: opt.value
                    }))} className={`px-4 py-2.5 rounded-xl border-2 text-sm font-semibold transition-colors ${projectForm.patented === opt.value ? "border-blue-600 bg-blue-50 text-blue-700" : "border-slate-200 text-slate-600 hover:border-slate-300"}`}>
                          {opt.label}
                        </button>)}
                    </div>
                  </div>
                  {projectForm.patented === "yes" && <div>
                      <div className="mb-3">
                        <label className="block text-xs font-bold text-slate-600 mb-1">Patent / Application Number *</label>
                        <input value={projectForm.patentNumber} onChange={e => setProjectForm(f => ({
                      ...f,
                      patentNumber: e.target.value
                    }))} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm bg-slate-50 focus:bg-white" placeholder="e.g. US11456782B2, 202341012345, 1234/DEL/2015" />
                        <p className="text-xs text-slate-400 mt-1">Checked against official patent-office formats by PatentBot before investors can fund this project.</p>
                      </div>
                      <label className="block text-xs font-bold text-slate-600 mb-1">Proof of Patent *</label>
                      <button type="button" onClick={() => patentFileInputRef.current?.click()} className="flex items-center gap-2 px-4 py-2.5 border-2 border-dashed border-slate-200 rounded-xl text-sm text-slate-500 hover:border-blue-300 hover:text-blue-700 transition-colors w-full justify-center font-medium">
                        <Plus className="w-4 h-4" /> {pendingPatentFile ? pendingPatentFile.name : "Upload patent certificate / proof"}
                      </button>
                      <input ref={patentFileInputRef} type="file" className="hidden" onChange={handlePatentFileChange} />
                      {pendingPatentFile ? <button type="button" onClick={() => {
                      setPendingPatentFile(null);
                      if (patentFileInputRef.current) patentFileInputRef.current.value = "";
                    }} className="text-xs text-slate-500 hover:text-slate-800 font-semibold mt-1.5 hover:underline">
                          Remove file
                        </button> : <p className="text-xs text-slate-400 mt-1">Attach your patent certificate or other proof of patent.</p>}
                    </div>}
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Funding Goal ($, optional)</label>
                    <input type="number" min="0" value={projectForm.fundingRequired} onChange={e => setProjectForm(f => ({
                    ...f,
                    fundingRequired: e.target.value
                  }))} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm bg-slate-50 focus:bg-white" placeholder="e.g. 5000000" />
                    <p className="text-xs text-slate-400 mt-1">Powers the funding progress tracker shown on this project.</p>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Project File (deck, demo, docs — optional)</label>
                    <button type="button" onClick={() => projectFileInputRef.current?.click()} className="flex items-center gap-2 px-4 py-2.5 border-2 border-dashed border-slate-200 rounded-xl text-sm text-slate-500 hover:border-blue-300 hover:text-blue-700 transition-colors w-full justify-center font-medium">
                      <Plus className="w-4 h-4" /> {pendingProjectFile ? pendingProjectFile.name : "Choose a file"}
                    </button>
                    <input ref={projectFileInputRef} type="file" className="hidden" onChange={handleProjectFileChange} />
                    {pendingProjectFile && <button type="button" onClick={() => {
                    setPendingProjectFile(null);
                    if (projectFileInputRef.current) projectFileInputRef.current.value = "";
                  }} className="text-xs text-slate-500 hover:text-slate-800 font-semibold mt-1.5 hover:underline">
                        Remove file
                      </button>}
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Live Demo Link (optional)</label>
                    <input type="text" inputMode="url" value={projectForm.liveLink} onChange={e => setProjectForm(f => ({
                    ...f,
                    liveLink: e.target.value
                  }))} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm bg-slate-50 focus:bg-white" placeholder="https://your-live-project.com" />
                    <p className="text-xs text-slate-400 mt-1">Don't have a file? Paste a live demo link instead — or add both.</p>
                  </div>
                </div>
                <div className="flex gap-3 mt-5">
                  <button type="submit" className="bg-blue-700 hover:bg-blue-800 text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-colors">
                    {editingProjectId ? "Save Changes" : "Publish Project"}
                  </button>
                  <button type="button" onClick={() => {
                  setShowProjectForm(false);
                  resetProjectForm();
                }} className="px-5 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-600 hover:bg-slate-50 transition-colors font-medium">
                    Cancel
                  </button>
                </div>
              </form>}

            <div className="grid md:grid-cols-2 gap-4 mb-8">
              {myProjects.length === 0 && <div className="col-span-2 bg-white rounded-2xl border border-slate-100 p-10 text-center text-slate-400">
                  <Briefcase className="w-10 h-10 mx-auto mb-3 opacity-20" />
                  <p className="font-semibold">No projects yet</p>
                  <p className="text-sm mt-1">Add a project so investors can discover what you're building</p>
                </div>}
              {myProjects.map(p => <div key={p.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h4 className="font-bold text-slate-900 leading-snug">{p.title}</h4>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${p.status === "funded" ? "bg-emerald-100 text-emerald-700" : p.status === "in_talks" ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-600"}`}>
                        {p.status === "funded" ? "Funded" : p.status === "in_talks" ? "In talks" : "Open"}
                      </span>
                      <button type="button" onClick={() => startEditProject(p)} className="flex items-center gap-1 text-xs px-2.5 py-1 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600 font-semibold transition-colors">
                        <Edit2 className="w-3 h-3" /> {t("Edit")}
                      </button>
                      <button type="button" onClick={() => confirmRemove("project", p.id)} className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg font-semibold transition-colors border ${removeTarget?.kind === "project" && removeTarget?.id === p.id ? "bg-rose-600 text-white border-rose-600 hover:bg-rose-700" : "border-slate-200 text-slate-600 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200"}`}>
                        <Trash2 className="w-3 h-3" /> {removeTarget?.kind === "project" && removeTarget?.id === p.id ? t("Confirm remove") : t("Remove")}
                      </button>
                    </div>
                  </div>
                  {p.industry && <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-medium">{p.industry}</span>}
                  <p className="text-sm text-slate-600 mt-2 leading-relaxed">{p.description || "No description yet."}</p>
                  {p.fundingRequired && <div className="mt-3">
                      <FundingProgressBar required={p.fundingRequired} received={getProjectFundingReceived(p.id)} />
                    </div>}
                  <ProjectLinks project={p} />
                </div>)}
            </div>
          </div>;
        }

      // ======================== REQUIREMENTS ========================
      case "requirements":
        return <div className="p-6 lg:p-8 max-w-5xl mx-auto pb-12">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-slate-900">Open Investor Requirements</h1>
            <p className="text-slate-500 mt-1 text-sm">Browse active investment requirements from investors and submit your project for consideration</p>
          </div>

          <div className="space-y-3">
              {requirements.length === 0 && <div className="bg-white rounded-2xl border border-slate-100 p-8 text-center text-slate-400 text-sm">No open requirements right now.</div>}
              {requirements.map(r => {
                const investor = users.find(u => u.id === r.investorId);
                const myProposalForThis = myProposals.find(pr => pr.requirementId === r.id);
                return <div key={r.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                    <div className="flex items-start justify-between gap-3 mb-1.5">
                      <h4 className="font-bold text-slate-900">{r.title}</h4>
                      {r.budgetRange && <span className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-100 px-2.5 py-0.5 rounded-full font-semibold flex-shrink-0">{r.budgetRange}</span>}
                    </div>
                    {investor && <div className="flex items-center gap-2 mb-2">
                        <UserAvatar user={investor} size="xs" />
                        <span className="text-xs text-slate-500">{investor.name} · {investor.company}</span>
                      </div>}
                    {r.industry && <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-medium">{r.industry}</span>}
                    <p className="text-sm text-slate-600 mt-2 leading-relaxed">{r.description}</p>
                    <AttachmentView name={r.fileName} dataUrl={r.fileDataUrl} className="mt-3" />

                    {myProposalForThis ? <div className="mt-3 text-xs font-semibold">
                        {myProposalForThis.status === "invested" && <span className="text-emerald-600">✓ Investor has invested in your submitted project</span>}
                        {myProposalForThis.status === "pending" && <span className="text-amber-600">Proposal submitted — awaiting investor response</span>}
                        {myProposalForThis.status === "declined" && <span className="text-slate-400">Proposal declined</span>}
                      </div> : submitToRequirementId === r.id ? <div className="mt-3">
                        {investor && investor.agreementPolicy && <div className="mb-3 bg-amber-50 border border-amber-200 rounded-xl p-4">
                            <p className="text-xs font-bold text-amber-800 mb-1.5">Agreement Policy — {investor.company}</p>
                            <p className="text-xs text-amber-800 leading-relaxed whitespace-pre-line">{investor.agreementPolicy}</p>
                          </div>}
                        <div className="flex flex-col sm:flex-row gap-2">
                          <select value={submitProjectId} onChange={e => setSubmitProjectId(e.target.value)} className="flex-1 px-3 py-2 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-600">
                            <option value="">Select one of your projects...</option>
                            {myProjects.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
                          </select>
                          <button disabled={!submitProjectId || !!(investor && investor.agreementPolicy && !policyAcknowledged)} onClick={() => submitProposal(r.id, submitProjectId)} className="bg-blue-700 hover:bg-blue-800 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm px-4 py-2 rounded-xl font-semibold transition-colors">
                            Submit
                          </button>
                          <button onClick={() => {
                      setSubmitToRequirementId(null);
                      setSubmitProjectId("");
                      setPolicyAcknowledged(false);
                    }} className="px-4 py-2 border border-slate-200 rounded-xl text-sm text-slate-600 hover:bg-slate-50 font-medium">
                            Cancel
                          </button>
                        </div>
                        {investor && investor.agreementPolicy && <label className="flex items-center gap-2 mt-3 cursor-pointer select-none">
                            <input type="checkbox" checked={policyAcknowledged} onChange={e => setPolicyAcknowledged(e.target.checked)} className="w-4 h-4 rounded border-slate-300 text-blue-700 focus:ring-blue-600" />
                            <span className="text-xs font-semibold text-slate-600">I have read and agree to {investor.company}'s agreement policy</span>
                          </label>}
                      </div> : <button onClick={() => {
                    setSubmitToRequirementId(r.id);
                    setPolicyAcknowledged(false);
                  }} disabled={myProjects.length === 0} className="mt-3 text-sm px-4 py-2 bg-blue-700 hover:bg-blue-800 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl font-semibold transition-colors">
                        {myProjects.length === 0 ? "Add a project first" : "Submit a Project"}
                      </button>}
                  </div>;
              })}
            </div>
        </div>;

      // ======================== INVESTMENTS (investor) ========================
      case "investments":
        return <div className="p-6 lg:p-8 max-w-4xl mx-auto pb-12">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-slate-900">Investments</h1>
            <p className="text-slate-500 mt-1 text-sm">Track your portfolio, post requirements, and review proposals from founders</p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[{
              label: "Total Invested",
              value: `$${totalInvested.toLocaleString()}`,
              icon: Wallet,
              color: "text-emerald-600 bg-emerald-50"
            }, {
              label: "Current Portfolio Value",
              value: `$${Math.round(currentPortfolioValue).toLocaleString()}`,
              icon: TrendingUp,
              color: portfolioGrowthPercent >= 0 ? "text-emerald-600 bg-emerald-50" : "text-red-600 bg-red-50"
            }, {
              label: "Overall Growth",
              value: `${portfolioGrowthPercent >= 0 ? "+" : ""}${portfolioGrowthPercent.toFixed(2)}%`,
              icon: TrendingUp,
              color: portfolioGrowthPercent >= 0 ? "text-emerald-600 bg-emerald-50" : "text-red-600 bg-red-50"
            }, {
              label: "Investments Made",
              value: myInvestments.length,
              icon: Briefcase,
              color: "text-blue-700 bg-blue-50"
            }, {
              label: "Requirements Posted",
              value: myRequirements.length,
              icon: Briefcase,
              color: "text-amber-600 bg-amber-50"
            }, {
              label: "Portfolio Companies",
              value: cu.portfolioCompanies ?? myInvestments.length,
              icon: Building2,
              color: "text-slate-700 bg-slate-100"
            }].map(stat => <div key={stat.label} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.color} mb-3`}>
                  <stat.icon className="w-5 h-5" />
                </div>
                <div className="text-2xl font-bold text-slate-900">{stat.value}</div>
                <div className="text-xs text-slate-500 mt-0.5">{stat.label}</div>
              </div>)}
          </div>

          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-slate-900">{t("My Requirements")}</h3>
            <button onClick={() => {
            if (showRequirementForm) resetRequirementForm();
            setShowRequirementForm(!showRequirementForm);
          }} className="flex items-center gap-2 bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded-xl font-semibold transition-colors text-sm">
              <Plus className="w-4 h-4" /> {editingRequirementId ? t("Cancel edit") : t("Post Requirement")}
            </button>
          </div>

          {showRequirementForm && <form ref={requirementFormRef} onSubmit={postRequirement} className="bg-white rounded-2xl border-2 border-blue-200 shadow-sm p-6 mb-6">
              <h4 className="font-bold text-slate-900 mb-3">{editingRequirementId ? t("Edit Requirement") : t("Post a Requirement")}</h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Title *</label>
                  <input required value={requirementForm.title} onChange={e => setRequirementForm(f => ({
                  ...f,
                  title: e.target.value
                }))} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm bg-slate-50 focus:bg-white" placeholder="e.g. Series A HealthTech opportunities" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Description</label>
                  <textarea value={requirementForm.description} onChange={e => setRequirementForm(f => ({
                  ...f,
                  description: e.target.value
                }))} rows={3} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm resize-none bg-slate-50 focus:bg-white" placeholder="What are you looking for in a founder or project?" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Industry</label>
                    <input value={requirementForm.industry} onChange={e => setRequirementForm(f => ({
                    ...f,
                    industry: e.target.value
                  }))} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm bg-slate-50 focus:bg-white" placeholder="HealthTech" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Budget Range</label>
                    <input value={requirementForm.budgetRange} onChange={e => setRequirementForm(f => ({
                    ...f,
                    budgetRange: e.target.value
                  }))} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm bg-slate-50 focus:bg-white" placeholder="$500K - $2M" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Project Details (image or document, optional)</label>
                  <button type="button" onClick={() => requirementFileInputRef.current?.click()} className="flex items-center gap-2 px-4 py-2.5 border-2 border-dashed border-slate-200 rounded-xl text-sm text-slate-500 hover:border-blue-300 hover:text-blue-700 transition-colors w-full justify-center font-medium">
                    <Plus className="w-4 h-4" /> {pendingRequirementFile ? pendingRequirementFile.name : "Choose an image or file"}
                  </button>
                  <input ref={requirementFileInputRef} type="file" className="hidden" onChange={handleRequirementFileChange} />
                  {pendingRequirementFile && <button type="button" onClick={() => {
                  setPendingRequirementFile(null);
                  if (requirementFileInputRef.current) requirementFileInputRef.current.value = "";
                }} className="text-xs text-slate-500 hover:text-slate-800 font-semibold mt-1.5 hover:underline">
                      Remove file
                    </button>}
                  <p className="text-xs text-slate-400 mt-1">Attach an image or document with all the details about the project you're looking for.</p>
                </div>
              </div>
              <div className="flex gap-3 mt-5">
                <button type="submit" className="bg-blue-700 hover:bg-blue-800 text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-colors">
                  {editingRequirementId ? t("Save Changes") : t("Publish Requirement")}
                </button>
                <button type="button" onClick={() => {
                setShowRequirementForm(false);
                resetRequirementForm();
              }} className="px-5 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-600 hover:bg-slate-50 transition-colors font-medium">
                  {t("Cancel")}
                </button>
              </div>
            </form>}

          <div className="space-y-4 mb-10">
            {myRequirements.length === 0 && <div className="bg-white rounded-2xl border border-slate-100 p-10 text-center text-slate-400">
                <Briefcase className="w-10 h-10 mx-auto mb-3 opacity-20" />
                <p className="font-semibold">No requirements posted yet</p>
              </div>}
            {myRequirements.map(r => {
              const relatedProposals = proposalsForMyRequirements.filter(p => p.requirementId === r.id);
              return <div key={r.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                  <div className="flex items-start justify-between gap-3 mb-1">
                    <h4 className="font-bold text-slate-900">{r.title}</h4>
                    <div className="flex flex-col items-end gap-2 flex-shrink-0">
                      {r.budgetRange && <span className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-100 px-2.5 py-0.5 rounded-full font-semibold">{r.budgetRange}</span>}
                      <div className="flex items-center gap-2">
                        <button type="button" onClick={() => startEditRequirement(r)} className="flex items-center gap-1 text-xs px-2.5 py-1 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600 font-semibold transition-colors">
                          <Edit2 className="w-3 h-3" /> {t("Edit")}
                        </button>
                        <button type="button" onClick={() => confirmRemove("requirement", r.id)} className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg font-semibold transition-colors border ${removeTarget?.kind === "requirement" && removeTarget?.id === r.id ? "bg-rose-600 text-white border-rose-600 hover:bg-rose-700" : "border-slate-200 text-slate-600 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200"}`}>
                          <Trash2 className="w-3 h-3" /> {removeTarget?.kind === "requirement" && removeTarget?.id === r.id ? t("Confirm remove") : t("Remove")}
                        </button>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-slate-600 mb-3 leading-relaxed">{r.description}</p>
                  <AttachmentView name={r.fileName} dataUrl={r.fileDataUrl} className="mb-3" />
                  {relatedProposals.length === 0 ? <p className="text-xs text-slate-400">No proposals submitted yet.</p> : <div className="space-y-2.5">
                      {relatedProposals.map(prop => {
                    const founder = users.find(u => u.id === prop.entrepreneurId);
                    const proj = projects.find(p => p.id === prop.projectId);
                    if (!founder || !proj) return null;
                    const isPatentedProp = proj.patented === true || proj.patented === "yes";
                    const noveltyCleared = prop.noveltyStatus === "cleared";
                    return <div key={prop.id} className="bg-slate-50 rounded-xl p-3.5 border border-slate-100">
                            <div className="flex items-center justify-between gap-2 mb-1.5">
                              <div className="flex items-center gap-2 min-w-0">
                                <UserAvatar user={founder} size="xs" />
                                <span className="text-sm font-semibold text-slate-900 truncate">{founder.name}</span>
                                <span className="text-xs text-slate-400">— {proj.title}</span>
                              </div>
                              {prop.status === "invested" && <span className="text-xs font-bold text-emerald-600 flex-shrink-0">Invested</span>}
                              {prop.status === "declined" && <span className="text-xs font-bold text-slate-400 flex-shrink-0">Declined</span>}
                            </div>
                            <p className="text-xs text-slate-500 mb-2 leading-relaxed">{proj.description}</p>
                            <ProjectLinks project={proj} className="mb-2" />
                            {isPatentedProp && <div className={`flex items-center gap-2 mb-2 text-xs font-semibold rounded-lg px-2.5 py-1.5 border ${noveltyCleared ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-amber-50 text-amber-700 border-amber-200"}`}>
                                <ShieldCheck className="w-3.5 h-3.5 flex-shrink-0" />
                                {noveltyCleared ? `Patent novelty verified${prop.noveltyScore != null ? ` (${prop.noveltyScore}/100)` : ""} — cleared to invest` : "Patented project — verify novelty with PatentBot before investing"}
                                {!noveltyCleared && <button onClick={() => openPatentBot(proj.id, prop.id)} className="ml-auto text-[11px] px-2.5 py-1 bg-blue-700 hover:bg-blue-800 text-white rounded-lg font-semibold transition-colors">Run novelty check</button>}
                              </div>}
                            {prop.status === "pending" && <div className="flex gap-2 mt-1.5">
                                <input value={investAmountInputs[prop.id] || ""} onChange={e => setInvestAmountInputs(v => ({
                          ...v,
                          [prop.id]: e.target.value
                        }))} placeholder="Amount, e.g. 500000" type="number" className="flex-1 px-3 py-1.5 border border-slate-200 rounded-lg text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-600" />
                                <button onClick={() => requestInvestmentAgreement(prop, investAmountInputs[prop.id] || "")} disabled={isPatentedProp && !noveltyCleared} title={isPatentedProp && !noveltyCleared ? "Run a PatentBot novelty check first" : ""} className="text-xs px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition-colors">
                                  Invest
                                </button>
                                <button onClick={() => declineProposal(prop.id)} className="text-xs px-3 py-1.5 border border-slate-200 rounded-lg hover:bg-white text-slate-500 font-semibold transition-colors">
                                  Decline
                                </button>
                              </div>}
                          </div>;
                  })}
                    </div>}
                </div>;
            })}
          </div>

          <h3 className="font-bold text-slate-900 mb-3">Investment History</h3>
          {myInvestments.length === 0 ? <div className="bg-white rounded-2xl border border-slate-100 p-10 text-center text-slate-400">
              <Wallet className="w-10 h-10 mx-auto mb-3 opacity-20" />
              <p className="font-semibold">No investments made yet</p>
            </div> : <div className="space-y-2.5">
              {myInvestments.slice().reverse().map(inv => {
              const founder = users.find(u => u.id === inv.entrepreneurId);
              const proj = projects.find(p => p.id === inv.projectId);
              if (!founder) return null;
              const series = getInvestmentGrowthSeries(inv);
              const latest = series[series.length - 1];
              const growthPct = (latest.value - inv.amount) / inv.amount * 100;
              const isOpen = growthOpenId === inv.id;
              return <div key={inv.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
                    <div className="flex items-center gap-3">
                      <UserAvatar user={founder} size="sm" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-900">{founder.name} {proj && <span className="text-slate-400 font-normal">· {proj.title}</span>}</p>
                        <p className="text-xs text-slate-400">{new Date(inv.createdAt).toLocaleDateString([], {
                        month: "short",
                        day: "numeric",
                        year: "numeric"
                      })}</p>
                      </div>
                      {editingInvestmentId === inv.id ? <div className="flex items-center gap-2 flex-shrink-0">
                          <input autoFocus type="number" min="1" value={investmentEdit.amount} onChange={e => setInvestmentEdit(v => ({
                        ...v,
                        amount: e.target.value
                      }))} className="w-32 px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-600" />
                          <input type="date" value={investmentEdit.date} onChange={e => setInvestmentEdit(v => ({
                        ...v,
                        date: e.target.value
                      }))} className="px-2 py-1.5 border border-slate-200 rounded-lg text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-600" />
                          <button onClick={() => saveInvestmentEdit(inv)} className="text-xs px-3 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded-lg font-semibold transition-colors">{t("Save")}</button>
                          <button onClick={cancelEditInvestment} className="text-xs px-3 py-1.5 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 font-semibold transition-colors">{t("Cancel")}</button>
                        </div> : <>
                          <div className="text-right flex-shrink-0">
                            <div className="text-sm font-bold text-emerald-600">${inv.amount.toLocaleString()}</div>
                            <div className={`text-xs font-semibold ${growthPct >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                              {growthPct >= 0 ? "+" : ""}{growthPct.toFixed(2)}% · ${Math.round(latest.value).toLocaleString()} now
                            </div>
                          </div>
                          <button onClick={() => startEditInvestment(inv)} className="flex items-center gap-1 text-xs px-2.5 py-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600 font-semibold transition-colors flex-shrink-0">
                            <Edit2 className="w-3 h-3" /> {t("Edit")}
                          </button>
                        </>}
                      <button onClick={() => setGrowthOpenId(isOpen ? null : inv.id)} className="text-xs px-3 py-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600 font-semibold transition-colors flex-shrink-0">
                        {isOpen ? "Hide" : "Daily Growth"}
                      </button>
                    </div>
                    {isOpen && <div className="mt-3 border-t border-slate-100 pt-3">
                        <div className="max-h-64 overflow-y-auto space-y-1">
                          {series.map((day, idx) => <div key={day.date} className="flex items-center justify-between text-xs px-2 py-1.5 rounded-lg odd:bg-slate-50">
                              <span className="text-slate-500 font-medium">Day {idx + 1} · {new Date(day.date).toLocaleDateString([], {
                            month: "short",
                            day: "numeric"
                          })}</span>
                              <span className="text-slate-700 font-semibold">${Math.round(day.value).toLocaleString()}</span>
                              <span className={`font-semibold w-16 text-right ${day.status === "up" ? "text-emerald-600" : day.status === "down" ? "text-red-500" : "text-slate-400"}`}>
                                {idx === 0 ? "—" : `${day.changePercent >= 0 ? "+" : ""}${day.changePercent.toFixed(2)}%`}
                              </span>
                            </div>)}
                        </div>
                      </div>}
                  </div>;
            })}
            </div>}
        </div>;

      // ======================== OFFERS (freelance offer letters) ========================
      case "offers":
        return <div className="p-6 lg:p-8 max-w-3xl mx-auto pb-12">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-slate-900">Offers</h1>
            <p className="text-slate-500 mt-1 text-sm">Freelancers receive <span className="font-semibold text-slate-700">Offers</span> with a <span className="font-semibold text-slate-700">Package</span>; all other roles receive <span className="font-semibold text-slate-700">Bonds</span> quoted in <span className="font-semibold text-slate-700">LPA</span></p>
          </div>

          {cu.role !== "investor" && (cu.role === "freelancer" || myReceivedOffers.length > 0) && <>
              <h3 className="font-bold text-slate-900 mb-3">Offers Received</h3>
              <div className="space-y-3 mb-8">
                {myReceivedOffers.length === 0 && <div className="bg-white rounded-2xl border border-slate-100 p-8 text-center text-slate-400 text-sm">No offers received yet.</div>}
                {myReceivedOffers.slice().reverse().map(o => {
                const sender = users.find(u => u.id === o.fromId);
                if (!sender) return null;
                const t = offerTerms(cu.role);
                const offerExpanded = expandedOffers.includes(o.id);
                const offerDesc = o.description || "";
                const offerDescLong = offerDesc.length > OFFER_DESC_LIMIT;
                return <div key={o.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                      <div className="flex items-start justify-between gap-3 mb-1.5">
                        <div className="flex items-center gap-2 min-w-0">
                          <UserAvatar user={sender} size="xs" />
                          <span className="text-sm font-semibold text-slate-900 truncate">{sender.name}</span>
                        </div>
                        <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full flex-shrink-0 ${o.status === "accepted" ? "bg-emerald-100 text-emerald-700" : o.status === "declined" ? "bg-slate-100 text-slate-500" : "bg-amber-100 text-amber-700"}`}>
                          {o.status === "accepted" ? "Accepted" : o.status === "declined" ? "Declined" : "Pending"}
                        </span>
                      </div>
                      <h4 className="font-bold text-slate-900">{o.title}</h4>
                      {offerDesc ? <p className="text-sm text-slate-600 mt-1.5 leading-relaxed">
                          {offerExpanded ? offerDesc : truncateOfferText(offerDesc)}
                        </p> : <p className="text-sm text-slate-400 italic mt-1.5">No description provided.</p>}
                      {offerDescLong && <button onClick={() => toggleOfferExpanded(o.id)} className="text-xs text-blue-700 font-semibold mt-1 hover:underline">
                          {offerExpanded ? "Read less" : "Read more"}
                        </button>}
                      <div className="flex gap-4 mt-2.5 text-xs text-slate-500 font-medium">
                        {o.duration && <span>Duration: {o.duration}</span>}
                        {o.rate && <span>{t.rateKey}: {o.rate}</span>}
                      </div>
                      <AttachmentView name={o.attachmentName} dataUrl={o.attachmentDataUrl} className="mt-3" />
                      <div className="flex items-center gap-2 mt-3">
                        <button onClick={() => openOfferLetter(o)} className="text-xs px-4 py-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600 font-semibold transition-colors flex items-center gap-1.5">
                          <Send className="w-3.5 h-3.5" /> View {t.docTitle}
                        </button>
                      </div>
                      {o.status === "pending" && <div className="flex gap-2 mt-3.5">
                          <button onClick={() => requestOfferAcceptance(o.id)} className="text-xs px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold transition-colors">
                            Accept {t.noun}
                          </button>
                          <button onClick={() => respondToOffer(o.id, false)} className="text-xs px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-500 font-semibold transition-colors">
                            Decline
                          </button>
                        </div>}
                    </div>;
              })}
              </div>
            </>}

          <h3 className="font-bold text-slate-900 mb-3">Offers Sent</h3>
          <div className="space-y-3">
            {mySentOffers.length === 0 && <div className="bg-white rounded-2xl border border-slate-100 p-8 text-center text-slate-400 text-sm">
                No offers sent yet.
              </div>}
            {mySentOffers.slice().reverse().map(o => {
              const recipient = users.find(u => u.id === o.toId);
              if (!recipient) return null;
              const t = offerTerms(recipient.role);
              const offerExpanded = expandedOffers.includes(o.id);
              const offerDesc = o.description || "";
              const offerDescLong = offerDesc.length > OFFER_DESC_LIMIT;
              return <div key={o.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                  <div className="flex items-start justify-between gap-3 mb-1.5">
                    <div className="flex items-center gap-2 min-w-0">
                      <UserAvatar user={recipient} size="xs" />
                      <span className="text-sm font-semibold text-slate-900 truncate">{recipient.name}</span>
                    </div>
                    <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full flex-shrink-0 ${o.status === "accepted" ? "bg-emerald-100 text-emerald-700" : o.status === "declined" ? "bg-slate-100 text-slate-500" : "bg-amber-100 text-amber-700"}`}>
                      {o.status === "accepted" ? "Accepted" : o.status === "declined" ? "Declined" : "Pending"}
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-900">{o.title}</h4>
                  {offerDesc ? <p className="text-sm text-slate-600 mt-1.5 leading-relaxed">
                      {offerExpanded ? offerDesc : truncateOfferText(offerDesc)}
                    </p> : <p className="text-sm text-slate-400 italic mt-1.5">No description provided.</p>}
                  {offerDescLong && <button onClick={() => toggleOfferExpanded(o.id)} className="text-xs text-blue-700 font-semibold mt-1 hover:underline">
                      {offerExpanded ? "Read less" : "Read more"}
                    </button>}
                  <div className="flex gap-4 mt-1.5 text-xs text-slate-500 font-medium">
                    {o.duration && <span>Duration: {o.duration}</span>}
                    {o.rate && <span>{t.rateKey}: {o.rate}</span>}
                  </div>
                  <AttachmentView name={o.attachmentName} dataUrl={o.attachmentDataUrl} className="mt-3" />
                  <div className="flex items-center gap-2 mt-3">
                    <button onClick={() => openOfferLetter(o)} className="text-xs px-4 py-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600 font-semibold transition-colors flex items-center gap-1.5">
                      <Send className="w-3.5 h-3.5" /> View {t.docTitle}
                    </button>
                  </div>
                </div>;
            })}
          </div>
        </div>;

      // ======================== HELP (startup founders <-> entrepreneurs/investors/mentors) ========================
      case "help":
        {
          const isFounder = cu.role === "startup_founder";
          const otherRequests = helpRequests.filter(r => r.founderId !== cu.id);
          return <div className="p-6 lg:p-8 max-w-3xl mx-auto pb-12">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-slate-900">{isFounder ? "Get Help" : "Help Founders"}</h1>
              <p className="text-slate-500 mt-1 text-sm">
                {isFounder ? "Ask entrepreneurs, investors, and mentors for advice or support" : "Offer your experience to startup founders who need help"}
              </p>
            </div>

            {isFounder && <>
                <div className="flex justify-end mb-3">
                  <button onClick={() => setShowHelpForm(!showHelpForm)} className="flex items-center gap-2 bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded-xl font-semibold transition-colors text-sm">
                    <Plus className="w-4 h-4" /> Ask for Help
                  </button>
                </div>
                {showHelpForm && <form onSubmit={postHelpRequest} className="bg-white rounded-2xl border-2 border-blue-200 shadow-sm p-6 mb-6">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-600 mb-1">What do you need help with? *</label>
                        <input required value={helpForm.title} onChange={e => setHelpForm(f => ({
                      ...f,
                      title: e.target.value
                    }))} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm bg-slate-50 focus:bg-white" placeholder="e.g. Reviewing our pitch deck" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-600 mb-1">Details</label>
                        <textarea value={helpForm.description} onChange={e => setHelpForm(f => ({
                      ...f,
                      description: e.target.value
                    }))} rows={3} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm resize-none bg-slate-50 focus:bg-white" placeholder="Give a bit more context" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-600 mb-1">Category</label>
                        <input value={helpForm.category} onChange={e => setHelpForm(f => ({
                      ...f,
                      category: e.target.value
                    }))} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm bg-slate-50 focus:bg-white" placeholder="e.g. Fundraising, Product, Hiring" />
                      </div>
                    </div>
                    <div className="flex gap-3 mt-5">
                      <button type="submit" className="bg-blue-700 hover:bg-blue-800 text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-colors">
                        Post Request
                      </button>
                      <button type="button" onClick={() => setShowHelpForm(false)} className="px-5 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-600 hover:bg-slate-50 transition-colors font-medium">
                        Cancel
                      </button>
                    </div>
                  </form>}
                <div className="space-y-4">
                  {myHelpRequests.length === 0 && <div className="bg-white rounded-2xl border border-slate-100 p-10 text-center text-slate-400">
                      <Zap className="w-10 h-10 mx-auto mb-3 opacity-20" />
                      <p className="font-semibold">No help requests posted yet</p>
                    </div>}
                  {myHelpRequests.map(r => {
                  const responses = helpOffers.filter(h => h.requestId === r.id);
                  return <div key={r.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                        <div className="flex items-start justify-between gap-2 mb-1.5">
                          <h4 className="font-bold text-slate-900">{r.title}</h4>
                          {r.category && <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-medium flex-shrink-0">{r.category}</span>}
                        </div>
                        <p className="text-sm text-slate-600 mb-3 leading-relaxed">{r.description}</p>
                        {responses.length === 0 ? <p className="text-xs text-slate-400">No responses yet.</p> : <div className="space-y-2">
                            {responses.map(resp => {
                        const helper = users.find(u => u.id === resp.helperId);
                        if (!helper) return null;
                        return <div key={resp.id} className="bg-slate-50 rounded-xl p-3 border border-slate-100 flex items-start gap-2.5">
                                  <UserAvatar user={helper} size="xs" />
                                  <div className="flex-1 min-w-0">
                                    <p className="text-xs font-semibold text-slate-900">{helper.name} <span className="text-slate-400 font-normal">· {ROLE_LABELS[helper.role]}</span></p>
                                    <p className="text-xs text-slate-600 mt-0.5">{resp.message}</p>
                                  </div>
                                  <button onClick={() => openMessage(helper.id)} className="text-xs text-blue-700 font-semibold flex-shrink-0 hover:underline">Message</button>
                                </div>;
                      })}
                          </div>}
                      </div>;
                })}
                </div>
              </>}

            {!isFounder && <div className="space-y-4">
                {otherRequests.length === 0 && <div className="bg-white rounded-2xl border border-slate-100 p-10 text-center text-slate-400">
                    <Zap className="w-10 h-10 mx-auto mb-3 opacity-20" />
                    <p className="font-semibold">No help requests right now</p>
                  </div>}
                {otherRequests.map(r => {
                const founder = users.find(u => u.id === r.founderId);
                if (!founder) return null;
                const alreadyOffered = helpOffers.some(h => h.requestId === r.id && h.helperId === cu.id);
                return <div key={r.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                      <div className="flex items-center gap-2 mb-2">
                        <UserAvatar user={founder} size="xs" />
                        <span className="text-xs text-slate-500 font-medium">{founder.name} · {founder.company}</span>
                      </div>
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <h4 className="font-bold text-slate-900">{r.title}</h4>
                        {r.category && <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-medium flex-shrink-0">{r.category}</span>}
                      </div>
                      <p className="text-sm text-slate-600 mb-3 leading-relaxed">{r.description}</p>
                      {alreadyOffered ? <div className="space-y-2.5">
                          <p className="text-xs font-semibold text-emerald-600">✓ You've offered help on this</p>
                          <div className="flex flex-wrap gap-2">
                            <button onClick={() => openMessage(founder.id)} className="text-xs px-3 py-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600 font-semibold transition-colors">
                              Message
                            </button>
                            <button onClick={() => scheduleMeetingWith(founder.id)} className="text-xs px-3 py-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600 font-semibold transition-colors">
                              Schedule a Meeting
                            </button>
                            {cu.role === "investor" && <button onClick={() => setHelpInvestOpenId(helpInvestOpenId === r.id ? null : r.id)} className="text-xs px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold transition-colors">
                                Invest in {founder.name}
                              </button>}
                          </div>
                          {cu.role === "investor" && helpInvestOpenId === r.id && (() => {
                        const founderProjects = projects.filter(p => p.ownerId === founder.id);
                        const inputs = helpInvestInputs[founder.id] || {
                          projectId: "",
                          amount: ""
                        };
                        return <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-100 space-y-2">
                                {founderProjects.length > 0 && <select value={inputs.projectId} onChange={e => setHelpInvestInputs(v => ({
                            ...v,
                            [founder.id]: {
                              ...inputs,
                              projectId: e.target.value
                            }
                          }))} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-600">
                                    <option value="">Select a project (optional)</option>
                                    {founderProjects.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
                                  </select>}
                                <div className="flex gap-2">
                                  <input value={inputs.amount} onChange={e => setHelpInvestInputs(v => ({
                              ...v,
                              [founder.id]: {
                                ...inputs,
                                amount: e.target.value
                              }
                            }))} placeholder="Amount, e.g. 500000" type="number" className="flex-1 px-3 py-1.5 border border-slate-200 rounded-lg text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-600" />
                                  <button onClick={() => requestHelpInvestmentAgreement(founder.id, inputs.projectId, inputs.amount)} disabled={!inputs.amount.trim()} className="text-xs px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition-colors flex-shrink-0">
                                    Confirm Investment
                                  </button>
                                </div>
                              </div>;
                      })()}
                        </div> : <div className="flex gap-2">
                          <input value={helpOfferInputs[r.id] || ""} onChange={e => setHelpOfferInputs(v => ({
                      ...v,
                      [r.id]: e.target.value
                    }))} placeholder="Write a short note offering your help..." className="flex-1 px-3 py-2 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600" />
                          <button onClick={() => offerHelp(r.id, helpOfferInputs[r.id] || "")} disabled={!(helpOfferInputs[r.id] || "").trim()} className="text-sm px-4 py-2 bg-blue-700 hover:bg-blue-800 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl font-semibold transition-colors flex-shrink-0">
                            Offer Help
                          </button>
                        </div>}
                    </div>;
              })}
              </div>}
          </div>;
        }

      // ======================== AGREEMENTS ========================
      case "agreements":
        return <div className="p-6 lg:p-8 max-w-3xl mx-auto pb-12">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-slate-900">Agreements</h1>
            <p className="text-slate-500 mt-1 text-sm">Investment term sheets and freelance work agreements generated on VentureLink</p>
          </div>
          <div className="space-y-4">
            {myAgreements.length === 0 && <div className="bg-white rounded-2xl border border-slate-100 p-10 text-center text-slate-400">
                <CheckCircle className="w-10 h-10 mx-auto mb-3 opacity-20" />
                <p className="font-semibold">No agreements yet</p>
                <p className="text-sm mt-1">Agreements are generated when an investment is made or an offer is accepted</p>
              </div>}
            {myAgreements.slice().reverse().map(a => {
              const otherPartyId = a.partyAId === cu.id ? a.partyBId : a.partyAId;
              const otherParty = users.find(u => u.id === otherPartyId);
              return <div key={a.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${a.type === "investment" ? "bg-emerald-100 text-emerald-700" : "bg-blue-100 text-blue-700"}`}>
                        {a.type === "investment" ? "Investment Term Sheet" : "Freelance Agreement"}
                      </span>
                      <h4 className="font-bold text-slate-900 mt-2">{a.title}</h4>
                    </div>
                    <span className="text-xs text-slate-400 flex-shrink-0">{new Date(a.createdAt).toLocaleDateString([], {
                      month: "short",
                      day: "numeric",
                      year: "numeric"
                    })}</span>
                  </div>
                  {otherParty && <div className="flex items-center gap-2 mb-3">
                      <UserAvatar user={otherParty} size="xs" />
                      <span className="text-xs text-slate-500">with {otherParty.name}</span>
                    </div>}
                  <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 rounded-xl p-3.5 border border-slate-100 whitespace-pre-line">{a.terms}</p>
                  <div className="flex items-center justify-between gap-4 mt-3">
                    <div className="flex gap-4 text-xs text-slate-500 font-medium">
                      {a.amount != null && <span>Amount: ${a.amount.toLocaleString()}</span>}
                      {a.duration && <span>Duration: {a.duration}</span>}
                    </div>
                    <button onClick={() => openAgreementReport(a)} className="flex items-center gap-1.5 text-xs px-3.5 py-2 bg-[#0F1E3D] hover:bg-[#14224a] text-white rounded-lg font-semibold transition-colors flex-shrink-0">
                      <Link2 className="w-3.5 h-3.5" /> Generate Report
                    </button>
                  </div>
                </div>;
            })}
          </div>
        </div>;

      // ======================== CALENDAR (my meetings) ========================
      case "calendar":
        {
          const myMeetings = meetings.filter(m => m.partyAId === cu.id || m.partyBId === cu.id);
          const now = new Date();
          const viewDate = new Date(now.getFullYear(), now.getMonth() + calendarMonthOffset, 1);
          const year = viewDate.getFullYear();
          const month = viewDate.getMonth();
          const firstDayIndex = new Date(year, month, 1).getDay();
          const daysInMonth = new Date(year, month + 1, 0).getDate();
          const monthLabel = viewDate.toLocaleDateString([], {
            month: "long",
            year: "numeric"
          });
          const pad2 = n => String(n).padStart(2, "0");
          const todayStr = `${now.getFullYear()}-${pad2(now.getMonth() + 1)}-${pad2(now.getDate())}`;
          const meetingsByDate = {};
          myMeetings.forEach(m => {
            (meetingsByDate[m.date] = meetingsByDate[m.date] || []).push(m);
          });
          const cells = [];
          for (let i = 0; i < firstDayIndex; i++) cells.push(null);
          for (let d = 1; d <= daysInMonth; d++) cells.push(d);
          const sortedMeetings = myMeetings.slice().sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`));
          const upcomingMeetings = sortedMeetings.filter(m => m.date >= todayStr);
          const pastMeetings = sortedMeetings.filter(m => m.date < todayStr).reverse();
          const listedMeetings = selectedCalendarDate ? sortedMeetings.filter(m => m.date === selectedCalendarDate) : upcomingMeetings;
          return <div className="p-6 lg:p-8 max-w-5xl mx-auto pb-12">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-slate-900">My Meetings</h1>
              <p className="text-slate-500 mt-1 text-sm">All your scheduled calls and meetings in one calendar</p>
            </div>

            <div className="grid lg:grid-cols-5 gap-6">
              <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                <div className="flex items-center justify-between mb-4">
                  <button onClick={() => setCalendarMonthOffset(o => o - 1)} className="p-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-500">
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <h3 className="font-bold text-slate-900 text-sm">{monthLabel}</h3>
                  <button onClick={() => setCalendarMonthOffset(o => o + 1)} className="p-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-500">
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
                <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(7, 1fr)",
                gap: "4px"
              }} className="mb-1">
                  {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => <div key={i} className="text-center text-xs font-bold text-slate-400 py-1">{d}</div>)}
                </div>
                <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(7, 1fr)",
                gap: "4px"
              }}>
                  {cells.map((day, idx) => {
                  if (day === null) return <div key={idx} />;
                  const dateStr = `${year}-${pad2(month + 1)}-${pad2(day)}`;
                  const dayMeetings = meetingsByDate[dateStr] || [];
                  const isToday = dateStr === todayStr;
                  const isSelected = dateStr === selectedCalendarDate;
                  return <button key={idx} onClick={() => setSelectedCalendarDate(isSelected ? null : dateStr)} style={{
                    aspectRatio: "1"
                  }} className={`rounded-xl text-xs font-semibold flex flex-col items-center justify-center gap-0.5 transition-colors ${isSelected ? "bg-blue-700 text-white" : isToday ? "bg-blue-50 text-blue-700 border border-blue-200" : dayMeetings.length > 0 ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100" : "text-slate-600 hover:bg-slate-50"}`}>
                        <span>{day}</span>
                        {dayMeetings.length > 0 && <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? "bg-white" : "bg-emerald-500"}`} />}
                      </button>;
                })}
                </div>
                {selectedCalendarDate && <button onClick={() => setSelectedCalendarDate(null)} className="mt-4 text-xs text-blue-700 font-semibold hover:underline">Show upcoming instead</button>}
              </div>

              <div className="lg:col-span-2">
                <h3 className="font-bold text-slate-900 text-sm mb-3">{selectedCalendarDate ? `Meetings on ${selectedCalendarDate}` : "Upcoming Meetings"}</h3>
                <div className="space-y-3 mb-6">
                  {listedMeetings.length === 0 && <div className="bg-white rounded-2xl border border-slate-100 p-6 text-center text-slate-400 text-xs">No meetings {selectedCalendarDate ? "on this day" : "scheduled yet"}.</div>}
                  {listedMeetings.map(m => {
                  const otherId = m.partyAId === cu.id ? m.partyBId : m.partyAId;
                  const other = users.find(u => u.id === otherId);
                  if (!other) return null;
                  return <div key={m.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
                        <div className="flex items-center gap-3 mb-2">
                          <UserAvatar user={other} size="sm" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-slate-900 truncate">{other.name}</p>
                            <p className="text-xs text-slate-400">{m.date} · {m.time} · {m.mode === "online" ? "Online" : "In-person"}</p>
                          </div>
                        </div>
                        {m.notes && <p className="text-xs text-slate-500 leading-relaxed">{m.notes}</p>}
                      </div>;
                })}
                </div>
                {!selectedCalendarDate && pastMeetings.length > 0 && <>
                    <h3 className="font-bold text-slate-900 text-sm mb-3">Past Meetings</h3>
                    <div className="space-y-3">
                      {pastMeetings.map(m => {
                    const otherId = m.partyAId === cu.id ? m.partyBId : m.partyAId;
                    const other = users.find(u => u.id === otherId);
                    if (!other) return null;
                    return <div key={m.id} className="bg-white rounded-2xl border border-slate-100 p-4 opacity-70">
                          <div className="flex items-center gap-3">
                            <UserAvatar user={other} size="sm" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-slate-900 truncate">{other.name}</p>
                              <p className="text-xs text-slate-400">{m.date} · {m.time} · {m.mode === "online" ? "Online" : "In-person"}</p>
                            </div>
                          </div>
                        </div>;
                  })}
                    </div>
                  </>}
              </div>
            </div>
          </div>;
        }

      // ======================== WEBINARS ========================
      case "webinars":
        return <div className="p-6 lg:p-8 max-w-4xl mx-auto pb-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Webinars</h1>
              <p className="text-slate-500 mt-1 text-sm">Learn from entrepreneurs, investors, and industry experts</p>
            </div>
            {cu.role !== "freelancer" && <button onClick={() => setShowWebinarForm(!showWebinarForm)} className="flex items-center gap-2 bg-blue-700 hover:bg-blue-800 text-white px-4 py-2.5 rounded-xl font-semibold transition-colors text-sm flex-shrink-0">
                <Plus className="w-4 h-4" />
                Host a Webinar
              </button>}
          </div>

          {showWebinarForm && <form onSubmit={postWebinar} className="bg-white rounded-2xl border-2 border-blue-200 shadow-sm p-6 mb-6">
              <h3 className="font-bold text-slate-900 mb-4">Create New Webinar</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Webinar Title *</label>
                  <input required value={webinarForm.title} onChange={e => setWebinarForm(f => ({
                  ...f,
                  title: e.target.value
                }))} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm bg-slate-50 focus:bg-white" placeholder="e.g. Building a SaaS from Scratch" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Description *</label>
                  <textarea required value={webinarForm.description} onChange={e => setWebinarForm(f => ({
                  ...f,
                  description: e.target.value
                }))} rows={3} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm resize-none bg-slate-50 focus:bg-white" placeholder="What will attendees learn?" />
                </div>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Date *</label>
                    <input required type="date" value={webinarForm.date} onChange={e => setWebinarForm(f => ({
                    ...f,
                    date: e.target.value
                  }))} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Time *</label>
                    <input required value={webinarForm.time} onChange={e => setWebinarForm(f => ({
                    ...f,
                    time: e.target.value
                  }))} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm" placeholder="2:00 PM EST" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Duration</label>
                    <select value={webinarForm.duration} onChange={e => setWebinarForm(f => ({
                    ...f,
                    duration: e.target.value
                  }))} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm bg-white">
                      {["30 min", "45 min", "60 min", "90 min", "120 min"].map(d => <option key={d}>{d}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Topic</label>
                    <input value={webinarForm.topic} onChange={e => setWebinarForm(f => ({
                    ...f,
                    topic: e.target.value
                  }))} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm bg-slate-50" placeholder="Fundraising" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Tags (comma-separated)</label>
                  <input value={webinarForm.tags} onChange={e => setWebinarForm(f => ({
                  ...f,
                  tags: e.target.value
                }))} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm bg-slate-50" placeholder="FinTech, Startups, Fundraising" />
                </div>
              </div>
              <div className="flex gap-3 mt-5">
                <button type="submit" className="bg-blue-700 hover:bg-blue-800 text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-colors">
                  Publish Webinar
                </button>
                <button type="button" onClick={() => setShowWebinarForm(false)} className="px-5 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-600 hover:bg-slate-50 transition-colors font-medium">
                  Cancel
                </button>
              </div>
            </form>}

          <div className="space-y-4">
            {webinars.map(w => {
              const host = users.find(u => u.id === w.hostId);
              const isUpcoming = new Date(w.date) >= new Date();
              return <div key={w.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        {w.topic && <span className="text-xs bg-blue-50 text-blue-700 border border-blue-100 px-2.5 py-0.5 rounded-full font-semibold">{w.topic}</span>}
                        {isUpcoming && <span className="text-xs bg-emerald-50 text-emerald-600 border border-emerald-100 px-2.5 py-0.5 rounded-full font-semibold">Upcoming</span>}
                      </div>
                      <h3 className="font-bold text-slate-900 text-lg leading-snug">{w.title}</h3>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-sm font-bold text-slate-900">{new Date(w.date).toLocaleDateString([], {
                        month: "short",
                        day: "numeric",
                        year: "numeric"
                      })}</div>
                      <div className="text-xs text-slate-500">{w.time}</div>
                    </div>
                  </div>
                  <p className="text-sm text-slate-600 mb-4 line-clamp-2 leading-relaxed">{w.description}</p>
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <div className="flex items-center gap-4 flex-wrap">
                      {host && <div className="flex items-center gap-2">
                          <UserAvatar user={host} size="xs" />
                          <div>
                            <p className="text-xs font-semibold text-slate-900">{host.name}</p>
                            <p className="text-xs text-slate-400">{host.position}</p>
                          </div>
                        </div>}
                      <div className="flex items-center gap-1 text-xs text-slate-500">
                        <Clock className="w-3 h-3" />{w.duration}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-slate-500">
                        <Users className="w-3 h-3" />{w.registeredCount} registered
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1 flex-wrap">
                        {w.tags.slice(0, 2).map(t => <span key={t} className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">{t}</span>)}
                      </div>
                      <button onClick={() => toggleWebinarRegistration(w.id)} className={`text-xs px-4 py-2 rounded-xl font-semibold transition-colors flex-shrink-0 ${myWebinarRegistrations.includes(w.id) ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200" : "bg-blue-700 hover:bg-blue-800 text-white"}`}>
                        {myWebinarRegistrations.includes(w.id) ? "✓ Registered" : "Register"}
                      </button>
                    </div>
                  </div>
                </div>;
            })}
          </div>
        </div>;

      // ======================== PROFILE ========================
      case "profile":
        {
          if (editingProfile) {
            return <div className="p-6 lg:p-8 max-w-3xl mx-auto pb-12">
              <div className="flex items-center gap-3 mb-6">
                <button onClick={() => setEditingProfile(false)} className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
                  <ChevronLeft className="w-4 h-4 text-slate-600" />
                </button>
                <h1 className="text-xl font-bold text-slate-900">Edit Profile</h1>
              </div>
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Full Name</label>
                    <input value={editForm.name || ""} onChange={e => setEditForm(f => ({
                      ...f,
                      name: e.target.value
                    }))} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm bg-slate-50 focus:bg-white" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Location</label>
                    <input value={editForm.location || ""} onChange={e => setEditForm(f => ({
                      ...f,
                      location: e.target.value
                    }))} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm bg-slate-50 focus:bg-white" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Bio</label>
                  <textarea value={editForm.bio || ""} onChange={e => setEditForm(f => ({
                    ...f,
                    bio: e.target.value
                  }))} rows={4} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm resize-none bg-slate-50 focus:bg-white" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Company</label>
                    <input value={editForm.company || ""} onChange={e => setEditForm(f => ({
                      ...f,
                      company: e.target.value
                    }))} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm bg-slate-50 focus:bg-white" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Position</label>
                    <input value={editForm.position || ""} onChange={e => setEditForm(f => ({
                      ...f,
                      position: e.target.value
                    }))} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm bg-slate-50 focus:bg-white" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Experience</label>
                    <input value={editForm.experience || ""} onChange={e => setEditForm(f => ({
                      ...f,
                      experience: e.target.value
                    }))} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm bg-slate-50 focus:bg-white" placeholder="8 years" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Website</label>
                    <input value={editForm.website || ""} onChange={e => setEditForm(f => ({
                      ...f,
                      website: e.target.value
                    }))} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm bg-slate-50 focus:bg-white" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">LinkedIn URL</label>
                  <input value={editForm.linkedin || ""} onChange={e => setEditForm(f => ({
                    ...f,
                    linkedin: e.target.value
                  }))} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm bg-slate-50 focus:bg-white" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Industries (comma-separated)</label>
                  <input value={(editForm.industry || []).join(", ")} onChange={e => setEditForm(f => ({
                    ...f,
                    industry: e.target.value.split(",").map(s => s.trim()).filter(Boolean)
                  }))} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm bg-slate-50 focus:bg-white" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Skills (comma-separated)</label>
                  <input value={(editForm.skills || []).join(", ")} onChange={e => setEditForm(f => ({
                    ...f,
                    skills: e.target.value.split(",").map(s => s.trim()).filter(Boolean)
                  }))} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm bg-slate-50 focus:bg-white" />
                </div>
                {(cu.role === "entrepreneur" || cu.role === "startup_founder") && <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Funding Stage</label>
                    <select value={editForm.fundingStage || ""} onChange={e => setEditForm(f => ({
                    ...f,
                    fundingStage: e.target.value
                  }))} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm bg-white">
                      <option value="">Select...</option>
                      {["Pre-idea", "Pre-seed", "Seed", "Series A", "Series B", "Series C+", "Bootstrapped"].map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>}
                {cu.role === "startup_founder" && <div>
                    <p className="text-xs font-bold text-slate-600 mb-2">Company Details</p>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-600 mb-1">Founded Year</label>
                        <input value={editForm.companyDetails?.founded || ""} onChange={e => setEditForm(f => ({
                        ...f,
                        companyDetails: {
                          ...f.companyDetails,
                          founded: e.target.value
                        }
                      }))} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm bg-slate-50 focus:bg-white" placeholder="2022" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-600 mb-1">Team Size</label>
                        <input value={editForm.companyDetails?.teamSize || ""} onChange={e => setEditForm(f => ({
                        ...f,
                        companyDetails: {
                          ...f.companyDetails,
                          teamSize: e.target.value
                        }
                      }))} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm bg-slate-50 focus:bg-white" placeholder="e.g. 12 employees" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-600 mb-1">Headquarters</label>
                        <input value={editForm.companyDetails?.headquarters || ""} onChange={e => setEditForm(f => ({
                        ...f,
                        companyDetails: {
                          ...f.companyDetails,
                          headquarters: e.target.value
                        }
                      }))} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm bg-slate-50 focus:bg-white" placeholder="City, Country" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-600 mb-1">Registration No.</label>
                        <input value={editForm.companyDetails?.registrationNumber || ""} onChange={e => setEditForm(f => ({
                        ...f,
                        companyDetails: {
                          ...f.companyDetails,
                          registrationNumber: e.target.value
                        }
                      }))} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm bg-slate-50 focus:bg-white" placeholder="Company registration number" />
                      </div>
                    </div>
                  </div>}
                {cu.role === "investor" && <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1">Investment Range</label>
                      <input value={editForm.investmentRange || ""} onChange={e => setEditForm(f => ({
                      ...f,
                      investmentRange: e.target.value
                    }))} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm bg-slate-50" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1">Portfolio Size</label>
                      <input type="number" value={editForm.portfolioCompanies || ""} onChange={e => setEditForm(f => ({
                      ...f,
                      portfolioCompanies: parseInt(e.target.value) || 0
                    }))} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm bg-slate-50" />
                    </div>
                  </div>}
                {cu.role === "investor" && <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Agreement Policy</label>
                    <textarea value={editForm.agreementPolicy || ""} onChange={e => setEditForm(f => ({
                    ...f,
                    agreementPolicy: e.target.value
                  }))} rows={3} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm resize-none bg-slate-50" placeholder="Describe your investment agreement policy — terms, equity expectations, conditions founders must accept before submitting projects..." />
                    <p className="text-xs text-slate-400 mt-1">This policy is shown to founders before they submit a project to your requirements.</p>
                  </div>}
                {cu.role === "freelancer" && <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1">Hourly Rate</label>
                      <input value={editForm.hourlyRate || ""} onChange={e => setEditForm(f => ({
                      ...f,
                      hourlyRate: e.target.value
                    }))} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm bg-slate-50" placeholder="$100/hr" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1">Available For</label>
                      <input value={editForm.availableFor || ""} onChange={e => setEditForm(f => ({
                      ...f,
                      availableFor: e.target.value
                    }))} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm bg-slate-50" placeholder="Contract work" />
                    </div>
                  </div>}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Company Logo</label>
                    <div className="flex items-center gap-3">
                      {cu.companyLogoDataUrl ? <img src={cu.companyLogoDataUrl} alt="logo" className="w-11 h-11 rounded-xl object-contain border border-slate-200 bg-white" /> : <div className="w-11 h-11 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400">
                          <Building2 className="w-5 h-5" />
                        </div>}
                      <button type="button" onClick={() => logoFileInputRef.current?.click()} className="text-xs px-3 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600 font-semibold">
                        {cu.companyLogoDataUrl ? "Replace" : "Upload logo"}
                      </button>
                      <input ref={logoFileInputRef} type="file" accept="image/*" className="hidden" onChange={handleLogoFileChange} />
                    </div>
                    <p className="text-xs text-slate-400 mt-1.5">Appears on agreement reports you generate.</p>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">E-Signature</label>
                    {cu.signatureDataUrl ? <div className="flex items-center gap-3">
                        <img src={cu.signatureDataUrl} alt="signature" className="h-11 border border-slate-200 rounded-lg bg-white px-2" />
                        <button type="button" onClick={() => setUsers(prev => prev.map(u => u.id === cu.id ? {
                        ...u,
                        signatureDataUrl: undefined
                      } : u))} className="text-xs px-3 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600 font-semibold">
                          Redo
                        </button>
                      </div> : <p className="text-xs text-slate-400 mt-1">Draw your signature below to sign agreement reports.</p>}
                  </div>
                </div>

                {!cu.signatureDataUrl && <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Draw your signature</label>
                    <canvas ref={sigCanvasRef} width={400} height={120} onMouseDown={sigPointerDown} onMouseMove={sigPointerMove} onMouseUp={sigPointerUp} onMouseLeave={sigPointerUp} onTouchStart={sigPointerDown} onTouchMove={sigPointerMove} onTouchEnd={sigPointerUp} className="w-full max-w-sm border border-slate-200 rounded-xl bg-slate-50 touch-none" style={{
                    cursor: "crosshair"
                  }} />
                    <div className="flex gap-2 mt-2">
                      <button type="button" onClick={saveSignature} disabled={!sigHasStrokes} className="text-xs px-3.5 py-2 bg-blue-700 hover:bg-blue-800 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition-colors">
                        Save Signature
                      </button>
                      <button type="button" onClick={clearSignaturePad} className="text-xs px-3.5 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600 font-semibold">
                        Clear
                      </button>
                    </div>
                  </div>}

                <div className="flex gap-3 pt-2">
                  <button onClick={saveProfile} className="bg-blue-700 hover:bg-blue-800 text-white px-6 py-2.5 rounded-xl font-semibold text-sm transition-colors flex items-center gap-2">
                    <Save className="w-4 h-4" /> Save Changes
                  </button>
                  <button onClick={() => setEditingProfile(false)} className="px-6 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-600 hover:bg-slate-50 transition-colors font-medium">
                    Cancel
                  </button>
                </div>
              </div>
            </div>;
          }
          const ownReviews = getUserReviews(cu.id).map(r => ({
            ...r,
            fromName: users.find(u => u.id === r.fromId)?.name || "A member"
          }));
          const checklist = getVerificationChecklist(cu);
          return <>
            <ProfileView user={cu} isOwnProfile onEdit={startEditProfile} onConnect={() => {}} onMessage={() => {}} connectionStatus="self" avgRating={getAvgRating(cu.id)} reviewCount={ownReviews.length} reviewsList={ownReviews} />
            <div className="max-w-3xl mx-auto px-6 -mt-1 mb-10">
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                <div className="flex items-center justify-between gap-3 mb-1">
                  <h3 className="font-bold text-slate-900 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" /> Verification & Trust
                  </h3>
                  {cu.verified && <VerifiedBadge />}
                </div>
                <p className="text-xs text-slate-500 mb-3">{cu.verified ? "Your profile is verified. Members see a trust badge on your profile and listings." : "Complete the checklist to request a verification badge that builds trust with the network."}</p>
                {!cu.verified && <>
                    <div className="space-y-2 mb-4">
                      {checklist.map(c => <div key={c.label} className="flex items-center gap-2 text-sm">
                          {c.done ? <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" /> : <span className="w-4 h-4 rounded-full border-2 border-slate-200 flex-shrink-0" />}
                          <span className={c.done ? "text-slate-700" : "text-slate-400"}>{c.label}</span>
                        </div>)}
                    </div>
                    <button onClick={requestVerification} disabled={!isEligibleForVerification(cu)} className="text-sm px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl font-semibold transition-colors">
                      Request Verification
                    </button>
                    {verifyMessage && <p className="text-xs text-emerald-700 font-semibold mt-2">{verifyMessage}</p>}
                  </>}
              </div>
            </div>
          </>;
        }

      // ======================== VIEW USER PROFILE ========================
      case "view-profile":
        {
          const viewUser = viewingUserId ? users.find(u => u.id === viewingUserId) : null;
          if (!viewUser) return null;
          const status = cu.connections.includes(viewUser.id) ? "connected" : cu.pendingSent.includes(viewUser.id) ? "pending" : cu.pendingReceived.includes(viewUser.id) ? "received" : "none";
          const showMatch = (cu.role === "entrepreneur" || cu.role === "startup_founder") && viewUser.role === "investor";
          const viewedProjects = projects.filter(p => p.ownerId === viewUser.id);
          const showProjects = viewUser.role === "entrepreneur" || viewUser.role === "freelancer" || viewUser.role === "startup_founder";
          // Anyone willing to hire can send a job offer letter to a freelancer,
          // and a freelancer can also send an offer letter pitching an investor.
          const canSendOffer = viewUser.id !== cu.id && ((viewUser.role === "freelancer") || (cu.role === "freelancer" && viewUser.role === "investor"));
          const offerUi = offerTerms(viewUser.role);
          const viewedReviews = getUserReviews(viewUser.id).map(r => ({
            ...r,
            fromName: users.find(u => u.id === r.fromId)?.name || "A member"
          }));
          const canReview = viewUser.id !== cu.id && hasCollaboratedWith(viewUser.id) && !hasAlreadyReviewed(viewUser.id);
          return <div>
            <div className="px-6 pt-4">
              <button onClick={() => setView("discover")} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition-colors font-medium">
                <ChevronLeft className="w-4 h-4" /> Back to Discover
              </button>
            </div>
            <ProfileView user={viewUser} isOwnProfile={false} onEdit={() => {}} onConnect={() => sendConnectionRequest(viewUser.id)} onMessage={() => openMessage(viewUser.id)} connectionStatus={status} matchScore={showMatch ? calcMatchScore(cu, viewUser) : undefined} avgRating={getAvgRating(viewUser.id)} reviewCount={viewedReviews.length} reviewsList={viewedReviews} />

            {canReview && <div className="max-w-3xl mx-auto px-6 -mt-4 mb-6">
                {reviewTargetId !== viewUser.id ? <button onClick={() => setReviewTargetId(viewUser.id)} className="flex items-center gap-2 bg-white border-2 border-emerald-200 hover:bg-emerald-50 text-emerald-700 px-4 py-2.5 rounded-xl font-semibold transition-colors text-sm">
                    <Star className="w-4 h-4" /> Rate & Review {viewUser.name.split(" ")[0]}
                  </button> : <div className="bg-white rounded-2xl border-2 border-emerald-200 shadow-sm p-6">
                    <h4 className="font-bold text-slate-900 mb-4">Rate your collaboration with {viewUser.name}</h4>
                    <div className="flex items-center gap-1.5 mb-4">
                      {[1, 2, 3, 4, 5].map(n => <button key={n} type="button" onClick={() => setReviewForm(f => ({
                    ...f,
                    rating: n
                  }))} className="text-amber-500">
                          <Star filled={n <= reviewForm.rating} className="w-6 h-6" />
                        </button>)}
                    </div>
                    <textarea value={reviewForm.comment} onChange={e => setReviewForm(f => ({
                  ...f,
                  comment: e.target.value
                }))} rows={3} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm resize-none bg-slate-50 focus:bg-white" placeholder="How did the collaboration go?" />
                    <div className="flex gap-3 mt-4">
                      <button onClick={() => submitReview(viewUser.id)} disabled={!reviewForm.comment.trim()} className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-colors">
                        Submit Review
                      </button>
                      <button onClick={() => {
                    setReviewTargetId(null);
                    setReviewForm({
                      rating: 5,
                      comment: ""
                    });
                  }} className="px-5 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-600 hover:bg-slate-50 transition-colors font-medium">
                        Cancel
                      </button>
                    </div>
                  </div>}
              </div>}

            {viewUser.id !== cu.id && !hasAlreadyReviewed(viewUser.id) && !hasCollaboratedWith(viewUser.id) && <div className="max-w-3xl mx-auto px-6 -mt-4 mb-6">
                <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 text-slate-500 px-4 py-3 rounded-xl text-xs font-semibold">
                  <ShieldCheck className="w-4 h-4 flex-shrink-0" /> Rate & Review unlocks after you complete work together (a concluded investment or an accepted offer).
                </div>
              </div>}

            {canSendOffer && <div className="max-w-3xl mx-auto px-6 -mt-4 mb-6">
                {!showOfferForm ? <button onClick={() => setShowOfferForm(true)} className="flex items-center gap-2 bg-blue-700 hover:bg-blue-800 text-white px-4 py-2.5 rounded-xl font-semibold transition-colors text-sm">
                    <Send className="w-4 h-4" /> {offerUi.sendBtn}
                  </button> : <div className="bg-white rounded-2xl border-2 border-blue-200 shadow-sm p-6">
                    <h4 className="font-bold text-slate-900 mb-4">{offerUi.docTitle} for {viewUser.name}</h4>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-600 mb-1">Project / Role Title *</label>
                        <input value={offerForm.title} onChange={e => setOfferForm(f => ({
                      ...f,
                      title: e.target.value
                    }))} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm bg-slate-50 focus:bg-white" placeholder="e.g. Landing Page Redesign" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-600 mb-1">Scope / Description</label>
                        <textarea value={offerForm.description} onChange={e => setOfferForm(f => ({
                      ...f,
                      description: e.target.value
                    }))} rows={3} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm resize-none bg-slate-50 focus:bg-white" placeholder="What will they work on?" />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-bold text-slate-600 mb-1">Duration</label>
                          <input value={offerForm.duration} onChange={e => setOfferForm(f => ({
                        ...f,
                        duration: e.target.value
                      }))} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm bg-slate-50 focus:bg-white" placeholder="e.g. 3 months, 20 days" />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-600 mb-1">{offerUi.packageLabel}</label>
                          <input value={offerForm.rate} onChange={e => setOfferForm(f => ({
                        ...f,
                        rate: e.target.value
                      }))} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm bg-slate-50 focus:bg-white" placeholder={offerUi.packagePlaceholder} />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-600 mb-1">Project Details (image or file, optional)</label>
                        <button type="button" onClick={() => offerFileInputRef.current?.click()} className="flex items-center gap-2 px-4 py-2.5 border-2 border-dashed border-slate-200 rounded-xl text-sm text-slate-500 hover:border-blue-300 hover:text-blue-700 transition-colors w-full justify-center font-medium">
                          <Plus className="w-4 h-4" /> {pendingOfferFile ? pendingOfferFile.name : "Attach an image or file"}
                        </button>
                        <input ref={offerFileInputRef} type="file" className="hidden" onChange={handleOfferFileChange} />
                        {pendingOfferFile && <button type="button" onClick={() => {
                      setPendingOfferFile(null);
                      if (offerFileInputRef.current) offerFileInputRef.current.value = "";
                    }} className="text-xs text-slate-500 hover:text-slate-800 font-semibold mt-1.5 hover:underline">
                            Remove file
                          </button>}
                        <p className="text-xs text-slate-400 mt-1">Shared along with the offer letter so they can see the project details.</p>
                      </div>
                    </div>
                    <div className="flex gap-3 mt-5">
                      <button onClick={() => sendOfferLetter(viewUser.id)} disabled={!offerForm.title.trim()} className="bg-blue-700 hover:bg-blue-800 disabled:opacity-40 disabled:cursor-not-allowed text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-colors">
                        Send Offer Letter
                      </button>
                      <button onClick={() => {
                      setShowOfferForm(false);
                      setPendingOfferFile(null);
                    }} className="px-5 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-600 hover:bg-slate-50 transition-colors font-medium">
                        Cancel
                      </button>
                    </div>
                  </div>}
              </div>}

            {showProjects && <div className="max-w-3xl mx-auto px-6 pb-10">
                <h3 className="font-bold text-slate-900 mb-3">Projects by {viewUser.name.split(" ")[0]}</h3>
                {viewedProjects.length === 0 ? <div className="bg-white rounded-2xl border border-slate-100 p-8 text-center text-slate-400 text-sm">No projects published yet.</div> : <div className="grid md:grid-cols-2 gap-4">
                    {viewedProjects.map(p => <div key={p.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h4 className="font-bold text-slate-900 leading-snug">{p.title}</h4>
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${p.status === "funded" ? "bg-emerald-100 text-emerald-700" : p.status === "in_talks" ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-600"}`}>
                            {p.status === "funded" ? "Funded" : p.status === "in_talks" ? "In talks" : "Open"}
                          </span>
                        </div>
                        {p.industry && <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-medium">{p.industry}</span>}
                        <p className="text-sm text-slate-600 mt-2 leading-relaxed">{p.description || "No description yet."}</p>
                        {p.fundingRequired && <div className="mt-3">
                            <FundingProgressBar required={p.fundingRequired} received={getProjectFundingReceived(p.id)} />
                          </div>}
                        <ProjectLinks project={p} />
                      </div>)}
                  </div>}
              </div>}
          </div>;
        }
      default:
        return null;
    }
  }
  return <div className="flex h-screen bg-slate-50 overflow-hidden" style={{
    fontFamily: "var(--font-family)"
  }}>
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? "w-60" : "w-16"} flex-shrink-0 bg-[#1B2D5B] flex flex-col transition-all duration-300 overflow-hidden`}>
        <div className="flex items-center gap-3 px-4 py-5 border-b border-white/10 flex-shrink-0">
          <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-600/30">
            <Zap className="w-5 h-5 text-white" />
          </div>
          {sidebarOpen && <span className="text-white font-bold text-lg tracking-tight">VentureLink</span>}
        </div>
        <nav className="flex-1 py-4 px-2 space-y-0.5 overflow-y-auto">
          {navItems.map(item => <button key={item.id} onClick={() => setView(item.id)} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors relative group ${view === item.id || view === "view-profile" && item.id === "discover" ? "bg-white/20 text-white" : "text-white/60 hover:text-white hover:bg-white/10"}`}>
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {sidebarOpen && <span className="text-sm font-semibold">{item.label}</span>}
              {item.badge ? <span className={`${sidebarOpen ? "ml-auto" : "absolute -top-0.5 -right-0.5"} bg-amber-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold`}>
                  {item.badge}
                </span> : null}
            </button>)}
        </nav>
        <div className="p-3 border-t border-white/10 flex-shrink-0">
          <div className={`flex items-center gap-3 px-2 py-2 ${!sidebarOpen ? "justify-center" : ""}`}>
            <div className={`w-8 h-8 ${getAvatarColor(cu.id)} rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
              {getInitials(cu.name)}
            </div>
            {sidebarOpen && <div className="flex-1 min-w-0">
                <p className="text-white text-xs font-semibold truncate">{cu.name}</p>
                <p className="text-white/50 text-xs">{ROLE_LABELS[cu.role]}</p>
              </div>}
          </div>
          <button onClick={handleLogout} className={`w-full flex items-center gap-2.5 px-2 py-2 rounded-xl text-white/50 hover:text-white hover:bg-white/10 transition-colors mt-1 ${!sidebarOpen ? "justify-center" : ""}`}>
            <LogOut className="w-4 h-4 flex-shrink-0" />
            {sidebarOpen && <span className="text-xs font-medium">Sign out</span>}
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="relative flex-1 overflow-hidden flex flex-col">
        <div className="sticky top-0 z-10 bg-white border-b border-slate-100 px-5 py-3 flex items-center gap-3 flex-shrink-0">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 rounded-xl hover:bg-slate-100 text-slate-500 transition-colors">
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex-1" />
          <div className="flex items-center gap-1.5 text-slate-400">
            <Globe className="w-4 h-4" />
            <select data-vl-i18n="off" value={lang} onChange={e => setLang(e.target.value)} className="text-xs font-semibold text-slate-600 border border-slate-200 rounded-lg px-2 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 cursor-pointer" title="Language / மொழி / भाषा">
              {I18N_LANGS.map(l => <option key={l.code} value={l.code}>{l.label}</option>)}
            </select>
          </div>
          <div className="relative">
            <button onClick={() => setNotifDropdownOpen(!notifDropdownOpen)} className="relative p-2 rounded-xl hover:bg-slate-100 text-slate-500 transition-colors">
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && <span className="absolute top-0.5 right-0.5 bg-rose-600 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                  {unreadCount}
                </span>}
            </button>
            {notifDropdownOpen && <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl border border-slate-100 shadow-xl z-20 overflow-hidden">
                <div className="p-3.5 border-b border-slate-100 flex items-center justify-between">
                  <p className="font-bold text-slate-900 text-sm">Notifications</p>
                  <button onClick={() => setNotifDropdownOpen(false)} className="text-slate-300 hover:text-slate-500">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {unreadMsgList.length === 0 ? <p className="text-sm text-slate-400 text-center py-8">You're all caught up.</p> : unreadMsgList.map(m => <button key={m.id} onClick={() => {
                openMessage(m.fromId);
                setNotifDropdownOpen(false);
              }} className="w-full text-left px-4 py-3 hover:bg-slate-50 border-b border-slate-50 transition-colors">
                        <p className="text-xs font-semibold text-slate-900">{m.senderName}</p>
                        <p className="text-xs text-slate-500 truncate mt-0.5">{m.content}</p>
                      </button>)}
                </div>
              </div>}
          </div>
          <div className="flex items-center gap-2.5">
            <RoleBadge role={cu.role} />
            <span className="text-sm font-bold text-slate-900">{cu.name}</span>
          </div>
        </div>
        <div className={`flex-1 ${view === "messages" ? "overflow-hidden" : "overflow-y-auto"}`}>
          {renderContent()}
        </div>

        {/* PatentBot — investor-side patent novelty screener (floating inside the content column) */}
        {cu.role === "investor" && !patentBotOpen && <button onClick={openPatentBotFromLauncher} className="absolute bottom-6 right-6 z-30 flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white pl-4 pr-5 py-3 rounded-full shadow-xl text-sm font-bold transition-colors">
          <span className="w-7 h-7 bg-blue-600 rounded-full flex items-center justify-center"><ShieldCheck className="w-4 h-4" /></span>
          PatentBot
        </button>}
        {cu.role === "investor" && patentBotOpen && <div className="absolute bottom-6 right-6 z-30 w-[360px] max-w-[calc(100%-3rem)] bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col" style={{ height: "min(540px, calc(100% - 3rem))" }}>
          <div className="bg-slate-900 px-4 py-3 flex items-center gap-2.5 flex-shrink-0">
            <span className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0"><ShieldCheck className="w-4.5 h-4.5 text-white" /></span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white leading-tight">PatentBot</p>
              <p className="text-[11px] text-slate-400 truncate">Patent novelty screener · POST /api/novelty-check</p>
            </div>
            <button onClick={closePatentBot} className="text-slate-400 hover:text-white p-1 transition-colors"><X className="w-4 h-4" /></button>
          </div>
          {(() => {
          const botProj = projects.find(p => p.id === patentBotProjectId);
          return <>
                <div className="flex-1 overflow-y-auto bg-slate-50 p-4 space-y-2.5">
                  {patentBotLog.length === 0 && <p className="text-xs text-slate-400 text-center pt-8">Ask me to verify a patent, or press “Run novelty check”.{!botProj && " Open me from a patented proposal under Requirements to pick a project."}</p>}
                  {patentBotLog.map((m, i) => <div key={i} className={`flex ${m.from === "user" ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-xs leading-relaxed ${m.from === "user" ? "bg-blue-700 text-white rounded-br-md" : "bg-white border border-slate-200 text-slate-700 rounded-bl-md"}`}>{m.text}</div>
                      </div>)}
                  {patentBotBusy && <div className="flex justify-start"><div className="bg-white border border-slate-200 rounded-2xl rounded-bl-md px-3.5 py-2 text-xs text-slate-400">Screening…</div></div>}
                  <div ref={patentBotEndRef} />
                </div>
                {botProj && <div className="px-4 py-2.5 border-t border-slate-100 bg-slate-50 flex-shrink-0">
                    <p className="text-[11px] text-slate-400 truncate mb-1.5">In context: <span className="font-semibold text-slate-600">{botProj.title}</span>{botProj.patentNumber && <span className="text-slate-400"> · Patent No. {botProj.patentNumber}</span>}</p>
                    <button onClick={runPatentNoveltyCheck} disabled={patentBotBusy} className="w-full bg-blue-700 hover:bg-blue-800 disabled:opacity-50 text-white text-xs font-bold py-2 rounded-xl transition-colors">
                      {patentBotBusy ? "Screening…" : "Run novelty check"}
                    </button>
                  </div>}
                {!botProj && <div className="px-4 py-2.5 border-t border-slate-100 bg-slate-50 flex-shrink-0">
                    <p className="text-[11px] text-slate-400 mb-1.5">No patented project in context — open a pending proposal under Requirements, or pick one:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {projects.filter(p => p.patented === true || p.patented === "yes").map(p => <button key={p.id} onClick={() => openPatentBot(p.id, null)} className="text-[11px] px-2.5 py-1 bg-white border border-slate-200 rounded-lg hover:border-blue-300 text-slate-600 font-semibold transition-colors truncate max-w-full">{p.title}</button>)}
                    </div>
                  </div>}
                <div className="p-3 border-t border-slate-100 bg-white flex-shrink-0 flex gap-2">
                  <input value={patentBotInput} onChange={e => setPatentBotInput(e.target.value)} onKeyDown={e => {
                if (e.key === "Enter" && patentBotInput.trim()) {
                  askPatentBot(patentBotInput.trim());
                  setPatentBotInput("");
                }
              }} placeholder="Ask about patent verification…" className="flex-1 px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-600 bg-slate-50" />
                  <button onClick={() => {
                if (patentBotInput.trim()) {
                  askPatentBot(patentBotInput.trim());
                  setPatentBotInput("");
                }
              }} className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors">Send</button>
                  <button onClick={closePatentBot} className="px-3 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl text-xs font-bold transition-colors">{t("Close")}</button>
                </div>
              </>;
        })()}
        </div>}
      </main>

      {/* New message notification popup (shown on login) */}
      {showNotifPopup && notifPreview.length > 0 && <div className="fixed inset-0 bg-slate-900/40 flex items-center justify-center z-50 p-4" onClick={() => setShowNotifPopup(false)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6" onClick={e => e.stopPropagation()}>
            <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center mb-4">
              <MessageCircle className="w-6 h-6 text-blue-700" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">
              {notifPreview.length === 1 ? "You have a new message" : `You have ${notifPreview.length} new messages`}
            </h3>
            <div className="space-y-2 mt-3 mb-5 max-h-48 overflow-y-auto">
              {notifPreview.map(n => <div key={n.id} className="bg-slate-50 rounded-xl p-3">
                  <p className="text-xs font-semibold text-slate-900">{n.senderName}</p>
                  <p className="text-xs text-slate-500 truncate mt-0.5">{n.content}</p>
                </div>)}
            </div>
            <div className="flex gap-3">
              <button onClick={() => {
            setShowNotifPopup(false);
            setView("messages");
            if (notifPreview[0]) setActiveConvoId(users.find(u => u.name === notifPreview[0].senderName)?.id || null);
          }} className="flex-1 bg-blue-700 hover:bg-blue-800 text-white font-semibold py-2.5 rounded-xl text-sm transition-colors">
                View Messages
              </button>
              <button onClick={() => setShowNotifPopup(false)} className="px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-600 hover:bg-slate-50 font-medium">
                Dismiss
              </button>
            </div>
          </div>
        </div>}

      {/* Success toast: offer letter / agreement sent */}
      {successNotice && <div className="fixed bottom-6 left-6 z-50 flex items-start gap-2.5 bg-white border border-emerald-200 shadow-2xl text-emerald-700 pl-4 pr-3 py-3 rounded-2xl max-w-sm">
          <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <p className="text-sm font-semibold leading-snug">{successNotice}</p>
          <button onClick={() => setSuccessNotice("")} className="text-emerald-400 hover:text-emerald-700 p-0.5 flex-shrink-0"><X className="w-4 h-4" /></button>
        </div>}

      {/* Agreement details prompt: shown whenever an agreement is about to be made */}
      {agreementModal && (() => {
      const isOffer = agreementModal.kind === "offer";
      const otherParty = users.find(u => u.id === agreementModal.otherId);
      const offerBeingAccepted = isOffer ? offers.find(o => o.id === agreementModal.offerId) : null;
      const modalProject = !isOffer && agreementModal.projectId ? projects.find(p => p.id === agreementModal.projectId) : null;
      const inputCls = "w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm bg-slate-50 focus:bg-white";
      const setField = key => e => setAgreementForm(f => ({
        ...f,
        [key]: e.target.value
      }));
      return <div className="fixed inset-0 bg-slate-900/40 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6" style={{
          maxHeight: "90vh",
          overflowY: "auto"
        }}>
              <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center mb-4">
                <CheckCircle className="w-6 h-6 text-blue-700" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-1">Agreement Details</h3>
              <p className="text-sm text-slate-500 mb-4">
                {isOffer ? <>Enter the details of your working agreement{otherParty ? ` with ${otherParty.name}` : ""}{offerBeingAccepted ? ` for "${offerBeingAccepted.title}"` : ""}. The agreement report is generated from what you fill in below.</> : <>Enter the details of this investment agreement{otherParty ? ` with ${otherParty.name}` : ""}. The agreement report is generated from what you fill in below.</>}
              </p>
              {!isOffer && <div className="mb-4 bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm text-slate-700">
                  <span className="font-semibold">Investment amount:</span> ${agreementModal.amount.toLocaleString()}{modalProject ? <span className="text-slate-500"> · {modalProject.title}</span> : null}
                </div>}

              {isOffer ? <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Scope of Work *</label>
                    <textarea value={agreementForm.scope} onChange={setField("scope")} rows={3} className={`${inputCls} resize-none`} placeholder="What work will be done?" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1">Duration *</label>
                      <input value={agreementForm.term} onChange={setField("term")} className={inputCls} placeholder="e.g. 3 months, 20 days" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1">Payment / Rate *</label>
                      <input value={agreementForm.rate} onChange={setField("rate")} className={inputCls} placeholder="e.g. $60/hr or $5,000 total" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1">Start Date</label>
                      <input type="date" value={agreementForm.startDate} onChange={setField("startDate")} className={inputCls} />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1">Payment Schedule</label>
                      <input value={agreementForm.paymentSchedule} onChange={setField("paymentSchedule")} className={inputCls} placeholder="e.g. 50% upfront, 50% on delivery" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Deliverables</label>
                    <textarea value={agreementForm.deliverables} onChange={setField("deliverables")} rows={2} className={`${inputCls} resize-none`} placeholder="What will be delivered?" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Additional Terms &amp; Conditions</label>
                    <textarea value={agreementForm.conditions} onChange={setField("conditions")} rows={2} className={`${inputCls} resize-none`} placeholder="Anything else both parties should agree on" />
                  </div>
                </div> : <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1">Investment Type *</label>
                      <select value={agreementForm.instrument} onChange={setField("instrument")} className={inputCls}>
                        <option value="">Select type...</option>
                        {INVESTMENT_INSTRUMENTS.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1">Agreement Term *</label>
                      <input value={agreementForm.term} onChange={setField("term")} className={inputCls} placeholder="e.g. 24 months, 5 years" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1">Equity / Ownership</label>
                      <input value={agreementForm.equityPercent} onChange={setField("equityPercent")} className={inputCls} placeholder="e.g. 8%" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1">Valuation</label>
                      <input value={agreementForm.valuation} onChange={setField("valuation")} className={inputCls} placeholder="e.g. $40M post-money" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Effective Date</label>
                    <input type="date" value={agreementForm.startDate} onChange={setField("startDate")} className={inputCls} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Payment / Disbursement Terms</label>
                    <textarea value={agreementForm.disbursement} onChange={setField("disbursement")} rows={2} className={`${inputCls} resize-none`} placeholder="e.g. Two tranches: 60% at signing, 40% after milestone" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Additional Terms &amp; Conditions</label>
                    <textarea value={agreementForm.conditions} onChange={setField("conditions")} rows={2} className={`${inputCls} resize-none`} placeholder="Board seat, reporting, vesting, or anything else both parties should agree on" />
                  </div>
                </div>}

              <div className="flex gap-3 mt-5">
                <button onClick={confirmAgreementDetails} disabled={!isAgreementFormValid()} className="flex-1 bg-blue-700 hover:bg-blue-800 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-xl text-sm transition-colors">
                  {isOffer ? "Accept & Generate Agreement" : "Confirm Investment & Generate Agreement"}
                </button>
                <button onClick={() => setAgreementModal(null)} className="px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-600 hover:bg-slate-50 font-medium">
                  Cancel
                </button>
              </div>
            </div>
          </div>;
    })()}

      {/* Schedule meeting prompt after an investment is accepted */}
      {scheduleModal && (() => {
      const partyB = users.find(u => u.id === scheduleModal.partyBId);
      return <div className="fixed inset-0 bg-slate-900/40 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6">
              <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center mb-4">
                <Calendar className="w-6 h-6 text-emerald-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-1">Schedule a Meeting</h3>
              <p className="text-sm text-slate-500 mb-4">
                {scheduleModal.context === "meeting" ? <>Set up a call or meeting{partyB ? ` with ${partyB.name}` : ""} to follow up on your offer to help.</> : <>Investment confirmed{partyB ? ` with ${partyB.name}` : ""}. Set up a call or meeting to finalize next steps.</>}
              </p>
              <div className="space-y-3">
                <div className="flex gap-2">
                  {["online", "offline"].map(m => <button key={m} onClick={() => setScheduleForm(f => ({
                ...f,
                mode: m
              }))} className={`flex-1 text-sm px-3 py-2 rounded-xl font-semibold border transition-colors ${scheduleForm.mode === m ? "bg-blue-700 text-white border-blue-700" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}>
                      {m === "online" ? "Online" : "In Person"}
                    </button>)}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Date</label>
                    <input type="date" value={scheduleForm.date} onChange={e => setScheduleForm(f => ({
                  ...f,
                  date: e.target.value
                }))} className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Time</label>
                    <input type="time" value={scheduleForm.time} onChange={e => setScheduleForm(f => ({
                  ...f,
                  time: e.target.value
                }))} className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Notes (optional)</label>
                  <input value={scheduleForm.notes} onChange={e => setScheduleForm(f => ({
                ...f,
                notes: e.target.value
              }))} placeholder={scheduleForm.mode === "online" ? "Meeting link, or leave blank to share later" : "Location"} className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600" />
                </div>
              </div>
              <div className="flex gap-3 mt-5">
                <button onClick={confirmScheduleMeeting} disabled={!scheduleForm.date || !scheduleForm.time} className="flex-1 bg-blue-700 hover:bg-blue-800 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-xl text-sm transition-colors">
                  Confirm &amp; Notify
                </button>
                <button onClick={() => setScheduleModal(null)} className="px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-600 hover:bg-slate-50 font-medium">
                  Skip
                </button>
              </div>
            </div>
          </div>;
    })()}
    </div>;
}