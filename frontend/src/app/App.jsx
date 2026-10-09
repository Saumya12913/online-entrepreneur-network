import { useState, useRef, useEffect } from "react";
import { Home, Search, Users, MessageCircle, Video, User, LogOut, Plus, Send, X, Check, MapPin, Edit2, Save, Calendar, Globe, TrendingUp, Menu, Bell, Clock, Zap, CheckCircle, UserPlus, Building2, Wallet, ChevronLeft, Briefcase, DollarSign, Link2, Star, ShieldCheck, ChevronRight, Filter, Trash2, GraduationCap, Award, UserCheck, UserX, FileText, Target, Layers, BarChart, Paperclip, Sparkles, Printer, Download, Monitor, KeyRound } from "./icons";
import { loadState, saveCollection, apiLogin, apiRegister, apiMe, apiOauthDemo, apiNoveltyCheck, apiPitchReview, apiProjectSummary, apiNoveltyReport, apiAdminStats, startGoogleLogin, takeOauthTokenFromUrl, takeOauthTwoFactorFromUrl, takeOauthErrorFromUrl, getToken, setToken, apiSessions, apiRevokeSession, apiRevokeOtherSessions, apiLogout, apiChangePassword, apiForgotPassword, apiResetPassword, apiVerifyTwoFactor, apiResendTwoFactor, apiTwoFactorStatus, apiEnableTwoFactor, apiConfirmTwoFactor, apiDisableTwoFactor, apiAlertChannels, apiSaveAlertChannels, apiMyAlerts, apiOutbox, apiNotifyImportant, apiWebinarInvites } from "../api.js";
import { UI_LANGS, enableUiLanguage } from "./i18n.js";
import { ThemePicker } from "./theme-picker.jsx";
import { scoreMatch, rankProjectsForInvestor, rankInvestorsForProject } from "./ai-match.js";

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
// The password the build's own sample accounts were seeded with. It is no longer
// printed on the sign-in card; instead those accounts are remembered (see
// rememberSignedInAccount) so one click signs them in.
const DEMO_PASSWORD = "123";
const isDemoEmail = email => DEMO_ACCOUNTS.some(d => d.email.toLowerCase() === String(email || "").trim().toLowerCase());

// Which sign-ins this browser remembers. Only the address, the display name and
// the role are kept — never a password. A real account's credential is saved by
// the browser itself, through the autocomplete attributes on the form fields.
const SAVED_ACCOUNTS_KEY = "vl_saved_accounts";
function loadSavedAccounts() {
  try {
    // First run on this browser: the build's own sample accounts are saved up
    // front, so typing the start of one offers it back instead of printing the
    // address on the card.
    if (localStorage.getItem(SAVED_ACCOUNTS_KEY) === null) return persistSavedAccounts(DEMO_ACCOUNTS.map(d => ({
      email: d.email,
      name: d.name,
      role: d.role,
      demo: true
    })));
    const rows = JSON.parse(localStorage.getItem(SAVED_ACCOUNTS_KEY) || "[]");
    if (!Array.isArray(rows)) return [];
    return rows.filter(r => r && typeof r.email === "string" && r.email.includes("@")).slice(0, 8);
  } catch {
    return [];
  }
}
function persistSavedAccounts(rows) {
  try { localStorage.setItem(SAVED_ACCOUNTS_KEY, JSON.stringify(rows.slice(0, 8))); } catch { /* private mode: nothing to remember */ }
  return rows;
}
function rememberSignedInAccount(user) {
  if (!user || !user.email) return loadSavedAccounts();
  const row = {
    email: user.email,
    name: user.name || String(user.email).split("@")[0],
    role: user.role || "entrepreneur",
    demo: isDemoEmail(user.email)
  };
  const rest = loadSavedAccounts().filter(r => r.email.toLowerCase() !== row.email.toLowerCase());
  return persistSavedAccounts([row, ...rest]);
}
function forgetSignedInAccount(email) {
  return persistSavedAccounts(loadSavedAccounts().filter(r => r.email.toLowerCase() !== String(email).toLowerCase()));
}

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
const AVATAR_COLORS = ["bg-violet-500", "bg-emerald-500", "bg-amber-600", "bg-rose-500", "bg-sky-500", "bg-blue-600", "bg-teal-500", "bg-pink-500", "bg-orange-500", "bg-cyan-600"];
function getAvatarColor(id) {
  const num = parseInt(id.replace(/\D/g, "")) || 0;
  return AVATAR_COLORS[num % AVATAR_COLORS.length];
}
// An email carries no digits to index by, so the accounts this browser remembers
// fall back to a stable letter-sum hash instead of all landing on the first colour.
function avatarColorForSeed(seed) {
  const digits = String(seed || "").replace(/\D/g, "");
  if (digits) return getAvatarColor(digits);
  let sum = 0;
  for (const ch of String(seed || "")) sum += ch.codePointAt(0);
  return AVATAR_COLORS[sum % AVATAR_COLORS.length];
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
// Same short date, read out in the interface language so a screen that is
// already translated does not drop an English date into the middle of it.
function formatShortDateIn(ts, lang) {
  return new Date(ts).toLocaleDateString(lang || undefined, {
    month: "short",
    day: "numeric"
  });
}

// ---- Sign-in activity + session labels (security panel) ----
// Only the browser string the server already receives is turned into a short
// device name here — no extra data is collected.
function describeDevice(userAgent) {
  const ua = String(userAgent || "");
  if (!ua || ua === "unknown") return "Unknown device";
  const browser = /Edg\//.test(ua) ? "Edge" : /OPR\//.test(ua) ? "Opera" : /Firefox\//.test(ua) ? "Firefox" : /Chrome\//.test(ua) ? "Chrome" : /Safari\//.test(ua) ? "Safari" : "Browser";
  const os = /Windows/.test(ua) ? "Windows" : /Android/.test(ua) ? "Android" : /iPhone|iPad|iPod/.test(ua) ? "iOS" : /Mac OS X/.test(ua) ? "macOS" : /Linux/.test(ua) ? "Linux" : "Unknown OS";
  return `${browser} · ${os}`;
}
const SESSION_VIA_LABELS = {
  password: "Password",
  register: "Sign-up",
  google: "Google",
  "oauth-demo": "Google"
};
const ACTIVITY_VIA_LABELS = {
  password: "Sign-in",
  register: "Account created",
  google: "Google sign-in",
  "oauth-demo": "Google sign-in",
  "reset-request": "Reset code requested",
  "reset-password": "Password reset",
  "change-password": "Password changed",
  logout: "Signed out"
};
// Backend details can lead with a count ("3 other session(s) signed out").
// Splitting it keeps the wording its own text node so it can be translated.
function splitDetail(detail) {
  const match = /^(\d+)\s+([\s\S]*)$/.exec(String(detail || ""));
  return match ? { count: match[1], rest: match[2] } : { count: "", rest: String(detail || "") };
}

// The channels an alert can leave through, and the second factor can use.
const ALERT_CHANNEL_KEYS = ["email", "sms", "whatsapp"];
const CHANNEL_LABELS = {
  email: "Email",
  sms: "Text message (SMS)",
  whatsapp: "WhatsApp"
};
// The kinds the platform sends outward, for the delivery log labels.
const ALERT_KIND_LABELS = {
  "two-factor-code": "Verification code",
  "password-reset": "Password reset code",
  "sign-in-alert": "Sign-in notice",
  "offer-sent": "Offer letter sent",
  "offer-decision": "Offer reply",
  "agreement-made": "Agreement filed",
  "meeting-scheduled": "Meeting scheduled",
  "webinar-invite": "Webinar invitation",
  "verification-granted": "Verification granted",
  "proposal-received": "Proposal received",
  "message-received": "New message"
};
const OUTBOX_STATUS_STYLES = {
  sent: "text-emerald-700 bg-emerald-50 border-emerald-100",
  queued: "text-amber-700 bg-amber-50 border-amber-100",
  failed: "text-rose-700 bg-rose-50 border-rose-100",
  skipped: "text-slate-500 bg-slate-50 border-slate-100"
};

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

// ======================== PROFILE DEPTH (additive) ========================
// Each step is one equal-weight item of the profile completion score. Optional
// fields (education, work history) are listed here but never required by any
// existing feature, so an older account simply scores lower.
const PROFILE_STEPS = [{
  label: "Bio",
  test: u => (u.bio || "").trim().length > 20
}, {
  label: "Location",
  test: u => !!u.location
}, {
  label: "Position",
  test: u => !!u.position
}, {
  label: "Company",
  test: u => !!u.company
}, {
  label: "Industry",
  test: u => (u.industry || []).length > 0
}, {
  label: "Skills",
  test: u => (u.skills || []).length >= 3
}, {
  label: "Experience",
  test: u => !!u.experience
}, {
  label: "Work history",
  test: u => (u.experienceList || []).some(e => e.role || e.company)
}, {
  label: "Education",
  test: u => (u.education || []).some(e => e.school || e.degree)
}, {
  label: "Website or LinkedIn",
  test: u => !!(u.website || u.linkedin)
}, {
  label: "First connection",
  test: u => (u.connections || []).length > 0
}];
function profileSteps(u) {
  if (!u) return [];
  return PROFILE_STEPS.map(s => ({
    label: s.label,
    done: !!s.test(u)
  }));
}
function profileCompletion(u) {
  const steps = profileSteps(u);
  if (!steps.length) return 0;
  return Math.round(steps.filter(s => s.done).length / steps.length * 100);
}
function ProfileStrengthCard({
  user,
  onEdit
}) {
  const steps = profileSteps(user);
  const pct = profileCompletion(user);
  const missing = steps.filter(s => !s.done);
  const bar = pct >= 90 ? "bg-emerald-500" : pct >= 60 ? "bg-blue-600" : "bg-amber-500";
  const num = pct >= 90 ? "text-emerald-600" : pct >= 60 ? "text-blue-700" : "text-amber-600";
  return <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
      <div className="flex items-center justify-between mb-1">
        <h3 className="font-bold text-slate-900">Profile completion</h3>
        <span className={`text-xl font-bold ${num}`}>{pct}%</span>
      </div>
      <div className="w-full bg-slate-100 rounded-full overflow-hidden my-3" style={{
      height: "8px"
    }}>
        <div style={{
        width: `${pct}%`,
        height: "8px",
        backgroundColor: pct >= 90 ? "#059669" : pct >= 60 ? "#1d4ed8" : "#d97706",
        transition: "width 0.4s ease"
      }} />
      </div>
      {missing.length === 0 ? <p className="text-xs text-emerald-700 font-semibold">Your profile is complete.</p> : <>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Still to add</p>
          <div className="flex flex-wrap gap-1.5">
            {missing.map(s => <span key={s.label} className="text-xs px-2 py-1 bg-slate-100 text-slate-600 rounded-lg font-medium">{s.label}</span>)}
          </div>
          <button onClick={onEdit} className="mt-3 text-xs px-3.5 py-2 border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-600 font-semibold transition-colors flex items-center gap-1.5">
            <Edit2 className="w-3.5 h-3.5" /> Complete these steps
          </button>
        </>}
      <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-slate-100">
        <div className="text-center bg-slate-50 rounded-xl py-2.5">
          <div className="text-base font-bold text-slate-900">{steps.filter(s => s.done).length}</div>
          <div className="text-[10px] text-slate-500">Steps done</div>
        </div>
        <div className="text-center bg-slate-50 rounded-xl py-2.5">
          <div className="text-base font-bold text-slate-900">{missing.length}</div>
          <div className="text-[10px] text-slate-500">Remaining</div>
        </div>
      </div>
    </div>;
}

// ---- Extra trust badges earned from what is already on the platform ----
const TRUST_TONES = {
  sky: "bg-sky-50 text-sky-700 border-sky-200",
  violet: "bg-violet-50 text-violet-700 border-violet-200",
  amber: "bg-amber-50 text-amber-700 border-amber-200",
  emerald: "bg-emerald-50 text-emerald-700 border-emerald-200"
};
function trustBadgesFor(user, ctx) {
  if (!user) return [];
  const owned = ctx.projectsOwned || [];
  const list = [];
  if (profileCompletion(user) >= 90) list.push({
    key: "complete",
    label: "Profile complete",
    tone: "sky",
    icon: CheckCircle
  });
  if (owned.some(p => p.noveltyStatus === "cleared" && (p.patented === true || p.patented === "yes"))) list.push({
    key: "patent",
    label: "Patent verified",
    tone: "violet",
    icon: ShieldCheck
  });
  if (ctx.avgRating !== null && ctx.avgRating !== undefined && ctx.avgRating >= 4.5 && (ctx.reviewCount || 0) >= 2) list.push({
    key: "rated",
    label: "Top rated",
    tone: "amber",
    icon: Award
  });
  if ((user.connections || []).length >= 5) list.push({
    key: "connector",
    label: "Trusted connector",
    tone: "emerald",
    icon: Users
  });
  return list;
}
function TrustBadgeRow({
  badges
}) {
  if (!badges || badges.length === 0) return null;
  return <>
      {badges.map(b => {
    const Icon = b.icon;
    return <span key={b.key} className={`inline-flex items-center gap-1 border px-1.5 py-0.5 rounded-full text-[10px] font-bold flex-shrink-0 ${TRUST_TONES[b.tone]}`}>
              <Icon className="w-3 h-3" /> {b.label}
            </span>;
  })}
    </>;
}

// ---- Structured work history and education ----
function TimelineCard({
  title,
  icon,
  rows,
  head,
  sub
}) {
  const items = (rows || []).filter(r => r && (r[head] || r[sub]));
  if (items.length === 0) return null;
  return <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
      <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
        {icon} {title}
      </h3>
      <div className="space-y-4">
        {items.map((r, idx) => <div key={idx} className={idx < items.length - 1 ? "border-b border-slate-50 pb-4" : ""}>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-900 truncate">{r[head] || r[sub]}</p>
                {r[head] && r[sub] && <p className="text-xs text-slate-500 truncate">{r[sub]}</p>}
                {r.note && <p className="text-xs text-slate-400 mt-1 leading-relaxed">{r.note}</p>}
              </div>
              <span className="text-[10px] text-slate-400 font-semibold flex-shrink-0">
                {[r.from, r.to].filter(Boolean).join(" – ")}
              </span>
            </div>
          </div>)}
      </div>
    </div>;
}

// ---- Who to reach out to next, with the reason spelled out ----
// Pure scoring over what is already on the platform: shared industries and
// skills, mutual connections, location, and the role pairing that matters to
// the viewer (founders want investors, investors want patented projects…).
const SHARED = (a, b) => {
  const x = a || [],
    y = b || [];
  return x.filter(v => y.includes(v));
};
function recommendMembers(me, allUsers, ownedProjects, ratingOf) {
  if (!me) return [];
  const myIds = new Set([...(me.connections || []), ...(me.pendingSent || []), ...(me.pendingReceived || [])]);
  const myIndustries = new Set((ownedProjects || []).map(p => p.industry).filter(Boolean));
  const founder = me.role === "entrepreneur" || me.role === "startup_founder";
  const out = [];
  allUsers.forEach(u => {
    if (u.id === me.id || myIds.has(u.id)) return;
    const reasons = [];
    let score = 0;
    const mutual = SHARED(me.connections || [], u.connections || []);
    if (mutual.length) {
      score += mutual.length * 9;
      reasons.push({
        key: "mutual",
        label: "Mutual connections",
        value: String(mutual.length)
      });
    }
    const ind = SHARED(me.industry || [], u.industry || []);
    if (ind.length) {
      score += ind.length * 8;
      reasons.push({
        key: "industry",
        label: "Shared industry",
        value: ind[0]
      });
    }
    const skills = SHARED(me.skills || [], u.skills || []);
    if (skills.length) {
      score += skills.length * 5;
      reasons.push({
        key: "skills",
        label: "Shared skills",
        value: String(skills.length)
      });
    }
    if (me.location && u.location === me.location) {
      score += 6;
      reasons.push({
        key: "city",
        label: "Same city",
        value: u.location
      });
    }
    if (founder && u.role === "investor") {
      if (me.fundingStage && u.investmentRange && u.investmentRange.toLowerCase().includes(me.fundingStage.toLowerCase())) {
        score += 12;
        reasons.push({
          key: "stage",
          label: "Invests at your stage",
          value: me.fundingStage
        });
      } else {
        score += 6;
        reasons.push({
          key: "investor",
          label: "Active investor",
          value: ""
        });
      }
    }
    if (founder && u.role === "freelancer" && ind.length) {
      score += 8;
      reasons.push({
        key: "hire",
        label: "Available for hire",
        value: u.position || ""
      });
    }
    if (me.role === "investor") {
      if (u.role === "entrepreneur" || u.role === "startup_founder") {
        score += 5;
        reasons.push({
          key: "sector",
          label: "Sector match",
          value: (u.industry || [])[0] || ""
        });
      }
    }
    if ([...myIndustries].some(i => (u.industry || []).includes(i))) score += 4;
    if (u.verified) score += 3;
    const rating = ratingOf ? ratingOf(u.id) : null;
    if (rating && rating.avg !== null && rating.avg >= 4.5 && rating.count >= 2) {
      score += 7;
      reasons.push({
        key: "rated",
        label: "Top rated",
        value: rating.avg.toFixed(1)
      });
    }
    if (profileCompletion(u) >= 90) score += 3;
    if (score <= 0) return;
    out.push({
      user: u,
      score: Math.min(99, 30 + score),
      reasons: reasons.slice(0, 3),
      mutual
    });
  });
  return out.sort((a, b) => b.score - a.score).slice(0, 8);
}

// ---- Project lifecycle (additive): Idea → Prototype → MVP → Launched → Scaling → Funded.
// A project only carries `lifecycle` once someone moves it; until then the stage is
// derived from the status it already had, so every existing project shows a sensible step.
const LIFECYCLE = [{
  key: "idea",
  label: "Idea"
}, {
  key: "prototype",
  label: "Prototype"
}, {
  key: "mvp",
  label: "MVP"
}, {
  key: "launched",
  label: "Launched"
}, {
  key: "scaling",
  label: "Scaling"
}, {
  key: "funded",
  label: "Funded"
}];
function lifecycleOf(project) {
  if (project && LIFECYCLE.some(s => s.key === project.lifecycle)) return project.lifecycle;
  if (project && project.status === "funded") return "funded";
  if (project && project.status === "in_talks") return "scaling";
  return "mvp";
}
function lifecycleIndex(key) {
  return LIFECYCLE.findIndex(s => s.key === key);
}
function lifecycleLabel(key) {
  const hit = LIFECYCLE.find(s => s.key === key);
  return hit ? hit.label : key || "";
}

function LifecycleStepper({
  stage,
  onSet
}) {
  const at = lifecycleIndex(stage);
  return <div>
      <div className="flex items-center">
      {LIFECYCLE.map((s, i) => <div key={s.key} className="flex items-center flex-1 last:flex-none">
          <button type="button" disabled={!onSet} onClick={() => onSet && onSet(s.key)} title={s.label} className={`flex-shrink-0 w-7 h-7 rounded-full text-[11px] font-bold flex items-center justify-center border-2 transition-colors ${i < at ? "bg-blue-700 border-blue-700 text-white" : i === at ? "bg-white border-blue-700 text-blue-700 ring-4 ring-blue-100" : "bg-white border-slate-200 text-slate-400"} ${onSet ? "hover:border-blue-800 cursor-pointer" : "cursor-default"}`}>
            {i < at ? <Check className="w-3.5 h-3.5" /> : i + 1}
          </button>
          {i < LIFECYCLE.length - 1 && <div className={`flex-1 h-0.5 mx-1 rounded ${i < at ? "bg-blue-700" : "bg-slate-200"}`} />}
        </div>)}
    </div>
    <div className="flex mt-2">
      {LIFECYCLE.map((s, i) => <div key={s.key} className="flex-1 text-center">
          <p className={`text-[10px] font-bold uppercase tracking-wider ${i === at ? "text-blue-700" : i < at ? "text-slate-500" : "text-slate-400"}`}>{s.label}</p>
        </div>)}
    </div>
  </div>;
}

// Milestones are optional and start empty; the shape is {title, note, done}.
function milestoneProgress(rows) {
  const list = rows || [];
  const done = list.filter(m => m.done).length;
  return {
    done,
    total: list.length,
    pct: list.length ? Math.round(done / list.length * 100) : 0
  };
}

// Documents are listed on the project page; the file itself travels as a data URL,
// exactly like the patent proof and the pitch deck already do.
function fileSizeLabel(bytes) {
  const n = Number(bytes) || 0;
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${Math.round(n / 1024)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

// Money is read off the deal, so the tracker keeps it compact: $8M, $750K, $1,200.
function moneyLabel(n) {
  const v = Number(n) || 0;
  if (v >= 1e6) return `$${+(v / 1e6).toFixed(2)}M`;
  if (v >= 1e3) return `$${Math.round(v / 1e3)}K`;
  return `$${v.toLocaleString()}`;
}

// The "why" behind an AI fit score: explainable pills, never a bare number.
// The phrase is a catalogue row; only the trailing data (a sector, a cheque range)
// stays as the member wrote it, exactly like names, bios and skill lists.
function MatchPills({
  reasons,
  gaps
}) {
  const list = reasons || [];
  const missing = gaps || [];
  if (!list.length && !missing.length) return null;
  const pill = (item, positive) => <span key={`${item.label}|${item.value || ""}`} className={`text-[11px] px-2 py-0.5 rounded-full font-semibold border ${positive ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-slate-50 text-slate-500 border-slate-200"}`}>
      {positive && <Check className="w-3 h-3 inline mr-0.5 -mt-0.5" />}
      <span>{item.label}</span>
      {item.value ? <> <span className="font-bold">{item.value}</span></> : null}
    </span>;
  return <div className="flex flex-wrap gap-1.5">
      {list.map(r => pill(r, true))}
      {missing.map(g => pill(g, false))}
    </div>;
}

function FitBadge({
  score
}) {
  const tone = score >= 75 ? "bg-emerald-600" : score >= 55 ? "bg-blue-700" : score >= 35 ? "bg-amber-600" : "bg-slate-400";
  return <span className={`text-xs font-bold text-white px-2.5 py-1 rounded-full ${tone}`}>
      {score}%
    </span>;
}

// ---- Repeatable editor used by Edit Profile ----
function EntryListEditor({
  title,
  itemLabel,
  addLabel,
  rows,
  fields,
  onChange
}) {
  const list = rows || [];
  const patch = (idx, key, val) => onChange(list.map((r, i) => i === idx ? {
    ...r,
    [key]: val
  } : r));
  return <div>
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-bold text-slate-600">{title}</p>
        <button type="button" onClick={() => onChange([...list, {}])} className="text-xs px-3 py-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600 font-semibold flex items-center gap-1">
          <Plus className="w-3 h-3" /> {addLabel}
        </button>
      </div>
      {list.length === 0 ? <p className="text-xs text-slate-400 mb-1">Nothing added yet.</p> : <div className="space-y-2 mb-1">
          {list.map((r, idx) => <div key={idx} className="border border-slate-200 rounded-xl p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{itemLabel} {idx + 1}</span>
                <button type="button" onClick={() => onChange(list.filter((_, i) => i !== idx))} className="p-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-400 hover:text-rose-600 transition-colors">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {fields.map(f => <input key={f.key} value={r[f.key] || ""} onChange={e => patch(idx, f.key, e.target.value)} placeholder={f.placeholder} className={`px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm bg-white ${f.wide ? "col-span-2" : ""}`} />)}
              </div>
            </div>)}
        </div>}
    </div>;
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
  compact = false,
  onEdit,
  onConnect,
  onMessage,
  connectionStatus,
  matchScore,
  avgRating,
  reviewCount,
  reviewsList = [],
  ownedProjects = [],
  onFollow,
  isFollowing,
  followerCount,
  followingCount
}) {
  // The cards used to sit in two columns of very different height, which left a
  // long empty stretch beside the shorter one. They now run in full-width bands,
  // so the cards inside a band are level with each other and nothing trails off
  // beside an empty column.
  const expRows = (user.experienceList || []).filter(r => r && (r.role || r.company));
  const eduRows = (user.education || []).filter(r => r && (r.school || r.degree));
  const hasChips = user.skills.length > 0 || user.industry.length > 0;
  const isFounder = user.role === "startup_founder";
  return <div className="max-w-4xl mx-auto px-6 pt-6 lg:pt-8 pb-12">
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden mb-5">
        <div className={(compact ? "h-14" : "h-28") + " bg-gradient-to-r from-[#0F1E3D] via-[#1B2D5B] to-[#22345E]"} />
        <div className="px-6 pb-6">
          <div className={"flex items-end justify-between " + (compact ? "-mt-7" : "-mt-10") + " mb-4"}>
            <div className={`${compact ? "w-14 h-14 text-xl" : "w-20 h-20 text-2xl"} ${getAvatarColor(user.id)} rounded-2xl flex items-center justify-center text-white font-bold border-4 border-white shadow-lg`}>
              {getInitials(user.name)}
            </div>
            <div className={"flex gap-2 " + (compact ? "mt-7" : "mt-10")}>
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
              {!isOwnProfile && onFollow && (isFollowing ? <button onClick={onFollow} className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors">
                    <UserCheck className="w-3.5 h-3.5" /> Following
                  </button> : <button onClick={onFollow} className="flex items-center gap-2 px-4 py-2 border border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl text-sm font-semibold transition-colors">
                    <UserPlus className="w-3.5 h-3.5" /> Follow
                  </button>)}
            </div>
          </div>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">{user.role === "startup_founder" ? user.company || user.name : user.name}</h1>
              <p className="text-slate-500 mt-0.5 text-sm">
                {user.role === "startup_founder" ? <>Founded by <span className="font-semibold text-slate-700">{user.name}</span>{user.position && <> · {user.position}</>}</> : (user.position || user.company) && <>{user.position}{user.position && user.company && <> <span className="text-slate-400">at</span> </>}<span className="font-semibold text-slate-700">{user.company}</span></>}
              </p>
              <div className="flex items-center gap-3 mt-2 flex-wrap">
                <RoleBadge role={user.role} />
                {user.verified && <VerifiedBadge />}
                <TrustBadgeRow badges={trustBadgesFor(user, {
              projectsOwned: ownedProjects,
              avgRating,
              reviewCount
            })} />
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

      {/* Band 1 — the three short fact cards, level with one another */}
      <div className={"grid gap-5 mb-5 " + (isOwnProfile ? "md:grid-cols-2 lg:grid-cols-3" : "md:grid-cols-2")}>
        {isOwnProfile && <ProfileStrengthCard user={user} onEdit={onEdit} />}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <h3 className="font-bold text-slate-900 mb-4">Details</h3>
          <div className="space-y-3">
            {user.company && <InfoRow icon={<Building2 className="w-4 h-4 text-slate-400" />} text={user.company} />}
            {user.fundingStage && <InfoRow icon={<TrendingUp className="w-4 h-4 text-violet-500" />} text={`${user.fundingStage} stage`} />}
            {user.investmentRange && <InfoRow icon={<Wallet className="w-4 h-4 text-emerald-500" />} text={user.investmentRange} />}
            {user.portfolioCompanies !== undefined && <InfoRow icon={<Briefcase className="w-4 h-4 text-slate-400" />} text={`${user.portfolioCompanies} portfolio companies`} />}
            {user.hourlyRate && <InfoRow icon={<DollarSign className="w-4 h-4 text-amber-500" />} text={user.hourlyRate} />}
            {user.availableFor && <InfoRow icon={<CheckCircle className="w-4 h-4 text-emerald-500" />} text={user.availableFor} />}
            {user.website && <InfoRow icon={<Globe className="w-4 h-4 text-slate-400" />} text={user.website} accent href={user.website} />}
            {user.linkedin && <InfoRow icon={<Link2 className="w-4 h-4 text-slate-400" />} text="LinkedIn Profile" accent href={user.linkedin} />}
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
            {user.experience && <div className="text-center bg-slate-50 rounded-xl py-3">
                <div className="text-xl font-bold text-slate-900">{user.experience?.replace(" years", "")}</div>
                <div className="text-xs text-slate-500">Yrs Exp.</div>
              </div>}
            {followingCount !== undefined && <div className="text-center bg-slate-50 rounded-xl py-3">
                <div className="text-xl font-bold text-slate-900">{followingCount}</div>
                <div className="text-xs text-slate-500">Following</div>
              </div>}
            {followerCount !== undefined && <div className="text-center bg-slate-50 rounded-xl py-3">
                <div className="text-xl font-bold text-slate-900">{followerCount}</div>
                <div className="text-xs text-slate-500">Followers</div>
              </div>}
          </div>
        </div>
      </div>

      {/* Band 2 — the bio with the two chip lists beside it */}
      <div className="grid lg:grid-cols-3 gap-5 mb-5">
        <div className={"bg-white rounded-2xl border border-slate-100 shadow-sm p-5 " + (hasChips ? "lg:col-span-2" : "lg:col-span-3")}>
          <h3 className="font-bold text-slate-900 mb-3">About</h3>
          <p className="text-sm text-slate-600 leading-relaxed">{user.bio || "No bio provided yet."}</p>
        </div>
        {hasChips && <div className="space-y-5">
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
          </div>}
      </div>

      {/* Band 3 — history, two columns only when both halves have rows to show */}
      {(expRows.length > 0 || eduRows.length > 0) && <div className={"grid gap-5 mb-5 " + (expRows.length > 0 && eduRows.length > 0 ? "md:grid-cols-2" : "")}>
          {expRows.length > 0 && <TimelineCard title="Experience" icon={<Briefcase className="w-4 h-4 text-blue-500" />} rows={user.experienceList} head="role" sub="company" />}
          {eduRows.length > 0 && <TimelineCard title="Education" icon={<GraduationCap className="w-4 h-4 text-violet-500" />} rows={user.education} head="school" sub="degree" />}
        </div>}

      {/* Band 4 — company facts beside the reviews */}
      <div className={"grid gap-5 " + (isFounder ? "md:grid-cols-2" : "")}>
        {isFounder && <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
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
    </div>;
}
function InfoRow({
  icon,
  text,
  accent,
  muted,
  href
}) {
  const body = <>
      <span className="flex-shrink-0">{icon}</span>
      <span className={muted ? "text-slate-400 text-xs" : accent ? "text-blue-700" : "text-slate-600"}>{text}</span>
    </>;
  // A row that points somewhere is a real link; the rest stay plain text.
  if (href) return <a href={normalizeLink(href)} target="_blank" rel="noreferrer" title={href} className="flex items-center gap-2.5 text-sm hover:underline">
      {body}
    </a>;
  return <div className="flex items-center gap-2.5 text-sm">
      {body}
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
// The second factor, rendered the same way on the sign-in card and inside the
// provider window: one question, a 6-digit answer, and the way back out.

function TwoFactorPanel({
  pending,
  code,
  setCode,
  onSubmit,
  onResend,
  onBack,
  backLabel = "Back",
  busy,
  error
}) {
  const channel = CHANNEL_LABELS[pending?.method] || "Email";
  return <form onSubmit={onSubmit}>
      <h2 className="gs-title">2-Step Verification</h2>
      <p className="gs-sub">
        {pending?.dest ? <>Enter the 6-digit code we sent by {channel} to <strong>{pending.dest}</strong>.</> : <>This account has 2-Step Verification switched on, so your password is only the first half.</>}
      </p>
      <div className="gs-field">
        <label className="gs-label">Your 6-digit code</label>
        <input className="gs-input gs-otp" inputMode="numeric" autoComplete="one-time-code" autoFocus maxLength={6} value={code} onChange={e => setCode(e.target.value.replace(/[^\d]/g, "").slice(0, 6))} placeholder="000000" />
      </div>
      {pending?.devCode && <div className="gs-note mt-3">
          <span>{`No code provider is connected to this server, so the code is shown here: `}</span>
          <strong>{pending.devCode}</strong>
          <span>{` — it is also written to the delivery log.`}</span>
        </div>}
      {error && <p className="gs-error">{error}</p>}
      <div className="flex items-center gap-4 mt-4">
        <button type="button" onClick={onResend} disabled={busy} className="gs-link">Try another code</button>
        <span className="text-[11px] text-slate-400">Codes expire in 10 minutes and work once.</span>
      </div>
      <div className="gs-foot">
        <button type="button" onClick={onBack} className="gs-btn">{backLabel}</button>
        <button type="submit" disabled={busy || code.length !== 6} className="gs-btn gs-primary">{busy ? "Checking…" : "Next"}</button>
      </div>
    </form>;
}

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
  const [viewingProjectId, setViewingProjectId] = useState(null);
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
  // ---- Password recovery + session management (all additive) ----
  // The sign-in card keeps its normal form; recovery opens as an overlay panel,
  // exactly like the OAuth consent screen below it, so nothing existing moves.
  const [recoveryOpen, setRecoveryOpen] = useState(false);
  const [recoveryStep, setRecoveryStep] = useState("email"); // email -> reset -> done
  const [recoveryEmail, setRecoveryEmail] = useState("");
  const [recoveryCode, setRecoveryCode] = useState("");
  const [recoveryMessage, setRecoveryMessage] = useState("");
  const [recoveryError, setRecoveryError] = useState("");
  const [recoveryPending, setRecoveryPending] = useState(false);
  const [resetPassword, setResetPassword] = useState("");
  const [resetConfirm, setResetConfirm] = useState("");
  const [security, setSecurity] = useState(null); // { current, sessions[], activity[] }
  const [securityError, setSecurityError] = useState("");
  const [securityNote, setSecurityNote] = useState("");
  const [securitySignedOut, setSecuritySignedOut] = useState(0);
  const [securityBusy, setSecurityBusy] = useState(false);
  const [pwCurrent, setPwCurrent] = useState("");
  const [pwNext, setPwNext] = useState("");
  const [pwConfirm, setPwConfirm] = useState("");
  // ---- Two-step verification settings + outward alert channels (additive) ----
  const [tf, setTf] = useState(null); // { enabled, method, dest, phone, availability }
  const [tfBusy, setTfBusy] = useState(false);
  const [tfError, setTfError] = useState("");
  const [tfNote, setTfNote] = useState("");
  const [tfMethod, setTfMethod] = useState("email");
  const [tfPhone, setTfPhone] = useState("");
  const [tfPassword, setTfPassword] = useState("");
  const [tfChallenge, setTfChallenge] = useState(null); // { challengeId, dest, method, devCode }
  const [tfCode, setTfCode] = useState("");
  const [alerts, setAlerts] = useState(null); // { email, phone, channels, availability }
  const [alertBusy, setAlertBusy] = useState(false);
  const [alertError, setAlertError] = useState("");
  const [alertNote, setAlertNote] = useState("");
  const [myAlerts, setMyAlerts] = useState(null);
  const [outbox, setOutbox] = useState(null); // { outbox[], counts, availability }
  const [invitingWebinarId, setInvitingWebinarId] = useState("");
  const [oauthModalOpen, setOauthModalOpen] = useState(false);
  const [oauthEmail, setOauthEmail] = useState("");
  const [oauthName, setOauthName] = useState("");
  const [oauthRole, setOauthRole] = useState("entrepreneur");
  const [oauthError, setOauthError] = useState("");
  // ---- Two-step sign-in (all additive) ----
  // The same card asks one question at a time — address, then password, then a
  // code if that account has two-step verification — and a real password sign-in
  // and a provider sign-in both land in the same session afterwards.
  const [signInStep, setSignInStep] = useState("identifier"); // identifier -> password -> code
  const [pending2fa, setPending2fa] = useState(null); // { challengeId, method, dest, devCode, error }
  const [otpCode, setOtpCode] = useState("");
  const [oauthStep, setOauthStep] = useState("choose"); // choose -> code
  const [savedAccounts, setSavedAccounts] = useState(loadSavedAccounts);
  const [suggestOpen, setSuggestOpen] = useState(false);
  const [suggestAt, setSuggestAt] = useState(-1);
  const [pwVisible, setPwVisible] = useState(false);
  const [adminStats, setAdminStats] = useState(null);
  const [patentBotOpen, setPatentBotOpen] = useState(false);
  const [patentBotProjectId, setPatentBotProjectId] = useState(null);
  const [patentBotProposalId, setPatentBotProposalId] = useState(null);
  const [patentBotLog, setPatentBotLog] = useState([]);
  const [patentBotInput, setPatentBotInput] = useState("");
  const [patentBotBusy, setPatentBotBusy] = useState(false);
  const patentBotEndRef = useRef(null);
  // ---- Pitch intelligence + patent verification report (all additive) ----
  const [pitchReview, setPitchReview] = useState(null); // { projectId, data }
  const [pitchBusy, setPitchBusy] = useState(false);
  const [projectSummary, setProjectSummary] = useState(null);
  const [summaryBusy, setSummaryBusy] = useState(false);
  const [aiError, setAiError] = useState("");
  const [noveltyReport, setNoveltyReport] = useState(null); // { projectId, data }
  const [reportBusy, setReportBusy] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
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
  // ---- Requirements page: industry sections + a separate proposals section ----
  const [reqSearch, setReqSearch] = useState("");
  const [reqIndustryFilter, setReqIndustryFilter] = useState("all");
  const [reqShow, setReqShow] = useState("all"); // all | requirements | proposals
  const [reqProposalStatus, setReqProposalStatus] = useState("all");
  // ---- Funding tracker, watchlist and side-by-side comparison (all additive) ----
  const [watchlist, setWatchlist] = useState([]);
  const [fundingStageFilter, setFundingStageFilter] = useState("all");
  const [fundingSort, setFundingSort] = useState("gap");
  const [compareIds, setCompareIds] = useState([]);
  const [matchSectorFilter, setMatchSectorFilter] = useState("all");
  const [reviewTargetId, setReviewTargetId] = useState(null);
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    comment: ""
  });
  const [verifyMessage, setVerifyMessage] = useState("");
  // Which account panel a brand-new profile shows — the four of them are stacked
  // on an established account and tabbed on a new one, so the setup screens stay
  // inside the first viewport.
  const [profilePanelTab, setProfilePanelTab] = useState("verification");
  // The sign-in log grows with every visit, so it starts short and opens on demand.
  const [showAllActivity, setShowAllActivity] = useState(false);
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
    if (state.watchlist) setWatchlist(state.watchlist);
    setDataLoaded(true);
  }

  // First load always shows the sign-in page. The only exception is a fresh
  // OAuth redirect that arrives with ?oauth_token=<jwt> in the URL.
  useEffect(() => {
    let cancelled = false;
    const oauthFailure = takeOauthErrorFromUrl(); // a real-Google redirect that came back without a token
    if (oauthFailure) setLoginError(oauthFailure);
    // A provider sign-in for a two-step account returns without a token and with
    // ?oauth_2fa=<challengeId>: the code step continues where the provider left off.
    const gated = takeOauthTwoFactorFromUrl();
    if (gated && gated.challengeId) {
      setToken("");
      setPending2fa({ ...gated, error: "" });
      setSignInStep("code");
      return;
    }
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
  useEffect(() => { if (dataLoaded) saveCollection("watchlist", watchlist); }, [watchlist, dataLoaded]);

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

  // ---- Two-step sign-in handlers ----
  // Step 1 asks only for the address, exactly like a provider page: nothing is
  // sent to the server yet, so no attempt can be logged against an unknown account.
  const EMAIL_SHAPE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  function handleIdentifierSubmit(e) {
    e.preventDefault();
    const email = loginEmail.trim();
    if (!EMAIL_SHAPE.test(email)) {
      setLoginError("Enter a valid email address.");
      return;
    }
    setLoginError("");
    setPending2fa(null);
    setSignInStep("password");
  }
  function backToIdentifier() {
    setSignInStep("identifier");
    setPending2fa(null);
    setOtpCode("");
    setLoginError("");
  }
  function backToPassword() {
    setSignInStep("password");
    setPending2fa(null);
    setOtpCode("");
    setLoginError("");
  }

  // The single path every password entry takes: password first, a code if the
  // account asks for one, and the browser remembering the address afterwards.
  async function submitPassword(email, password) {
    setAuthPending(true);
    setLoginError("");
    try {
      const res = await apiLogin(email, password);
      setLoginPassword("");
      if (res.twoFactor) {
        setPending2fa({ ...res.twoFactor, error: "" });
        setSignInStep("code");
        return;
      }
      setSignInStep("identifier");
      setPending2fa(null);
      setSavedAccounts(rememberSignedInAccount(res.user));
      await finishAuth(res.user);
    } catch (err) {
      setLoginError(err.message || "Unable to sign in.");
    } finally {
      setAuthPending(false);
    }
  }
  async function handleLogin(e) {
    e.preventDefault();
    await submitPassword(loginEmail.trim(), loginPassword);
  }

  // A remembered address. The build's own sample accounts were seeded with a known
  // password and finish in one click; any other account still types its own.
  async function handleSavedAccount(row) {
    if (!row.demo) {
      setLoginEmail(row.email);
      setLoginError("");
      setPending2fa(null);
      setSignInStep("password");
      return;
    }
    setLoginEmail(row.email);
    await submitPassword(row.email, DEMO_PASSWORD);
  }
  function handleForgetAccount(email) {
    setSavedAccounts(forgetSignedInAccount(email));
  }

  // The remembered addresses are never listed on the sign-in card. They appear
  // only once the typed start of the email matches one, the way a provider
  // finishes the address for you.
  const typedEmail = loginEmail.trim().toLowerCase();
  const emailSuggestions = !suggestOpen || !typedEmail ? [] : savedAccounts.filter(row => {
    const email = String(row.email || "").toLowerCase();
    const name = String(row.name || "").toLowerCase();
    if (email === typedEmail) return false;
    return email.startsWith(typedEmail) || email.includes(typedEmail) || name.startsWith(typedEmail);
  }).slice(0, 5);
  function pickEmailSuggestion(row) {
    setSuggestOpen(false);
    setSuggestAt(-1);
    setLoginEmail(row.email);
    handleSavedAccount(row);
  }
  function handleEmailKeyDown(e) {
    if (!emailSuggestions.length) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSuggestAt(i => (i + 1) % emailSuggestions.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSuggestAt(i => (i <= 0 ? emailSuggestions.length - 1 : i - 1));
    } else if (e.key === "Enter" && suggestAt >= 0) {
      e.preventDefault();
      pickEmailSuggestion(emailSuggestions[Math.min(suggestAt, emailSuggestions.length - 1)]);
    } else if (e.key === "Escape") {
      setSuggestOpen(false);
      setSuggestAt(-1);
    }
  }

  async function handleVerifyCode(e) {
    e.preventDefault();
    if (!pending2fa?.challengeId) return;
    setAuthPending(true);
    const where = oauthStep === "code" ? "oauth" : "card";
    const setError = message => {
      if (where === "oauth") setOauthError(message);else setLoginError(message);
      setPending2fa(p => p ? { ...p, error: message } : p);
    };
    try {
      if (where === "oauth") setError("");setOauthError("");
      const res = await apiVerifyTwoFactor(pending2fa.challengeId, otpCode);
      if (res.twoFactor) {
        setPending2fa({ ...res.twoFactor, error: "" });
        return;
      }
      setPending2fa(null);
      setOtpCode("");
      setSignInStep("identifier");
      setOauthStep("choose");
      setOauthModalOpen(false);
      setSavedAccounts(rememberSignedInAccount(res.user));
      await finishAuth(res.user);
    } catch (err) {
      setError(err.message || "That code did not verify.");
    } finally {
      setAuthPending(false);
    }
  }
  async function handleResendCode() {
    if (!pending2fa?.challengeId) return;
    setAuthPending(true);
    try {
      const fresh = await apiResendTwoFactor(pending2fa.challengeId);
      setPending2fa({ ...fresh, error: "" });
      setOtpCode("");
    } catch (err) {
      setPending2fa(p => p ? { ...p, error: err.message || "Could not send another code." } : p);
    } finally {
      setAuthPending(false);
    }
  }

  // ---- Provider (Google) sign-in ----
  // With GOOGLE_CLIENT_ID configured the backend redirects to real Google;
  // otherwise the built-in demo provider renders the chooser below.
  function handleGoogleSignIn() {
    setOauthError("");
    setOauthStep("choose");
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
      const res = await apiOauthDemo(email, known ? known.name : oauthName.trim(), known ? known.role : oauthRole);
      if (res.twoFactor) {
        // The provider accepted the identity; the account's own second factor still applies.
        setPending2fa({ ...res.twoFactor, error: "" });
        setOauthStep("code");
        setOtpCode("");
        return;
      }
      setOauthModalOpen(false);
      setOauthStep("choose");
      setSavedAccounts(rememberSignedInAccount(res.user));
      await finishAuth(res.user);
    } catch (err) {
      setOauthError(err.message || "Google sign-in failed.");
    } finally {
      setAuthPending(false);
    }
  }

  // Leaving the provider window always drops its second factor too, so the next
  // open starts on the chooser rather than a stale code screen.
  function closeOauth() {
    setOauthModalOpen(false);
    setOauthStep("choose");
    setOauthError("");
    if (signInStep === "code") {
      setSignInStep("identifier");
      setPending2fa(null);
      setOtpCode("");
    }
  }
  function backToChooser() {
    setOauthStep("choose");
    setPending2fa(null);
    setOtpCode("");
    setOauthError("");
  }

  // ---- Password recovery: an overlay panel on the sign-in screen ----
  function openRecovery() {
    setRecoveryOpen(true);
    setRecoveryStep("email");
    setRecoveryEmail(loginEmail.trim());
    setRecoveryCode("");
    setRecoveryError("");
    setRecoveryMessage("");
    setResetPassword("");
    setResetConfirm("");
  }
  function closeRecovery() {
    setRecoveryOpen(false);
    setRecoveryStep("email");
    setRecoveryError("");
    setRecoveryMessage("");
    setResetPassword("");
    setResetConfirm("");
  }
  async function handleRecoveryRequest(e) {
    e.preventDefault();
    const email = recoveryEmail.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
      setRecoveryError("Enter a valid email address.");
      return;
    }
    setRecoveryPending(true);
    setRecoveryError("");
    try {
      const data = await apiForgotPassword(email);
      setRecoveryMessage(data.message || "");
      // No mail provider is wired up in this build, so outside production the
      // backend returns the code and the panel shows it instead of an inbox.
      if (data.resetCode) setRecoveryCode(data.resetCode);
      setRecoveryStep("code");
    } catch (err) {
      setRecoveryError(err.message || "Could not start the password reset.");
    } finally {
      setRecoveryPending(false);
    }
  }
  async function handleRecoveryReset(e) {
    e.preventDefault();
    if (!recoveryCode.trim()) {
      setRecoveryError("Enter the reset code.");
      return;
    }
    if (resetPassword !== resetConfirm) {
      setRecoveryError("The two new passwords do not match.");
      return;
    }
    setRecoveryPending(true);
    setRecoveryError("");
    try {
      const data = await apiResetPassword(recoveryCode.trim(), resetPassword);
      setRecoveryMessage(data.message || "Your password has been updated. Please sign in again.");
      setRecoveryStep("done");
      setRecoveryCode("");
      setResetPassword("");
      setResetConfirm("");
      setLoginEmail(recoveryEmail.trim());
      // The reset closes on the password step, with the address still filled in.
      if (recoveryEmail.includes("@")) setSignInStep("password");
    } catch (err) {
      setRecoveryError(err.message || "Could not reset the password.");
    } finally {
      setRecoveryPending(false);
    }
  }

  // ---- Security & sessions (profile screen) ----
  function refreshSecurity() {
    if (!getToken()) return;
    apiSessions().then(data => {
      setSecurity(data);
      setSecurityError("");
    }).catch(err => setSecurityError(err.message || "Session details unavailable."));
  }
  useEffect(() => {
    if (!currentUser || view !== "profile") return;
    refreshSecurity();
  }, [currentUser, view]);

  async function handleChangePassword(e) {
    e.preventDefault();
    setSecurityNote("");
    setSecuritySignedOut(0);
    setSecurityError("");
    if (pwNext !== pwConfirm) {
      setSecurityError("The new passwords do not match.");
      return;
    }
    setSecurityBusy(true);
    try {
      const data = await apiChangePassword(pwCurrent, pwNext);
      setSecurityNote(data.message || "Password changed.");
      setSecuritySignedOut(Number(data.signedOut) || 0);
      setPwCurrent("");
      setPwNext("");
      setPwConfirm("");
      refreshSecurity();
    } catch (err) {
      setSecurityError(err.message || "Could not change your password.");
    } finally {
      setSecurityBusy(false);
    }
  }
  async function handleRevokeSession(jti) {
    setSecurityError("");
    setSecurityNote("");
    try {
      await apiRevokeSession(jti);
      // Revoking the session you are using signs this device out, as expected.
      if (jti === (security?.current || "")) {
        handleLogout();
        return;
      }
      refreshSecurity();
    } catch (err) {
      setSecurityError(err.message || "Could not sign out that session.");
    }
  }
  async function handleRevokeOtherSessions() {
    setSecurityError("");
    try {
      const data = await apiRevokeOtherSessions();
      setSecurityNote("Every other device has been signed out.");
      setSecuritySignedOut(Number(data.revoked) || 0);
      refreshSecurity();
    } catch (err) {
      setSecurityError(err.message || "Could not sign out the other sessions.");
    }
  }

  // ---- Two-step verification + outward alerts (additive) ----
  // Both read the account's own security settings; neither changes how any
  // existing feature behaves.
  function refreshAlerts() {
    if (!getToken()) return;
    apiTwoFactorStatus().then(data => {
      setTf(data);
      setTfMethod(data?.method || "email");
      setTfPhone(data?.phone || "");
    }).catch(() => setTf(null));
    apiAlertChannels().then(data => {
      setAlerts(data);
      setTfPhone(prev => prev || data?.phone || "");
    }).catch(() => setAlerts(null));
    apiMyAlerts().then(data => setMyAlerts(data.alerts || [])).catch(() => setMyAlerts([]));
  }
  useEffect(() => {
    if (!currentUser || view !== "profile") return;
    refreshAlerts();
  }, [currentUser, view]);

  async function handleEnableTwoFactor(e) {
    e.preventDefault();
    setTfError("");
    setTfNote("");
    if (!tfPassword) {
      setTfError("Confirm your current password first — switching 2-step on is a security change.");
      return;
    }
    setTfBusy(true);
    try {
      const data = await apiEnableTwoFactor({ password: tfPassword, method: tfMethod, phone: tfPhone });
      setTfChallenge(data);
      setTfCode("");
      setTfPassword("");
      setTfNote(data.message || "");
    } catch (err) {
      setTfError(err.message || "Could not start two-step verification.");
    } finally {
      setTfBusy(false);
    }
  }
  async function handleResendTfCode() {
    if (!tfChallenge?.challengeId) return;
    setTfBusy(true);
    setTfError("");
    try {
      setTfChallenge(await apiResendTwoFactor(tfChallenge.challengeId));
      setTfCode("");
    } catch (err) {
      setTfError(err.message || "Could not send another code.");
    } finally {
      setTfBusy(false);
    }
  }
  async function handleConfirmTwoFactor(e) {
    e.preventDefault();
    if (!tfChallenge?.challengeId) return;
    setTfError("");
    setTfBusy(true);
    try {
      const data = await apiConfirmTwoFactor(tfChallenge.challengeId, tfCode);
      setTfChallenge(null);
      setTfCode("");
      setTfNote(data.message || "Two-step verification is on.");
      refreshAlerts();
    } catch (err) {
      setTfError(err.message || "That code did not verify.");
    } finally {
      setTfBusy(false);
    }
  }
  async function handleDisableTwoFactor(e) {
    e.preventDefault();
    if (!tfPassword) {
      setTfError("Enter your current password to switch two-step verification off.");
      return;
    }
    setTfError("");
    setTfBusy(true);
    try {
      const data = await apiDisableTwoFactor(tfPassword);
      setTfNote(data.message || "Two-step verification is off.");
      setTfPassword("");
      setTfChallenge(null);
      refreshAlerts();
    } catch (err) {
      setTfError(err.message || "Could not change two-step verification.");
    } finally {
      setTfBusy(false);
    }
  }
  function cancelTfSetup() {
    setTfChallenge(null);
    setTfCode("");
    setTfError("");
    setTfNote("");
  }
  function toggleAlertChannel(key) {
    setAlerts(prev => prev ? {
      ...prev,
      channels: { ...prev.channels, [key]: !prev.channels[key] }
    } : prev);
  }
  // An opt-in only counts once it has been proved, so the same call can send a test.
  async function handleSaveAlertChannels(test) {
    if (!alerts) return;
    setAlertError("");
    setAlertNote("");
    setAlertBusy(true);
    try {
      const data = await apiSaveAlertChannels({ channels: alerts.channels, phone: tfPhone, test: test ? "sign-in-alert" : undefined });
      const rows = Array.isArray(data.test) ? data.test : [];
      setAlertNote(rows.length ? `Test: ${rows.map(r => `${r.channel} ${r.status}${r.reason ? ` (${r.reason})` : ""}`).join(", ")}.` : "Alert settings saved.");
      setAlerts(prev => prev ? { ...prev, channels: data.channels, phone: data.phone } : prev);
      refreshAlerts();
    } catch (err) {
      setAlertError(err.message || "Could not save the alert settings.");
    } finally {
      setAlertBusy(false);
    }
  }
  function refreshOutbox() {
    apiOutbox().then(setOutbox).catch(err => setOutbox({ error: err.message || "Delivery log unavailable." }));
  }
  useEffect(() => {
    if (!currentUser || currentUser.role !== "admin" || view !== "admin") return;
    refreshOutbox();
  }, [currentUser, view]);

  // Outward copy for something that just happened. The backend rebuilds the
  // message from the stored record, so this waits for the debounced collection
  // save to land — and a failure here never undoes the action.
  function notifyImportant(kind, refId, attempt = 1) {
    if (!refId || !getToken()) return;
    setTimeout(() => {
      apiNotifyImportant(kind, refId).catch(() => {
        // The debounced save may not have landed yet, so try once more rather
        // than dropping the notice.
        if (attempt < 2) notifyImportant(kind, refId, attempt + 1);
      });
    }, attempt === 1 ? 1500 : 2500);
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
    // Tell the backend first so this session is recorded as signed out; the
    // local behaviour below is exactly the same as before.
    if (getToken()) apiLogout();
    setToken("");
    setDataLoaded(false);
    setCurrentUser(null);
    setView("login");
    setLoginEmail("");
    setLoginPassword("");
    setSignInStep("identifier");
    setPending2fa(null);
    setOtpCode("");
    setOauthStep("choose");
    setOauthModalOpen(false);
    setAdminStats(null);
    setPatentBotOpen(false);
    setPatentBotLog([]);
    setSecurity(null);
    setSecurityNote("");
    setSecurityError("");
    setSecuritySignedOut(0);
    closeRecovery();
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

  // ---- Follow graph (sits alongside connection requests, replaces nothing) ----
  function toggleFollow(targetId) {
    if (!latestCu || targetId === latestCu.id) return;
    const me = latestCu.id;
    const wasFollowing = (latestCu.following || []).includes(targetId);
    const add = (list, id) => list.includes(id) ? list : [...list, id];
    const drop = (list, id) => list.filter(x => x !== id);
    const apply = u => {
      if (u.id === me) return {
        ...u,
        following: wasFollowing ? drop(u.following || [], targetId) : add(u.following || [], targetId)
      };
      if (u.id === targetId) return {
        ...u,
        followers: wasFollowing ? drop(u.followers || [], me) : add(u.followers || [], me)
      };
      return u;
    };
    setUsers(prev => prev.map(apply));
    setCurrentUser(prev => prev ? apply(prev) : prev);
  }
  function removeConnection(targetId) {
    if (!latestCu) return;
    const me = latestCu.id;
    const other = users.find(u => u.id === targetId);
    const drop = (u, id) => ({
      ...u,
      connections: (u.connections || []).filter(x => x !== id)
    });
    setUsers(prev => prev.map(u => u.id === me ? drop(u, targetId) : u.id === targetId ? drop(u, me) : u));
    setCurrentUser(prev => prev ? drop(prev, targetId) : prev);
    setSuccessNotice({
      title: "Network updated",
      text: "Connection removed from",
      entity: other ? other.name : ""
    });
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
    notifyImportant("message-received", msg.id);
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
    // Members whose requirements, sector or projects fit this webinar are invited
    // out of the website — by email, and by SMS/WhatsApp if they opted in.
    apiWebinarInvites({ webinar: w }).then(data => {
      const matched = Number(data.matched) || 0;
      if (!matched) return;
      setSuccessNotice({
        title: t("Webinar invitations"),
        text: <>{matched} {t("members whose requirements fit were invited to")}</>,
        entity: w.title
      });
      setTimeout(() => setSuccessNotice(""), 6000);
    }).catch(() => {});
  }
  // The backend does the matching against each member's requirements, sector and
  // projects, and rebuilds the invitation from the stored webinar.
  async function inviteWebinarMembers(webinar) {
    setInvitingWebinarId(webinar.id);
    try {
      const data = await apiWebinarInvites({ webinarId: webinar.id });
      const matched = Number(data.matched) || 0;
      setSuccessNotice({
        title: t("Webinar invitations"),
        text: matched ? <>{matched} {t("matched members were invited to")}</> : t("No member matched this webinar yet, so nobody was invited."),
        entity: matched ? webinar.title : ""
      });
      setTimeout(() => setSuccessNotice(""), 6000);
    } catch (err) {
      setSuccessNotice({ title: t("Invitations unavailable"), text: err.message || t("Please try again later."), entity: "" });
      setTimeout(() => setSuccessNotice(""), 6000);
    } finally {
      setInvitingWebinarId("");
    }
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

  // ---- Project page (additive) ----
  // Opening a project records a visit in the same per-user log the dashboard's
  // "recently accessed" panel already writes, which is what the analytics card reads.
  function openProject(projectId) {
    recordRecentAccess(projectId, "project");
    setViewingProjectId(projectId);
    setView("project-detail");
  }
  function patchProject(projectId, patch) {
    setProjects(prev => prev.map(p => p.id === projectId ? {
      ...p,
      ...patch
    } : p));
  }
  function notify(title, text, entity) {
    setSuccessNotice({
      title,
      text,
      entity
    });
    setTimeout(() => setSuccessNotice(""), 5000);
  }

  // ---- Deal watchlist (additive) ----
  // A watchlist row is only a pointer: userId + projectId + when it was added. It never
  // touches a connection, a proposal or an investment, so watching a deal is free.
  const myWatchRows = latestCu ? watchlist.filter(w => w.userId === latestCu.id) : [];
  const watchedProjectIds = myWatchRows.map(w => w.projectId);
  function toggleWatch(projectId) {
    if (!latestCu) return;
    const proj = projects.find(p => p.id === projectId);
    if (!proj) return;
    const mine = watchlist.find(w => w.userId === latestCu.id && w.projectId === projectId);
    if (mine) {
      setWatchlist(prev => prev.filter(w => w.id !== mine.id));
      notify(t("Removed from watchlist"), t("You are no longer tracking"), proj.title);
      return;
    }
    setWatchlist(prev => [...prev, {
      id: `wl${Date.now()}`,
      userId: latestCu.id,
      projectId,
      addedAt: new Date().toISOString()
    }]);
    notify(t("Added to watchlist"), t("Funding updates for"), proj.title);
  }

  // ---- Side-by-side comparison tray (additive) ----
  function toggleCompare(projectId) {
    setCompareIds(prev => prev.includes(projectId) ? prev.filter(x => x !== projectId) : [...prev, projectId].slice(-3));
  }

  // ---- Explainable match scores (additive) ----
  // Same inputs always give the same fit %, and every point is one of the reasons below.
  const matchCtx = {
    investments,
    requirements,
    users,
    stageOf: lifecycleOf,
    noveltyOf: p => p.noveltyStatus === "cleared"
  };
  function matchBetween(investorId, projectId) {
    const inv = users.find(u => u.id === investorId);
    const proj = projects.find(p => p.id === projectId);
    if (!inv || !proj) return null;
    return scoreMatch(inv, proj, matchCtx);
  }
  function setProjectStage(projectId, stage) {
    patchProject(projectId, {
      lifecycle: stage
    });
    const label = (LIFECYCLE.find(s => s.key === stage) || {}).label || stage;
    notify(t("Lifecycle updated"), t("Project moved to"), label);
  }
  function editList(projectId, key, fn) {
    const project = projects.find(p => p.id === projectId);
    if (!project) return;
    patchProject(projectId, {
      [key]: fn((project[key] || []).slice())
    });
  }
  const addMilestone = id => editList(id, "milestones", list => [...list, {
    title: "",
    note: "",
    done: false
  }]);
  const updateMilestone = (id, idx, patch) => editList(id, "milestones", list => list.map((m, i) => i === idx ? {
    ...m,
    ...patch
  } : m));
  const removeMilestone = (id, idx) => editList(id, "milestones", list => list.filter((_, i) => i !== idx));
  const addTeamMember = id => editList(id, "team", list => [...list, {
    name: "",
    role: "",
    note: ""
  }]);
  const updateTeamMember = (id, idx, patch) => editList(id, "team", list => list.map((m, i) => i === idx ? {
    ...m,
    ...patch
  } : m));
  const removeTeamMember = (id, idx) => editList(id, "team", list => list.filter((_, i) => i !== idx));
  function attachProjectDocument(projectId, file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      editList(projectId, "documents", list => [...list, {
        name: file.name,
        size: file.size,
        type: file.type || "",
        dataUrl: String(reader.result || ""),
        at: new Date().toISOString()
      }]);
      notify(t("Document added"), t("Attached to this project"), file.name);
    };
    reader.readAsDataURL(file);
  }
  const removeProjectDocument = (id, idx) => editList(id, "documents", list => list.filter((_, i) => i !== idx));

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
    notifyImportant("proposal-received", proposal.id);
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
    notifyImportant("agreement-made", agreement.id);
    setSuccessNotice({ title: "Agreement made", text: "Investment agreement created and sent for", entity: proj?.title || "the project" });
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
    notifyImportant("agreement-made", agreement.id);
    setSuccessNotice({ title: "Agreement made", text: "Investment agreement created and sent for", entity: proj?.title || "the project" });
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
    notifyImportant("meeting-scheduled", meeting.id);
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
    notifyImportant("offer-sent", offer.id);
    setOfferForm({
      title: "",
      description: "",
      duration: "",
      rate: ""
    });
    setPendingOfferFile(null);
    if (offerFileInputRef.current) offerFileInputRef.current.value = "";
    setShowOfferForm(false);
    setSuccessNotice({ title: `${terms.noun} sent`, text: "Letter delivered to", entity: recipient.name });
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
      setSuccessNotice({ title: "Agreement made", text: "Agreement created and sent for", entity: offer.title });
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
      notifyImportant("offer-decision", offerId);
      notifyImportant("agreement-made", agreement.id);
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
    setNoveltyReport(null);
    setReportOpen(false);
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
        const pid = patentBotProjectId;
        setTimeout(() => {
          loadNoveltyReport(pid).then(report => {
            if (!report) return;
            const rows = report.priorArt || [];
            if (!rows.length) {
              pushBotMsg("Similarity analysis: no other project on the registry shares enough claim language with this one, so nothing is cited as prior art.");
              return;
            }
            rows.slice(0, 3).forEach((r, i) => setTimeout(() => pushBotMsg(`Similarity analysis ${i + 1}/${Math.min(rows.length, 3)}: “${r.title}” — ${r.similarity}% overlap on the ${r.matchedOn}, band: ${r.band}. Shared claim terms: ${r.shared.join(", ") || "none"}.`), 350 * i));
            setTimeout(() => pushBotMsg(`Overlap is word-set comparison against every registered project: ${report.registry.duplicateAt}%+ is duplicate risk, ${report.registry.reviewAt}%+ needs manual review. Press “Verification report” for the full screening record — you can download or print it.`), 350 * Math.min(rows.length, 3) + 200);
          });
        }, finish + 500);
      }, 500);
    }).catch(err => {
      pushBotMsg(`Sorry — the screening service could not run: ${err.message}`);
    }).finally(() => setPatentBotBusy(false));
  }
  function runPitchReview(projectId) {
    if (!projectId || pitchBusy) return;
    setPitchBusy(true);
    setAiError("");
    apiPitchReview(projectId).then(data => setPitchReview({
      projectId,
      data
    })).catch(err => setAiError(err.message)).finally(() => setPitchBusy(false));
  }
  function runProjectSummary(projectId) {
    if (!projectId || summaryBusy) return;
    setSummaryBusy(true);
    setAiError("");
    apiProjectSummary(projectId).then(data => setProjectSummary({
      projectId,
      data
    })).catch(err => setAiError(err.message)).finally(() => setSummaryBusy(false));
  }
  function loadNoveltyReport(projectId) {
    if (!projectId) return Promise.resolve(null);
    if (noveltyReport && noveltyReport.projectId === projectId) return Promise.resolve(noveltyReport.data);
    setReportBusy(true);
    return apiNoveltyReport(projectId).then(data => {
      setNoveltyReport({
        projectId,
        data
      });
      return data;
    }).catch(err => {
      setAiError(err.message);
      return null;
    }).finally(() => setReportBusy(false));
  }
  function openVerificationReport(projectId) {
    loadNoveltyReport(projectId).then(data => {
      if (data) setReportOpen(true);
    });
  }
  function noveltyReportAsText(report) {
    const lines = [];
    const push = (label, value) => {
      if (value !== "" && value != null) lines.push(`${label}: ${value}`);
    };
    lines.push("VENTURELINK — PATENT NOVELTY VERIFICATION REPORT");
    lines.push(report.id);
    lines.push("");
    lines.push("SUBJECT");
    push("Project", report.subject.title);
    push("Industry", report.subject.industry);
    push("Founder", report.subject.founder);
    push("Company", report.subject.company);
    push("Patent number", report.subject.patentNumber);
    push("Proof document", report.subject.patentProofName);
    lines.push("");
    lines.push("VERDICT");
    push("Novelty score", `${report.score}/100`);
    push("Status", String(report.status).toUpperCase());
    push("Verified", report.verified ? "yes" : "no");
    if (report.blockedBy.length) push("Blocked by", report.blockedBy.join(", "));
    lines.push("");
    lines.push(`PRIOR ART (registry pool of ${report.registry.poolSize} projects, ${report.registry.patentedInPool} patented)`);
    if (!report.priorArt.length) lines.push("No other registered project shares enough claim language to be cited.");
    report.priorArt.forEach(r => {
      lines.push(`- ${r.title} — ${r.similarity}% overlap (${r.matchedOn}, ${r.band})${r.shared.length ? ` — shared terms: ${r.shared.join(", ")}` : ""}`);
    });
    lines.push("");
    lines.push("CHECKS");
    report.checks.forEach(c => lines.push(`- [${c.result.toUpperCase()}] ${c.label}${c.value ? ` (${c.value})` : ""}${c.note ? ` — ${c.note}` : ""}`));
    lines.push("");
    lines.push("SCREENING NOTES");
    report.reasons.forEach(r => lines.push(`- ${r.text}`));
    lines.push("");
    lines.push("LIMITS OF THIS REPORT");
    report.limits.forEach(l => lines.push(`- ${l}`));
    lines.push("");
    lines.push(`Generated ${new Date(report.generatedAt).toLocaleString()} by VentureLink PatentBot.`);
    return lines.join("\n");
  }
  function downloadNoveltyReport() {
    const report = noveltyReport && noveltyReport.data;
    if (!report) return;
    const url = URL.createObjectURL(new Blob([noveltyReportAsText(report)], {
      type: "text/plain;charset=utf-8"
    }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `${report.id}.txt`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  function printNoveltyReport() {
    loadNoveltyReport(noveltyReport && noveltyReport.projectId).then(() => {
      setTimeout(() => window.print(), 60);
    });
  }
  useEffect(() => {
    setPitchReview(null);
    setProjectSummary(null);
    setAiError("");
  }, [viewingProjectId]);
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
  useEffect(() => {
    if (!reportOpen) return undefined;
    const onKey = e => {
      if (e.key === "Escape") setReportOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [reportOpen]);

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
            {/* Two-step sign-in card: one question per screen — address, then
                password, then a 6-digit code when that account asks for one. */}
            <div className="gs-card mx-auto">
              <div className="flex items-start justify-between gap-4 mb-6">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0">
                    <Zap className="w-4 h-4 text-white" />
                  </span>
                  <span className="text-[13px] font-semibold" style={{
                color: "#5e636b"
              }}>VentureLink</span>
                </div>
                <div className="flex items-center gap-1">{langPicker}<ThemePicker /></div>
              </div>
              {signInStep === "identifier" && <form onSubmit={handleIdentifierSubmit}>
                  <h2 className="gs-title">Sign in</h2>
                  <p className="gs-sub">Use your VentureLink account</p>
                  <div className="gs-field">
                    <label className="gs-label">Email address</label>
                    <input type="email" autoComplete="username" name="ven-login-email" autoFocus value={loginEmail} onChange={e => {
                  setLoginEmail(e.target.value);setSuggestOpen(true);setSuggestAt(-1);
                }} onFocus={() => setSuggestOpen(true)} onBlur={() => setTimeout(() => setSuggestOpen(false), 140)} onKeyDown={handleEmailKeyDown} role="combobox" aria-expanded={emailSuggestions.length > 0} aria-controls="gs-suggest-list" aria-autocomplete="list" className="gs-input" placeholder="you@example.com" />
                    {emailSuggestions.length > 0 && <div className="gs-suggest" id="gs-suggest-list" role="listbox">
                        {emailSuggestions.map((row, i) => <div key={row.email} role="option" aria-selected={i === suggestAt} className={"gs-suggest-item" + (i === suggestAt ? " gs-on" : "")}>
                            <button type="button" onMouseDown={e => e.preventDefault()} onClick={() => pickEmailSuggestion(row)} className="gs-suggest-pick">
                              <span className={`gs-avatar ${avatarColorForSeed(row.email || row.name)}`}>{getInitials(row.name || row.email)}</span>
                              <span className="gs-suggest-text">
                                <span className="gs-row-name">{row.name}</span>
                                <span className="gs-row-sub">{row.email}</span>
                              </span>
                            </button>
                            <button type="button" onMouseDown={e => e.preventDefault()} onClick={() => handleForgetAccount(row.email)} className="gs-saved-x" title={`Forget ${row.name}`} aria-label={`Forget ${row.name}`}>×</button>
                          </div>)}
                      </div>}
                  </div>
                  {loginError && <p className="gs-error">{loginError}</p>}
                  <div className="mt-1">
                    <button type="button" onClick={openRecovery} className="gs-link">Forgot password?</button>
                  </div>
                  <div className="gs-foot">
                    <button type="button" onClick={() => setView("register")} className="gs-link">Create account</button>
                    <button type="submit" disabled={authPending || !loginEmail.trim()} className="gs-btn gs-primary">Next</button>
                  </div>
                  <div className="gs-divider" />
                  <button type="button" onClick={handleGoogleSignIn} disabled={authPending} className="w-full flex items-center justify-center gap-2.5 border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold py-3 rounded-xl transition-colors text-sm disabled:opacity-60">
                    <svg className="w-4.5 h-4.5" width="18" height="18" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.6 20.5H42V24H24v8h11.3C33.7 36.4 29.3 40 24 40c-8.8 0-16-7.2-16-16s7.2-16 16-16c4.1 0 7.8 1.6 10.7 4.1l5.7-5.7C36.6 2.9 30.6 0.8 24 0.8 11.2.8.8 11.2.8 24S11.2 47.2 24 47.2 47.2 36.8 47.2 24c0-1.2-.1-2.3-.4-3.5z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.3 19 12 24 12c3.3 0 6.3 1.3 8.5 3.3l6.1-6.1C34.9 6 29.7 3.8 24 3.8c-7.6 0-14.2 4.3-17.7 10.9z"/><path fill="#4CAF50" d="M24 47.2c5.6 0 10.7-2.1 14.6-5.5l-6.7-5.7c-2.2 1.6-5 2.6-7.9 2.6-5.2 0-9.6-3.4-11.2-8.1l-6.6 5.1C8 41.3 15.3 47.2 24 47.2z"/><path fill="#1976D2" d="M43.6 20.5H42V24H24v8h11.3c-.8 2.2-2.1 4.1-3.8 5.6l6.7 5.7C42.1 44.5 47.2 37 47.2 24c0-1.2-.1-2.3-.4-3.5z"/></svg>
                    Continue with Google
                  </button>
                  <p className="text-center text-sm text-slate-500 mt-5">
                    New to VentureLink?{" "}
                    <button onClick={() => setView("register")} className="text-blue-700 font-bold hover:underline">Create account</button>
                  </p>
                </form>}
              {signInStep === "password" && <form onSubmit={handleLogin}>
                  <h2 className="gs-title">Welcome</h2>
                  <div className="gs-chip mb-5">
                    <span className={`gs-avatar ${avatarColorForSeed(loginEmail)}`}>{getInitials(loginEmail.split("@")[0])}</span>
                    <span className="truncate">{loginEmail}</span>
                    <button type="button" onClick={backToIdentifier} className="gs-saved-x" title="Use another address" aria-label="Use another address">×</button>
                  </div>
                  <div className="gs-field">
                    <label className="gs-label">Enter your password</label>
                    <input type={pwVisible ? "text" : "password"} autoComplete="current-password" name="ven-login-password" autoFocus value={loginPassword} onChange={e => setLoginPassword(e.target.value)} className="gs-input" placeholder="Your password" />
                  </div>
                  <label className="gs-remember">
                    <input type="checkbox" checked={pwVisible} onChange={e => setPwVisible(e.target.checked)} />
                    <span>Show password</span>
                  </label>
                  {loginError && <p className="gs-error">{loginError}</p>}
                  <div className="gs-foot">
                    <button type="button" onClick={backToIdentifier} className="gs-btn">Back</button>
                    <button type="submit" disabled={authPending || !loginPassword} className="gs-btn gs-primary">{authPending ? "Checking…" : "Next"}</button>
                  </div>
                  <p className="text-[11.5px] mt-4" style={{
                color: "#7c828b"
              }}>
                    This device remembers the address, never the password — turn that on in your browser.{" "}
                    <button type="button" onClick={openRecovery} className="gs-link">Forgot password?</button>
                  </p>
                </form>}
              {signInStep === "code" && <TwoFactorPanel pending={pending2fa} code={otpCode} setCode={setOtpCode} onSubmit={handleVerifyCode} onResend={handleResendCode} onBack={oauthStep === "code" ? backToChooser : backToPassword} backLabel={oauthStep === "code" ? "Choose another account" : "Back"} busy={authPending} error={pending2fa?.error || loginError} />}
            </div>
          </div>
          {/* Password recovery — additive overlay panel; the sign-in form above it is unchanged */}
          {recoveryOpen && <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center z-50 p-4" onClick={closeRecovery}>
              <div className="bg-white rounded-3xl shadow-2xl max-w-[420px] w-full p-7 sm:p-8 max-h-[92vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                <div className="flex items-start justify-between gap-4 mb-5">
                  <h2 className="text-xl font-bold text-slate-900">Reset your password</h2>
                  <button type="button" onClick={closeRecovery} className="p-1.5 border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-500" aria-label="Close">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                {recoveryStep === "email" && <form onSubmit={handleRecoveryRequest} className="space-y-4">
                    <p className="text-sm text-slate-500">Enter the email address you sign in with. A single-use code is issued and expires in 15 minutes.</p>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1">Email address</label>
                      <input type="email" autoComplete="off" value={recoveryEmail} onChange={e => setRecoveryEmail(e.target.value)} className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 text-slate-900 bg-slate-50 focus:bg-white transition-colors text-sm" placeholder="you@example.com" />
                    </div>
                    {recoveryError && <p className="text-rose-600 text-sm font-medium">{recoveryError}</p>}
                    <button type="submit" disabled={recoveryPending} className="w-full bg-blue-700 hover:bg-blue-800 text-white font-bold py-3 rounded-xl transition-colors text-sm disabled:opacity-60 disabled:cursor-not-allowed">
                      {recoveryPending ? "Checking…" : "Send reset code"}
                    </button>
                  </form>}
                {recoveryStep === "code" && <form onSubmit={handleRecoveryReset} className="space-y-4">
                    {recoveryMessage && <p className="text-xs font-semibold text-slate-600 bg-slate-50 border border-slate-100 rounded-xl px-3.5 py-2.5">{recoveryMessage}</p>}
                    <p className="text-xs text-slate-500">This build has no email service connected, so the code is shown here. With one configured it would arrive in the inbox.</p>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1">Reset code</label>
                      <input autoComplete="one-time-code" value={recoveryCode} onChange={e => setRecoveryCode(e.target.value)} className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 text-slate-900 bg-slate-50 focus:bg-white transition-colors text-sm" placeholder="Paste the code" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1">New password</label>
                      <input type="password" autoComplete="new-password" value={resetPassword} onChange={e => setResetPassword(e.target.value)} className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 text-slate-900 bg-slate-50 focus:bg-white transition-colors text-sm" placeholder="At least 8 characters" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1">Confirm new password</label>
                      <input type="password" autoComplete="new-password" value={resetConfirm} onChange={e => setResetConfirm(e.target.value)} className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 text-slate-900 bg-slate-50 focus:bg-white transition-colors text-sm" placeholder="Type it again" />
                    </div>
                    {recoveryError && <p className="text-rose-600 text-sm font-medium">{recoveryError}</p>}
                    <button type="submit" disabled={recoveryPending} className="w-full bg-blue-700 hover:bg-blue-800 text-white font-bold py-3 rounded-xl transition-colors text-sm disabled:opacity-60 disabled:cursor-not-allowed">
                      {recoveryPending ? "Updating…" : "Update password"}
                    </button>
                    <button type="button" onClick={() => setRecoveryStep("email")} className="w-full text-center text-xs font-semibold text-slate-500 hover:text-slate-700 transition-colors">
                      Use a different email
                    </button>
                  </form>}
                {recoveryStep === "done" && <div className="space-y-4">
                    <div className="flex items-start gap-2.5">
                      <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                      <p className="text-sm font-bold text-slate-800">{recoveryMessage}</p>
                    </div>
                    <p className="text-xs text-slate-500">For security every previous session was ended. Sign in again to start a new one.</p>
                    <button type="button" onClick={closeRecovery} className="w-full bg-blue-700 hover:bg-blue-800 text-white font-bold py-3 rounded-xl transition-colors text-sm">
                      Back to sign in
                    </button>
                  </div>}
              </div>
            </div>}
          {/* Simulated Google consent screen — active when no real Google app credentials are configured.
              Deliberately the same one-question-per-screen shape as the card behind it. */}
          {oauthModalOpen && <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center z-50 p-4" onClick={closeOauth}>
              <div className="gs-card max-h-[92vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                {oauthStep === "choose" && <>
                    <div className="flex items-center gap-2 mb-7">
                      <svg width="20" height="20" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.6 20.5H42V24H24v8h11.3C33.7 36.4 29.3 40 24 40c-8.8 0-16-7.2-16-16s7.2-16 16-16c4.1 0 7.8 1.6 10.7 4.1l5.7-5.7C36.6 2.9 30.6 0.8 24 0.8 11.2.8.8 11.2.8 24S11.2 47.2 24 47.2 47.2 36.8 47.2 24c0-1.2-.1-2.3-.4-3.5z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.3 19 12 24 12c3.3 0 6.3 1.3 8.5 3.3l6.1-6.1C34.9 6 29.7 3.8 24 3.8c-7.6 0-14.2 4.3-17.7 10.9z"/><path fill="#4CAF50" d="M24 47.2c5.6 0 10.7-2.1 14.6-5.5l-6.7-5.7c-2.2 1.6-5 2.6-7.9 2.6-5.2 0-9.6-3.4-11.2-8.1l-6.6 5.1C8 41.3 15.3 47.2 24 47.2z"/><path fill="#1976D2" d="M43.6 20.5H42V24H24v8h11.3c-.8 2.2-2.1 4.1-3.8 5.6l6.7 5.7C42.1 44.5 47.2 37 47.2 24c0-1.2-.1-2.3-.4-3.5z"/></svg>
                      <span className="text-[13px] font-medium" style={{
                      color: "#1f1f1f"
                    }}>Sign in</span>
                      <span className="ml-auto text-[10px] font-bold" style={{
                      color: "#b06000"
                    }}>Demo provider</span>
                    </div>
                    <h2 className="gs-title">Choose an account</h2>
                    <p className="gs-sub mb-4">
                      to continue to <span className="font-medium" style={{
                      color: "#1f1f1f"
                    }}>VentureLink</span>
                    </p>
                    <div>
                      {DEMO_ACCOUNTS.map((d, i) => <button key={d.email} onClick={() => {
                        setOauthEmail(d.email);
                        setOauthName(d.name);
                        setOauthRole(d.role);
                      }} className={`gs-row ${oauthEmail.toLowerCase() === d.email.toLowerCase() ? "gs-on" : ""}`}>
                          <span className={`gs-avatar ${getAvatarColor("u" + (i + 1))}`}>{getInitials(d.name)}</span>
                          <span className="min-w-0 flex-1">
                            <span className="gs-row-name">{d.name}</span>
                            <span className="gs-row-sub">{d.email}</span>
                          </span>
                          {oauthEmail.toLowerCase() === d.email.toLowerCase() && <Check className="w-4 h-4 flex-shrink-0" style={{
                        color: "#1a56c4"
                      }} />}
                        </button>)}
                      <button onClick={() => {
                        setOauthEmail("");
                        setOauthName("");
                        setOauthRole("entrepreneur");
                      }} className={`gs-row ${oauthEmail === "" ? "gs-on" : ""}`}>
                        <span className="gs-avatar" style={{
                        background: "#f1f3f4",
                        color: "#5e636b"
                      }}>
                          <UserPlus className="w-4 h-4" />
                        </span>
                        <span className="gs-row-name">Use another account</span>
                      </button>
                    </div>
                    {oauthEmail === "" && <div className="gs-field mt-4">
                        <label className="gs-label">Google email address</label>
                        <input type="email" autoComplete="off" value={oauthEmail} onChange={e => setOauthEmail(e.target.value)} className="gs-input" placeholder="you@example.com" />
                        <label className="gs-label mt-3">Display name</label>
                        <input type="text" autoComplete="off" value={oauthName} onChange={e => setOauthName(e.target.value)} className="gs-input" placeholder="Only for a new account" />
                        <div className="flex items-center gap-2 mt-3">
                          <p className="text-[11px] font-medium whitespace-nowrap" style={{
                          color: "#5e636b"
                        }}>Join as</p>
                          <select value={oauthRole} onChange={e => setOauthRole(e.target.value)} className="flex-1 px-3 py-2 border rounded-lg text-sm bg-white focus:outline-none" style={{
                          borderColor: "#d5d9e2",
                          color: "#1f1f1f"
                        }}>
                            {Object.keys(ROLE_LABELS).filter(k => k !== "admin").map(k => <option key={k} value={k}>{ROLE_LABELS[k]}</option>)}
                          </select>
                        </div>
                        <p className="text-[11.5px] mt-2" style={{
                        color: "#7c828b"
                      }}>An existing VentureLink account for this address always signs in with its own saved profile and role.</p>
                      </div>}
                    {oauthError && <p className="gs-error">{oauthError}</p>}
                    <div className="gs-foot">
                      <button onClick={closeOauth} className="gs-link">Cancel</button>
                      <button onClick={handleOauthDemoConfirm} disabled={authPending || !oauthEmail.trim()} className="gs-btn gs-primary">
                        {authPending ? "Authorising…" : "Continue"}
                      </button>
                    </div>
                    <div className="gs-meta">
                      <span className="flex items-center gap-1.5">
                        <Globe className="w-3.5 h-3.5" /> English
                      </span>
                      <span>Help · Privacy · Terms</span>
                    </div>
                    <p className="text-[11px] mt-3 leading-relaxed" style={{
                      color: "#7c828b"
                    }}>Sign-in is OAuth find-or-create; a new address is created with the role chosen above. Set <code>GOOGLE_CLIENT_ID</code> and <code>GOOGLE_CLIENT_SECRET</code> on the backend to route this through real Google instead of this demo provider.</p>
                  </>}
                {oauthStep === "code" && <TwoFactorPanel pending={pending2fa} code={otpCode} setCode={setOtpCode} onSubmit={handleVerifyCode} onResend={handleResendCode} onBack={backToChooser} backLabel="Choose another account" busy={authPending} error={pending2fa?.error || oauthError} />}
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
              <div className="flex items-center gap-1">{langPicker}<ThemePicker /></div>
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
  }] : []), ...(cu.role !== "admin" ? [{
    id: "funding",
    icon: BarChart,
    label: t("Funding Tracker")
  }, {
    id: "match",
    icon: Target,
    label: t("Smart Matching")
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
    const target = users.find(u => u.id === userId);
    // Tell the member out of the website as well, the way any trust change should.
    if (target && !target.verified) notifyImportant("verification-granted", userId);
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

          {/* Delivery log — additive; every outward email/SMS/WhatsApp receipt */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden mb-8">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-slate-900">Delivery log</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {outbox?.availability?.any ? <>Sent through <span className="font-semibold text-slate-600">{[outbox.availability.email, outbox.availability.sms, outbox.availability.whatsapp].filter(Boolean).join(" · ")}</span>.</> : t("No provider is configured, so outward messages are queued here instead of leaving the server.")}
                </p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {outbox?.counts && <div className="hidden sm:flex items-center gap-1.5">
                    {["sent", "queued", "failed"].map(k => <span key={k} className={`text-[10px] font-bold rounded-full px-2 py-0.5 border ${OUTBOX_STATUS_STYLES[k]}`}>{outbox.counts[k] || 0} {k}</span>)}
                  </div>}
                <button onClick={refreshOutbox} className="text-xs font-semibold text-slate-500 hover:text-slate-700 border border-slate-200 rounded-lg px-3 py-1.5 transition-colors">Refresh</button>
              </div>
            </div>
            {!outbox && <p className="px-5 py-4 text-xs text-slate-400">Loading delivery log…</p>}
            {outbox?.error && <p className="px-5 py-4 text-xs text-rose-700 font-semibold">{outbox.error}</p>}
            {outbox && outbox.outbox && !outbox.outbox.length && <p className="px-5 py-4 text-xs text-slate-400">Nothing has been sent out yet.</p>}
            {outbox?.outbox?.length > 0 && <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="text-left text-xs text-slate-400 uppercase tracking-wider border-b border-slate-100">
                        <th className="px-5 py-3">Event</th>
                        <th className="px-5 py-3">Channel</th>
                        <th className="px-5 py-3">To</th>
                        <th className="px-5 py-3">Status</th>
                        <th className="px-5 py-3">Detail</th>
                      </tr></thead>
                  <tbody>
                    {outbox.outbox.slice(0, 40).map(row => <tr key={row.id || row._id} className="border-b border-slate-50 hover:bg-slate-50">
                          <td className="px-5 py-3">
                            <p className="text-sm font-semibold text-slate-800">{ALERT_KIND_LABELS[row.kind] || row.kind}</p>
                            {row.createdAt && <p className="text-xs text-slate-400">{formatShortDateIn(row.createdAt, lang)}</p>}
                          </td>
                          <td className="px-5 py-3 text-slate-600">{CHANNEL_LABELS[row.channel] || row.channel}</td>
                          <td className="px-5 py-3 text-xs text-slate-500">{row.to}</td>
                          <td className="px-5 py-3">
                            <span className={`text-[10px] font-bold rounded-full px-2 py-0.5 border ${OUTBOX_STATUS_STYLES[row.status] || OUTBOX_STATUS_STYLES.skipped}`}>{row.status}</span>
                          </td>
                          <td className="px-5 py-3 text-xs text-slate-400 max-w-xs">
                            <p className="truncate">{row.subject || row.body || "—"}</p>
                            {row.reason && <p className="truncate text-slate-400">{row.provider ? `${row.provider} · ` : ""}{row.reason}</p>}
                          </td>
                        </tr>)}
                  </tbody>
                </table>
              </div>}
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
            const recent = recentlyAccessed.filter(e => e.userId === cu.id).slice(-8).reverse().map(e => {
              if (e.targetType === "project") {
                const p = projects.find(x => x.id === e.targetId);
                return p ? {
                  e,
                  p
                } : null;
              }
              const u = users.find(x => x.id === e.targetId);
              return u && u.id !== cu.id ? {
                e,
                u
              } : null;
            }).filter(Boolean).slice(0, 6);
            if (recent.length === 0) return null;
            return <div className="mb-8 bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="w-4 h-4 text-blue-700" />
                  <h3 className="font-bold text-slate-900 text-sm">{t("Recently accessed")}</h3>
                  <span className="text-[10px] text-slate-400 font-medium">your last visited profiles and projects, newest first</span>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {recent.map(({e, u, p}) => <button key={e.id} onClick={() => p ? openProject(p.id) : viewUserProfile(u.id)} className="flex items-center gap-2 pl-1.5 pr-3 py-1.5 rounded-full border border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition-colors">
                        {p ? <span className="w-6 h-6 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center flex-shrink-0"><Layers className="w-3.5 h-3.5" /></span> : <UserAvatar user={u} size="xs" />}
                        <span className="text-xs font-semibold text-slate-700">{p ? p.title : u.name}</span>
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
                    <div className="flex gap-2 mt-4">
                      <button onClick={() => openProject(p.id)} className="flex-1 text-sm py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-xl font-semibold transition-colors">
                        View project
                      </button>
                      <button onClick={() => viewUserProfile(owner.id)} className="flex-1 text-sm py-2 border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-700 font-semibold transition-colors">
                        View Founder Profile
                      </button>
                    </div>
                    <div className="flex gap-2 mt-2">
                      <button onClick={() => toggleWatch(p.id)} className={`flex-1 text-xs py-2 rounded-xl font-semibold transition-colors border ${watchedProjectIds.includes(p.id) ? "bg-violet-50 text-violet-700 border-violet-200 hover:bg-violet-100" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}>
                        {watchedProjectIds.includes(p.id) ? t("Watching") : t("Watch deal")}
                      </button>
                      <button onClick={() => toggleCompare(p.id)} className={`flex-1 text-xs py-2 rounded-xl font-semibold transition-colors border ${compareIds.includes(p.id) ? "bg-blue-50 text-blue-700 border-blue-200" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}>
                        {compareIds.includes(p.id) ? t("In comparison") : t("Compare")}
                      </button>
                    </div>
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
                        <button onClick={() => toggleFollow(u.id)} className={`p-2.5 rounded-xl transition-colors border ${(cu.following || []).includes(u.id) ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-slate-200 hover:bg-slate-50 text-slate-500"}`} title={(cu.following || []).includes(u.id) ? "Following" : "Follow"}>
                          <UserCheck className="w-4 h-4" />
                        </button>
                        <button onClick={() => removeConnection(u.id)} className="p-2.5 border border-slate-200 rounded-xl hover:bg-rose-50 hover:border-rose-200 text-slate-400 hover:text-rose-600 transition-colors" title="Remove connection">
                          <X className="w-4 h-4" />
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

            {(() => {
              const recs = recommendMembers(cu, users, projects.filter(p => p.ownerId === cu.id), id => ({
                avg: getAvgRating(id),
                count: getUserReviews(id).length
              }));
              if (recs.length === 0) return null;
              return <div className="mb-8">
                  <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">
                    Recommended for you ({recs.length})
                  </h2>
                  <div className="grid md:grid-cols-2 gap-3">
                    {recs.map(r => <div key={r.user.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
                        <div className="flex items-center gap-3">
                          <UserAvatar user={r.user} size="md" />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="font-bold text-slate-900 text-sm">{r.user.name}</p>
                              <RoleBadge role={r.user.role} />
                            </div>
                            <p className="text-xs text-slate-500 truncate">{r.user.position} · {r.user.company}</p>
                          </div>
                          <div className="text-center flex-shrink-0">
                            <div className={`text-base font-bold leading-none ${r.score >= 70 ? "text-emerald-600" : r.score >= 50 ? "text-amber-600" : "text-slate-500"}`}>{r.score}%</div>
                            <div className="text-[10px] text-slate-400 mt-0.5">fit</div>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-1.5 mt-3">
                          {r.reasons.map(x => <span key={x.key} className="text-[11px] px-2 py-1 bg-slate-50 border border-slate-100 rounded-lg text-slate-600 font-medium">
                              {x.label}
                              {x.value && <span className="text-slate-400"> · {x.value}</span>}
                            </span>)}
                        </div>
                        <div className="flex gap-2 mt-3">
                          <button onClick={() => viewUserProfile(r.user.id)} className="flex-1 text-xs py-2 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600 font-semibold transition-colors">View Profile</button>
                          <button onClick={() => sendConnectionRequest(r.user.id)} className="flex-1 text-xs py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-1">
                            <UserPlus className="w-3.5 h-3.5" /> Connect
                          </button>
                          <button onClick={() => toggleFollow(r.user.id)} className={`text-xs px-3 py-2 border rounded-lg font-semibold transition-colors ${(cu.following || []).includes(r.user.id) ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-slate-200 hover:bg-slate-50 text-slate-600"}`}>{(cu.following || []).includes(r.user.id) ? "Following" : "Follow"}</button>
                        </div>
                      </div>)}
                  </div>
                </div>;
            })()}

            {(() => {
              const following = users.filter(u => (cu.following || []).includes(u.id));
              const followers = users.filter(u => (cu.followers || []).includes(cu.id));
              if (following.length === 0 && followers.length === 0) return null;
              const row = (u, isIn) => <div key={u.id} className="bg-white rounded-xl border border-slate-100 p-3 flex items-center gap-3">
                  <UserAvatar user={u} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900 truncate">{u.name}</p>
                    <p className="text-xs text-slate-400 truncate">{u.position}</p>
                  </div>
                  <div className="flex gap-1.5 flex-shrink-0">
                    <button onClick={() => viewUserProfile(u.id)} className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-500 transition-colors" title="View Profile">
                      <User className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => toggleFollow(u.id)} className={`p-2 rounded-lg border transition-colors ${isIn ? "border-slate-200 hover:bg-rose-50 hover:border-rose-200 text-slate-400 hover:text-rose-600" : "border-emerald-200 bg-emerald-50 text-emerald-700"}`} title={isIn ? "Unfollow" : "Follow back"}>
                      {isIn ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>;
              return <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">
                      Following ({following.length})
                    </h2>
                    <div className="space-y-2">
                      {following.length === 0 ? <p className="text-xs text-slate-400">You are not following anyone yet.</p> : following.map(u => row(u, true))}
                    </div>
                  </div>
                  <div>
                    <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">
                      Followers ({followers.length})
                    </h2>
                    <div className="space-y-2">
                      {followers.length === 0 ? <p className="text-xs text-slate-400">No followers yet.</p> : followers.map(u => row(u, false))}
                    </div>
                  </div>
                </div>;
            })()}
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
                      <button type="button" onClick={() => openProject(p.id)} className="flex items-center gap-1 text-xs px-2.5 py-1 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600 font-semibold transition-colors">
                        <Layers className="w-3 h-3" /> {t("View page")}
                      </button>
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
        {
          // The page is split in two: open requirements grouped by industry, and
          // the proposals that were submitted for those requirements. One filter
          // bar drives both, so a member can look at a single industry end to end.
          const industryOf = r => r.industry || "Unspecified";
          const reqQuery = reqSearch.trim().toLowerCase();
          const reqMatchesSearch = r => {
            if (!reqQuery) return true;
            const inv = users.find(u => u.id === r.investorId);
            return (r.title || "").toLowerCase().includes(reqQuery) || (r.description || "").toLowerCase().includes(reqQuery) || industryOf(r).toLowerCase().includes(reqQuery) || !!(inv && (inv.name.toLowerCase().includes(reqQuery) || (inv.company || "").toLowerCase().includes(reqQuery)));
          };
          const reqInIndustry = r => reqIndustryFilter === "all" || industryOf(r) === reqIndustryFilter;
          const visibleRequirements = requirements.filter(r => reqInIndustry(r) && reqMatchesSearch(r));
          const industriesShown = Array.from(new Set(visibleRequirements.map(industryOf)));
          const myRequirementIds = new Set(myRequirements.map(r => r.id));
          const visibleProposals = proposals.filter(p => {
            const related = requirements.find(r => r.id === p.requirementId);
            if (!related) return false;
            if (p.entrepreneurId !== cu.id && !myRequirementIds.has(p.requirementId)) return false;
            if (reqProposalStatus !== "all" && p.status !== reqProposalStatus) return false;
            return reqInIndustry(related) && reqMatchesSearch(related);
          }).slice().sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
          const sentProposals = visibleProposals.filter(p => p.entrepreneurId === cu.id);
          const receivedProposals = visibleProposals.filter(p => p.entrepreneurId !== cu.id);
          const activeReqFilters = (reqIndustryFilter !== "all" ? 1 : 0) + (reqProposalStatus !== "all" ? 1 : 0) + (reqQuery ? 1 : 0);
          const PROPOSAL_STATUS = {
            pending: ["Awaiting response", "bg-amber-100 text-amber-700"],
            invested: ["Invested", "bg-emerald-100 text-emerald-700"],
            declined: ["Declined", "bg-slate-100 text-slate-600"]
          };
          const renderRequirementCard = r => {
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
          };
          const renderProposalRow = p => {
            const related = requirements.find(r => r.id === p.requirementId);
            const founder = users.find(u => u.id === p.entrepreneurId);
            const investor = users.find(u => u.id === p.investorId);
            const proj = projects.find(x => x.id === p.projectId);
            const sent = p.entrepreneurId === cu.id;
            const status = PROPOSAL_STATUS[p.status] || PROPOSAL_STATUS.pending;
            return <div key={p.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-bold text-slate-900 truncate">{proj ? proj.title : related.title}</p>
                    <p className="text-xs text-slate-500 mt-1 truncate">
                      {sent ? <>Sent to <span className="font-semibold text-slate-700">{investor ? investor.name : "the investor"}</span></> : <>Submitted by <span className="font-semibold text-slate-700">{founder ? founder.name : "a founder"}</span></>} · for “{related.title}”
                    </p>
                  </div>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full flex-shrink-0 ${status[1]}`}>{status[0]}</span>
                </div>
                <div className="flex items-center gap-1.5 flex-wrap mt-2.5">
                  <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-medium">{industryOf(related)}</span>
                  {related.budgetRange && <span className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-100 px-2.5 py-0.5 rounded-full font-semibold">{related.budgetRange}</span>}
                  {p.createdAt && <span className="text-xs text-slate-400">{formatShortDateIn(p.createdAt, lang)}</span>}
                </div>
                {proj && proj.description && <p className="text-sm text-slate-600 mt-2.5 leading-relaxed line-clamp-2">{proj.description}</p>}
                <div className="flex gap-2 mt-3.5">
                  {proj && <button onClick={() => openProject(proj.id)} className="flex-1 text-sm py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-xl font-semibold transition-colors">View project</button>}
                  <button onClick={() => {
                  setReqIndustryFilter(industryOf(related));
                  setReqShow("requirements");
                }} className="flex-1 text-sm py-2 border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-700 font-semibold transition-colors">Show this industry</button>
                </div>
              </div>;
          };
          const segBase = "flex items-center gap-1 rounded-xl bg-slate-100 p-1";
          const segOpt = active => `px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${active ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"}`;
          return <div className="p-6 lg:p-8 max-w-5xl mx-auto pb-12">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-slate-900">Open Investor Requirements</h1>
              <p className="text-slate-500 mt-1 text-sm">Browse active investment requirements from investors by industry, and track the proposals submitted for them</p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-6">
              <div className="flex items-center justify-between gap-3 mb-3.5 flex-wrap">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center"><Filter className="w-4 h-4" /></span>
                  <p className="text-sm font-bold text-slate-900">Refine requirements</p>
                  {activeReqFilters > 0 && <span className="text-[11px] bg-blue-700 text-white px-2 py-0.5 rounded-full font-bold">{activeReqFilters} active</span>}
                </div>
                {activeReqFilters > 0 && <button onClick={() => {
                setReqSearch("");
                setReqIndustryFilter("all");
                setReqProposalStatus("all");
                setReqShow("all");
              }} className="text-xs font-semibold text-slate-500 hover:text-blue-700 underline underline-offset-2">Clear all</button>}
              </div>
              <div className="flex flex-col lg:flex-row gap-3 lg:gap-4 lg:items-end">
                <div className="flex-1 relative min-w-0">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input value={reqSearch} onChange={e => setReqSearch(e.target.value)} placeholder="Search by requirement, industry, investor..." className="w-full pl-10 pr-9 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white text-sm" />
                  {reqSearch && <button onClick={() => setReqSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500"><X className="w-4 h-4" /></button>}
                </div>
                <div className="flex flex-wrap gap-3">
                  <div className="flex flex-col gap-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pl-1">Show</p>
                    <div className={segBase}>
                      {[["all", "Both"], ["requirements", "Requirements"], ["proposals", "Proposals"]].map(([val, label]) => <button key={val} onClick={() => setReqShow(val)} className={segOpt(reqShow === val)}>{label}</button>)}
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pl-1">Proposal status</p>
                    <div className={segBase}>
                      {[["all", "Any"], ["pending", "Pending"], ["invested", "Invested"], ["declined", "Declined"]].map(([val, label]) => <button key={val} onClick={() => setReqProposalStatus(val)} className={segOpt(reqProposalStatus === val)}>{label}</button>)}
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-3.5">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 pl-1">Industry</p>
                <div className="flex gap-1.5 overflow-x-auto pb-1">
                  {[["all", "All industries"], ...Array.from(new Set(requirements.map(industryOf))).map(i => [i, i])].map(([val, label]) => <button key={val} onClick={() => setReqIndustryFilter(val)} className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all whitespace-nowrap ${reqIndustryFilter === val ? "bg-blue-700 text-white border-blue-700 shadow-sm" : "bg-white text-slate-600 border-slate-200 hover:border-blue-400 hover:text-blue-700"}`}>
                      {label}
                    </button>)}
                </div>
              </div>
              <p className="text-xs text-slate-400 font-semibold mt-3.5 pt-3 border-t border-slate-100">{visibleRequirements.length} requirement{visibleRequirements.length !== 1 ? "s" : ""} · {visibleProposals.length} proposal{visibleProposals.length !== 1 ? "s" : ""}</p>
            </div>

            {(reqShow === "all" || reqShow === "requirements") && <section className="mb-10">
                <div className="flex items-center gap-2 mb-1">
                  <Layers className="w-4 h-4 text-blue-700" />
                  <h2 className="text-lg font-bold text-slate-900">Requirements by industry</h2>
                  <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-semibold">{visibleRequirements.length}</span>
                </div>
                <p className="text-xs text-slate-500 mb-4">Every open requirement, grouped so each industry reads as its own section.</p>
                {requirements.length === 0 && <div className="bg-white rounded-2xl border border-slate-100 p-8 text-center text-slate-400 text-sm">No open requirements right now.</div>}
                {requirements.length > 0 && industriesShown.length === 0 && <div className="bg-white rounded-2xl border border-slate-100 p-8 text-center text-slate-400 text-sm">
                    <p className="font-semibold">No requirement matches these filters</p>
                    <p className="mt-1">Try another industry or clear the search</p>
                  </div>}
                <div className="space-y-6">
                  {industriesShown.map(industry => {
                const items = visibleRequirements.filter(r => industryOf(r) === industry);
                return <div key={industry}>
                      <div className="flex items-center gap-2 mb-3">
                        <h3 className="text-sm font-bold text-slate-800">{industry}</h3>
                        <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-semibold">{items.length}</span>
                      </div>
                      <div className="grid md:grid-cols-2 gap-4">
                        {items.map(renderRequirementCard)}
                      </div>
                    </div>;
              })}
                </div>
              </section>}

            {(reqShow === "all" || reqShow === "proposals") && <section>
                <div className="flex items-center gap-2 mb-1">
                  <FileText className="w-4 h-4 text-violet-600" />
                  <h2 className="text-lg font-bold text-slate-900">Submitted proposals</h2>
                  <span className="text-xs bg-violet-50 text-violet-700 px-2 py-0.5 rounded-full font-semibold">{visibleProposals.length}</span>
                </div>
                <p className="text-xs text-slate-500 mb-4">Proposals put forward for these requirements, kept apart from the open list.</p>
                {visibleProposals.length === 0 && <div className="bg-white rounded-2xl border border-slate-100 p-8 text-center text-slate-400 text-sm">
                    {myProposals.length === 0 && receivedProposals.length === 0 ? <p>Nothing has been submitted for these requirements yet. Submit a project above and it appears here.</p> : <p>No proposal matches these filters.</p>}
                  </div>}
                {sentProposals.length > 0 && <div className="mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <h3 className="text-sm font-bold text-slate-800">You submitted</h3>
                    <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-semibold">{sentProposals.length}</span>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    {sentProposals.map(renderProposalRow)}
                  </div>
                </div>}
                {receivedProposals.length > 0 && <div>
                    <div className="flex items-center gap-2 mb-3">
                      <h3 className="text-sm font-bold text-slate-800">Submitted to your requirements</h3>
                      <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-semibold">{receivedProposals.length}</span>
                    </div>
                    <p className="text-xs text-slate-500 mb-3">Accept or decline these under Investments, where the amount and PatentBot checks live.</p>
                    <div className="grid md:grid-cols-2 gap-4">
                      {receivedProposals.map(renderProposalRow)}
                    </div>
                  </div>}
              </section>}
          </div>;
        }

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

          {myInvestments.length > 0 && (() => {
          // Portfolio breakdown: only what the investor's own cheques already say.
          const bySector = {};
          const byStage = {};
          let best = null;
          let weakest = null;
          myInvestments.forEach(inv => {
            const proj = projects.find(p => p.id === inv.projectId);
            const sector = proj && proj.industry ? proj.industry : "Unlisted";
            const stage = proj ? lifecycleOf(proj) : "mvp";
            const series = getInvestmentGrowthSeries(inv);
            const latest = series[series.length - 1];
            const growth = inv.amount ? (latest.value - inv.amount) / inv.amount * 100 : 0;
            const row = {
              inv,
              proj,
              sector,
              stage,
              growth,
              now: latest.value
            };
            bySector[sector] = (bySector[sector] || 0) + inv.amount;
            byStage[stage] = (byStage[stage] || 0) + inv.amount;
            if (!best || growth > best.growth) best = row;
            if (!weakest || growth < weakest.growth) weakest = row;
          });
          const sectorRows = Object.entries(bySector).sort((a, b) => b[1] - a[1]);
          const stageRows = Object.entries(byStage).sort((a, b) => b[1] - a[1]);
          const spread = sectorRows.length;
          const maxSector = sectorRows.length ? sectorRows[0][1] : 1;
          return <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 mb-8">
                  <div className="flex items-center gap-2 mb-1">
                    <Layers className="w-4 h-4 text-blue-700" />
                    <h3 className="font-bold text-slate-900">{t("Portfolio breakdown")}</h3>
                  </div>
                  <p className="text-xs text-slate-500 mb-4">Where your capital sits, sector by sector and stage by stage</p>
                  <div className="grid md:grid-cols-2 gap-5">
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">By sector</p>
                      <div className="space-y-2">
                        {sectorRows.map(([name, amount]) => <div key={name}>
                            <div className="flex items-center justify-between text-xs font-semibold text-slate-600 mb-1">
                              <span>{name}</span>
                              <span>{moneyLabel(amount)}</span>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full" style={{
                          height: "8px"
                        }}>
                              <div className="bg-blue-700 rounded-full" style={{
                            width: `${Math.max(6, Math.round(amount / maxSector * 100))}%`,
                            height: "8px"
                          }} />
                            </div>
                          </div>)}
                      </div>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">By stage</p>
                      <div className="flex flex-wrap gap-2">
                        {stageRows.map(([name, amount]) => <span key={name} className="text-xs bg-slate-50 border border-slate-200 text-slate-600 px-2.5 py-1.5 rounded-xl font-semibold">
                            <span>{LIFECYCLE.find(s => s.key === name)?.label || name}</span>
                            <span className="ml-1.5 text-slate-400">{moneyLabel(amount)}</span>
                          </span>)}
                      </div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-4 mb-2">Best and weakest</p>
                      <div className="space-y-2">
                        {(() => {
                        const picks = [["Top performer", best, "text-emerald-600 bg-emerald-50"], ["Needs attention", weakest, "text-amber-600 bg-amber-50"]];
                        const rows = myInvestments.length > 1 && best && weakest && best.inv.id === weakest.inv.id ? picks.slice(0, 1) : picks;
                        return rows.map(([label, row, tone]) => !row ? null : <div key={label} className="flex items-center gap-2 text-xs">
                              <span className={`px-2 py-1 rounded-lg font-bold flex-shrink-0 ${tone}`}>{label}</span>
                              <span className="font-semibold text-slate-700 truncate">{row.proj ? row.proj.title : row.inv.id}</span>
                              <span className={`ml-auto font-bold ${row.growth >= 0 ? "text-emerald-600" : "text-red-500"}`}>
                                {row.growth >= 0 ? "+" : ""}
                                {row.growth.toFixed(2)}%
                              </span>
                            </div>);
                      })()}
                      </div>
                      <p className="text-[11px] text-slate-400 mt-4">
                        <span className="font-bold text-slate-500">Sector spread</span>
                        <span>: </span>
                        <span>{spread}</span>
                      </p>
                    </div>
                  </div>
                </div>;
          })()}

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

      // ======================== FUNDING TRACKER (additive) ========================
      // Every number here is derived from the collections the app already keeps
      // (projects, investments, users) plus the new per-user watchlist.
      case "funding":
        {
          const rounds = projects.map(p => {
            const owner = users.find(u => u.id === p.ownerId);
            const backers = investments.filter(i => i.projectId === p.id);
            const raised = backers.reduce((s, i) => s + (Number(i.amount) || 0), 0);
            const required = Number(p.fundingRequired) || 0;
            return {
              p,
              owner,
              backers,
              raised,
              required,
              gap: Math.max(0, required - raised),
              pct: required > 0 ? Math.min(100, Math.round(raised / required * 100)) : 0,
              stage: lifecycleOf(p),
              watched: watchedProjectIds.includes(p.id)
            };
          }).filter(r => r.owner);
          const shown = rounds.filter(r => fundingStageFilter === "all" || r.stage === fundingStageFilter);
          const ordered = shown.slice().sort((a, b) => {
            if (fundingSort === "progress") return b.pct - a.pct;
            if (fundingSort === "newest") return new Date(b.p.createdAt) - new Date(a.p.createdAt);
            if (fundingSort === "size") return b.required - a.required;
            return b.gap - a.gap;
          });
          const totalSought = rounds.reduce((s, r) => s + r.required, 0);
          const totalPledged = rounds.reduce((s, r) => s + r.raised, 0);
          const openRounds = rounds.filter(r => r.p.status !== "funded" && r.gap > 0).length;
          const avgProgress = rounds.length ? Math.round(rounds.reduce((s, r) => s + r.pct, 0) / rounds.length) : 0;
          const myWatched = myWatchRows.map(w => {
            const r = rounds.find(x => x.p.id === w.projectId);
            return r ? {
              ...r,
              addedAt: w.addedAt
            } : null;
          }).filter(Boolean);
          const activity = investments.slice().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 6);
          const comparing = compareIds.map(id => rounds.find(r => r.p.id === id)).filter(Boolean);
          const tile = (label, value, sub, tone) => <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${tone} mb-3`}>
                <BarChart className="w-5 h-5" />
              </div>
              <div className="text-2xl font-bold text-slate-900">{value}</div>
              <div className="text-xs text-slate-500 mt-0.5">{label}</div>
              {sub && <div className="text-[11px] text-slate-400 mt-1">{sub}</div>}
            </div>;
          const pair = (n, label) => <>
              <span>{n}</span>
              <span> {label}</span>
            </>;
          return <div className="p-6 lg:p-8 max-w-5xl mx-auto pb-12">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-slate-900">Funding Tracker</h1>
              <p className="text-slate-500 mt-1 text-sm">Every live round on the platform, how close it is to closing, and what you are watching</p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {tile("Total funding sought", moneyLabel(totalSought), pair(rounds.length, "rounds on the platform"), "text-blue-700 bg-blue-50")}
              {tile("Capital pledged", moneyLabel(totalPledged), pair(investments.length, "investments recorded"), "text-emerald-600 bg-emerald-50")}
              {tile("Open rounds", openRounds, "Still seeking capital", "text-amber-600 bg-amber-50")}
              {tile("On your watchlist", myWatched.length, "Tracked by you", "text-violet-600 bg-violet-50")}
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-6">
              <div className="flex flex-wrap items-end gap-3">
                <div className="flex flex-col gap-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pl-1">Lifecycle stage</p>
                  <div className="flex gap-1.5 overflow-x-auto pb-1">
                    {[["all", "All stages"], ...LIFECYCLE.map(s => [s.key, s.label])].map(([val, label]) => <button key={val} onClick={() => setFundingStageFilter(val)} className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all whitespace-nowrap ${fundingStageFilter === val ? "bg-blue-700 text-white border-blue-700 shadow-sm" : "bg-white text-slate-600 border-slate-200 hover:border-blue-400 hover:text-blue-700"}`}>
                        {label}
                      </button>)}
                  </div>
                </div>
                <div className="flex flex-col gap-1 ml-auto">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pl-1">Sort</p>
                  <select value={fundingSort} onChange={e => setFundingSort(e.target.value)} className="px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 font-semibold text-slate-600">
                    <option value="gap">Biggest gap first</option>
                    <option value="progress">Most funded first</option>
                    <option value="size">Largest round first</option>
                    <option value="newest">Newest first</option>
                  </select>
                </div>
              </div>
              <p className="text-xs text-slate-400 font-semibold mt-3 pt-3 border-t border-slate-100">
                <span>{pair(shown.length, shown.length === 1 ? "round shown" : "rounds shown")}</span>
                <span className="ml-2">·</span>
                <span className="ml-2">{avgProgress}% </span>
                <span>average progress</span>
              </p>
            </div>

            {myWatched.length > 0 && <>
                <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
                  <Target className="w-4 h-4 text-violet-600" />
                  <span>Your watchlist</span>
                  <span className="text-xs bg-violet-50 text-violet-700 px-2 py-0.5 rounded-full font-semibold">{myWatched.length}</span>
                </h3>
                <div className="grid md:grid-cols-2 gap-3 mb-8">
                  {myWatched.map(r => <div key={r.p.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-slate-900 truncate">{r.p.title}</p>
                          <p className="text-xs text-slate-500 truncate">{r.owner.name}</p>
                        </div>
                        <FitBadge score={r.pct} />
                      </div>
                      <div className="flex items-center gap-2 mt-2 text-xs text-slate-500 flex-wrap">
                        <span>{moneyLabel(r.raised)} </span>
                        <span>raised of</span>
                        <span>{moneyLabel(r.required)}</span>
                        <span className="text-slate-300">·</span>
                        <span>{r.backers.length} </span>
                        <span>backers</span>
                      </div>
                      <div className="flex gap-2 mt-3">
                        <button onClick={() => openProject(r.p.id)} className="flex-1 text-xs py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-xl font-semibold transition-colors">{t("View project")}</button>
                        <button onClick={() => toggleWatch(r.p.id)} className="text-xs px-3 py-2 border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-600 font-semibold transition-colors">{t("Unwatch")}</button>
                      </div>
                    </div>)}
                </div>
              </>}

            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-slate-900">Funding pipeline</h3>
              {comparing.length > 0 && <button onClick={() => setCompareIds([])} className="text-xs font-semibold text-slate-500 hover:text-blue-700 underline underline-offset-2">{t("Clear comparison")}</button>}
            </div>
            <div className="space-y-4 mb-10">
              {ordered.length === 0 && <div className="bg-white rounded-2xl border border-slate-100 p-10 text-center text-slate-400">
                  <BarChart className="w-10 h-10 mx-auto mb-3 opacity-20" />
                  <p className="font-semibold">No rounds at this stage</p>
                </div>}
              {ordered.map(r => {
              const fit = cu.role === "investor" ? matchBetween(cu.id, r.p.id) : null;
              return <div key={r.p.id} className={`bg-white rounded-2xl border shadow-sm p-5 ${compareIds.includes(r.p.id) ? "border-blue-300 ring-2 ring-blue-50" : "border-slate-100"}`}>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="min-w-0">
                      <h4 className="font-bold text-slate-900 leading-snug">{r.p.title}</h4>
                      <div className="flex items-center gap-2 mt-1.5">
                        <UserAvatar user={r.owner} size="xs" />
                        <span className="text-xs text-slate-500 truncate">{r.owner.name} · {r.owner.company}</span>
                        {r.owner.verified && <VerifiedBadge />}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                      <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-semibold">{LIFECYCLE.find(s => s.key === r.stage)?.label || r.stage}</span>
                      {r.p.industry && <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-medium">{r.p.industry}</span>}
                    </div>
                  </div>

                  {r.required > 0 && <div className="mt-3">
                      <FundingProgressBar required={r.required} received={r.raised} />
                      <div className="grid grid-cols-3 gap-2 mt-3">
                        {[["Raised", moneyLabel(r.raised)], ["Still needed", moneyLabel(r.gap)], ["Backers", `${r.backers.length}`]].map(([label, value]) => <div key={label} className="bg-slate-50 rounded-xl px-3 py-2">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</p>
                            <p className="text-sm font-bold text-slate-900 mt-0.5">{value}</p>
                          </div>)}
                      </div>
                    </div>}

                  <div className="flex flex-wrap items-center gap-2 mt-4">
                    <button onClick={() => openProject(r.p.id)} className="text-sm px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-xl font-semibold transition-colors">{t("View project")}</button>
                    <button onClick={() => toggleWatch(r.p.id)} className={`text-sm px-4 py-2 rounded-xl font-semibold transition-colors border ${r.watched ? "bg-violet-50 text-violet-700 border-violet-200 hover:bg-violet-100" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}>
                      {r.watched ? t("Watching") : t("Watch deal")}
                    </button>
                    <button onClick={() => toggleCompare(r.p.id)} className={`text-sm px-4 py-2 rounded-xl font-semibold transition-colors border ${compareIds.includes(r.p.id) ? "bg-blue-50 text-blue-700 border-blue-200" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}>
                      {compareIds.includes(r.p.id) ? t("In comparison") : t("Compare")}
                    </button>
                    {fit && <span className="text-xs text-slate-400 font-semibold ml-auto">
                        <span>Matched for you</span>
                        <span className="ml-1 font-bold text-slate-600">{fit.score}%</span>
                      </span>}
                  </div>
                </div>;
            })}
            </div>

            {comparing.length >= 2 && <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 mb-10">
                <h3 className="font-bold text-slate-900 mb-1">Deal comparison</h3>
                <p className="text-xs text-slate-500 mb-4">Side by side, using only what the platform knows about each round</p>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-xs text-slate-400 uppercase tracking-wider">
                        <th className="py-2 pr-3 font-bold">
                          <span>Comparison</span>
                          <span>: </span>
                          <span>{comparing.length}</span>
                        </th>
                        {comparing.map(r => <th key={r.p.id} className="py-2 px-3 font-bold text-slate-700 whitespace-nowrap">{r.p.title}</th>)}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {[["Founder", r => r.owner.name], ["Company", r => r.owner.company || "—"], ["Sector", r => r.p.industry || "—"], ["Stage", r => LIFECYCLE.find(s => s.key === r.stage)?.label || r.stage], ["Round size", r => moneyLabel(r.required)], ["Raised", r => moneyLabel(r.raised)], ["Still needed", r => moneyLabel(r.gap)], ["Funded", r => `${r.pct}%`], ["Backers", r => `${r.backers.length}`], ["Patent", r => r.p.patented === true || r.p.patented === "yes" ? r.p.noveltyStatus === "cleared" ? "Verified" : "Claimed" : "None"], ["Milestones done", r => `${milestoneProgress(r.p.milestones || []).done} / ${milestoneProgress(r.p.milestones || []).total}`], ["Team", r => `${(r.p.team || []).length}`], ["Posted", r => new Date(r.p.createdAt).toLocaleDateString(lang, {
                        month: "short",
                        day: "numeric",
                        year: "numeric"
                      })]].map(([label, fn]) => <tr key={label}>
                          <td className="py-2 pr-3 text-xs font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">{label}</td>
                          {comparing.map(r => <td key={r.p.id} className="py-2 px-3 text-slate-700 font-medium">{fn(r)}</td>)}
                        </tr>)}
                    </tbody>
                  </table>
                </div>
              </div>}

            <h3 className="font-bold text-slate-900 mb-3">Recent funding activity</h3>
            <div className="space-y-2.5">
              {activity.length === 0 && <div className="bg-white rounded-2xl border border-slate-100 p-8 text-center text-slate-400 text-sm">No funding has closed yet.</div>}
              {activity.map(inv => {
              const investor = users.find(u => u.id === inv.investorId);
              const founder = users.find(u => u.id === inv.entrepreneurId);
              const proj = projects.find(p => p.id === inv.projectId);
              if (!investor || !founder) return null;
              return <div key={inv.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex items-center gap-3">
                    <UserAvatar user={investor} size="sm" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-700 truncate">
                        <span className="font-semibold">{investor.name}</span>
                        <span> invested in </span>
                        <span className="font-semibold">{founder.name}</span>
                        {proj && <span className="text-slate-400"> · {proj.title}</span>}
                      </p>
                      <p className="text-xs text-slate-400">{new Date(inv.createdAt).toLocaleDateString(lang, {
                      month: "short",
                      day: "numeric",
                      year: "numeric"
                    })}</p>
                    </div>
                    <span className="text-sm font-bold text-emerald-600 flex-shrink-0">{moneyLabel(inv.amount)}</span>
                  </div>;
            })}
            </div>
          </div>;
        }

      // ======================== SMART MATCHING (additive) ========================
      case "match":
        {
          const investingUsers = users.filter(u => u.role === "investor");
          const ownedProjects = projects.filter(p => p.ownerId === cu.id);
          const isInvestor = cu.role === "investor";
          const sectors = Array.from(new Set(projects.map(p => p.industry).filter(Boolean)));
          const pool = projects.filter(p => matchSectorFilter === "all" || p.industry === matchSectorFilter);
          const asInvestor = isInvestor ? rankProjectsForInvestor(cu, pool, matchCtx).map(entry => ({
            ...entry,
            stage: lifecycleOf(entry.project)
          })).slice(0, 8) : [];
          const perProject = !isInvestor ? ownedProjects.map(p => ({
            project: p,
            matches: rankInvestorsForProject(p, investingUsers, matchCtx).slice(0, 4)
          })) : [];
          return <div className="p-6 lg:p-8 max-w-5xl mx-auto pb-12">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-slate-900">Smart Matching</h1>
              <p className="text-slate-500 mt-1 text-sm">Ranked deals and investors, each with the reasons behind its fit score</p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-6">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Sector</p>
              <div className="flex gap-1.5 overflow-x-auto pb-1">
                {[["all", "All sectors"], ...sectors.map(s => [s, s])].map(([val, label]) => <button key={val} onClick={() => setMatchSectorFilter(val)} className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all whitespace-nowrap ${matchSectorFilter === val ? "bg-blue-700 text-white border-blue-700 shadow-sm" : "bg-white text-slate-600 border-slate-200 hover:border-blue-400 hover:text-blue-700"}`}>
                    {label}
                  </button>)}
              </div>
            </div>

            {isInvestor && <>
                <h3 className="font-bold text-slate-900 mb-1">Deals matched to your profile</h3>
                <p className="text-xs text-slate-500 mb-4">Scored on your sectors, your cheque size, the stages you write, and the round's own momentum</p>
                <div className="space-y-4 mb-10">
                  {asInvestor.length === 0 && <div className="bg-white rounded-2xl border border-slate-100 p-10 text-center text-slate-400">
                      <Target className="w-10 h-10 mx-auto mb-3 opacity-20" />
                      <p className="font-semibold">No live rounds to match yet</p>
                    </div>}
                  {asInvestor.map(entry => {
                const owner = users.find(u => u.id === entry.project.ownerId);
                if (!owner) return null;
                return <div key={entry.project.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                      <div className="flex items-start gap-3">
                        <UserAvatar user={owner} size="md" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-bold text-slate-900">{entry.project.title}</h4>
                            <FitBadge score={entry.score} />
                            <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-semibold">{LIFECYCLE.find(s => s.key === entry.stage)?.label || entry.stage}</span>
                          </div>
                          <p className="text-xs text-slate-500 mt-1">{owner.name} · {owner.company}</p>
                          <p className="text-sm text-slate-600 mt-2 leading-relaxed line-clamp-2">{entry.project.description || "No description yet."}</p>
                          <div className="mt-3">
                            <MatchPills reasons={entry.reasons} gaps={entry.gaps} />
                          </div>
                          <div className="flex flex-wrap items-center gap-2 mt-3">
                            <button onClick={() => openProject(entry.project.id)} className="text-xs px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-xl font-semibold transition-colors">{t("View project")}</button>
                            <button onClick={() => toggleWatch(entry.project.id)} className={`text-xs px-4 py-2 rounded-xl font-semibold transition-colors border ${watchedProjectIds.includes(entry.project.id) ? "bg-violet-50 text-violet-700 border-violet-200" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}>
                              {watchedProjectIds.includes(entry.project.id) ? t("Watching") : t("Watch deal")}
                            </button>
                            <button onClick={() => toggleCompare(entry.project.id)} className={`text-xs px-4 py-2 rounded-xl font-semibold transition-colors border ${compareIds.includes(entry.project.id) ? "bg-blue-50 text-blue-700 border-blue-200" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}>
                              {compareIds.includes(entry.project.id) ? t("In comparison") : t("Compare")}
                            </button>
                            <span className="text-xs text-slate-400 ml-auto">
                              <span>{moneyLabel(entry.facts.raised)} </span>
                              <span>raised of</span>
                              <span> {moneyLabel(entry.facts.sought)}</span>
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>;
              })}
                </div>
              </>}

            {!isInvestor && <>
                {perProject.length === 0 ? <div className="bg-white rounded-2xl border border-slate-100 p-10 text-center text-slate-400">
                    <Target className="w-10 h-10 mx-auto mb-3 opacity-20" />
                    <p className="font-semibold">Publish a project to see which investors fit it</p>
                    <p className="text-sm mt-1">Matching reads your round size, sector, stage and patent status.</p>
                  </div> : perProject.map(group => <div key={group.project.id} className="mb-10">
                    <h3 className="font-bold text-slate-900 mb-1">{group.project.title}</h3>
                    <p className="text-xs text-slate-500 mb-4">Investors ranked by how well this round suits them</p>
                    <div className="grid md:grid-cols-2 gap-4">
                      {group.matches.map(entry => <div key={entry.investor.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
                          <div className="flex items-start gap-3">
                            <UserAvatar user={entry.investor} size="sm" />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-bold text-slate-900 truncate">{entry.investor.name}</span>
                                <FitBadge score={entry.score} />
                              </div>
                              <p className="text-xs text-slate-500 truncate">
                                <span>{entry.investor.company}</span>
                                {entry.investor.investmentRange && <span> · {entry.investor.investmentRange}</span>}
                              </p>
                              <div className="mt-2">
                                <MatchPills reasons={entry.reasons} gaps={entry.gaps} />
                              </div>
                              <div className="flex gap-2 mt-3">
                                <button onClick={() => viewUserProfile(entry.investor.id)} className="text-xs px-3 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg font-semibold transition-colors">{t("View Profile")}</button>
                                {cu.connections.includes(entry.investor.id) ? <button onClick={() => openMessage(entry.investor.id)} className="text-xs px-3 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600 font-semibold transition-colors">{t("Message")}</button> : <button onClick={() => sendConnectionRequest(entry.investor.id)} className="text-xs px-3 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600 font-semibold transition-colors">{cu.pendingSent.includes(entry.investor.id) ? t("Requested") : t("Connect")}</button>}
                              </div>
                            </div>
                          </div>
                        </div>)}
                    </div>
                  </div>)}
              </>}

            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <h3 className="font-bold text-slate-900 mb-3">How a fit score is built</h3>
              <div className="grid sm:grid-cols-2 gap-3">
                {[["Sector overlap", "The investor names this industry, or the founder works in it"], ["Check size", "The round sits inside the investor's stated range"], ["Stage fit", "Early, growth or late stage, read from what they write about"], ["Defensibility", "A filed patent, verified by PatentBot, counts most"], ["Deal momentum", "Other backers already in, and traction numbers in the pitch"], ["Network & location", "Existing connection with the founder, or the same city"]].map(([label, text]) => <div key={label} className="bg-slate-50 rounded-xl p-3">
                    <p className="text-xs font-bold text-slate-700">{label}</p>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">{text}</p>
                  </div>)}
              </div>
              <p className="text-[11px] text-slate-400 mt-4">Scores are computed in your browser from data on this platform. Nothing is sent to a third-party model.</p>
            </div>
          </div>;
        }

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
                      {(latestCu?.id === w.hostId || latestCu?.role === "admin") && <button onClick={() => inviteWebinarMembers(w)} disabled={invitingWebinarId === w.id} className="text-xs px-3.5 py-2 rounded-xl font-semibold border border-blue-200 text-blue-700 hover:bg-blue-50 disabled:opacity-50 transition-colors flex-shrink-0">
                          {invitingWebinarId === w.id ? t("Checking fit…") : t("Invite matched members")}
                        </button>}
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
                <EntryListEditor title="Work history" itemLabel="Role" addLabel="Add role" rows={editForm.experienceList} onChange={rows => setEditForm(f => ({
                  ...f,
                  experienceList: rows
                }))} fields={[{
                  key: "role",
                  placeholder: "Position or title"
                }, {
                  key: "company",
                  placeholder: "Company"
                }, {
                  key: "from",
                  placeholder: "From (year)"
                }, {
                  key: "to",
                  placeholder: "To (year)"
                }, {
                  key: "note",
                  placeholder: "What you did there",
                  wide: true
                }]} />
                <EntryListEditor title="Education" itemLabel="Qualification" addLabel="Add education" rows={editForm.education} onChange={rows => setEditForm(f => ({
                  ...f,
                  education: rows
                }))} fields={[{
                  key: "school",
                  placeholder: "School or university"
                }, {
                  key: "degree",
                  placeholder: "Degree or qualification"
                }, {
                  key: "from",
                  placeholder: "From (year)"
                }, {
                  key: "to",
                  placeholder: "To (year)"
                }]} />
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
          const securitySessions = (security?.sessions || []).filter(s => s && s.jti);
          const securityActivity = security?.activity || [];
          const activeSessions = securitySessions.filter(s => s.active);
          // A freshly registered profile has almost nothing filled in yet, so the
          // card above is drawn compact. Established accounts keep the full card.
          const newAccount = profileCompletion(cu) <= 25;
          // Each account panel holds a long form or a long list, so every account
          // gets one panel at a time in its own section instead of one endless
          // stack. The tab row carries a live summary of what is inside.
          const channelsOn = alerts ? ALERT_CHANNEL_KEYS.filter(k => alerts.channels?.[k]).length : 0;
          const PANEL_TABS = [{
            key: "verification",
            label: "Verification",
            hint: cu.verified ? "Verified" : checklist.some(c => c.done) ? "In progress" : "Not started"
          }, {
            key: "security",
            label: "Security",
            hint: `${activeSessions.length} active`
          }, {
            key: "two-factor",
            label: "Two-step",
            hint: tf?.enabled ? "On" : "Off"
          }, {
            key: "alerts",
            label: "Alerts",
            hint: `${channelsOn} on`
          }];
          return <>
            <ProfileView user={cu} isOwnProfile compact={newAccount} onEdit={startEditProfile} onConnect={() => {}} onMessage={() => {}} connectionStatus="self" avgRating={getAvgRating(cu.id)} reviewCount={ownReviews.length} reviewsList={ownReviews} ownedProjects={projects.filter(p => p.ownerId === cu.id)} followingCount={(cu.following || []).length} followerCount={(cu.followers || []).length} />
            <div className="max-w-4xl mx-auto px-6 mb-5">
              <div className="flex items-end justify-between gap-3 mb-2 flex-wrap">
                <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Account settings</h2>
                <p className="text-xs text-slate-400">Open one section at a time.</p>
              </div>
              <div className="vl-panel-tabs">
                {PANEL_TABS.map(tab => <button key={tab.key} onClick={() => setProfilePanelTab(tab.key)} className={"vl-panel-tab" + (profilePanelTab === tab.key ? " vl-panel-tab-on" : "")}>
                    <span>{t(tab.label)}</span>
                    <span className="vl-panel-tab-hint">{t(tab.hint)}</span>
                  </button>)}
              </div>
            </div>
            {profilePanelTab === "verification" && <div className="max-w-4xl mx-auto px-6 -mt-1 mb-10">
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
            </div>}
            {/* Security & sessions — password on its own, then the devices and
                the sign-in log, each in its own card */}
            {profilePanelTab === "security" && <div className="max-w-4xl mx-auto px-6 -mt-1 mb-10">
              <div className="flex items-start justify-between gap-3 mb-5 flex-wrap">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <KeyRound className="w-4 h-4 text-blue-700" /> Security &amp; sessions
                  </h3>
                  <p className="text-xs text-slate-500 mt-1.5">Change your password, review the devices that hold a session, and check recent sign-in activity.</p>
                </div>
                <button onClick={refreshSecurity} className="text-xs font-semibold text-slate-500 hover:text-slate-700 border border-slate-200 rounded-lg px-3 py-1.5 transition-colors">
                  Refresh
                </button>
              </div>

              {securityError && <div className="bg-rose-50 border border-rose-200 rounded-xl px-3.5 py-2.5 mb-4">
                  <p className="text-xs font-semibold text-rose-700">{securityError}</p>
                </div>}
              {securityNote && <div className="bg-emerald-50 border border-emerald-100 rounded-xl px-3.5 py-2.5 mb-4">
                  <p className="text-xs font-semibold text-emerald-700">{securityNote}
                    {securitySignedOut > 0 && <>
                      <span>{securitySignedOut}</span> {t("other session(s) signed out.")}
                    </>}
                  </p>
                </div>}

              <div className="grid lg:grid-cols-2 gap-5">
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-4">Change password</h4>
                  <form onSubmit={handleChangePassword} className="space-y-3.5">
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1">Current</label>
                      <input type="password" autoComplete="current-password" value={pwCurrent} onChange={e => setPwCurrent(e.target.value)} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm bg-slate-50 focus:bg-white" placeholder="••••••••" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1">New</label>
                      <input type="password" autoComplete="new-password" value={pwNext} onChange={e => setPwNext(e.target.value)} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm bg-slate-50 focus:bg-white" placeholder="8+ characters" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1">Confirm</label>
                      <input type="password" autoComplete="new-password" value={pwConfirm} onChange={e => setPwConfirm(e.target.value)} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm bg-slate-50 focus:bg-white" placeholder="Repeat it" />
                    </div>
                    <p className="text-xs text-slate-400">A new password ends every other session. This device stays signed in.</p>
                    <button type="submit" disabled={securityBusy || !pwCurrent || !pwNext || !pwConfirm} className="text-sm px-4 py-2 bg-blue-700 hover:bg-blue-800 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl font-semibold transition-colors">
                      {securityBusy ? "Updating…" : "Update password"}
                    </button>
                  </form>
                </div>

                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                  <div className="flex items-center justify-between gap-3 mb-1">
                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Active sessions
                      <span className="ml-1.5 text-[10px] font-semibold text-slate-400">{activeSessions.length}</span>
                    </h4>
                    {activeSessions.length > 1 && <button onClick={handleRevokeOtherSessions} className="text-xs font-semibold text-rose-600 hover:text-rose-700 transition-colors">Sign out everywhere else</button>}
                  </div>
                  <p className="text-xs text-slate-400 mb-2">Every device signed in to this account.</p>
                  {!security && <p className="text-xs text-slate-400">Loading sessions…</p>}
                  {security && !securitySessions.length && <p className="text-xs text-slate-400">No sessions recorded for this account yet.</p>}
                  <div className="divide-y divide-slate-100 overflow-y-auto" style={{
                  maxHeight: "24rem"
                }}>
                    {securitySessions.map(s => <div key={s.jti} className="flex items-start gap-3 py-2.5">
                        <Monitor className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-semibold text-slate-800">{describeDevice(s.userAgent)}</span>
                            {s.current && <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 rounded-full px-2 py-0.5">This device</span>}
                            {!s.active && <span className="text-[10px] font-bold text-slate-500 bg-slate-100 rounded-full px-2 py-0.5">Signed out</span>}
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {SESSION_VIA_LABELS[s.via] || s.via} · {s.ip} · {t("Started")} {formatShortDateIn(s.createdAt, lang)}
                            {s.lastSeenAt && <> · {t("Last seen")} {formatShortDateIn(s.lastSeenAt, lang)}</>}
                          </p>
                        </div>
                        {s.active && !s.current && <button onClick={() => handleRevokeSession(s.jti)} className="text-xs font-semibold text-slate-600 hover:text-rose-700 border border-slate-200 hover:border-rose-200 rounded-lg px-3 py-1.5 transition-colors flex-shrink-0">Sign out</button>}
                      </div>)}
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 mt-5">
                <div className="flex items-center justify-between gap-3 mb-1">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Recent sign-in activity</h4>
                  <span className="text-[10px] font-semibold text-slate-400">{securityActivity.length}</span>
                </div>
                <p className="text-xs text-slate-400 mb-2">Successful and failed attempts on this account.</p>
                {!security && <p className="text-xs text-slate-400">Loading activity…</p>}
                {security && !securityActivity.length && <p className="text-xs text-slate-400">Nothing recorded yet.</p>}
                <div className="divide-y divide-slate-100">
                  {(showAllActivity ? securityActivity : securityActivity.slice(0, 8)).map((a, i) => {
                  const d = splitDetail(a.detail);
                  return <div key={`${a.at}-${i}`} className="flex items-start gap-3 py-2">
                      {a.outcome === "success" ? <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" /> : <UserX className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-slate-700">
                          {ACTIVITY_VIA_LABELS[a.via] || a.via}
                          {a.outcome === "failure" && <> · {t("Failed")}</>}
                        </p>
                        <p className="text-xs text-slate-400">
                          {formatShortDateIn(a.at, lang)} · {a.ip}
                          {a.detail && <> · <span>{d.count}</span> {d.rest}</>}
                        </p>
                      </div>
                    </div>;
                })}
                </div>
                {securityActivity.length > 8 && <button onClick={() => setShowAllActivity(v => !v)} className="text-xs font-semibold text-blue-700 hover:underline mt-2.5">
                    {showAllActivity ? t("Show less") : t("Show all activity")} · {securityActivity.length}
                  </button>}
              </div>
            </div>}
            {/* Two-step verification — status on the left, the action on the
                right; sign-in behaviour for every other account is unchanged
                until a member switches this on */}
            {profilePanelTab === "two-factor" && <div className="max-w-4xl mx-auto px-6 -mt-1 mb-10">
              <div className="flex items-start justify-between gap-3 mb-5 flex-wrap">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-blue-700" /> Two-step verification
                  </h3>
                  <p className="text-xs text-slate-500 mt-1.5">{t("After your password, every sign-in also asks for a 6-digit code. Works the same way for Google sign-in.")}</p>
                </div>
                <span className={`text-[10px] font-bold rounded-full px-2.5 py-1 border ${tf?.enabled ? "text-emerald-700 bg-emerald-50 border-emerald-100" : "text-slate-500 bg-slate-50 border-slate-100"}`}>
                  {tf?.enabled ? t("On") : t("Off")}
                </span>
              </div>
              {tfError && <div className="bg-rose-50 border border-rose-200 rounded-xl px-3.5 py-2.5 mb-4">
                  <p className="text-xs font-semibold text-rose-700">{tfError}</p>
                </div>}
              {tfNote && <div className="bg-emerald-50 border border-emerald-100 rounded-xl px-3.5 py-2.5 mb-4">
                  <p className="text-xs font-semibold text-emerald-700">{tfNote}</p>
                </div>}
              {!tf && <p className="text-xs text-slate-400">{t("Loading security settings…")}</p>}
              <div className="grid lg:grid-cols-2 gap-5">
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">Current status</h4>
                  {tf && tf.enabled && <>
                      <p className="text-sm text-slate-700 mb-1">
                        {t("Codes are sent by")} <span className="font-semibold">{t(CHANNEL_LABELS[tf.method] || "Email")}</span>
                        {tf.dest ? <> {t("to")} <span className="font-semibold">{tf.dest}</span></> : null}.
                      </p>
                      <p className="text-xs text-slate-400">{t("Your password alone no longer signs you in — on any device, including Google sign-in.")}</p>
                    </>}
                  {tf && !tf.enabled && <p className="text-xs text-slate-500 leading-relaxed">{t("Two-step is off, so your password alone signs you in. Turn it on if this account holds agreements or offer letters.")}</p>}
                  {tf && <div className="mt-4 pt-4 border-t border-slate-100 space-y-1.5">
                      {ALERT_CHANNEL_KEYS.map(key => <p key={key} className="text-xs text-slate-400 flex items-center gap-2">
                          <span className={tf.availability?.[key] ? "text-emerald-600 font-semibold" : ""}>{t(CHANNEL_LABELS[key])}</span>
                          <span>{tf.availability?.[key] ? t("can send from this server") : t("shown on screen here")}</span>
                        </p>)}
                    </div>}
                </div>
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                  {tf && !tf.enabled && !tfChallenge && <form onSubmit={handleEnableTwoFactor}>
                      <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">{t("Choose how to receive the code")}</h4>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {ALERT_CHANNEL_KEYS.map(key => <button key={key} type="button" onClick={() => setTfMethod(key)} className={`text-xs font-semibold px-3.5 py-2 rounded-xl border transition-colors ${tfMethod === key ? "bg-blue-50 border-blue-300 text-blue-800" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"}`}>
                            {t(CHANNEL_LABELS[key])}
                          </button>)}
                      </div>
                      {tfMethod !== "email" && <div className="mb-4">
                          <label className="block text-xs font-bold text-slate-600 mb-1">{t("Phone number")}</label>
                          <input type="tel" autoComplete="tel" value={tfPhone} onChange={e => setTfPhone(e.target.value)} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm bg-slate-50 focus:bg-white" placeholder="+91 98765 43210" />
                          <p className="text-xs text-slate-400 mt-1.5">{t("The code goes to this number when the account signs in.")}</p>
                        </div>}
                      {tfMethod === "email" && <p className="text-xs text-slate-500 mb-4">{t("Codes go to")} <span className="font-semibold text-slate-700">{latestCu?.email || alerts?.email || ""}</span></p>}
                      <div className="mb-4">
                        <label className="block text-xs font-bold text-slate-600 mb-1">{t("Current password")}</label>
                        <input type="password" autoComplete="current-password" value={tfPassword} onChange={e => setTfPassword(e.target.value)} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm bg-slate-50 focus:bg-white" placeholder="Confirm it is you" />
                      </div>
                      <button type="submit" disabled={tfBusy || !tfPassword || (tfMethod !== "email" && !tfPhone)} className="text-sm px-4 py-2 bg-blue-700 hover:bg-blue-800 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl font-semibold transition-colors">
                        {tfBusy ? t("Sending…") : t("Send verification code")}
                      </button>
                    </form>}
                  {tfChallenge && <div className="border border-blue-100 bg-blue-50/40 rounded-xl p-4">
                      <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">{t("Enter the 6-digit code")}</h4>
                      <p className="text-xs text-slate-600 mb-3">
                        {t("Sent by")} <span className="font-semibold">{t(CHANNEL_LABELS[tfChallenge.method] || "Email")}</span>
                        {tfChallenge.dest ? <> {t("to")} <span className="font-semibold">{tfChallenge.dest}</span></> : null}
                        {tfChallenge.expiresMinutes ? <> · {t("expires in")} {tfChallenge.expiresMinutes} {t("minutes")}.</> : null}
                      </p>
                      {tfChallenge.devCode && <p className="text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl px-3 py-2 mb-3">
                          {t("No code provider is connected to this server, so the code is shown here:")} <span className="font-mono tracking-widest">{tfChallenge.devCode}</span>
                        </p>}
                      <form onSubmit={handleConfirmTwoFactor} className="flex flex-wrap items-end gap-3">
                        <div>
                          <label className="block text-xs font-bold text-slate-600 mb-1">{t("Code")}</label>
                          <input inputMode="numeric" autoComplete="one-time-code" maxLength={6} value={tfCode} onChange={e => setTfCode(e.target.value.replace(/[^\d]/g, "").slice(0, 6))} className="w-32 px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm bg-white text-center tracking-[0.3em] font-semibold" placeholder="000000" />
                        </div>
                        <button type="submit" disabled={tfBusy || tfCode.length < 6} className="text-sm px-4 py-2 bg-blue-700 hover:bg-blue-800 disabled:opacity-40 text-white rounded-xl font-semibold transition-colors">{t("Turn on")}</button>
                        <button type="button" onClick={handleResendTfCode} disabled={tfBusy} className="text-sm px-3 py-2 text-blue-700 hover:bg-blue-100 rounded-xl font-semibold transition-colors">{t("Send another code")}</button>
                        <button type="button" onClick={cancelTfSetup} className="text-sm px-3 py-2 text-slate-500 hover:bg-slate-100 rounded-xl font-semibold transition-colors">{t("Cancel")}</button>
                      </form>
                    </div>}
                  {tf && tf.enabled && <form onSubmit={handleDisableTwoFactor}>
                      <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">Turn it off</h4>
                      <div className="mb-4">
                        <label className="block text-xs font-bold text-slate-600 mb-1">{t("Current password")}</label>
                        <input type="password" autoComplete="current-password" value={tfPassword} onChange={e => setTfPassword(e.target.value)} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm bg-slate-50 focus:bg-white" placeholder="Confirm it is you" />
                      </div>
                      <button type="submit" disabled={tfBusy || !tfPassword} className="text-sm px-4 py-2 bg-white hover:bg-slate-50 disabled:opacity-40 text-rose-700 border border-rose-200 rounded-xl font-semibold transition-colors">{t("Turn off two-step verification")}</button>
                    </form>}
                </div>
              </div>
            </div>}
            {/* Outward alerts — the same messages the bell shows, also mailed,
                texted and sent on WhatsApp when the member opts in */}
            {profilePanelTab === "alerts" && <div className="max-w-4xl mx-auto px-6 -mt-1 mb-10">
              <div className="flex items-start justify-between gap-3 mb-5 flex-wrap">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <Bell className="w-4 h-4 text-blue-700" /> Alerts by email, SMS and WhatsApp
                  </h3>
                  <p className="text-xs text-slate-500 mt-1.5">{t("Important events — offer letters, filed agreements, verification codes, webinar invites — also leave the website.")}</p>
                </div>
                <button onClick={refreshAlerts} className="text-xs font-semibold text-slate-500 hover:text-slate-700 border border-slate-200 rounded-lg px-3 py-1.5 transition-colors">{t("Refresh")}</button>
              </div>
              {alertError && <div className="bg-rose-50 border border-rose-200 rounded-xl px-3.5 py-2.5 mb-4">
                  <p className="text-xs font-semibold text-rose-700">{alertError}</p>
                </div>}
              {alertNote && <div className="bg-emerald-50 border border-emerald-100 rounded-xl px-3.5 py-2.5 mb-4">
                  <p className="text-xs font-semibold text-emerald-700">{alertNote}</p>
                </div>}
              {!alerts && <p className="text-xs text-slate-400">{t("Loading alert settings…")}</p>}
              {alerts && <div className="grid lg:grid-cols-2 gap-5">
                  <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Channels</h4>
                    <p className="text-xs text-slate-400 mb-2">{t("A channel this server cannot send through is marked, so nothing looks switched on when it is not.")}</p>
                    <div className="divide-y divide-slate-100 mb-4">
                      {ALERT_CHANNEL_KEYS.map(key => <div key={key} className="flex items-center justify-between gap-3 py-2.5">
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-slate-800 flex items-center gap-2 flex-wrap">
                              {t(CHANNEL_LABELS[key])}
                              {!alerts.availability?.[key] && <span className="text-[10px] font-bold text-slate-500 bg-slate-100 border border-slate-200 rounded-full px-2 py-0.5">{t("cannot send here")}</span>}
                            </p>
                            <p className="text-xs text-slate-400 truncate">
                              {key === "email" ? alerts.email : key === "sms" ? (alerts.phone || t("Add a number below")) : (alerts.phone || t("Add a number below"))}
                              {alerts.availability?.[key] ? <> · {t("via")} <span className="font-semibold text-slate-500">{alerts.availability[key]}</span></> : <> · {t("no provider configured")}</>}
                            </p>
                          </div>
                          <label className="flex items-center gap-2 cursor-pointer flex-shrink-0">
                            <input type="checkbox" checked={!!alerts.channels[key]} onChange={() => toggleAlertChannel(key)} className="w-4 h-4 accent-blue-700" />
                            <span className="text-xs font-semibold text-slate-500">{alerts.channels[key] ? t("On") : t("Off")}</span>
                          </label>
                        </div>)}
                    </div>
                    <div className="flex flex-wrap items-end gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-600 mb-1">{t("Phone number for SMS and WhatsApp")}</label>
                        <input type="tel" autoComplete="tel" value={tfPhone} onChange={e => setTfPhone(e.target.value)} className="w-full sm:w-64 px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm bg-slate-50 focus:bg-white" placeholder="+91 98765 43210" />
                      </div>
                      <button onClick={() => handleSaveAlertChannels(false)} disabled={alertBusy} className="text-sm px-4 py-2 bg-blue-700 hover:bg-blue-800 disabled:opacity-40 text-white rounded-xl font-semibold transition-colors">{t("Save settings")}</button>
                      <button onClick={() => handleSaveAlertChannels(true)} disabled={alertBusy} className="text-sm px-4 py-2 bg-white hover:bg-slate-50 disabled:opacity-40 text-blue-700 border border-blue-200 rounded-xl font-semibold transition-colors">{t("Save and send a test")}</button>
                    </div>
                  </div>
                  <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">{t("Alerts sent to you")}</h4>
                    <p className="text-xs text-slate-400 mb-3">{t("The most recent messages that left the website for this account.")}</p>
                    {!myAlerts && <p className="text-xs text-slate-400">{t("Loading…")}</p>}
                    {myAlerts && !myAlerts.length && <p className="text-xs text-slate-400">{t("Nothing has left the website for you yet.")}</p>}
                    <div className="divide-y divide-slate-100">
                      {(myAlerts || []).slice(0, 8).map(row => <div key={row.id || row._id} className="flex items-start gap-3 py-2">
                          <span className={`text-[10px] font-bold rounded-full px-2 py-0.5 border flex-shrink-0 mt-0.5 ${OUTBOX_STATUS_STYLES[row.status] || OUTBOX_STATUS_STYLES.skipped}`}>
                            {row.status}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-slate-700 truncate">{ALERT_KIND_LABELS[row.kind] || row.kind}</p>
                            <p className="text-xs text-slate-400 truncate">
                              {t(CHANNEL_LABELS[row.channel] || row.channel)} · {row.to}
                              {row.createdAt && <> · {formatShortDateIn(row.createdAt, lang)}</>}
                            </p>
                            {row.reason && <p className="text-[11px] text-slate-400 truncate">{row.reason}</p>}
                          </div>
                        </div>)}
                    </div>
                  </div>
                </div>}
            </div>}
          </>;
        }

      // ======================== PROJECT PAGE ========================
      case "project-detail":
        {
          const project = viewingProjectId ? projects.find(p => p.id === viewingProjectId) : null;
          if (!project) return <div className="p-6 lg:p-8 max-w-5xl mx-auto">
              <button onClick={() => setView("projects")} className="text-sm text-blue-700 hover:underline font-semibold flex items-center gap-1">
                <ChevronLeft className="w-4 h-4" /> Back to projects
              </button>
              <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center mt-4">
                <Layers className="w-10 h-10 mx-auto mb-3 text-slate-300" />
                <p className="font-semibold text-slate-700">This project is no longer available.</p>
                <p className="text-sm text-slate-400 mt-1">It may have been removed by its founder.</p>
              </div>
            </div>;
          const owner = users.find(u => u.id === project.ownerId);
          const isOwner = !!(owner && owner.id === cu.id);
          const received = getProjectFundingReceived(project.id);
          const required = project.fundingRequired || 0;
          const pctFunded = required ? Math.min(100, Math.round(received / required * 100)) : 0;
          const backers = investments.filter(i => i.projectId === project.id);
          const projectProposals = proposals.filter(pr => pr.projectId === project.id);
          const linkedRequirements = requirements.filter(r => projectProposals.some(pr => pr.requirementId === r.id) || (r.industry && r.industry === project.industry));
          const visits = recentlyAccessed.filter(e => e.targetType === "project" && e.targetId === project.id);
          const visitorIds = Array.from(new Set(visits.map(v => v.userId)));
          const roleOf = id => (users.find(u => u.id === id) || {}).role || "other";
          const interest = ["investor", "entrepreneur", "startup_founder", "mentor", "freelancer"].map(role => ({
            role,
            count: visitorIds.filter(id => roleOf(id) === role).length
          })).filter(x => x.count > 0);
          // Owners must see the blank row they just added; visitors only see rows with content.
          const allMilestones = (project.milestones || []).filter(m => m && typeof m === "object");
          const allTeam = (project.team || []).filter(m => m && typeof m === "object");
          const canEdit = isOwner && cu.role !== "admin";
          const milestones = canEdit ? allMilestones : allMilestones.filter(m => m.title || m.note);
          const team = canEdit ? allTeam : allTeam.filter(m => m.name || m.role || m.note);
          const documents = project.documents || [];
          const ms = milestoneProgress(milestones);
          const stage = lifecycleOf(project);
          const card = "bg-white rounded-2xl border border-slate-100 shadow-sm p-5";
          const cardTitle = "text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2";
          const cardTitleTight = "text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2";
          return <div className="p-6 lg:p-8 max-w-5xl mx-auto pb-12">
              <button onClick={() => setView("projects")} className="text-sm text-blue-700 hover:underline font-semibold flex items-center gap-1 mb-4">
                <ChevronLeft className="w-4 h-4" /> Back to projects
              </button>

              <div className={`${card} mb-4`}>
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="min-w-0 flex-1">
                    <h1 className="text-2xl font-bold text-slate-900 leading-snug">{project.title}</h1>
                    <div className="flex items-center gap-1.5 flex-wrap mt-2">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${project.status === "funded" ? "bg-emerald-100 text-emerald-700" : project.status === "in_talks" ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-600"}`}>
                        {project.status === "funded" ? "Funded" : project.status === "in_talks" ? "In talks" : "Open"}
                      </span>
                      <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-medium">{project.projectType === "product" ? "Product" : "SaaS"}</span>
                      {project.industry && <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium">{project.industry}</span>}
                      {project.patented && <span className="text-xs bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full font-semibold">Patented</span>}
                      {project.noveltyStatus === "cleared" && <span className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full font-semibold">Novelty cleared</span>}
                    </div>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {owner && owner.id !== cu.id && <button onClick={() => openMessage(owner.id)} className="text-sm px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-xl font-semibold transition-colors flex items-center gap-1.5">
                        <MessageCircle className="w-4 h-4" /> Message founder
                      </button>}
                    <button onClick={() => openPatentBot(project.id, null)} className="text-sm px-4 py-2 border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-700 font-semibold transition-colors">
                      Verify novelty
                    </button>
                    <button onClick={() => toggleWatch(project.id)} className={`text-sm px-4 py-2 rounded-xl font-semibold transition-colors border ${watchedProjectIds.includes(project.id) ? "bg-violet-50 text-violet-700 border-violet-200 hover:bg-violet-100" : "border-slate-200 text-slate-700 hover:bg-slate-50"}`}>
                      {watchedProjectIds.includes(project.id) ? t("Watching") : t("Watch deal")}
                    </button>
                    <button onClick={() => toggleCompare(project.id)} className={`text-sm px-4 py-2 rounded-xl font-semibold transition-colors border ${compareIds.includes(project.id) ? "bg-blue-50 text-blue-700 border-blue-200" : "border-slate-200 text-slate-700 hover:bg-slate-50"}`}>
                      {compareIds.includes(project.id) ? t("In comparison") : t("Compare")}
                    </button>
                    {canEdit && <button onClick={() => {
                    startEditProject(project);
                    setView("portfolio");
                  }} className="text-sm px-4 py-2 border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-700 font-semibold transition-colors flex items-center gap-1.5">
                        <Edit2 className="w-4 h-4" /> Edit project
                      </button>}
                  </div>
                </div>

                {owner && <div className="flex items-center gap-3 mt-4 pt-4 border-t border-slate-100">
                    <UserAvatar user={owner} size="sm" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-slate-900 truncate">{owner.name} <span className="text-slate-400 font-normal">· {owner.position} {owner.company && `at ${owner.company}`}</span></p>
                      <p className="text-xs text-slate-400">Posted {project.createdAt ? new Date(project.createdAt).toLocaleDateString(lang, {
                      month: "long",
                      year: "numeric"
                    }) : "recently"}</p>
                    </div>
                    <button onClick={() => viewUserProfile(owner.id)} className="text-xs px-3 py-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600 font-semibold transition-colors flex-shrink-0">View Profile</button>
                  </div>}
              </div>

              <div className={`${card} mb-4`}>
                <h2 className={cardTitle}><Zap className="w-4 h-4 text-blue-700" /> Project lifecycle</h2>
                <LifecycleStepper stage={stage} onSet={canEdit ? key => setProjectStage(project.id, key) : undefined} />
                <p className="text-xs text-slate-400 mt-3">{canEdit ? "Click a step to move this project along its lifecycle." : "Idea → Prototype → MVP → Launched → Scaling → Funded"}</p>
              </div>

              {isOwner && (() => {
              // Explainable investor matches for this round, computed the same way
              // the Smart Matching page does.
              const fits = rankInvestorsForProject(project, users.filter(u => u.role === "investor"), matchCtx).slice(0, 3);
              if (!fits.length) return null;
              return <div className={`${card} mb-4`}>
                    <h2 className={cardTitle}><Target className="w-4 h-4 text-blue-700" /> Investors matched to this round</h2>
                    <div className="grid md:grid-cols-3 gap-3">
                      {fits.map(entry => <div key={entry.investor.id} className="bg-slate-50 rounded-xl p-3">
                          <div className="flex items-center gap-2">
                            <UserAvatar user={entry.investor} size="xs" />
                            <span className="text-xs font-bold text-slate-900 truncate">{entry.investor.name}</span>
                            <FitBadge score={entry.score} />
                          </div>
                          <p className="text-[11px] text-slate-500 mt-1.5 truncate">{entry.investor.investmentRange || entry.investor.company}</p>
                          <div className="mt-2">
                            <MatchPills reasons={entry.reasons.slice(0, 2)} gaps={[]} />
                          </div>
                          <div className="flex gap-1.5 mt-2.5">
                            <button onClick={() => viewUserProfile(entry.investor.id)} className="text-[11px] px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600 font-semibold transition-colors">{t("View Profile")}</button>
                            <button onClick={() => cu.connections.includes(entry.investor.id) ? openMessage(entry.investor.id) : sendConnectionRequest(entry.investor.id)} className="text-[11px] px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600 font-semibold transition-colors">
                              {cu.connections.includes(entry.investor.id) ? t("Message") : cu.pendingSent.includes(entry.investor.id) ? t("Requested") : t("Connect")}
                            </button>
                          </div>
                        </div>)}
                    </div>
                  </div>;
            })()}

              {!isOwner && cu.role === "investor" && (() => {
              const fit = matchBetween(cu.id, project.id);
              if (!fit) return null;
              return <div className={`${card} mb-4`}>
                    <h2 className={cardTitle}>
                      <span><Target className="w-4 h-4 text-blue-700" /> </span>
                      <span>Your fit with this round</span>
                      <FitBadge score={fit.score} />
                    </h2>
                    <MatchPills reasons={fit.reasons} gaps={fit.gaps} />
                  </div>;
            })()}

              <div className="grid lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2 space-y-4">
                  <div className={card}>
                    <h2 className={cardTitle}><FileText className="w-4 h-4 text-blue-700" /> The pitch</h2>
                    <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">{project.description || "No description yet."}</p>
                    {project.liveLink && <a href={project.liveLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm text-blue-700 font-semibold hover:underline mt-3">
                        <Globe className="w-4 h-4" /> {project.liveLink.replace(/^https?:\/\//, "")}
                      </a>}
                  </div>

                  {(() => {
                  // In-house pitch analysis: the server reads the founder's own words and
                  // the platform's own records, so a suggestion never invents a fact.
                  const review = pitchReview && pitchReview.projectId === project.id ? pitchReview.data : null;
                  const summary = projectSummary && projectSummary.projectId === project.id ? projectSummary.data : null;
                  const tone = !review ? "" : review.verdict === "strong" ? "bg-emerald-100 text-emerald-700" : review.verdict === "workable" ? "bg-blue-100 text-blue-700" : "bg-amber-100 text-amber-700";
                  return <div className={card}>
                        <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
                          <h2 className={cardTitleTight}><Sparkles className="w-4 h-4 text-blue-700" /> Pitch intelligence</h2>
                          <div className="flex gap-1.5">
                            <button onClick={() => runPitchReview(project.id)} disabled={pitchBusy} className="text-xs px-3 py-1.5 bg-blue-700 hover:bg-blue-800 disabled:opacity-60 text-white rounded-lg font-semibold transition-colors">
                              {pitchBusy ? t("Analysing…") : t("Review pitch")}
                            </button>
                            <button onClick={() => runProjectSummary(project.id)} disabled={summaryBusy} className="text-xs px-3 py-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600 font-semibold transition-colors disabled:opacity-60">
                              {summaryBusy ? t("Reading the record…") : t("Project summary")}
                            </button>
                          </div>
                        </div>
                        <p className="text-xs text-slate-400">{t("VentureLink's own checker reads this pitch against the project's records. Nothing is sent to a third-party model.")}</p>
                        {aiError && <p className="text-xs text-rose-600 mt-2">{aiError}</p>}
                        {review && <div className="bg-slate-50 rounded-xl p-3 mt-3">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">{t("Pitch score")}</span>
                            <span className="text-sm font-bold text-slate-900">{review.score}<span className="text-slate-400 font-normal">/100</span></span>
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${tone}`}>{review.verdict[0].toUpperCase() + review.verdict.slice(1)}</span>
                          </div>
                          <div className="w-full bg-slate-200 rounded-full overflow-hidden my-2" style={{
                        height: "8px"
                      }}>
                            <div className="bg-blue-700 rounded-full" style={{
                        width: `${review.score}%`,
                        height: "8px",
                        transition: "width 0.4s ease"
                      }} />
                          </div>
                          {review.strengths.length > 0 && <>
                              <p className="text-[11px] font-bold text-slate-500 mb-1">{t("What works")}</p>
                              <MatchPills reasons={review.strengths} gaps={[]} />
                            </>}
                          {review.gaps.length > 0 && <div className="mt-2.5">
                              <p className="text-[11px] font-bold text-slate-500 mb-1">{t("What to strengthen")}</p>
                              <MatchPills reasons={[]} gaps={review.gaps} />
                            </div>}
                          {review.rewrite && <div className="mt-3 pt-3 border-t border-slate-200">
                              <div className="flex items-center justify-between gap-2">
                                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">{t("Suggested rewrite")}</p>
                                <button onClick={() => {
                              navigator.clipboard?.writeText(review.rewrite).catch(() => {});
                              notify(t("Copied"), t("The suggested pitch is on your clipboard."));
                            }} className="text-[11px] px-2.5 py-1 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600 font-semibold transition-colors">{t("Copy")}</button>
                              </div>
                              <p className="text-sm text-slate-700 leading-relaxed mt-1.5">{review.rewrite}</p>
                              <p className="text-[11px] text-slate-400 mt-1.5">{t("Built only from this founder's own sentences and recorded platform data.")}</p>
                            </div>}
                        </div>}
                        {summary && <div className="bg-slate-50 rounded-xl p-3 mt-3">
                          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">{t("One-line summary")}</p>
                          <p className="text-sm font-semibold text-slate-900 mt-1">{summary.oneLiner}</p>
                          <p className="text-sm text-slate-600 leading-relaxed mt-2">{summary.paragraph}</p>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-3">
                            {summary.facts.map(f => <div key={f.label} className="bg-white rounded-lg p-2">
                                <p className="text-[11px] text-slate-400">{f.label}</p>
                                <p className="text-sm font-bold text-slate-900">{f.value}</p>
                              </div>)}
                          </div>
                          {summary.keywords.length > 0 && <div className="flex flex-wrap items-center gap-1.5 mt-3">
                              <span className="text-[11px] font-bold text-slate-500">{t("Keywords")}</span>
                              {summary.keywords.map(k => <span key={k} className="text-[11px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-semibold">{k}</span>)}
                            </div>}
                        </div>}
                      </div>;
            })()}

                  <div className={card}>
                    <div className="flex items-center justify-between gap-2 mb-3 flex-wrap">
                      <h2 className={cardTitleTight}><Layers className="w-4 h-4 text-blue-700" /> Milestones ({ms.done}/{ms.total})</h2>
                      {canEdit && <button onClick={() => addMilestone(project.id)} className="text-xs px-3 py-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600 font-semibold transition-colors flex items-center gap-1">
                          <Plus className="w-3.5 h-3.5" /> Add milestone
                        </button>}
                    </div>
                    {ms.total > 0 && <div className="w-full bg-slate-100 rounded-full overflow-hidden mb-3" style={{
                    height: "8px"
                  }}>
                        <div className="bg-blue-700 rounded-full" style={{
                      width: `${ms.pct}%`,
                      height: "8px",
                      transition: "width 0.4s ease"
                    }} />
                      </div>}
                    {milestones.length === 0 ? <p className="text-sm text-slate-400">No milestones recorded yet.</p> : <div className="space-y-2">
                        {milestones.map((m, idx) => <div key={idx} className="flex items-start gap-3 border border-slate-100 rounded-xl p-3">
                            <button type="button" onClick={() => canEdit && updateMilestone(project.id, idx, {
                          done: !m.done
                        })} className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${m.done ? "bg-emerald-500 border-emerald-500 text-white" : "border-slate-200 text-transparent"} ${canEdit ? "hover:border-emerald-400" : "cursor-default"}`}>
                              <Check className="w-3 h-3" />
                            </button>
                            <div className="flex-1 min-w-0">
                              {canEdit ? <input value={m.title || ""} onChange={e => updateMilestone(project.id, idx, {
                          title: e.target.value
                        })} placeholder="Milestone title" className="w-full px-2 py-1 border border-slate-200 rounded-lg text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white" /> : <p className={`text-sm font-semibold ${m.done ? "text-slate-400 line-through" : "text-slate-900"}`}>{m.title || "Untitled milestone"}</p>}
                              {canEdit ? <input value={m.note || ""} onChange={e => updateMilestone(project.id, idx, {
                          note: e.target.value
                        })} placeholder="Outcome, metric or date" className="w-full mt-1.5 px-2 py-1 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white" /> : m.note && <p className="text-xs text-slate-500 mt-1">{m.note}</p>}
                            </div>
                            {canEdit && <button onClick={() => removeMilestone(project.id, idx)} className="p-1.5 border border-slate-200 rounded-lg hover:bg-rose-50 hover:border-rose-200 text-slate-400 hover:text-rose-600 transition-colors flex-shrink-0">
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>}
                          </div>)}
                      </div>}
                  </div>

                  <div className={card}>
                    <div className="flex items-center justify-between gap-2 mb-3 flex-wrap">
                      <h2 className={cardTitleTight}><Users className="w-4 h-4 text-blue-700" /> Team ({team.length})</h2>
                      {canEdit && <button onClick={() => addTeamMember(project.id)} className="text-xs px-3 py-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600 font-semibold transition-colors flex items-center gap-1">
                          <Plus className="w-3.5 h-3.5" /> Add member
                        </button>}
                    </div>
                    {team.length === 0 ? <p className="text-sm text-slate-400">No team members listed yet.</p> : <div className="grid md:grid-cols-2 gap-3">
                        {team.map((m, idx) => <div key={idx} className={`border border-slate-100 rounded-xl p-3 flex items-start gap-3 ${canEdit ? "" : ""}`}>
                            <span className="w-9 h-9 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center flex-shrink-0 text-sm font-bold">{getInitials(m.name || m.role || "?")}</span>
                            <div className="flex-1 min-w-0">
                              {canEdit ? <>
                                  <input value={m.name || ""} onChange={e => updateTeamMember(project.id, idx, {
                              name: e.target.value
                            })} placeholder="Full name" className="w-full px-2 py-1 border border-slate-200 rounded-lg text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white" />
                                  <input value={m.role || ""} onChange={e => updateTeamMember(project.id, idx, {
                              role: e.target.value
                            })} placeholder="Role" className="w-full mt-1.5 px-2 py-1 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white" />
                                  <input value={m.note || ""} onChange={e => updateTeamMember(project.id, idx, {
                              note: e.target.value
                            })} placeholder="One line about them" className="w-full mt-1.5 px-2 py-1 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white" />
                                </> : <>
                                  <p className="text-sm font-semibold text-slate-900 truncate">{m.name || "Team member"}</p>
                                  {m.role && <p className="text-xs text-slate-500 truncate">{m.role}</p>}
                                  {m.note && <p className="text-xs text-slate-400 mt-1">{m.note}</p>}
                                </>}
                            </div>
                            {canEdit && <button onClick={() => removeTeamMember(project.id, idx)} className="p-1.5 border border-slate-200 rounded-lg hover:bg-rose-50 hover:border-rose-200 text-slate-400 hover:text-rose-600 transition-colors flex-shrink-0">
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>}
                          </div>)}
                      </div>}
                  </div>

                  <div className={card}>
                    <div className="flex items-center justify-between gap-2 mb-3 flex-wrap">
                      <h2 className={cardTitleTight}><Paperclip className="w-4 h-4 text-blue-700" /> Documents ({documents.length + (project.fileDataUrl ? 1 : 0)})</h2>
                      {canEdit && <label className="text-xs px-3 py-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600 font-semibold transition-colors cursor-pointer flex items-center gap-1">
                          <Plus className="w-3.5 h-3.5" /> Upload document
                          <input type="file" className="hidden" onChange={e => {
                        attachProjectDocument(project.id, e.target.files && e.target.files[0]);
                        e.target.value = "";
                      }} />
                        </label>}
                    </div>
                    {project.fileName && project.fileDataUrl && <div className="flex items-center gap-3 border border-slate-100 rounded-xl p-3 mb-2">
                        <span className="w-9 h-9 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center flex-shrink-0"><FileText className="w-4 h-4" /></span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-slate-900 truncate">{project.fileName}</p>
                          <p className="text-xs text-slate-400">Pitch deck</p>
                        </div>
                        <a href={project.fileDataUrl} download={project.fileName} className="text-xs px-3 py-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600 font-semibold transition-colors flex-shrink-0">Download</a>
                      </div>}
                    {documents.length === 0 && !project.fileName && <p className="text-sm text-slate-400">No documents shared yet.</p>}
                    <div className="space-y-2">
                      {documents.map((d, idx) => <div key={idx} className="flex items-center gap-3 border border-slate-100 rounded-xl p-3">
                          <span className="w-9 h-9 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center flex-shrink-0"><FileText className="w-4 h-4" /></span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-slate-900 truncate">{d.name}</p>
                            <p className="text-xs text-slate-400">{fileSizeLabel(d.size)}{d.at && <> · {formatAgo(d.at)}</>}</p>
                          </div>
                          <a href={d.dataUrl} download={d.name} className="text-xs px-3 py-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600 font-semibold transition-colors flex-shrink-0">Download</a>
                          {canEdit && <button onClick={() => removeProjectDocument(project.id, idx)} className="p-1.5 border border-slate-200 rounded-lg hover:bg-rose-50 hover:border-rose-200 text-slate-400 hover:text-rose-600 transition-colors flex-shrink-0">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>}
                        </div>)}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className={card}>
                    <h2 className={cardTitle}><Wallet className="w-4 h-4 text-blue-700" /> Funding</h2>
                    {required > 0 ? <>
                        <FundingProgressBar required={required} received={received} />
                        <div className="grid grid-cols-2 gap-2 mt-3">
                          <div className="text-center bg-slate-50 rounded-xl py-3">
                            <div className="text-xl font-bold text-slate-900">{backers.length}</div>
                            <div className="text-xs text-slate-500">Backers</div>
                          </div>
                          <div className="text-center bg-slate-50 rounded-xl py-3">
                            <div className="text-xl font-bold text-slate-900">{pctFunded}%</div>
                            <div className="text-xs text-slate-500">Funded</div>
                          </div>
                        </div>
                      </> : <p className="text-sm text-slate-400">No funding target set.</p>}
                    {backers.length > 0 && <div className="mt-3 pt-3 border-t border-slate-100 space-y-2">
                        {backers.map(inv => {
                      const investor = users.find(u => u.id === inv.investorId);
                      if (!investor) return null;
                      return <div key={inv.id} className="flex items-center gap-2">
                              <UserAvatar user={investor} size="xs" />
                              <span className="text-xs font-semibold text-slate-700 truncate flex-1">{investor.name}</span>
                              <span className="text-xs text-slate-400 truncate">{investor.company}</span>
                              <span className="text-xs font-bold text-emerald-700 flex-shrink-0">${inv.amount.toLocaleString()}</span>
                            </div>;
                    })}
                      </div>}
                  </div>

                  <div className={card}>
                    <h2 className={cardTitle}><BarChart className="w-4 h-4 text-blue-700" /> Analytics</h2>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="text-center bg-slate-50 rounded-xl py-3">
                        <div className="text-xl font-bold text-slate-900">{visits.length}</div>
                        <div className="text-xs text-slate-500">Views</div>
                      </div>
                      <div className="text-center bg-slate-50 rounded-xl py-3">
                        <div className="text-xl font-bold text-slate-900">{visitorIds.length}</div>
                        <div className="text-xs text-slate-500">Visitors</div>
                      </div>
                      <div className="text-center bg-slate-50 rounded-xl py-3">
                        <div className="text-xl font-bold text-slate-900">{projectProposals.length}</div>
                        <div className="text-xs text-slate-500">Proposals</div>
                      </div>
                      <div className="text-center bg-slate-50 rounded-xl py-3">
                        <div className="text-xl font-bold text-slate-900">{ms.pct}%</div>
                        <div className="text-xs text-slate-500">Milestones</div>
                      </div>
                    </div>
                    {interest.length > 0 && <div className="mt-4">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Who is looking</p>
                        <div className="space-y-1.5">
                          {interest.map(x => <div key={x.role} className="flex items-center gap-2">
                              <span className="text-xs text-slate-600 w-24 truncate">{ROLE_LABELS[x.role] || x.role}</span>
                              <span className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                                <span className="block h-2 bg-blue-600 rounded-full" style={{
                              width: `${Math.round(x.count / visitorIds.length * 100)}%`
                            }} />
                              </span>
                              <span className="text-xs font-bold text-slate-700 w-4 text-right">{x.count}</span>
                            </div>)}
                        </div>
                      </div>}
                    <p className="text-xs text-slate-400 mt-3">{visits.length ? <>Last viewed {formatAgo(visits[visits.length - 1].at)}</> : "No views recorded yet."}</p>
                  </div>

                  <div className={card}>
                    <h2 className={cardTitle}><Target className="w-4 h-4 text-blue-700" /> Open requirements</h2>
                    {linkedRequirements.length === 0 ? <p className="text-sm text-slate-400">No investor requirements match this project yet.</p> : <div className="space-y-2">
                        {linkedRequirements.slice(0, 4).map(r => {
                      const reqInvestor = users.find(u => u.id === r.investorId);
                      return <div key={r.id} className="border border-slate-100 rounded-xl p-3">
                              <p className="text-sm font-semibold text-slate-900 truncate">{r.title}</p>
                              <p className="text-xs text-slate-400 truncate">{reqInvestor ? `${reqInvestor.name}${r.budgetRange ? ` · ${r.budgetRange}` : ""}` : r.budgetRange}</p>
                            </div>;
                    })}
                      </div>}
                  </div>

                  <div className={card}>
                    <h2 className={cardTitle}><ShieldCheck className="w-4 h-4 text-blue-700" /> Patent</h2>
                    {project.patented ? <>
                        <p className="text-sm text-slate-600">{project.patentNumber ? <>Patent number {project.patentNumber}</> : "The founder claims a patent for this project."}</p>
                        {project.noveltyStatus && <p className={`text-xs font-semibold mt-2 ${project.noveltyStatus === "cleared" ? "text-emerald-700" : project.noveltyStatus === "flagged" ? "text-rose-700" : "text-amber-700"}`}>{project.noveltyStatus === "cleared" ? t("Novelty cleared") : project.noveltyStatus === "flagged" ? t("Novelty flagged") : t("Novelty pending")}</p>}
                        {project.patentProofName && <a href={project.patentProofDataUrl} download={project.patentProofName} className="inline-flex items-center gap-1.5 text-xs text-blue-700 font-semibold hover:underline mt-2">
                            <Paperclip className="w-3.5 h-3.5" /> {project.patentProofName}
                          </a>}
                      </> : <p className="text-sm text-slate-400">No patent claimed for this project.</p>}
                    {project.patented && <button onClick={() => openVerificationReport(project.id)} disabled={reportBusy} className="mt-3 w-full text-sm py-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-60 text-white rounded-xl font-semibold transition-colors flex items-center justify-center gap-1.5">
                        <FileText className="w-4 h-4" /> {reportBusy ? t("Building report…") : t("Verification report")}
                      </button>}
                    <button onClick={() => openPatentBot(project.id, null)} className="mt-2 w-full text-sm py-2 border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-700 font-semibold transition-colors">
                      Run PatentBot check
                    </button>
                  </div>
                </div>
              </div>
            </div>;
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
            <ProfileView user={viewUser} isOwnProfile={false} onEdit={() => {}} onConnect={() => sendConnectionRequest(viewUser.id)} onMessage={() => openMessage(viewUser.id)} connectionStatus={status} matchScore={showMatch ? calcMatchScore(cu, viewUser) : undefined} avgRating={getAvgRating(viewUser.id)} reviewCount={viewedReviews.length} reviewsList={viewedReviews} ownedProjects={viewedProjects} onFollow={() => toggleFollow(viewUser.id)} isFollowing={(cu.following || []).includes(viewUser.id)} followingCount={(viewUser.following || []).length} followerCount={(viewUser.followers || []).length} />

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
          <ThemePicker />
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
          const botReport = noveltyReport && noveltyReport.projectId === patentBotProjectId ? noveltyReport.data : null;
          const bandLabel = b => b === "duplicate risk" ? t("Duplicate risk") : b === "manual review" ? t("Needs manual review") : t("Below threshold");
          return <>
                <div className="flex-1 overflow-y-auto bg-slate-50 p-4 space-y-2.5">
                  {patentBotLog.length === 0 && <p className="text-xs text-slate-400 text-center pt-8">Ask me to verify a patent, or press “Run novelty check”.{!botProj && " Open me from a patented proposal under Requirements to pick a project."}</p>}
                  {patentBotLog.map((m, i) => <div key={i} className={`flex ${m.from === "user" ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-xs leading-relaxed ${m.from === "user" ? "bg-blue-700 text-white rounded-br-md" : "bg-white border border-slate-200 text-slate-700 rounded-bl-md"}`}>{m.text}</div>
                      </div>)}
                  {botReport && botReport.priorArt.length > 0 && <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-md p-3">
                      <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1">{t("Similarity analysis")}</p>
                      <p className="text-[10px] text-slate-400 mb-2">{t("Closest work already on the registry, word by word:")}</p>
                      {botReport.priorArt.slice(0, 5).map(r => <div key={r.id} className="py-1.5 border-t border-slate-100">
                            <div className="flex items-center gap-1.5">
                              <span className="text-[11px] font-bold text-slate-800 truncate flex-1">{r.title}</span>
                              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${r.similarity >= botReport.registry.duplicateAt ? "bg-rose-50 text-rose-700" : r.similarity >= botReport.registry.reviewAt ? "bg-amber-50 text-amber-700" : "bg-slate-100 text-slate-500"}`}>{r.similarity}%</span>
                            </div>
                            <p className="text-[10px] text-slate-400 mt-0.5">
                              <span>{t("Matched on")}</span> <span className="font-semibold text-slate-500">{r.matchedOn}</span> · <span className={`capitalize ${r.band === "duplicate risk" ? "text-rose-600 font-semibold" : "text-slate-500"}`}>{bandLabel(r.band)}</span>
                            </p>
                            {r.shared.length > 0 && <div className="flex flex-wrap gap-1 mt-1">{r.shared.map(w => <span key={w} className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-500">{w}</span>)}</div>}
                          </div>)}
                    </div>}
                  {patentBotBusy && <div className="flex justify-start"><div className="bg-white border border-slate-200 rounded-2xl rounded-bl-md px-3.5 py-2 text-xs text-slate-400">Screening…</div></div>}
                  <div ref={patentBotEndRef} />
                </div>
                {botProj && <div className="px-4 py-2.5 border-t border-slate-100 bg-slate-50 flex-shrink-0">
                    <p className="text-[11px] text-slate-400 truncate mb-1.5">In context: <span className="font-semibold text-slate-600">{botProj.title}</span>{botProj.patentNumber && <span className="text-slate-400"> · Patent No. {botProj.patentNumber}</span>}</p>
                    <button onClick={runPatentNoveltyCheck} disabled={patentBotBusy} className="w-full bg-blue-700 hover:bg-blue-800 disabled:opacity-50 text-white text-xs font-bold py-2 rounded-xl transition-colors">
                      {patentBotBusy ? "Screening…" : "Run novelty check"}
                    </button>
                    <button onClick={() => openVerificationReport(botProj.id)} disabled={reportBusy} className="w-full mt-1.5 bg-white hover:bg-slate-100 disabled:opacity-60 border border-slate-200 text-slate-700 text-xs font-bold py-2 rounded-xl transition-colors flex items-center justify-center gap-1.5">
                      <FileText className="w-3.5 h-3.5" /> {reportBusy ? t("Building report…") : t("Verification report")}
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

      {/* PatentBot verification report — printable record of a screening run */}
      {reportOpen && noveltyReport && (() => {
        const rep = noveltyReport.data;
        const res = r => r === "pass" ? t("Pass") : r === "warn" ? t("Caution") : t("Fail");
        const tone = r => r === "pass" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : r === "warn" ? "bg-amber-50 text-amber-700 border-amber-200" : "bg-rose-50 text-rose-700 border-rose-200";
        const statusLabel = s => s === "cleared" ? t("Novelty cleared") : s === "review" ? t("Novelty needs manual review") : t("Novelty flagged");
        return <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center z-50 p-4" onClick={() => setReportOpen(false)}>
            <div data-print-report="1" className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              <div className="bg-slate-900 px-5 py-4 flex items-start gap-3">
                <span className="w-9 h-9 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0"><ShieldCheck className="w-5 h-5 text-white" /></span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-white leading-tight">{t("Patent novelty verification report")}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    <span>{t("Report")}</span> {rep.id}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    <span>{t("Generated")}</span> {new Date(rep.generatedAt).toLocaleString(lang)}
                  </p>
                </div>
                <button onClick={() => setReportOpen(false)} className="text-slate-400 hover:text-white p-1 transition-colors report-actions"><X className="w-4 h-4" /></button>
              </div>

              <div className="p-5 space-y-5">
                <div>
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">{t("Subject")}</h3>
                  <div className="grid sm:grid-cols-2 gap-2">
                    {[["Project", rep.subject.title], ["Sector", rep.subject.industry], ["Founder", rep.subject.founder], ["Company", rep.subject.company], ["Patent number", rep.subject.patentNumber], ["Proof document", rep.subject.patentProofName]].filter(x => x[1]).map(x => <div key={x[0]} className="bg-slate-50 rounded-lg px-3 py-2">
                          <p className="text-[11px] text-slate-400">{t(x[0])}</p>
                          <p className="text-sm font-semibold text-slate-900 break-words">{x[1]}</p>
                        </div>)}
                  </div>
                </div>

                <div>
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">{t("Verdict")}</h3>
                  <div className="bg-slate-50 rounded-xl p-3 flex items-center gap-3 flex-wrap">
                    <div>
                      <p className="text-[11px] text-slate-400">{t("Novelty score")}</p>
                      <p className="text-2xl font-bold text-slate-900">{rep.score}<span className="text-sm font-normal text-slate-400">/100</span></p>
                    </div>
                    <span className={`text-xs font-bold px-3 py-1.5 rounded-full border capitalize ${rep.status === "cleared" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : rep.status === "review" ? "bg-amber-50 text-amber-700 border-amber-200" : "bg-rose-50 text-rose-700 border-rose-200"}`}>{statusLabel(rep.status)}</span>
                    <div className="min-w-0">
                      <p className="text-[11px] text-slate-400">{t("Investment gate")}</p>
                      <p className="text-sm font-semibold text-slate-800">{rep.verified ? t("Investing unlocked") : t("Investing locked")}</p>
                    </div>
                  </div>
                  {rep.blockedBy.length > 0 && <p className="text-xs text-rose-700 mt-2">
                      <span>{t("Blocked by")}</span> {rep.blockedBy.map(k => k === "number" ? t("the patent number / proof of filing") : k === "proof" ? t("the missing proof document") : t("prior-art overlap")).join(", ")}
                    </p>}
                </div>

                <div>
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">{t("Checks")}</h3>
                  <div className="space-y-1.5">
                    {rep.checks.map(c => <div key={c.label} className="flex items-start gap-2 border border-slate-100 rounded-lg px-3 py-2">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border flex-shrink-0 mt-0.5 ${tone(c.result)}`}>{res(c.result)}</span>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-semibold text-slate-800">{c.label}</p>
                            {c.note && <p className="text-[11px] text-slate-500 mt-0.5">{c.note}</p>}
                          </div>
                          {c.value !== "" && c.value != null && <span className="text-[11px] font-semibold text-slate-500 flex-shrink-0 mt-0.5 max-w-[45%] break-words text-right">{c.label === "Lifecycle stage" ? lifecycleLabel(c.value) : c.value}</span>}
                        </div>)}
                  </div>
                </div>

                <div>
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">{t("Prior-art analysis")}</h3>
                  <p className="text-[11px] text-slate-400 mb-2">
                    <span>{t("Compared against")}</span> <span className="font-semibold text-slate-600">{rep.registry.poolSize}</span>{' '}
                    <span>{t("other projects on the registry, of which")}</span> <span className="font-semibold text-slate-600">{rep.registry.patentedInPool}</span>{' '}
                    <span>{t("claim a patent. Duplicate risk starts at")}</span> <span className="font-semibold text-slate-600">{rep.registry.duplicateAt}%</span>,{' '}
                    <span>{t("manual review at")}</span> <span className="font-semibold text-slate-600">{rep.registry.reviewAt}%</span>.
                  </p>
                  {rep.priorArt.length === 0 ? <p className="text-xs text-slate-500 bg-slate-50 rounded-lg px-3 py-2">{t("No other registered project shares enough claim language to be cited as prior art.")}</p> : <div className="space-y-1.5">
                      {rep.priorArt.map(r => <div key={r.id} className="border border-slate-100 rounded-lg px-3 py-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-800 truncate flex-1">{r.title}</span>
                            <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${r.similarity >= rep.registry.duplicateAt ? "bg-rose-50 text-rose-700" : r.similarity >= rep.registry.reviewAt ? "bg-amber-50 text-amber-700" : "bg-slate-100 text-slate-600"}`}>{r.similarity}%</span>
                          </div>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            <span>{t("Matched on")}</span> <span className="font-semibold text-slate-500">{r.matchedOn}</span> · <span className="capitalize">{r.industry}</span>
                            {r.patented && <> · <span>{t("patented")}</span></>}
                          </p>
                          {r.shared.length > 0 && <p className="text-[11px] text-slate-400 mt-1">
                              <span>{t("Shared claim terms")}</span>: <span className="text-slate-600">{r.shared.join(", ")}</span>
                            </p>}
                        </div>)}
                    </div>}
                </div>

                <div>
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">{t("Screening notes")}</h3>
                  <ul className="space-y-1.5">
                    {rep.reasons.map((r, i) => <li key={i} className="flex items-start gap-2 text-xs text-slate-600">
                          <span className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${r.level === "pass" ? "bg-emerald-500" : r.level === "warn" ? "bg-amber-500" : r.level === "fail" ? "bg-rose-500" : "bg-slate-300"}`} />
                          <span>{r.text}</span>
                        </li>)}
                  </ul>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                  <h3 className="text-xs font-bold text-amber-800 uppercase tracking-wide mb-1.5">{t("What this report does not say")}</h3>
                  <ul className="space-y-1.5">
                    {rep.limits.map((l, i) => <li key={i} className="text-[11px] text-amber-900 leading-relaxed">{l}</li>)}
                  </ul>
                </div>

                {rep.screenedBy && <p className="text-[11px] text-slate-400">
                    <span>{t("Screened by")}</span> <span className="font-semibold text-slate-600">{rep.screenedBy.name}</span> <span>({ROLE_LABELS[rep.screenedBy.role] || rep.screenedBy.role})</span>
                  </p>}

                <div className="flex gap-2 flex-wrap report-actions">
                  <button onClick={printNoveltyReport} className="text-sm px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-xl font-semibold transition-colors flex items-center gap-1.5">
                    <Printer className="w-4 h-4" /> {t("Print report")}
                  </button>
                  <button onClick={downloadNoveltyReport} className="text-sm px-4 py-2 border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-700 font-semibold transition-colors flex items-center gap-1.5">
                    <Download className="w-4 h-4" /> {t("Download")}
                  </button>
                  <button onClick={() => setReportOpen(false)} className="text-sm px-4 py-2 border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-700 font-semibold transition-colors">
                    {t("Close")}
                  </button>
                </div>
              </div>
            </div>
          </div>;
      })()}

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
      {successNotice && (() => {
      const notice = typeof successNotice === "string" ? {
        text: successNotice
      } : successNotice;
      return <div className="fixed bottom-6 left-6 z-50 flex items-start gap-2.5 bg-white border border-emerald-200 shadow-2xl text-emerald-700 pl-4 pr-3 py-3 rounded-2xl max-w-sm">
              <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                {notice.title && <p className="text-sm font-bold leading-snug">{notice.title}</p>}
                <p className={`${notice.title ? "text-xs" : "text-sm"} font-semibold leading-snug ${notice.title ? "text-emerald-600 mt-0.5" : ""}`}>{notice.text}{notice.entity && <>&nbsp;{notice.entity}</>}</p>
              </div>
              <button onClick={() => setSuccessNotice("")} className="text-emerald-400 hover:text-emerald-700 p-0.5 flex-shrink-0"><X className="w-4 h-4" /></button>
            </div>;
    })()}

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