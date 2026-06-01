import { NextRequest, NextResponse } from "next/server";
import { fetchEddmRoutes } from "@postcard-platform/api/services/eddm.service";

export const runtime = "nodejs";

/**
 * GET /api/eddm/routes?zips=84037,84003&households_84037=11193
 * Optional per-zip household counts from Census estimate (until USPS API is live).
 */
export async function GET(req: NextRequest) {
  const zipsParam = req.nextUrl.searchParams.get("zips") ?? "";
  const zctas = zipsParam
    .split(",")
    .map((z) => z.trim())
    .filter(Boolean);

  if (zctas.length === 0) {
    return NextResponse.json({ error: "zips query param required" }, { status: 400 });
  }

  const householdByZip: Record<string, number> = {};
  for (const zip of zctas) {
    const key = zip.replace(/\D/g, "").slice(0, 5);
    const h = req.nextUrl.searchParams.get(`households_${key}`);
    if (h) householdByZip[key] = parseInt(h, 10);
  }

  const result = await fetchEddmRoutes({ zctas }, householdByZip);
  return NextResponse.json(result);
}
