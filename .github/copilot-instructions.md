# Copilot instructions for this repo

This is a beginner hackathon starter (Next.js 15 App Router, React 19, plain JavaScript). The people using it are first-year students building a small MVP in a few hours.

## How to work
- Keep changes small: one feature per prompt. Explain what you changed in plain language.
- Plain JavaScript only. No TypeScript. Do not add new dependencies unless the user asks.
- Comment new code briefly so a beginner can follow it.
- Don't rewrite files the user didn't ask about.

## TinyFish rules
- Never call TinyFish from client code (any file with "use client"). In components, use the hooks in `lib/useTinyFish.js` (`useSearch`, `useFetchPage`, `useAgent`). They call the `/api` routes, which call `lib/tinyfish.js` on the server.
- Only `lib/tinyfish.js` and files in `app/api/` may import `@tiny-fish/sdk` or `lib/tinyfish.js`.
- Never print, log, or hard-code the API key. It lives in `.env.local` (local and Codespaces) and in Amplify environment variables (deployed). Read it only through `process.env.TINYFISH_API_KEY`.
- When writing an agent goal, end it with "Return JSON" and name the fields, e.g. "List the first 5 events with name, date and url. Return JSON."
- Prefer Search or Fetch (free) over Agent (costs 1 credit per step) when they are enough. Don't raise `MAX_STEPS` in `lib/tinyfish.js` unless the user asks.

## Where things are
- `app/page.js`: the home page. The team's MVP goes here.
- `components/TinyFishPlayground.js`: a test panel. Safe to delete once the team's UI works.
- `lib/useTinyFish.js`: client hooks.
- `lib/tinyfish.js`: server helpers `search`, `fetchPage`, `startAgent`, `getRun`.
- `app/api/*`: thin JSON routes that wrap those helpers.
