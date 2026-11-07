// lib/tinyfish.js
// Everything that talks to TinyFish lives here. The /api routes call these helpers.
//
// SERVER ONLY: never import this file into a "use client" component.
// If you do, your secret API key could end up in the browser.
// In client components, use the hooks in lib/useTinyFish.js instead.
import { TinyFish } from "@tiny-fish/sdk";

// Returns a ready-to-use TinyFish client.
// We check for the key ourselves so you get a helpful message instead of a stack trace.
export function getClient() {
  if (!process.env.TINYFISH_API_KEY) {
    throw new Error("Add TINYFISH_API_KEY to .env.local, then restart npm run dev");
  }
  // new TinyFish() reads TINYFISH_API_KEY from the environment by itself.
  return new TinyFish();
}

// FREE: search the web. Returns up to 5 results: [{ title, url, snippet }, ...]
export async function search(query) {
  const data = await getClient().search.query({ query, location: "US", language: "en" });
  return data.results.slice(0, 5).map((r) => ({
    title: r.title,
    url: r.url,
    snippet: r.snippet,
  }));
}

// FREE: read one web page as clean text (markdown). Returns { url, title, text }.
export async function fetchPage(url) {
  const data = await getClient().fetch.getContents({ urls: [url], format: "markdown" });

  // Fetch reports per-URL failures in data.errors instead of throwing.
  if (data.errors.length > 0) throw new Error(data.errors[0].error);

  const page = data.results[0];
  return { url: page.url, title: page.title, text: page.text };
}

// COSTS CREDITS: start a web agent. Returns the run id right away (it doesn't wait).
// We queue the run instead of waiting for it, so the request never hits a
// serverless timeout. Use getRun(id) to check on it.
export async function startAgent({ url, goal }) {
  const queued = await getClient().agent.queue({
    url, // the website the agent starts on
    goal, // plain-English instructions, e.g. "... Return JSON."
  });

  // TinyFish returns either { run_id } or { error: { message } }
  if (queued.error) throw new Error(queued.error.message);
  return queued.run_id;
}

// FREE: check on an agent run.
// status is one of: PENDING, RUNNING, COMPLETED, FAILED, CANCELLED
export async function getRun(id) {
  const run = await getClient().runs.get(id);
  return {
    status: run.status,
    result: run.result, // the agent's answer (when COMPLETED)
    error: run.error?.message ?? null, // what went wrong (when FAILED)
  };
}
