// GET /api/fetch?url=https://example.com   (FREE)
// Reads one web page and returns { url, title, text }.
import { fetchPage } from "@/lib/tinyfish";

export async function GET(request) {
  const url = new URL(request.url).searchParams.get("url");
  if (!url) return Response.json({ error: "Add ?url=https://..." }, { status: 400 });

  try {
    return Response.json(await fetchPage(url));
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
