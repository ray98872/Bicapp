# Bicapp Roadmap

A living document. Phases are intentionally small so progress stays visible.

## Phase 0 — Scaffolding ✅ (current)

- [x] Create repo
- [x] README, LICENSE, .gitignore, CONTRIBUTING
- [ ] Initialize Expo project (`npx create-expo-app` with TypeScript template)
- [ ] Configure NativeWind, Expo Router, ESLint, Prettier
- [ ] Set up GitHub Actions CI (typecheck + lint on PR)
- [ ] Decide on local DB (Drizzle/expo-sqlite vs WatermelonDB) — see [docs/adr/0001-local-database.md](./docs/adr/0001-local-database.md)

## Phase 1 — Core logging loop (the MVP)

The loop a user does on day one: pick a workout → log sets → see history.

- [ ] Onboarding (3 screens: goal, experience, units)
- [ ] Home screen with "Start Workout" CTA
- [ ] Workout screen with big-tap set logger (weight / reps / RPE)
- [ ] Rest timer with haptics
- [ ] Workout summary screen
- [ ] Workout history list
- [ ] Local persistence of workouts, exercises, sets

## Phase 2 — Guided programs

- [ ] Built-in beginner programs: StrongLifts 5x5, Starting Strength, simple PPL
- [ ] Program picker on home screen
- [ ] Auto-suggest next workout based on program progress
- [ ] Deload / progression rules per program

## Phase 3 — Exercise library with visuals

- [ ] Exercise database (~150 movements, tagged by muscle group & equipment)
- [ ] Short looping demo per exercise (Lottie or short mp4)
- [ ] Tips & common-mistake notes per exercise
- [ ] Substitute / alternate exercise suggestions

## Phase 4 — Progress & PRs

- [ ] Per-exercise progress chart (weight × reps over time)
- [ ] 1RM estimate (Epley formula)
- [ ] PR celebrations (animated, opt-in haptics)
- [ ] Body-weight & measurements tracking (optional)

## Phase 5 — Polish & ship

- [ ] Onboarding copy review
- [ ] Accessibility pass (font scaling, screen reader)
- [ ] Dark mode
- [ ] Backup / export to JSON & CSV
- [ ] iOS TestFlight & Android internal track
- [ ] Public 1.0 release

## Later (not v1)

- Optional cloud sync (self-hostable backend; Supabase-compatible)
- Apple Health & Google Fit integration
- Watch companion (Apple Watch / Wear OS)
- Social / sharing
- AI form-check from short video clips
