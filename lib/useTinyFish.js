// lib/useTinyFish.js
// React hooks you can drop into any "use client" component.
// They call our own /api routes, which talk to TinyFish on the server.
// Your API key never reaches the browser.
//
// Example:
//   const { search, results, loading } = useSearch();
//   <button onClick={() => search("cheap flights to Denver")}>Go</button>
"use client";
import { useState } from "react";

// How often useAgent checks on a running agent.
const POLL_MS = 3000;
const FINISHED = ["COMPLETED", "FAILED", "CANCELLED"];

// Small helpers
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Fetch one of our /api routes and return its JSON. Throws if the route sent { error }.
async function callApi(path, options) {
  const res = await fetch(path, options);
  const data = await res.json();
  if (!res.ok || data.error) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
}

// Agents often answer with JSON written as text. Turn it into a real object
// when we can, otherwise keep the raw text.
function parseResult(value) {
  if (typeof value !== "string") return value;
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

// ---------------------------------------------------------------------------
// useSearch(): FREE web search.
//   const { search, results, error, loading } = useSearch();
//   search("query")  ->  results = [{ title, url, snippet }, ...]
// ---------------------------------------------------------------------------
export function useSearch() {
  const [results, setResults] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  async function search(query) {
    setLoading(true);
    setError(null);
    try {
      const data = await callApi(`/api/search?q=${encodeURIComponent(query)}`);
      setResults(data);
      return data;
    } catch (err) {
      setResults([]);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return { search, results, error, loading };
}

// ---------------------------------------------------------------------------
// useFetchPage(): FREE, reads one web page as text.
//   const { fetchPage, page, error, loading } = useFetchPage();
//   fetchPage("https://...")  ->  page = { url, title, text }
// ---------------------------------------------------------------------------
export function useFetchPage() {
  const [page, setPage] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  async function fetchPage(url) {
    setLoading(true);
    setError(null);
    try {
      const data = await callApi(`/api/fetch?url=${encodeURIComponent(url)}`);
      setPage(data);
      return data;
    } catch (err) {
      setPage(null);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return { fetchPage, page, error, loading };
}

// ---------------------------------------------------------------------------
// useAgent(): COSTS CREDITS. A web agent that clicks and reads a site for you.
//   const { run, status, result, error, loading } = useAgent();
//   run({ url: "https://...", goal: "... Return JSON." })
// status goes PENDING -> RUNNING -> COMPLETED (or FAILED / CANCELLED).
// ---------------------------------------------------------------------------
export function useAgent() {
  const [status, setStatus] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  async function run({ url, goal }) {
    setLoading(true);
    setStatus("STARTING");
    setResult(null);
    setError(null);

    try {
      // 1. Start the run. The server answers right away with a runId.
      const { runId } = await callApi("/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, goal }),
      });

      // 2. Poll: check on the run every few seconds until it finishes.
      while (true) {
        await sleep(POLL_MS);
        const runInfo = await callApi(`/api/agent/${runId}`);
        setStatus(runInfo.status);

        if (FINISHED.includes(runInfo.status)) {
          const parsed = parseResult(runInfo.result);
          setResult(parsed);
          if (runInfo.error) setError(runInfo.error);
          return parsed;
        }
      }
    } catch (err) {
      setStatus("FAILED");
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return { run, status, result, error, loading };
}
