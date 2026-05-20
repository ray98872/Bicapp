# ADR 0001: Local Database Choice

**Status:** Proposed
**Date:** 2026-05-20

## Context

Bicapp is offline-first. A workout logger that needs an internet connection to log a set is broken. We need a fast, reliable, local database that can:

- Handle thousands of sets / workouts without lag
- Support reactive queries (UI updates as data changes)
- Work seamlessly with Expo (no custom dev client unless necessary)
- Be easy to migrate schemas

## Options

### Option A — WatermelonDB

- Built specifically for React Native, optimized for large datasets via lazy loading
- Reactive out-of-the-box (observables)
- Requires a custom dev client (not pure Expo Go)
- More opinionated API

### Option B — Drizzle ORM + expo-sqlite

- Type-safe SQL via Drizzle, lightweight
- Works in Expo Go via `expo-sqlite`
- Easier migration story (raw SQL migrations)
- Less batteries-included for reactivity — pair with TanStack Query or a manual cache

### Option C — Realm (MongoDB)

- Mature, fast, reactive
- Heavier; recent licensing/maintenance concerns since the Atlas Device Sync sunset

## Decision

**Leaning toward Option B (Drizzle + expo-sqlite)** because:

1. Stays inside Expo Go for as long as possible → easier contributor onboarding
2. Type-safe SQL fits our TypeScript-first codebase
3. SQLite is boring, well-understood, and bulletproof for this scale
4. Drizzle's migration story is straightforward

We'll wrap queries in a thin repository layer so we can swap to WatermelonDB later if reactivity becomes painful.

## Consequences

- Need to set up a custom reactive layer (probably TanStack Query with SQLite as the source)
- Migrations live in `db/migrations/` as numbered SQL files
- All DB access goes through `repositories/` — no raw SQL in components
