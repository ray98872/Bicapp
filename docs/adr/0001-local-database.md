# ADR 0001: Local Database Choice

**Status:** Accepted (revised 2026-11-19)
**Date:** 2026-05-20

## Context

Bicapp is offline-first. A workout logger that needs an internet connection to log a set is broken. We need fast, reliable local storage that works in Expo Go and is easy for contributors.

## Options considered

- **A — WatermelonDB:** fast and reactive, but needs a custom dev client.
- **B — Drizzle ORM + expo-sqlite:** type-safe SQL, works in Expo Go, needs a reactive layer.
- **C — Realm:** heavy; maintenance concerns.
- **D — Zustand + persist middleware on AsyncStorage:** a single JSON document, reactive by default, zero schema/migration tooling, works everywhere including web.

## Decision (v1)

**Option D.** All state lives in one Zustand store (`src/store/index.ts`) persisted to AsyncStorage.

- One user's workout data is small (years of training ≈ a few MB of JSON).
- Reactivity comes for free; no query cache to maintain.
- The store's shape is the export/backup format, so backup/restore is trivial.
- Works identically on iOS, Android and web.

## Consequences / when to revisit

- Components never touch storage directly — only store actions and selectors — so moving to Option B later only changes the store module.
- Revisit if: history grows past ~10 MB, startup hydration exceeds ~300 ms on low-end devices, or we add sync (row-level changes become valuable).
- The persisted store has a `version` field; use zustand's `migrate` for shape changes.
