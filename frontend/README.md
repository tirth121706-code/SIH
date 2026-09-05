# ABHAYA — Frontend (UI Prototype)

Intelligent Hazard & Vulnerability Assessment System — frontend prototype.

This folder now works two ways, side by side:

## Option A — Vite + React (recommended)
```bash
cd abhaya-frontend
npm install
npm run dev
# open the local URL Vite prints (usually http://localhost:5173)
```
Build for production: `npm run build` (outputs to `dist/`), preview with `npm run preview`.

This mode is powered by `src/main.jsx` and `src/App.jsx`. **App.jsx is a direct
JSX conversion of the original markup** — same classes, ids, text and
structure, just written for React. It reuses the original, unmodified
`css/style.css` and `js/script.js` (imported as-is), so the look and every
interaction (view switching, table filters, search, the live India map)
are identical to the static version.

## Option B — Static, no build step
```bash
open index.static.html      # or double-click it
```
This is the original prototype file, untouched, kept exactly as it was
before React/Vite were added — useful if you just want to preview the UI
with zero setup.

## Structure
```
abhaya-frontend/
├── index.html          → Vite entry point (mounts React into #root)
├── index.static.html    → original, unmodified static prototype (open directly, no build)
├── src/
│   ├── main.jsx          → React entry; imports the ORIGINAL css/style.css and js/script.js
│   └── App.jsx           → JSX conversion of the original markup (no design changes)
├── css/style.css         → unchanged — same design tokens & component styles as before
├── js/script.js          → unchanged — same view switching / filters / map logic as before
├── assets/               → reserved for icons / exported map tiles
├── package.json          → Vite + React dependencies and scripts
├── vite.config.js        → Vite config (@vitejs/plugin-react)
└── README.md
```

See **ABHAYA_Frontend_Documentation.pdf** (outside this folder) for the full design
process, rationale, and a presentation Q&A prep sheet.
