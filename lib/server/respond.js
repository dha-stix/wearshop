import "server-only";
import { OrderError } from "./orders";

// Turns thrown errors into JSON responses without leaking internals.
export function errorResponse(err, fallback = "Something went wrong. Try again.") {
  if (err instanceof OrderError) return Response.json({ error: err.message }, { status: err.status });
  console.error(err);
  return Response.json({ error: fallback }, { status: err?.status && err.status < 500 ? 502 : 500 });
}
