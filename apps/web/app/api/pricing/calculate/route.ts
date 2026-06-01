import { NextRequest, NextResponse } from "next/server";
import { calculatePricing } from "@postcard-platform/api/services/pricing.service";
import { z } from "zod";

export const runtime = "nodejs";

const bodySchema = z.object({
  size: z.string(),
  quantity: z.number().int().min(0),
  productType: z.enum(["EDDM", "TARGETED"]).optional(),
  source: z.enum(["estimate", "final"]).optional(),
});

/** Public estimate endpoint for map/checkout (no PII). */
export async function POST(req: NextRequest) {
  const json = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { size, quantity, productType, source } = parsed.data;
  const breakdown = calculatePricing({ size, quantity, productType, source });
  return NextResponse.json(breakdown);
}
