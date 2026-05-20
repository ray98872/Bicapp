# Contributing to Bicapp

Thanks for thinking about contributing! Bicapp is built in the open and welcomes issues, PRs, design feedback, and exercise-library contributions.

## Ways to help

- **Code** — pick up an issue tagged `good first issue` or `help wanted`.
- **Design** — UX flows, screen mockups, motion design, iconography.
- **Exercise library** — short looping demo clips, alt-names, muscle-group taxonomy.
- **Programs** — well-cited beginner / intermediate routines.
- **Docs** — README, tutorials, onboarding flow copy.

## Dev setup

```bash
git clone https://github.com/ray98872/Bicapp.git
cd Bicapp
npm install
npx expo start
```

Then press `i` for iOS simulator or `a` for Android emulator, or scan the QR with Expo Go on your phone.

## Branching & PRs

- Branch from `main`. Use descriptive names: `feat/rest-timer`, `fix/log-set-crash`.
- Keep PRs focused — one feature or fix at a time.
- Run `npm run lint` and `npm run typecheck` before opening a PR.
- Reference any related issue in the PR description.

## Code style

- TypeScript strict mode. No `any` unless you justify it in a comment.
- Functional components and hooks. No class components.
- Co-locate component, styles, and tests when it makes sense.
- Prefer composition over prop drilling — Zustand stores for shared state.

## Commit messages

We loosely follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` new user-facing capability
- `fix:` bug fix
- `chore:` tooling, deps, refactors with no behavior change
- `docs:` documentation only
- `test:` test additions / fixes

## Code of Conduct

Be kind. This is a project for people who feel intimidated by the gym — let's make sure the community feels welcoming too. Harassment, gatekeeping, or condescension toward beginners will not be tolerated.
