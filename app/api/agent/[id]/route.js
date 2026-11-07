// GET /api/agent/<id>   (FREE)
// Returns { status, result, error } for one agent run.
//
// The [id] folder name means this route matches /api/agent/<anything>,
// and <anything> arrives as params.id.
import { getRun } from "@/lib/tinyfish";

export async function GET(_request, { params }) {
  // In Next.js 15, params is a Promise, so we await it.
  const { id } = await params;

  try {
    return Response.json(await getRun(id));
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
