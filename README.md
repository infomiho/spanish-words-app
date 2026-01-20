# Spanish Words

Flashcard app for learning Spanish vocabulary. Words you get wrong show up more often.

## Setup

```
pnpm install
pnpm dev
```

Build with `pnpm build`.

## Stack

- React 19, TypeScript, Vite 7
- Tailwind CSS 4
- Zustand for state (persisted to localStorage)
- vite-plugin-pwa for offline support

## Structure

```
src/
  components/     UI components
  stores/         Zustand stores (stats, settings)
  lib/            Word list and utilities
```

## PWA

Configured with portrait orientation lock, offline caching via workbox, and auto-updates. Icons are in `public/`.