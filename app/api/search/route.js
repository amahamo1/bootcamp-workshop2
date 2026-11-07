// GET /api/search?q=your+search   (FREE)
// Returns [{ title, url, snippet }, ...]
import { search } from "@/lib/tinyfish";

export async function GET(request) {
  // Read "q" from the URL, e.g. /api/search?q=pizza
  const q = new URL(request.url).searchParams.get("q");

  // 400 = "bad request": the caller forgot something.
  if (!q) return Response.json({ error: "Add ?q=your search" }, { status: 400 });

  try {
    return Response.json(await search(q));
  } catch (err) {
    // 500 = "server error": missing key, network problem, etc.
    return Response.json({ error: err.message }, { status: 500 });
  }
}
