# Sentence Scramble

Sentence Scramble is a classroom-friendly React app for building, sharing, and completing sentence reconstruction exercises. Learners drag shuffled words (or auto-generated phrase chunks) into place, while teachers can craft assignments and collect summarized results.

## Overview

- Practice mode loads a built-in bank of sentences so anyone can try the activity instantly.
- Homework mode is activated by `#C=<hash>` links generated in the teacher tools; progress is stored locally so students can resume unfinished work.
- Teacher mode (`/#teacher`) provides a form to paste sentences, auto-split paragraphs, and create shareable homework instructions in one click.

## Getting Started

1. Install dependencies: `npm install`
2. Start the dev server: `npm run dev`
3. Visit `http://localhost:5173` for practice mode, or append `#teacher` to open the teacher dashboard.

Vite reads environment variables from `.env.local`. `GEMINI_API_KEY` is defined in `vite.config.ts` for future integrations but is not required for core gameplay.

## Available Scripts

- `npm run dev` – Vite development server with hot reloads.
- `npm run build` – Production build (`dist/`).
- `npm run preview` – Serves the built bundle locally for smoke testing.
- `npm run test` – Runs the Vitest unit suite (use `npm run test -- --watch` while iterating).

## Teacher Workflow

1. Navigate to `/#teacher` and enter an assignment title plus one sentence per line (use “Split into sentences” for pasted paragraphs).
2. Generate a link; the app creates a seeded scramble and copies classroom-friendly instructions, including a unique homework URL.
3. Students open the link, enter their name, and complete the scramble set. Results summarize accuracy, reveals, and per-item status for easy reporting.

## Project Structure

- `components/` – React UI, including `GameApp.tsx` (player experience), `TeacherPanel.tsx`, and modal/dialog components.
- `constants/` – Default practice sentences and shared constants.
- `utils/` – Tokenization, chunking, pseudo-random shuffling, encoding, and local storage helpers (`utils/__tests__/` mirrors coverage).
- Root files (`App.tsx`, `index.tsx`, `vite.config.ts`) wire up routing modes, bootstrapping, and build aliases.

## Testing

Vitest drives the existing unit coverage for text processing and persistence helpers. Add new specs alongside the relevant utilities (or co-located with components) and ensure `npm run test` passes before committing.
