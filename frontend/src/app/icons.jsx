// Local, dependency-free line icons (plain SVG + React only — no icon library).
// Each icon is a small React function component accepting an optional className,
// styled to match the app's 24x24 stroke-based icon look.

const base = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round"
};
export function Home({
  className
}) {
  return <svg {...base} className={className}>
      <path d="M4 11.5 12 4l8 7.5" />
      <path d="M6 10v9a1 1 0 0 0 1 1h3v-6h4v6h3a1 1 0 0 0 1-1v-9" />
    </svg>;
}
export function Search({
  className
}) {
  return <svg {...base} className={className}>
      <circle cx="11" cy="11" r="7" />
      <line x1="21" y1="21" x2="16.2" y2="16.2" />
    </svg>;
}
export function Users({
  className
}) {
  return <svg {...base} className={className}>
      <circle cx="9" cy="8" r="3.2" />
      <path d="M3.5 20a5.5 5.5 0 0 1 11 0" />
      <path d="M16 8.2a3 3 0 1 1 1.1 5.8" />
      <path d="M15.5 14.5c2.6.3 4.7 2.2 5 5.5" />
    </svg>;
}
export function MessageCircle({
  className
}) {
  return <svg {...base} className={className}>
      <path d="M12 3a9 9 0 0 1 8.9 7.7A9 9 0 0 1 12 21a8.9 8.9 0 0 1-4.3-1.1L4 21l1.3-3.7A9 9 0 0 1 12 3z" />
    </svg>;
}
export function Video({
  className
}) {
  return <svg {...base} className={className}>
      <rect x="3" y="6" width="12" height="12" rx="2" />
      <path d="M15 10.5 21 7v10l-6-3.5z" />
    </svg>;
}
export function User({
  className
}) {
  return <svg {...base} className={className}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21a8 8 0 0 1 16 0" />
    </svg>;
}
export function LogOut({
  className
}) {
  return <svg {...base} className={className}>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>;
}
export function Plus({
  className
}) {
  return <svg {...base} className={className}>
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>;
}
export function Send({
  className
}) {
  return <svg {...base} className={className}>
      <path d="M22 2 11 13" />
      <path d="M22 2 15 22l-4-9-9-4z" />
    </svg>;
}
export function X({
  className
}) {
  return <svg {...base} className={className}>
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>;
}
export function Check({
  className
}) {
  return <svg {...base} className={className}>
      <polyline points="20 6 9 17 4 12" />
    </svg>;
}
export function MapPin({
  className
}) {
  return <svg {...base} className={className}>
      <path d="M12 22s7-6.2 7-12a7 7 0 1 0-14 0c0 5.8 7 12 7 12z" />
      <circle cx="12" cy="10" r="2.4" />
    </svg>;
}
export function Edit2({
  className
}) {
  return <svg {...base} className={className}>
      <path d="M17 3.5a2.1 2.1 0 0 1 3 3L8 18.5 3 20l1.5-5z" />
    </svg>;
}
export function Save({
  className
}) {
  return <svg {...base} className={className}>
      <path d="M5 3h11l3 3v15H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z" />
      <path d="M8 3v6h8V3" />
      <path d="M7 21v-8h10v8" />
    </svg>;
}
export function Calendar({
  className
}) {
  return <svg {...base} className={className}>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <line x1="3" y1="10" x2="21" y2="10" />
      <line x1="8" y1="3" x2="8" y2="7" />
      <line x1="16" y1="3" x2="16" y2="7" />
    </svg>;
}
export function Globe({
  className
}) {
  return <svg {...base} className={className}>
      <circle cx="12" cy="12" r="9" />
      <ellipse cx="12" cy="12" rx="4" ry="9" />
      <line x1="3" y1="12" x2="21" y2="12" />
    </svg>;
}
export function TrendingUp({
  className
}) {
  return <svg {...base} className={className}>
      <polyline points="3 17 9.5 10.5 14 15 21 8" />
      <polyline points="14 8 21 8 21 15" />
    </svg>;
}
export function Menu({
  className
}) {
  return <svg {...base} className={className}>
      <line x1="4" y1="6" x2="20" y2="6" />
      <line x1="4" y1="12" x2="20" y2="12" />
      <line x1="4" y1="18" x2="20" y2="18" />
    </svg>;
}
export function Bell({
  className
}) {
  return <svg {...base} className={className}>
      <path d="M6 9a6 6 0 0 1 12 0c0 5 2 6.5 2 6.5H4S6 14 6 9z" />
      <path d="M10 19.5a2 2 0 0 0 4 0" />
    </svg>;
}
export function Clock({
  className
}) {
  return <svg {...base} className={className}>
      <circle cx="12" cy="12" r="9" />
      <polyline points="12 7 12 12 16 14" />
    </svg>;
}
export function Zap({
  className
}) {
  return <svg {...base} className={className}>
      <polygon points="13 2 4 14 11 14 10 22 20 9 13 9 13 2" />
    </svg>;
}
export function CheckCircle({
  className
}) {
  return <svg {...base} className={className}>
      <circle cx="12" cy="12" r="9" />
      <polyline points="8.5 12.5 11 15 15.5 9.5" />
    </svg>;
}
export function UserPlus({
  className
}) {
  return <svg {...base} className={className}>
      <circle cx="9" cy="8" r="3.5" />
      <path d="M2.5 20a6.5 6.5 0 0 1 13 0" />
      <line x1="18" y1="8" x2="18" y2="14" />
      <line x1="15" y1="11" x2="21" y2="11" />
    </svg>;
}
export function Building2({
  className
}) {
  return <svg {...base} className={className}>
      <rect x="4" y="3" width="10" height="18" />
      <rect x="14" y="9" width="6" height="12" />
      <line x1="7" y1="7" x2="7" y2="7.01" />
      <line x1="11" y1="7" x2="11" y2="7.01" />
      <line x1="7" y1="11" x2="7" y2="11.01" />
      <line x1="11" y1="11" x2="11" y2="11.01" />
      <line x1="7" y1="15" x2="7" y2="15.01" />
      <line x1="11" y1="15" x2="11" y2="15.01" />
      <line x1="17" y1="13" x2="17" y2="13.01" />
      <line x1="17" y1="17" x2="17" y2="17.01" />
    </svg>;
}
export function Wallet({
  className
}) {
  return <svg {...base} className={className}>
      <path d="M3 7a2 2 0 0 1 2-2h13a1 1 0 0 1 1 1v3" />
      <path d="M3 7v11a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-7a1 1 0 0 0-1-1h-4a2.2 2.2 0 0 0 0 4.4h4" />
    </svg>;
}
export function ChevronLeft({
  className
}) {
  return <svg {...base} className={className}>
      <polyline points="15 18 9 12 15 6" />
    </svg>;
}
export function Briefcase({
  className
}) {
  return <svg {...base} className={className}>
      <rect x="2.5" y="7" width="19" height="13" rx="2" />
      <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <line x1="2.5" y1="13" x2="21.5" y2="13" />
    </svg>;
}
export function DollarSign({
  className
}) {
  return <svg {...base} className={className}>
      <line x1="12" y1="2" x2="12" y2="22" />
      <path d="M17 6.5c0-1.9-2.2-3-5-3s-5 1.1-5 2.8c0 3.6 10 1.7 10 5.7 0 1.7-2.2 2.8-5 2.8s-5-1.1-5-3" />
    </svg>;
}
export function Link2({
  className
}) {
  return <svg {...base} className={className}>
      <path d="M9 15 15 9" />
      <path d="M13 5.5 15 3.5a3.5 3.5 0 0 1 5 5l-2 2" />
      <path d="M11 18.5 9 20.5a3.5 3.5 0 0 1-5-5l2-2" />
    </svg>;
}
export function Star({
  className,
  filled
}) {
  return <svg viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polygon points="12 2.5 15 9.2 22 10.1 17 15 18.2 22 12 18.6 5.8 22 7 15 2 10.1 9 9.2" />
    </svg>;
}
export function ShieldCheck({
  className
}) {
  return <svg {...base} className={className}>
      <path d="M12 2.5 4.5 5.5v6c0 5 3.2 8.3 7.5 10 4.3-1.7 7.5-5 7.5-10v-6z" />
      <polyline points="8.5 12.2 11 14.7 15.5 9.8" />
    </svg>;
}
export function ChevronRight({
  className
}) {
  return <svg {...base} className={className}>
      <polyline points="9 6 15 12 9 18" />
    </svg>;
}
export function Filter({
  className
}) {
  return <svg {...base} className={className}>
      <path d="M3 5h18" />
      <path d="M6 12h12" />
      <path d="M10 19h4" />
    </svg>;
}
export function Trash2({
  className
}) {
  return <svg {...base} className={className}>
      <path d="M3 6h18" />
      <path d="M8 6V4h8v2" />
      <path d="M6 6l1 14h10l1-14" />
      <path d="M10 11v5M14 11v5" />
    </svg>;
}
export function Palette({
  className
}) {
  return <svg {...base} className={className}>
      <path d="M12 3a9 9 0 1 0 0 18c1.7 0 2-.9 1.4-1.7-.6-.8-.3-1.8.6-1.8H16a5 5 0 0 0 5-5c0-5.5-4-9.5-9-9.5Z" />
      <circle cx="7.5" cy="12" r="1" />
      <circle cx="10" cy="8" r="1" />
      <circle cx="14.5" cy="8.5" r="1" />
      <circle cx="16.5" cy="12" r="1" />
    </svg>;
}
export function GraduationCap({
  className
}) {
  return <svg {...base} className={className}>
      <path d="M2.5 9 12 4.5 21.5 9 12 13.5 2.5 9Z" />
      <path d="M6 11v4.5c0 1.4 2.7 2.5 6 2.5s6-1.1 6-2.5V11" />
      <path d="M21.5 9v5" />
    </svg>;
}
export function Award({
  className
}) {
  return <svg {...base} className={className}>
      <circle cx="12" cy="9" r="5.5" />
      <path d="M9 13.8 7.5 21l4.5-2.5L16.5 21 15 13.8" />
    </svg>;
}
export function UserCheck({
  className
}) {
  return <svg {...base} className={className}>
      <path d="M15.5 20v-1.8a4 4 0 0 0-4-4H6.8a4 4 0 0 0-4 4V20" />
      <circle cx="9.2" cy="7.6" r="3.8" />
      <path d="M17 11.5 19.2 14 23.5 9.5" />
    </svg>;
}
export function UserX({
  className
}) {
  return <svg {...base} className={className}>
      <path d="M15.5 20v-1.8a4 4 0 0 0-4-4H6.8a4 4 0 0 0-4 4V20" />
      <circle cx="9.2" cy="7.6" r="3.8" />
      <path d="M17.5 8.5 22 13M22 8.5 17.5 13" />
    </svg>;
}
export function Sparkles({
  className
}) {
  return <svg {...base} className={className}>
      <path d="M11 3.5 12.7 8l4.5 1.7-4.5 1.7L11 15.9 9.3 11.4 4.8 9.7 9.3 8 11 3.5Z" />
      <path d="M18.5 15.5l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8.8-2Z" />
    </svg>;
}
export function Layers({
  className
}) {
  return <svg {...base} className={className}>
      <path d="M12 3.5 21 8l-9 4.5L3 8l9-4.5Z" />
      <path d="M3.5 12.5 12 16.8l8.5-4.3" />
      <path d="M3.5 16.8 12 21l8.5-4.2" />
    </svg>;
}
export function BarChart({
  className
}) {
  return <svg {...base} className={className}>
      <path d="M4 20h16" />
      <path d="M6.5 20v-6M11.5 20V7M16.5 20v-9" />
    </svg>;
}
export function Paperclip({
  className
}) {
  return <svg {...base} className={className}>
      <path d="M20 11.5 12.2 19a4.6 4.6 0 0 1-6.5-6.5l7.6-7.5a3.1 3.1 0 0 1 4.4 4.4L9.8 16.8a1.6 1.6 0 0 1-2.2-2.2l7-7" />
    </svg>;
}
export function FileText({
  className
}) {
  return <svg {...base} className={className}>
      <path d="M14 3.5H7.5A1.5 1.5 0 0 0 6 5v14a1.5 1.5 0 0 0 1.5 1.5h9A1.5 1.5 0 0 0 18 19V7.5L14 3.5Z" />
      <path d="M13.6 3.7V8h4.2" />
      <path d="M9 12.5h6M9 16h6" />
    </svg>;
}
export function Target({
  className
}) {
  return <svg {...base} className={className}>
      <circle cx="12" cy="12" r="8.5" />
      <circle cx="12" cy="12" r="4.5" />
      <circle cx="12" cy="12" r="1" />
    </svg>;
}
export function Printer({
  className
}) {
  return <svg {...base} className={className}>
      <path d="M7 9V4.5h10V9" />
      <path d="M5.5 9h13a1.5 1.5 0 0 1 1.5 1.5v5H17v-2H7v2H4v-5A1.5 1.5 0 0 1 5.5 9Z" />
      <path d="M7 14.5h10V20H7v-5.5Z" />
    </svg>;
}
export function Download({
  className
}) {
  return <svg {...base} className={className}>
      <path d="M12 4v10" />
      <path d="m8 10.5 4 4 4-4" />
      <path d="M5 19h14" />
    </svg>;
}
export function Monitor({
  className
}) {
  return <svg {...base} className={className}>
      <rect x="3" y="4.5" width="18" height="11.5" rx="1.5" />
      <path d="M9 20h6" />
      <path d="M12 16v4" />
    </svg>;
}
export function KeyRound({
  className
}) {
  return <svg {...base} className={className}>
      <circle cx="8.5" cy="15.5" r="4" />
      <path d="M11.4 12.6 20 4" />
      <path d="M16.5 7.5 19 10" />
      <path d="M14 5 16.5 7.5" />
    </svg>;
}
