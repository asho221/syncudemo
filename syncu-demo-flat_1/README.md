# Sync U Health — Product Demo

A deep, clickable walkthrough of the Sync U product across three women's-health
conditions (menopause, PCOS, endometriosis). Built with Next.js, deployable to
Vercel. **All data is synthetic — no backend, no real patient information.**

## What's inside

- **Sign-in** (`/signin`) — a realistic clinician/patient login (NHS, Google SSO, email),
  verifying state, and role selection. Mock, but indistinguishable from real.
- **Clinician workspace** (`/clinician`) — a full triage workspace:
  - a patient *panel* that flags who needs review, sorted by priority
  - a deep per-patient view with tabs: Summary, Symptom trends, Adherence, Patient notes
  - a real **interpretation engine** that computes ranked clinical observations from
    90 days of data — trajectories, the adherence-vs-response question, side-effect
    patterns, data confidence — each shown with its evidence and a confidence level
  - a "Prepare for visit" action
- **Patient app** (`/patient`) — a full mobile app: home screen with streaks and a
  live trend, the daily check flow, a completion screen, a history view, and a
  wearable-connection screen. Toggle between the three conditions to see it adapt.
- **Landing** (`/`) — frames the problem and routes into both sides.

## The interpretation engine

`lib/engine.js` is the core. It's rule-based (explainable, not a black box) and
produces genuinely different clinical conclusions per patient — e.g. "responding
well", "response limited by adherence", or "limited response despite good adherence"
(an action flag). Everything the clinician sees is computed from `lib/data.js`.

## Run locally

```bash
npm install
npm run dev
```
Open http://localhost:3000

## Deploy to Vercel

If you already imported this repo to Vercel: just push and it redeploys. Make sure
in Vercel's project settings: **Framework Preset = Next.js**, and (if your files sit
in a subfolder in the repo) **Root Directory** points at that folder.

From scratch: push to GitHub → vercel.com → New Project → import → Deploy.

## Customising

- **Patients & their data**: `lib/data.js`
- **The analysis logic**: `lib/engine.js`
- **Colours & type**: CSS variables at the top of `app/globals.css`

## Note

Front-end demo for pitching and pilot conversations — no database, stores nothing,
safe to share publicly. A real pilot version (with data storage) would need a
backend and UK GDPR handling for health data, which is a separate build.
