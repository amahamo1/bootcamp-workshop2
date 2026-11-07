# SoDA Hackathon Starter

A blank Next.js app with three things ready to go:

1. **A working web app** you can edit right away (`app/page.js`)
2. **TinyFish on the server**, so your app can search the web, read pages, and run web agents
3. **One-click deploy to AWS Amplify**

Bring your own MVP idea. This repo doesn't assume one.

---

## Setup (about 10 minutes)

1. **Fork this repo.** One teammate clicks **Fork** (top right) using their personal GitHub account.
2. **Add your team.** In your fork: **Settings → Collaborators → Add people**.
3. **Open a Codespace.** In your fork: **Code → Codespaces → Create codespace on main**. Wait for `npm install` to finish.
4. **Get a TinyFish key.** Sign up at [agent.tinyfish.ai](https://agent.tinyfish.ai).
5. **Connect TinyFish with Copilot.**
   - On the TinyFish **Connect TinyFish** page, copy the setup prompt.
   - In the Codespace, open **Copilot Chat**, switch to **Agent** mode, and paste the prompt.
   - Then ask Copilot: *"Also save my TinyFish key in .env.local as TINYFISH_API_KEY."*
6. **Run it.**
   ```
   npm run dev
   ```
   Open port **3000** (the Ports tab, or the preview that pops up). Try the playground at the bottom of the page. If Search works, your key works.

> Your key lives in `.env.local`. Git ignores that file, so the key never gets committed. Never paste it into code.

---

## Plug it into your MVP

Use these hooks in any component that starts with `"use client"`. They call the `/api` routes for you, so your key stays on the server.

### 1. Look something up (free)
```js
import { useSearch } from "@/lib/useTinyFish";

const { search, results, loading } = useSearch();
<button onClick={() => search("free food events at ASU")}>Find</button>
{results.map((r) => <a key={r.url} href={r.url}>{r.title}</a>)}
```

### 2. Read a web page (free)
```js
import { useFetchPage } from "@/lib/useTinyFish";

const { fetchPage, page, loading } = useFetchPage();
<button onClick={() => fetchPage("https://example.com")}>Read</button>
{page && <pre>{page.text}</pre>}
```

### 3. Have an agent do a task on a site (uses credits)
```js
import { useAgent } from "@/lib/useTinyFish";

const { run, status, result } = useAgent();
<button onClick={() => run({ url: "https://example.com", goal: "List the first 5 items with name and price. Return JSON." })}>Go</button>
<p>{status}</p> {result && <pre>{JSON.stringify(result, null, 2)}</pre>}
```

**Tips**
- Use Search or Fetch first. They're free. Use the Agent only when you need clicks, forms, or multiple pages.
- Agent runs cost 1 credit per step and use the step limit configured for your TinyFish account. Keep goals short and specific.
- End every agent goal with **"Return JSON"** and name the fields you want.

---

## Build with Copilot

Open Copilot Chat in **Agent** mode. Copilot automatically reads `.github/copilot-instructions.md`, which keeps it on the rules of this starter. One slice per prompt:

> Build [feature] for [user]. Done when [visible result]. Only touch [files].

Run it, click it, read the diff, then commit:
```
git add . && git commit -m "slice: [feature]" && git push
```

When your own UI works, delete `components/TinyFishPlayground.js` and the `<TinyFishPlayground />` line in `app/page.js`.

---

## Deploy to AWS Amplify (about 10 minutes)

1. AWS Console → **Amplify → Create new app → GitHub**. Pick your fork and the `main` branch.
2. **Advanced settings → Environment variables**: add `TINYFISH_API_KEY` = your key.
3. **Save and deploy.** The build steps are already in `amplify.yml`.
4. Open your `amplifyapp.com` URL on your phone. Every `git push` to `main` redeploys.

---

## What's where

| File | What it does |
|---|---|
| `app/page.js` | Your home page. **Build your MVP here.** |
| `components/TinyFishPlayground.js` | Test panel for your key. Delete when you're done with it. |
| `lib/useTinyFish.js` | Hooks for your components: `useSearch`, `useFetchPage`, `useAgent` |
| `lib/tinyfish.js` | Server-only TinyFish helpers |
| `app/api/search` | `GET /api/search?q=...` (free) |
| `app/api/fetch` | `GET /api/fetch?url=...` (free) |
| `app/api/agent` | `POST /api/agent` with `{ url, goal }` → `{ runId }` (credits) |
| `app/api/agent/[id]` | `GET /api/agent/<runId>` → `{ status, result, error }` |
| `app/globals.css` | Base styles. Change the colors to make it yours. |
| `.github/copilot-instructions.md` | Rules Copilot follows in this repo |
| `amplify.yml` | AWS Amplify build settings |
