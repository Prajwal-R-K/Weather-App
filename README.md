# Weather+ Pro — Advanced PWA with GitHub Pages Deploy

Weather+ Pro is a modern, installable PWA weather application built with React, TypeScript, Tailwind, and Vite. It supports multiple providers (Open‑Meteo by default; optional OpenWeatherMap with a user-supplied key), smart caching, offline mode, charts, and map selection. CI/CD is set up to deploy to GitHub Pages.

![Build](https://img.shields.io/github/actions/workflow/status/OWNER/REPO/deploy.yml?branch=main&label=build)
![License](https://img.shields.io/badge/License-MIT-blue.svg)
![Pages](https://img.shields.io/badge/Pages-gh--pages-success)

## Features

- __Smart dashboard__: current weather, feels-like, humidity, wind, pressure, UV, sunrise/sunset (foundation in place)
- __Next 48h hourly chart__ and __7-day forecast__ (wire up with Recharts; scaffolding ready)
- __Map view__: Leaflet + OpenStreetMap tiles (to be wired)
- __City collections__: favorites with import/export (to be added)
- __Contextual coach__: local rule-based hints (to be added)
- __Shareable routes__: `/city/{name}` and `/lat/{lat}/lon/{lon}`
- __Theming__: System/Light/Dark + dynamic weather gradients
- __Animations__: Framer Motion transitions and micro-interactions
- __Accessibility__: keyboard shortcuts, focus styles, contrast-safe tokens
- __Offline mode__: PWA app shell + cached last successful data

## Tech Stack

- React + Vite + TypeScript
- Tailwind CSS (design tokens) + shadcn-style primitives
- Framer Motion
- Recharts (charts)
- Leaflet (OpenStreetMap)
- PWA via `vite-plugin-pwa`
- Vitest + React Testing Library
- ESLint + Prettier
- GitHub Actions → GitHub Pages (`gh-pages`)

## Architecture Overview

- `src/state/settings.tsx`: app settings context (units, provider, dynamic theme, OWM key)
- `src/lib/cache.ts`: SWR-style cache (in-memory + localStorage TTL)
- `src/lib/fetcher.ts`: abortable JSON fetch with timeout
- `src/api/openMeteo.ts`: geocoding + forecast; normalized data
- `src/api/types.ts`: normalized types
- `src/hooks/useWeather.ts`: city weather hook using settings/provider
- `src/components/SettingsDialog.tsx`: settings UI (dialog)
- `src/components/ThemeToggle.tsx`: theme switcher
- `src/pages/*`: `Home`, `CityView`, `LatLonView`

```mermaid
flowchart LR
  UI[Pages/Components] -- useSettings --> Settings
  UI -- useWeather --> DataLayer
  DataLayer -- cache/get/set --> Cache
  DataLayer -- fetch --> Provider[Open-Meteo | OpenWeather]
```

## Getting Started

Prereqs: Node 20+, PNPM 9+

```bash
pnpm i
pnpm dev
```

Open http://localhost:5173. Try `/city/Bengaluru`.

## Build & PWA

```bash
pnpm build
pnpm preview
```

The PWA is configured in `vite.config.ts` via `VitePWA`. App shell and remote API calls are cached (NetworkFirst). Icons live in `public/icons/`.

## Providers & API Keys

- Default: Open‑Meteo (no key). Geocoding via Open‑Meteo Geocoding API.
- Optional: OpenWeatherMap. Enter your key in Settings → stored in `localStorage` and only read at runtime (never committed).

## Settings & Shortcuts

- Units: Metric/Imperial
- Provider: Open‑Meteo / OpenWeatherMap
- Theme: System/Light/Dark + Dynamic weather theme toggle
- Particles: toggle
- Shortcuts: `/` focus search, `g` geolocate, `s` open settings

## GitHub Pages Deployment

1) Set Vite base path dynamically (already handled) or set `VITE_BASE='/<REPO_NAME>/'`.
2) Push to `main`. Workflow `.github/workflows/deploy.yml` builds and publishes `dist/` to `gh-pages` with SPA 404 redirect.
3) Enable Pages → branch `gh-pages`.

Local manual deploy:
```bash
pnpm build
# publish dist/ to gh-pages branch if needed
```

## Accessibility Checklist

- __Keyboard navigation__: focusable controls and visible focus rings
- __Color contrast__: tokens ensure contrast in both themes
- __Aria labels__: to be added on interactive widgets as features expand

## Roadmap

- Hook up Recharts for hourly/weekly charts
- Leaflet map selector + draggable pin
- Favorites with drag/reorder and import/export
- Contextual coach rules engine
- Offline banner + last updated indicator
- OpenWeatherMap provider parity

## Contributing

PRs welcome. Please run:

```bash
pnpm lint
pnpm test
```

## License

MIT — see `LICENSE`.