/**
 * Melissa buyer-door M-slice — flag, preview-only persist, finalize/list-buy refuse.
 *
 * MELISSA_BUYER_DOOR is hard-off in Vercel Production even if someone sets the env.
 * Do not write Production Melissa secrets or provider values from this slice.
 * Preview defaults ON so acceptance can be exercised without a Production merge.
 * Explicit 0/false/off still disables the door on preview.
 *
 * Preview Stripe **test** checkout is a separate escape hatch: VERCEL_ENV=preview
 * (or ALLOW_TEST_ORDERS=true) AND STRIPE_SECRET_KEY is sk_test_/rk_test_.
 * That path never enables Production MELISSA_BUYER_DOOR and never uses live keys.
 * List buy / mailing finalize stay blocked on previewOnly drafts.
 */

export const PREVIEW_ONLY_BLOCK_MESSAGE =
  "This draft is a Melissa preview-only quote. Finalize, checkout, and list buy are blocked. Pay later.";

export const PREVIEW_ONLY_FINALIZE_BLOCK_MESSAGE =
  "This draft is a Melissa preview-only quote. List buy and finalize are blocked. Stripe test checkout does not purchase a Melissa list.";

export const MELISSA_BUYER_DOOR_DISABLED_MESSAGE =
  "Melissa buyer door is not enabled in this environment.";

export const MELISSA_BUYER_DOOR_AUTH_MESSAGE =
  "Melissa buyer door requires a signed-in organization.";

export class PreviewOnlyBlockedError extends Error {
  constructor(message = PREVIEW_ONLY_BLOCK_MESSAGE) {
    super(message);
    this.name = "PreviewOnlyBlockedError";
  }
}

export type MelissaListPreviewMeta = {
  recipientCount: number;
  isStub: boolean;
  listProvider: string;
  door?: string;
  listRequestId?: string;
};

export type MelissaRouteMeta = {
  carrierRouteId: string;
  zip: string;
  householdCount: number;
  walkSequence?: string;
};

export type MelissaTargetingMeta = {
  provider: "melissa";
  isStub: boolean;
  routes?: MelissaRouteMeta[];
  totalHomes?: number;
  listPreview?: MelissaListPreviewMeta;
};

export type MelissaBuyerDoorEnv = {
  VERCEL_ENV?: string;
  NEXT_PUBLIC_VERCEL_ENV?: string;
  MELISSA_BUYER_DOOR?: string;
  NEXT_PUBLIC_MELISSA_BUYER_DOOR?: string;
  NODE_ENV?: string;
  ALLOW_TEST_ORDERS?: string;
  STRIPE_SECRET_KEY?: string;
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?: string;
};

export function parseEnvFlag(raw: string | undefined | null): boolean | null {
  if (raw == null) return null;
  const v = raw.trim().toLowerCase();
  if (v === "") return null;
  if (v === "1" || v === "true" || v === "on" || v === "yes") return true;
  if (v === "0" || v === "false" || v === "off" || v === "no") return false;
  return null;
}

export function vercelDeployEnv(env: MelissaBuyerDoorEnv = process.env): string | undefined {
  const raw = env.VERCEL_ENV ?? env.NEXT_PUBLIC_VERCEL_ENV;
  const trimmed = raw?.trim();
  return trimmed || undefined;
}

/**
 * Server-side flag. Uses VERCEL_ENV (available in Node / RSC).
 * Production is always off. Preview defaults on. Unknown deploy env is off
 * unless this is a local Node `development` process.
 */
export function isMelissaBuyerDoorEnabled(env: MelissaBuyerDoorEnv = process.env): boolean {
  return resolveMelissaBuyerDoor(env, "server");
}

/**
 * Client-shaped env: only NEXT_PUBLIC_* is visible. Next does not inline VERCEL_ENV.
 * Missing/empty NEXT_PUBLIC_VERCEL_ENV → OFF. Production → OFF.
 * Do not call this with raw `process.env` from a Client Component — pass a
 * server-computed boolean instead.
 */
export function isMelissaBuyerDoorEnabledOnClient(env: MelissaBuyerDoorEnv): boolean {
  return resolveMelissaBuyerDoor(env, "client");
}

function resolveMelissaBuyerDoor(
  env: MelissaBuyerDoorEnv,
  surface: "server" | "client"
): boolean {
  const deploy =
    surface === "client"
      ? env.NEXT_PUBLIC_VERCEL_ENV?.trim() || undefined
      : vercelDeployEnv(env);

  if (deploy === "production") return false;

  const explicit = parseEnvFlag(
    surface === "client"
      ? env.NEXT_PUBLIC_MELISSA_BUYER_DOOR
      : env.MELISSA_BUYER_DOOR ?? env.NEXT_PUBLIC_MELISSA_BUYER_DOOR
  );
  if (explicit === false) return false;

  if (deploy === "preview" || deploy === "development") return true;

  // Client: missing/empty deploy env must never enable the door.
  if (surface === "client") return false;

  // Server local (`next dev`) has no VERCEL_ENV.
  if (env.NODE_ENV === "development") return true;
  return false;
}

export function isPreviewOnlyTargeting(raw: unknown): boolean {
  if (!raw || typeof raw !== "object") return false;
  return (raw as { previewOnly?: unknown }).previewOnly === true;
}

export function readMelissaTargeting(raw: unknown): MelissaTargetingMeta | null {
  if (!raw || typeof raw !== "object") return null;
  const melissa = (raw as { melissa?: unknown }).melissa;
  if (!melissa || typeof melissa !== "object") return null;
  const rec = melissa as Partial<MelissaTargetingMeta>;
  if (rec.provider !== "melissa") return null;
  return rec as MelissaTargetingMeta;
}

export function assertNotPreviewOnly(raw: unknown): void {
  if (isPreviewOnlyTargeting(raw)) {
    throw new PreviewOnlyBlockedError();
  }
}

/** Stripe secret is test-mode (never live). Restricted test keys (rk_test_) count. */
export function isStripeTestSecretKey(key: string | undefined | null): boolean {
  const trimmed = key?.trim() ?? "";
  return trimmed.startsWith("sk_test_") || trimmed.startsWith("rk_test_");
}

export function isStripeTestPublishableKey(key: string | undefined | null): boolean {
  const trimmed = key?.trim() ?? "";
  return trimmed.startsWith("pk_test_");
}

/**
 * Server: allow Stripe Checkout Session create for previewOnly drafts.
 * Hard-off in Vercel Production. Requires a test secret key so live charges cannot run.
 */
export function isPreviewStripeTestCheckoutAllowed(
  env: MelissaBuyerDoorEnv = process.env
): boolean {
  if (vercelDeployEnv(env) === "production") return false;
  if (!isStripeTestSecretKey(env.STRIPE_SECRET_KEY)) return false;

  const deploy = vercelDeployEnv(env);
  if (deploy === "preview") return true;
  if (parseEnvFlag(env.ALLOW_TEST_ORDERS) === true) return true;
  return false;
}

/**
 * Client-shaped env: only NEXT_PUBLIC_* is visible.
 * Prefer a server-computed boolean from RSC (same pattern as MELISSA_BUYER_DOOR).
 */
export function isPreviewStripeTestCheckoutAllowedOnClient(env: MelissaBuyerDoorEnv): boolean {
  const deploy = env.NEXT_PUBLIC_VERCEL_ENV?.trim() || undefined;
  if (deploy === "production") return false;
  if (!isStripeTestPublishableKey(env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)) return false;
  if (deploy === "preview" || deploy === "development") return true;
  return parseEnvFlag(env.ALLOW_TEST_ORDERS) === true;
}

/** Refuse createCheckoutSession unless the Preview Stripe test escape hatch applies. */
export function shouldRefusePreviewOnlyCheckout(
  targeting: unknown,
  env: MelissaBuyerDoorEnv = process.env
): boolean {
  return isPreviewOnlyTargeting(targeting) && !isPreviewStripeTestCheckoutAllowed(env);
}

/**
 * After a Stripe **test** payment, mark the campaign paid / create jobs.
 * Does not unlock Melissa list buy or mailing finalize.
 */
export function canActivatePreviewOnlyAfterStripeTestPayment(
  targeting: unknown,
  options: { paymentIntentId?: string; actor?: string } = {},
  env: MelissaBuyerDoorEnv = process.env
): boolean {
  if (!isPreviewOnlyTargeting(targeting)) return true;
  if (!isPreviewStripeTestCheckoutAllowed(env)) return false;
  if (options.paymentIntentId) return true;
  return Boolean(options.actor?.startsWith("system:stripe"));
}

export function hasStubCarrierRoutes(
  routes: Array<{ carrierRouteId?: string }> | null | undefined
): boolean {
  if (!routes?.length) return false;
  return routes.some((r) => /STUB/i.test(String(r.carrierRouteId ?? "")));
}

/** Prefer attached list preview count; otherwise Occupant total homes. */
export function melissaQuoteQuantity(melissa?: MelissaTargetingMeta | null): number {
  const list = melissa?.listPreview?.recipientCount;
  if (typeof list === "number" && Number.isFinite(list) && list > 0) {
    return Math.floor(list);
  }
  const homes = melissa?.totalHomes;
  if (typeof homes === "number" && Number.isFinite(homes) && homes > 0) {
    return Math.floor(homes);
  }
  return 0;
}

export function normalizeMelissaMeta(
  input: MelissaTargetingMeta | null | undefined
): MelissaTargetingMeta | null {
  if (!input) return null;
  const routes = (input.routes ?? []).filter((r) => !/STUB/i.test(r.carrierRouteId));
  const totalHomes =
    input.totalHomes ?? routes.reduce((s, r) => s + (r.householdCount || 0), 0);
  const listPreview = input.listPreview
    ? {
        recipientCount: Math.max(0, Math.floor(input.listPreview.recipientCount || 0)),
        isStub: input.listPreview.isStub === true,
        listProvider: input.listPreview.listProvider || "melissa",
        door: input.listPreview.door,
        listRequestId: input.listPreview.listRequestId,
      }
    : undefined;

  return {
    provider: "melissa",
    isStub: input.isStub === true || hasStubCarrierRoutes(routes),
    routes,
    totalHomes,
    listPreview,
  };
}
