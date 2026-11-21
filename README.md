# Bicapp

> An open-source, fluid alternative to the STRONG app — making the gym easy for people who don't love the gym.

[![Latest release](https://img.shields.io/github/v/release/ray98872/Bicapp)](https://github.com/ray98872/Bicapp/releases/latest)
[![License: MIT](https://img.shields.io/badge/license-MIT-green.svg)](./LICENSE)

Bicapp is a cross-platform (iOS + Android + web) workout tracker. No paywalls, no accounts, no template limits. Just a fast workout logger with a guide for every exercise.

## Download

**Android:** grab the latest `.apk` from the [Releases page](https://github.com/ray98872/Bicapp/releases/latest).

1. Download `bicapp-vX.Y.Z.apk` on your phone.
2. Open it. If Android warns about unknown sources, tap **Settings**, allow your browser to install apps, then go back and tap **Install**.
3. Updating? Install the new APK over the old one — your workouts are kept.

**iOS:** not published yet. You can run it with Expo Go (see *Getting started*).

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

Requires Node 20+ and [Expo Go](https://expo.dev/go) for **SDK 58** on your phone.

```bash
git clone https://github.com/ray98872/Bicapp.git
cd Bicapp
npm install
npx expo start
```

Press `a` for Android, `i` for iOS, `w` for web, or scan the QR code with Expo Go.

## Building an APK

Builds run on Expo's free cloud build service (EAS), so you don't need Android Studio.

```bash
npx eas-cli@latest login          # opens your browser (GitHub login works)
npx eas-cli@latest build -p android --profile preview
```

When it finishes you get a download link for the `.apk`. Profiles live in [`eas.json`](./eas.json):

| Profile | Output | Use |
|---|---|---|
| `preview` | `.apk` | Sideloading / GitHub releases |
| `production` | `.aab` | Google Play Store |

### Releasing

1. Bump `version` (and `android.versionCode`) in `app.json`.
2. Build with the `preview` profile and download the APK.
3. Create a GitHub release tagged `vX.Y.Z` and attach the APK as `bicapp-vX.Y.Z.apk`.

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

**v1.0.0 released.** The V1 feature set is implemented — see [ROADMAP.md](./ROADMAP.md) for what's next. Contributions welcome: see [CONTRIBUTING.md](./CONTRIBUTING.md).

## License

[MIT](./LICENSE)
