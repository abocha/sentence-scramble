# Sentence Scramble

[![CI](https://github.com/abocha/sentence-scramble/actions/workflows/test.yml/badge.svg)](https://github.com/abocha/sentence-scramble/actions/workflows/test.yml)

A finished, deployed classroom web app for creating and completing sentence-reconstruction exercises.

Teachers can turn sentences or short texts into shareable homework. Learners rearrange shuffled words, check their answers, reveal difficult items, resume unfinished work, and send a compact result summary back to the teacher.

**Live app:** https://sentence-scramble-eng.web.app/  
**Teacher panel:** https://sentence-scramble-eng.web.app/#teacher

## Why this project exists

Sentence-reconstruction exercises are useful for practising word order, grammar patterns, and sentence structure, but preparing and checking them manually is repetitive. Sentence Scramble keeps that workflow small and practical: create an assignment, share one link, and let the learner complete it on any modern device.

The app was released for real use and improved using feedback from tutors and learners.

## Features

### For teachers

- Create assignments from one sentence per line or split pasted text into sentences.
- Add an assignment title and configure exercise behaviour.
- Generate a deterministic scramble so the same link produces the same exercise.
- Share homework through a compact URL without creating accounts.
- Receive learner summaries containing attempts, reveals, and per-item results.

### For learners

- Drag or click words to reconstruct each sentence.
- Check answers and reveal an item when needed.
- Resume unfinished homework on the same device.
- See a clear completion summary.
- Send results through copy, email, WhatsApp, or Telegram.

### Practice mode

The home page includes a built-in practice exercise, so the interaction can be tried immediately without creating homework first.

## Architecture and data model

Sentence Scramble is intentionally client-side:

- assignment data is encoded in the shared homework URL;
- progress is stored in the browser;
- no account, authentication service, or server-side database is required;
- deterministic shuffling keeps generated assignments reproducible.

This keeps deployment and classroom use simple while avoiding unnecessary infrastructure for a small teaching tool.

## Tech stack

- React 19
- TypeScript
- Vite
- Vitest
- Firebase Hosting
- Browser local storage

## Run locally

```bash
npm install
npm run dev
```

Then open:

- `http://localhost:5173/` for practice mode
- `http://localhost:5173/#teacher` for the teacher panel

## Available scripts

```bash
npm run dev      # Start the Vite development server
npm run build    # Create a production build in dist/
npm run preview  # Preview the production build locally
npm run test     # Run the Vitest suite
```

## Testing

The Vitest suite covers core text-processing and persistence behaviour, including tokenisation, chunking, deterministic shuffling, assignment encoding, and local progress handling.

Run it with:

```bash
npm test
```

## Project structure

- `components/` — learner interface, teacher panel, dialogs, and result views
- `constants/` — built-in practice content and shared constants
- `utils/` — text processing, seeded shuffling, assignment encoding, and browser persistence
- `utils/__tests__/` — unit tests for core utilities
- `App.tsx` and `index.tsx` — application entry points and mode selection

## Deployment

The production app is hosted on Firebase Hosting:

https://sentence-scramble-eng.web.app/

Build the production bundle with:

```bash
npm run build
```
