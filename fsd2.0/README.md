# WINDOPS — Offshore Wind Farm Operations Platform (Demo)

Static front-end demo of WINDOPS: SCADA-style dashboard, turbines, maintenance work orders, inspections, marine weather windows, vessel tracking, performance analytics, alerts and reports.

**No backend and no database.** All data is hard-coded in `src/data/` and served by an in-memory mock API (`src/services/api.js`). Changes you make in the UI (acknowledging alerts, creating work orders, assigning vessels, generating reports) last until you reload the page.

## Demo logins

All passwords are `windops123`.

| Role | Email |
| --- | --- |
| System Administrator | `admin@windops.io` |
| Operations Manager | `ops@windops.io` |
| Maintenance Engineer | `tech@windops.io` |
| QA / NDT Inspector | `inspector@windops.io` |

The persona switcher in the top bar also lets you swap roles instantly.

## Run locally

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # outputs to dist/
```

## Deploy to Vercel

1. Push this folder to GitHub (repo root = this folder).
2. In Vercel: **Add New → Project**, import the repo.
3. Vercel auto-detects Vite. Leave the defaults (`npm run build`, output `dist`) and deploy.

`vercel.json` already rewrites all routes to `index.html`, so deep links such as `/turbines/WT-024` work on refresh.

## Where the data lives

| File | Contents |
| --- | --- |
| `src/data/turbines.js` | 48 turbines (360 MW fleet), fixed values |
| `src/data/mockData.js` | users, work orders, inspections, vessels, alerts, reports, marine weather |
| `src/services/api.js` | mock API with the same method names and `{ success, data }` shapes as the original REST client |

Dates in the data files are stored as offsets (e.g. "2 days ago") so the demo never looks stale. The live "SCADA feed" polls every 12 s and applies small client-side fluctuations; WT-024, WT-009 and WT-042 are held steady so the demo storyline stays intact.
