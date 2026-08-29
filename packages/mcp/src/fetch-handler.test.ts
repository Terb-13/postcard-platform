import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ResolvedApiKey } from "./auth.ts";

const resolveApiKey = vi.fn();
const createOrgCaller = vi.fn();

vi.mock("./auth.ts", async (importOriginal) => {
  const actual = await importOriginal<typeof import("./auth.ts")>();
  return {
    ...actual,
    resolveApiKey: (...args: unknown[]) => resolveApiKey(...args),
  };
});

vi.mock("./caller.ts", () => ({
  createOrgCaller: (...args: unknown[]) => createOrgCaller(...args),
}));

import { extractMcpTokenFromHeaders, handleMcpFetchRequest } from "./fetch-handler.ts";

const auth: ResolvedApiKey = {
  id: "key_1",
  name: "Grok Bot",
  organizationId: "org_1",
  organizationName: "Acme",
  user: {
    id: "user_1",
    clerkId: "clerk_1",
    email: "ops@acme.test",
    firstName: "Ops",
    lastName: null,
    role: "OWNER",
    organizationId: "org_1",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  scopes: ["read", "draft"],
  spendCapCents: 0,
  spentCents: 0,
  remainingSpendCents: 0,
};

function mcpRequest(init: RequestInit & { url?: string } = {}): Request {
  const { url, headers, ...rest } = init;
  return new Request(url ?? "https://postcard-platform-web.vercel.app/mcp", {
    ...rest,
    headers: {
      Accept: "application/json, text/event-stream",
      "Content-Type": "application/json",
      ...headers,
    },
  });
}

describe("extractMcpTokenFromHeaders", () => {
  it("reads Authorization Bearer and ignores query-string keys", () => {
    const headers = new Headers({ authorization: "Bearer mcp_from_header" });
    expect(extractMcpTokenFromHeaders(headers)).toBe("mcp_from_header");
  });

  it("accepts X-MCP-API-Key as a fallback header", () => {
    const headers = new Headers({ "x-mcp-api-key": "mcp_header_key" });
    expect(extractMcpTokenFromHeaders(headers)).toBe("mcp_header_key");
  });
});

describe("handleMcpFetchRequest", () => {
  beforeEach(() => {
    resolveApiKey.mockReset();
    createOrgCaller.mockReset();
    resolveApiKey.mockResolvedValue(auth);
  });

  it("answers CORS preflight without auth", async () => {
    const res = await handleMcpFetchRequest(mcpRequest({ method: "OPTIONS" }));
    expect(res.status).toBe(204);
    expect(res.headers.get("Access-Control-Allow-Origin")).toBe("*");
    expect(res.headers.get("Access-Control-Allow-Headers")).toMatch(/Authorization/);
    expect(resolveApiKey).not.toHaveBeenCalled();
  });

  it("returns a public discovery document on GET (not SSE)", async () => {
    const res = await handleMcpFetchRequest(
      mcpRequest({ method: "GET", headers: { Accept: "text/html" } })
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toMatchObject({
      ok: true,
      server: "postcard-platform-mcp",
      transport: "streamable-http",
      path: "/mcp",
    });
    expect(JSON.stringify(body)).not.toMatch(/spend|fulfill|mcp_[A-Za-z0-9]/);
    expect(resolveApiKey).not.toHaveBeenCalled();
  });

  it("rejects POST without a Bearer token", async () => {
    resolveApiKey.mockRejectedValueOnce(new Error("Missing MCP API key"));
    const res = await handleMcpFetchRequest(
      mcpRequest({
        method: "POST",
        url: "https://postcard-platform-web.vercel.app/mcp?apiKey=mcp_in_query",
        body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "initialize", params: {} }),
      })
    );
    expect(res.status).toBe(401);
    expect(res.headers.get("WWW-Authenticate")).toMatch(/Bearer/);
    const body = await res.json();
    expect(body.error.code).toBe(-32001);
    expect(resolveApiKey).toHaveBeenCalledWith(null);
  });

  it("handles Streamable HTTP initialize with a read,draft key", async () => {
    const res = await handleMcpFetchRequest(
      mcpRequest({
        method: "POST",
        headers: { Authorization: "Bearer mcp_test_key" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: 1,
          method: "initialize",
          params: {
            protocolVersion: "2025-03-26",
            capabilities: {},
            clientInfo: { name: "vitest", version: "0.0.0" },
          },
        }),
      })
    );
    expect(res.status).toBe(200);
    expect(resolveApiKey).toHaveBeenCalledWith("mcp_test_key");
    const body = await res.json();
    expect(body.result.serverInfo.name).toBe("postcard-platform");
    expect(createOrgCaller).not.toHaveBeenCalled();
  });

  it("lists tools in stateless mode without a prior session", async () => {
    const res = await handleMcpFetchRequest(
      mcpRequest({
        method: "POST",
        headers: {
          Authorization: "Bearer mcp_test_key",
          "MCP-Protocol-Version": "2025-03-26",
        },
        body: JSON.stringify({ jsonrpc: "2.0", id: 2, method: "tools/list", params: {} }),
      })
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    const names = (body.result.tools as Array<{ name: string }>).map((t) => t.name);
    expect(names).toContain("get_workflow_guide");
    expect(names).toContain("create_campaign");
    expect(names).toContain("prepare_checkout");
    expect(names).toContain("finalize_mailing");
  });
});
