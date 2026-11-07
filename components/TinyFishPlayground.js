// Delete this component once your own UI works.
//
// A small test panel so you can check your TinyFish key on day one.
// It also shows how to use the hooks from lib/useTinyFish.js.
// To remove it: delete this file and the <TinyFishPlayground /> line in app/page.js.
"use client";
import { useState } from "react";
import { useAgent, useFetchPage, useSearch } from "@/lib/useTinyFish";

export default function TinyFishPlayground() {
  return (
    <section className="playground">
      <h2>TinyFish playground</h2>
      <p className="muted">Test your key here. Search and Fetch are free. Agent uses credits.</p>
      <SearchBox />
      <FetchBox />
      <AgentForm />
    </section>
  );
}

// ---- Search (free) ----
function SearchBox() {
  const [query, setQuery] = useState("");
  const { search, results, error, loading } = useSearch();

  return (
    <div className="card">
      <h3>Search (free)</h3>
      <form
        onSubmit={(e) => {
          e.preventDefault(); // stop the page from reloading
          search(query);
        }}
      >
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="best study spots near ASU"
          required
        />
        <button disabled={loading}>{loading ? "Searching..." : "Search"}</button>
      </form>
      {error && <p className="error">{error}</p>}
      <ul>
        {results.map((r) => (
          <li key={r.url}>
            <a href={r.url} target="_blank" rel="noreferrer">
              {r.title}
            </a>
            <br />
            <small>{r.snippet}</small>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ---- Fetch one page (free) ----
function FetchBox() {
  const [url, setUrl] = useState("");
  const { fetchPage, page, error, loading } = useFetchPage();

  return (
    <div className="card">
      <h3>Read a page (free)</h3>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          fetchPage(url);
        }}
      >
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://example.com"
          required
        />
        <button disabled={loading}>{loading ? "Reading..." : "Fetch"}</button>
      </form>
      {error && <p className="error">{error}</p>}
      {page && (
        <>
          <p>
            <strong>{page.title}</strong>
          </p>
          {/* Only show the start of the page so the screen doesn't explode */}
          <pre>{(page.text || "").slice(0, 1500)}</pre>
        </>
      )}
    </div>
  );
}

// ---- Agent (costs credits) ----
function AgentForm() {
  const [url, setUrl] = useState("");
  const [goal, setGoal] = useState("");
  const { run, status, result, error, loading } = useAgent();

  return (
    <div className="card">
      <h3>Agent (uses credits)</h3>
      <form
        className="stack"
        onSubmit={(e) => {
          e.preventDefault();
          run({ url, goal });
        }}
      >
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://example.com"
          required
        />
        <textarea
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
          rows={3}
          placeholder="List the first 5 items with name and price. Return JSON."
          required
        />
        <button disabled={loading}>{loading ? "Running..." : "Run agent"}</button>
      </form>
      {status && <p>Status: {status}</p>}
      {error && <p className="error">{error}</p>}
      {/* JSON.stringify(..., null, 2) pretty-prints objects */}
      {result && (
        <pre>{typeof result === "string" ? result : JSON.stringify(result, null, 2)}</pre>
      )}
    </div>
  );
}
