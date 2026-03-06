# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Polish Housing Dashboard — a data visualization app showing housing statistics from GUS (Central Statistical Office) and NBP (National Bank of Poland). FastAPI backend + React/TypeScript frontend.

## Development Commands

### Setup (requires Nix)
```bash
nix-shell  # provides Python 3.12, Node.js 20, and all dependencies
```

### Backend
```bash
cd backend && uvicorn main:app --reload  # runs on :8000
```

### Frontend
```bash
cd frontend && npm install && npm run dev    # dev server on :5173
npm run build                                # typecheck + production build
npm run lint                                 # ESLint
npm run preview                              # preview production build
```

The Vite dev server proxies `/api` requests to `localhost:8000`.

## Architecture

**Backend** (`backend/`): FastAPI app with three data clients:
- `gus_client.py` — fetches voivodeship-level housing data from GUS BDL API (variable IDs: 60811 stock, 60572 avg area, 410600 per-1000-pop, 475703 avg rooms, 748601 construction)
- `nbp_client.py` — downloads and parses NBP Excel file for apartment prices across 17 cities
- `cache.py` — file-based cache in `/tmp/dashboard-cache/` with 24h TTL

**Frontend** (`frontend/`): React 19 + TypeScript + Vite + Tailwind CSS 4
- `App.tsx` — main dashboard, loads all data on mount, manages selected metric state
- `api.ts` — typed API client with interfaces for all data shapes
- `PolandMap.tsx` — interactive choropleth map using react-simple-maps + GeoJSON (`src/data/poland-geo.json`)
- `PriceChart.tsx` — Recharts line chart for NBP price trends
- `CityCompare.tsx` — bar chart + table for city price comparison
- `i18n.ts` — i18next config with PL/EN/DE, locale files in `src/locales/`

## i18n

Three languages supported: PL (fallback), EN, DE. All UI strings go through i18next (`useTranslation` hook). Translation files: `frontend/src/locales/{pl,en,de}.json`.

## Git Commits

Always add `pozdrawiam grupke.pl` as the last line of every commit message (before the Co-Authored-By line).
