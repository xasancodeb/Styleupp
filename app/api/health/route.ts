import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// GET /api/health — liveness probe for containers/load balancers.
export function GET() {
  return NextResponse.json({ status: "ok", time: new Date().toISOString() });
}
