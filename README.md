# Bicapp

> An open-source, fluid alternative to the STRONG app — making the gym easy for people who don't love the gym.

Bicapp is a cross-platform (iOS + Android + web) workout tracker. No paywalls, no accounts, no template limits. Just a fast workout logger with a guide for every exercise.

## Features

- **Unlimited templates** — create, edit, duplicate, organise into folders and delete as many as you want. Save any finished workout as a template, and optionally update a template with what you actually lifted.
- **12 built-in programmes** — Beginner Full Body A/B, 5×5 A/B, Push / Pull / Legs, Upper / Lower, Dumbbell-only, Bodyweight at Home, Core Finisher. Copy any of them and customise.
- **870+ exercise guides** — every exercise has step-by-step instructions, an animated start/finish demo, muscles worked, beginner tips and a **Watch video tutorial** button.
- **Fast logging** — weight × reps (or reps-only / timed), warm-up / drop / failure sets, "previous" column from your last session, values carry down to the next set, one tap to complete.
- **Rest timer** — auto-starts after each set, ±15s, skip, haptics, survives the app being backgrounded.
- **History & progress** — full workout history, per-exercise history, estimated 1RM chart, personal records and PR detection on the summary screen.
- **Custom exercises** — add your own with instructions, an image and a video link.
- **Offline & private** — everything lives on your device. Export / import a JSON backup any time.
- kg / lb (converts all history), dark mode, keep-screen-awake.

## Getting started

```bash
npm install
npx expo start
```

Press `a` for Android, `i` for iOS, `w` for web, or scan the QR code with Expo Go.

Useful scripts:

| Command | What it does |
|---|---|
| `npm run typecheck` | TypeScript check |
| `npm run lint` | ESLint (incl. React Compiler rules) |
| `npm run build:exercises -- path/to/exercises.json` | Rebuild the bundled exercise library from Free Exercise DB |

## Project layout

```
src/
  app/              Expo Router screens
    (tabs)/         Workout (home + templates), History, Exercises, Settings
    workout.tsx     Active workout session
    picker.tsx      Exercise picker (multi-select)
    template/       Template guide view + editor
    exercise/       Exercise guide + custom exercise form
    history/        Past workout detail
    summary/        Post-workout summary & PRs
  components/       UI building blocks
  data/             Exercise library, curated videos, built-in programmes
  lib/              Types, formatting, stats (1RM, PRs), helpers
  store/            Zustand store persisted to AsyncStorage
```

## Exercise videos

Every exercise has a video button. By default it opens a YouTube search for a form tutorial for that exercise. To pin a specific trusted video, add it to [`src/data/exercise-videos.ts`](./src/data/exercise-videos.ts) — PRs welcome.

## Credits

Exercise data and images: [Free Exercise DB](https://github.com/yuhonas/free-exercise-db) (Unlicense / public domain). Images are loaded from GitHub and cached on device after first view.

## Status

V1 feature set is implemented. See [ROADMAP.md](./ROADMAP.md).

## License

[MIT](./LICENSE)
