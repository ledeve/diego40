# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Meme coin portfolio tracker ("Shitcoin Terminal v2.0") hosted on GitHub Pages at **diego40.wtf**. Vite + React 18 + TypeScript + Recharts.

## Commands

```bash
npm run dev        # Start dev server (Vite)
npm run build      # TypeScript check + production build → dist/
npm run preview    # Preview production build locally
```

## Architecture

- **`src/main.tsx`** — Entry point. Mounts `<App />` and initializes vanilla JS enhancements (refresh bar, sparkle trail).
- **`src/App.tsx`** — Main dashboard. Manages all state: prices, loading, sort mode, chart tab. Composes all child components.
- **`src/data/portfolio.ts`** — Hardcoded array of 6 coin holdings (id, units, buy price, colors, chain).
- **`src/utils/prices.ts`** — `fetchPrices()`: tries CoinGecko API live, falls back to `prices.json`.
- **`src/utils/formatters.ts`** — `formatNumber()` and `formatPL()` for display.
- **`src/components/`** — CoinGrid (sort + tiles), CoinTile (flip card), ChartSection (Recharts tabs), HoldingsTable, AnimatedNumber, ParticleCanvas.
- **`src/scripts/refreshBar.ts`** — Vanilla DOM scripts: 60s auto-refresh bar + sparkle cursor trail.
- **`src/styles/`** — `global.css` (fonts, scrollbar, refresh bar styles) + `animations.css` (all @keyframes).
- **`src/types/index.ts`** — TypeScript interfaces: CoinData, EnrichedCoin, PriceResponse, SortMode, ChartTab.

## Data Flow

`portfolio.ts` (static) → `fetchPrices()` → `App` enriches coins via `useMemo` (adds currentPrice, P/L) → passes `EnrichedCoin[]` to child components.

## Deployment

Push to `main` triggers GitHub Actions (`deploy.yml`): installs deps, builds, copies `CNAME` + `prices.json` to `dist/`, deploys to GitHub Pages.

Price updates run on a 6-hour cron (`update-prices.yml`) via `fetch-prices.js` (Node.js), commits `prices.json`, then triggers deploy.

## Static Assets

Images (`diego.png`, `ekipa.png`) live in `public/assets/` — Vite copies them to `dist/assets/` at build time. Reference as `/assets/filename.png`.
