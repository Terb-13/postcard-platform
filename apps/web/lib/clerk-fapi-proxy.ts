/**
 * Clerk Frontend API proxy for production on *.vercel.app.
 *
 * @clerk/nextjs v6 (this repo) does not ship clerkMiddleware({ frontendApiProxy }).
 * That helper is Clerk Core 3 / @clerk/nextjs v7 and needs Next.js ≥15.2.8.
 *
 * This implements the current Clerk proxy protocol:
 * https://clerk.com/docs/guides/dashboard/dns-domains/proxy-fapi
 *
 * Forward `/__clerk/*` → `https://frontend-api.clerk.dev/*` with body and
 * headers intact, plus Clerk-Proxy-Url, Clerk-Secret-Key, X-Forwarded-For.
 */

import { clerkProxyUrlFromEnv } from "./clerk-config";

export const CLERK_FAPI_PROXY_PATH = "/__clerk";
export const CLERK_PROD_FAPI_URL = "https://frontend-api.clerk.dev";

const HOP_BY_HOP_HEADERS = new Set([
  "connection",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailer",
  "transfer-encoding",
  "upgrade",
]);

const RESPONSE_HEADERS_TO_STRIP = new Set(["content-encoding", "content-length"]);

export function isClerkFrontendApiProxyPath(pathname: string): boolean {
  return pathname === CLERK_FAPI_PROXY_PATH || pathname.startsWith(`${CLERK_FAPI_PROXY_PATH}/`);
}

function stripTrailingSlashes(value: string): string {
  let next = value;
  while (next.endsWith("/")) {
    next = next.slice(0, -1);
  }
  return next;
}

function derivePublicOrigin(request: Request, requestUrl: URL): string {
  const forwardedProto = request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim();
  const forwardedHost = request.headers.get("x-forwarded-host")?.split(",")[0]?.trim();
  if (forwardedProto && forwardedHost) {
    return `${forwardedProto}://${forwardedHost}`;
  }
  return requestUrl.origin;
}

function getClientIp(request: Request): string | undefined {
  const cfConnectingIp = request.headers.get("cf-connecting-ip");
  if (cfConnectingIp) return cfConnectingIp;

  const vercelForwarded = request.headers.get("x-vercel-forwarded-for");
  if (vercelForwarded) return vercelForwarded.split(",")[0]?.trim();

  const xRealIp = request.headers.get("x-real-ip");
  if (xRealIp) return xRealIp;

  const xForwardedFor = request.headers.get("x-forwarded-for");
  if (xForwardedFor) return xForwardedFor.split(",")[0]?.trim();

  return undefined;
}

function jsonError(code: string, message: string, status: number): Response {
  return new Response(JSON.stringify({ errors: [{ code, message }] }), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
    },
  });
}

export function resolveClerkProxyUrl(request: Request): string {
  const fromEnv = clerkProxyUrlFromEnv();
  if (fromEnv) return fromEnv;
  const requestUrl = new URL(request.url);
  return `${derivePublicOrigin(request, requestUrl)}${CLERK_FAPI_PROXY_PATH}`;
}

export function clerkFrontendApiTargetUrl(
  requestUrl: URL,
  fapiBaseUrl = CLERK_PROD_FAPI_URL,
): URL {
  const targetPath = requestUrl.pathname.slice(CLERK_FAPI_PROXY_PATH.length) || "/";
  const targetUrl = new URL(`${stripTrailingSlashes(fapiBaseUrl)}${targetPath}`);
  targetUrl.search = requestUrl.search;
  return targetUrl;
}

/**
 * Reverse-proxy one request to Clerk's production Frontend API.
 * Used by the `/__clerk/[[...path]]` App Router route (and tests).
 */
export async function proxyClerkFrontendApi(request: Request): Promise<Response> {
  const secretKey = process.env.CLERK_SECRET_KEY?.trim();
  if (!secretKey) {
    return jsonError(
      "proxy_configuration_error",
      "Missing CLERK_SECRET_KEY. The Clerk FAPI proxy cannot forward requests.",
      500,
    );
  }

  const requestUrl = new URL(request.url);
  if (!isClerkFrontendApiProxyPath(requestUrl.pathname)) {
    return jsonError(
      "proxy_path_mismatch",
      `Request path "${requestUrl.pathname}" does not match ${CLERK_FAPI_PROXY_PATH}`,
      400,
    );
  }

  const fapiHost = new URL(CLERK_PROD_FAPI_URL).host;
  const targetUrl = clerkFrontendApiTargetUrl(requestUrl);
  if (targetUrl.host !== fapiHost) {
    return jsonError("proxy_request_failed", "Resolved target does not match the expected host", 400);
  }

  const headers = new Headers();
  request.headers.forEach((value, key) => {
    if (!HOP_BY_HOP_HEADERS.has(key.toLowerCase())) {
      headers.set(key, value);
    }
  });

  const proxyUrl = resolveClerkProxyUrl(request);
  headers.set("Clerk-Proxy-Url", proxyUrl);
  headers.set("Clerk-Secret-Key", secretKey);
  headers.set("Host", fapiHost);
  headers.set("Accept-Encoding", "identity");

  if (!headers.has("X-Forwarded-Host")) {
    headers.set("X-Forwarded-Host", requestUrl.host);
  }
  if (!headers.has("X-Forwarded-Proto")) {
    headers.set("X-Forwarded-Proto", requestUrl.protocol.replace(":", ""));
  }

  const clientIp = getClientIp(request);
  if (clientIp) {
    headers.set("X-Forwarded-For", clientIp);
  }

  const hasBody = request.body !== null && request.method !== "GET" && request.method !== "HEAD";

  try {
    const fetchOptions: RequestInit = {
      method: request.method,
      headers,
      redirect: "manual",
    };
    if (hasBody) {
      fetchOptions.body = request.body;
      // Required to stream a Request body in Node/undici.
      (fetchOptions as RequestInit & { duplex?: string }).duplex = "half";
    }

    const response = await fetch(targetUrl.toString(), fetchOptions);
    const responseHeaders = new Headers();
    response.headers.forEach((value, key) => {
      const lower = key.toLowerCase();
      if (HOP_BY_HOP_HEADERS.has(lower) || RESPONSE_HEADERS_TO_STRIP.has(lower)) return;
      if (lower === "set-cookie") {
        responseHeaders.append(key, value);
      } else {
        responseHeaders.set(key, value);
      }
    });

    const locationHeader = response.headers.get("location");
    if (locationHeader) {
      try {
        const locationUrl = new URL(locationHeader, CLERK_PROD_FAPI_URL);
        if (locationUrl.host === fapiHost) {
          responseHeaders.set(
            "Location",
            `${proxyUrl}${locationUrl.pathname}${locationUrl.search}${locationUrl.hash}`,
          );
        }
      } catch {
        // Leave Location as-is if it is not a valid URL.
      }
    }

    const proxyResponse = new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    });
    for (const header of RESPONSE_HEADERS_TO_STRIP) {
      proxyResponse.headers.delete(header);
    }
    return proxyResponse;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return jsonError("proxy_request_failed", `Failed to proxy request to Clerk FAPI: ${message}`, 502);
  }
}
