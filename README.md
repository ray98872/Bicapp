# Bicapp

> An open-source, fluid alternative to the STRONG app — making the gym easy for people who don't love the gym.

Bicapp is a cross-platform (iOS + Android) workout tracker focused on **low friction** for beginners and gym-skeptics. No paywalls, no clutter, no "pro" features locked behind a subscription. Just a beautiful, fast workout logger plus the structure you need to actually show up.

## Why Bicapp?

Most fitness apps are built for people who already love the gym. Bicapp is built for everyone else:

- **Guided programs out of the box** — pick a beginner routine and start; no need to design your own.
- **Big-tap logging** — fat, friendly buttons designed for sweaty hands and short rest periods.
- **Visual exercise library** — short looping demos so you know what each lift actually looks like.
- **Honest progress** — see your PRs and trend lines without the gamification noise.
- **Free and open** — MIT licensed. Your data stays on your device by default.

## Status

🚧 **Early development.** Scaffolding stage. See [ROADMAP.md](./ROADMAP.md) for the plan and [CONTRIBUTING.md](./CONTRIBUTING.md) if you'd like to help.

## Tech Stack

- **React Native + Expo (TypeScript)** — single codebase, iOS + Android, hot reload, easy contribution
- **Expo Router** — file-based navigation
- **NativeWind** (Tailwind for React Native) — clean, consistent styling
- **Drizzle ORM + expo-sqlite** — offline-first local database (see ADR-0001)
- **Zustand** — lightweight state management
- **Victory Native XL** — progress charts
- **expo-video** — exercise demo playback
- **Reanimated 3** — fluid animations and gesture-driven UI

## Getting Started

> Coming soon. The project is being scaffolded now.

```bash
# (Once scaffolded)
npm install
npx expo start
```

## License

[MIT](./LICENSE) — do what you want, no warranty.
