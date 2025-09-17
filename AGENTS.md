# Repository Guidelines

## Project Structure & Module Organization

The app boots from `index.tsx` and renders the root `App` component that toggles practice, homework, and teacher workflows. UI logic lives in `components/`, where `GameApp.tsx` drives gameplay, `TeacherPanel.tsx` handles assignment management, and shared visuals sit under `components/icons/`. Domain contracts are centralized in `types.ts` and `constants/`. Pure utilities go in `utils/`, with mirrored test files in `utils/__tests__/`. Deployment metadata (`firebase.json`, `.firebaserc`) and Vite configuration remain at the repository root.

## Build, Test, and Development Commands

Install once with `npm install`. Run `npm run dev` for the Vite dev server (requires `GEMINI_API_KEY` in `.env.local`). Build the production bundle with `npm run build`, and sanity-check it locally with `npm run preview`. Execute the Vitest suite via `npm run test`; append `-- --watch` to iterate on failing specs.

## Coding Style & Naming Conventions

TypeScript is strict, so favor explicit types for props, hooks, and utility inputs. Use functional React components with hooks, two-space indentation, single quotes, and trailing commas in multiline literals. Component files follow PascalCase (`WordButton.tsx`), shared helpers use camelCase (`sentenceSplitter.ts`), and tests mirror the source filename with a `.test.ts` suffix.

## Testing Guidelines

Vitest powers unit coverage. Keep fast, deterministic tests beside their utilities in `utils/__tests__/` and consider co-locating component tests when behavior warrants. Name cases descriptively, cover Unicode and seeded-random branches, and run `npm run test` before opening a PR. Flag any known gaps if full coverage is impractical.

## Commit & Pull Request Guidelines

Write short, imperative commits (e.g., `Add seeded scramble guard`). Reference tickets or issues in the body when relevant. Pull requests should explain the change, outline testing performed (command output or manual steps), and include screenshots or GIFs for UI updates. Verify `npm run build` and `npm run test` succeed locally before requesting review.

## Configuration & Security Notes

Secrets belong in untracked `.env.local`. Firebase project links live in `.firebaserc`; coordinate changes with maintainers before editing. Never commit generated artifacts or API keys, and rotate credentials promptly after suspected exposure.
