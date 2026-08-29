import assert from "node:assert/strict";
import { afterEach, describe, it, mock } from "node:test";
import { clerkProxyUrlFromEnv } from "./clerk-config";
import {
  CLERK_PROD_FAPI_URL,
  clerkFrontendApiTargetUrl,
  isClerkFrontendApiProxyPath,
  proxyClerkFrontendApi,
  resolveClerkProxyUrl,
} from "./clerk-fapi-proxy";

describe("clerk FAPI proxy", () => {
  afterEach(() => {
    mock.restoreAll();
    delete process.env.NEXT_PUBLIC_CLERK_PROXY_URL;
    delete process.env.CLERK_SECRET_KEY;
  });

  it("matches /__clerk and subpaths only", () => {
    assert.equal(isClerkFrontendApiProxyPath("/__clerk"), true);
    assert.equal(isClerkFrontendApiProxyPath("/__clerk/v1/client"), true);
    assert.equal(isClerkFrontendApiProxyPath("/mcp"), false);
    assert.equal(isClerkFrontendApiProxyPath("/sign-in"), false);
  });

  it("rewrites the proxy path onto Clerk's production FAPI", () => {
    const target = clerkFrontendApiTargetUrl(
      new URL("https://postcard-platform-web.vercel.app/__clerk/v1/client?_clerk_js_version=5"),
    );
    assert.equal(target.toString(), `${CLERK_PROD_FAPI_URL}/v1/client?_clerk_js_version=5`);
  });

  it("reads NEXT_PUBLIC_CLERK_PROXY_URL without a trailing slash", () => {
    process.env.NEXT_PUBLIC_CLERK_PROXY_URL =
      "https://postcard-platform-web.vercel.app/__clerk/";
    assert.equal(clerkProxyUrlFromEnv(), "https://postcard-platform-web.vercel.app/__clerk");
  });

  it("forwards the official Clerk proxy headers to FAPI", async () => {
    process.env.CLERK_SECRET_KEY = "sk_test_proxy_unit";
    process.env.NEXT_PUBLIC_CLERK_PROXY_URL =
      "https://postcard-platform-web.vercel.app/__clerk";

    const fetchMock = mock.method(globalThis, "fetch", async () => new Response("{}", { status: 200 }));

    const req = new Request("https://postcard-platform-web.vercel.app/__clerk/v1/client", {
      headers: {
        "x-forwarded-for": "203.0.113.9, 10.0.0.1",
        "x-real-ip": "203.0.113.9",
      },
    });

    const res = await proxyClerkFrontendApi(req);
    assert.equal(res.status, 200);
    assert.equal(fetchMock.mock.calls.length, 1);

    const [url, init] = fetchMock.mock.calls[0].arguments as unknown as [string, RequestInit];
    assert.equal(url, `${CLERK_PROD_FAPI_URL}/v1/client`);
    const headers = new Headers(init.headers);
    assert.equal(headers.get("Clerk-Proxy-Url"), "https://postcard-platform-web.vercel.app/__clerk");
    assert.equal(headers.get("Clerk-Secret-Key"), "sk_test_proxy_unit");
    assert.equal(headers.get("X-Forwarded-For"), "203.0.113.9");
    assert.equal(headers.get("Host"), "frontend-api.clerk.dev");
  });

  it("returns a configuration error instead of a Next 404 when the secret is missing", async () => {
    const res = await proxyClerkFrontendApi(
      new Request("https://postcard-platform-web.vercel.app/__clerk/v1/client"),
    );
    assert.equal(res.status, 500);
    const body = await res.json();
    assert.equal(body.errors[0].code, "proxy_configuration_error");
  });

  it("derives Clerk-Proxy-Url from the request when the env var is unset", () => {
    const req = new Request("https://preview.vercel.app/__clerk/v1/client", {
      headers: {
        "x-forwarded-proto": "https",
        "x-forwarded-host": "preview.vercel.app",
      },
    });
    assert.equal(resolveClerkProxyUrl(req), "https://preview.vercel.app/__clerk");
  });
});
