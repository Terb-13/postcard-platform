import { NextRequest, NextResponse } from "next/server";
import { fetchEddmRoutes } from "@postcard-platform/api/services/eddm.service";
import { EddmRoutesNotConfiguredError } from "@postcard-platform/api/services/usps-eddm.provider";

export const runtime = "nodejs";

/**
 * GET /api/eddm/routes?zips=84037,84003
 * Real USPS/Melissa carrier routes only. Does not return stub routes.
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

  try {
    const result = await fetchEddmRoutes({ zctas }, householdByZip);
    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof EddmRoutesNotConfiguredError) {
      return NextResponse.json(
        { error: err.message, isStub: false, provider: null, routes: [] },
        { status: 503 }
      );
    }
    const message = err instanceof Error ? err.message : "EDDM routes failed";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
