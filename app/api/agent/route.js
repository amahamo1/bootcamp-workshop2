// POST /api/agent   body: { "url": "...", "goal": "..." }   (COSTS CREDITS)
// Starts a web agent and returns { runId } right away.
// Then call GET /api/agent/<runId> to check on it.
import { startAgent } from "@/lib/tinyfish";

export async function POST(request) {
  // If the body isn't valid JSON, treat it as empty so we can send a clear 400.
  const body = await request.json().catch(() => ({}));
  const { url, goal } = body;

  if (!url || !goal) {
    return Response.json({ error: "Send JSON like { url, goal }" }, { status: 400 });
  }

  try {
    const runId = await startAgent({ url, goal });
    return Response.json({ runId });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
