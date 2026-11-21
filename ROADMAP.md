# Bicapp Roadmap

A living document. Phases are intentionally small so progress stays visible.

## Phase 0 — Scaffolding ✅

- [x] Repo, README, LICENSE, .gitignore, CONTRIBUTING
- [x] Expo SDK 56 + TypeScript + Expo Router + ESLint (React Compiler on)
- [x] Local storage decision — see [ADR-0001](./docs/adr/0001-local-database.md)
- [ ] GitHub Actions CI (typecheck + lint on PR)

## Phase 1 — Core logging loop ✅

- [x] Home with "Start empty workout" + templates
- [x] Workout screen: weight / reps / time, set types, previous column, add / remove / reorder / replace exercises
- [x] Rest timer with haptics (timestamp-based, survives backgrounding)
- [x] Workout summary screen with PR detection
- [x] Workout history list + detail (repeat, save as template, delete)
- [x] Local persistence; in-progress workout restored after restart

## Phase 2 — Templates & programmes ✅

- [x] Unlimited user templates (create / edit / duplicate / folders / delete)
- [x] 12 built-in programmes (Full Body, 5×5, PPL, Upper/Lower, Dumbbell, Bodyweight, Core)
- [x] Update template from a finished workout
- [ ] Auto-suggest next workout in a programme rotation
- [ ] Progression / deload rules per programme

## Phase 3 — Exercise library ✅

- [x] 870+ exercises (Free Exercise DB) with search + muscle / equipment filters
- [x] Step-by-step instructions, animated demo, muscles, beginner tips
- [x] Video tutorial for every exercise (YouTube search fallback + curated overrides)
- [x] Custom exercises
- [ ] Curate a pinned video for the top 50 exercises
- [ ] Bundle images for full offline use (optional download pack)
- [ ] Substitute / alternate exercise suggestions

## Phase 4 — Progress ✅ (basic)

- [x] Per-exercise history + estimated 1RM chart (Epley)
- [x] Personal records
- [ ] Body-weight & measurements
- [ ] Weekly volume per muscle group

## Phase 5 — Polish & ship

- [x] Dark mode
- [x] Export / import JSON backup
- [ ] Onboarding (goal, experience, units, equipment → recommended programme)
- [ ] CSV export (Strong-compatible) and Strong CSV import
- [ ] Accessibility pass (font scaling, screen reader labels)
- [ ] Notifications when rest ends with app in background
- [ ] iOS TestFlight & Android internal track → public 1.0

## Later

- Optional self-hostable sync
- Apple Health / Health Connect
- Watch companion
- Plate calculator, supersets
