# Online Entrepreneur Network Portal

A React app connecting entrepreneurs, investors, freelancers, startup founders, and mentors — profiles, discovery/search, connections, direct messaging, webinars, portfolios, investments, offer letters, agreements, and more.

## Run locally

```bash
npm install
npm run dev
```

Then open the printed local URL (usually http://localhost:5173).

## Build for production

```bash
npm run build
npm run preview
```

## Tech
- React 18 (hooks: useState, useEffect, useRef) — the only runtime library
- Plain CSS (`src/styles/app.css`) — hand-styled, no CSS framework
- Hand-written inline SVG icons (`src/app/icons.jsx`) — no icon library
- Vite — used only as the local dev server / build tool to compile JSX into browser-ready JavaScript (a bundler is required for any React project; it ships no runtime code of its own into the app)
