import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import { extractBearerToken, resolveApiKey } from "./auth.ts";
import { createOrgCaller } from "./caller.ts";
import { createPostcardMcpServer } from "./server.ts";

/** Production Streamable HTTP path on the web app (Vercel). */
export const MCP_HTTP_PATH = "/mcp";

export const MCP_CORS_HEADERS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, Accept, MCP-Protocol-Version, Mcp-Session-Id, Last-Event-ID, X-MCP-API-Key",
  "Access-Control-Expose-Headers": "Mcp-Session-Id, MCP-Protocol-Version, WWW-Authenticate",
  "Access-Control-Max-Age": "86400",
};

function json(status: number, body: unknown, extra?: HeadersInit): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      ...MCP_CORS_HEADERS,
      ...extra,
    },
  });
}

export function unauthorizedMcpResponse(): Response {
  return json(
    401,
    {
      jsonrpc: "2.0",
      error: { code: -32001, message: "Unauthorized — send Authorization: Bearer mcp_…" },
      id: null,
    },
    { "WWW-Authenticate": 'Bearer realm="postcard-mcp"' }
  );
}

/** Header-only. Never read a key from the URL query string. */
export function extractMcpTokenFromHeaders(headers: Headers): string | null {
  const bearer = extractBearerToken(headers.get("authorization") ?? undefined);
  if (bearer) return bearer;
  const headerKey = headers.get("x-mcp-api-key")?.trim();
  return headerKey || null;
}

function withCors(response: Response): Response {
  const headers = new Headers(response.headers);
  for (const [key, value] of Object.entries(MCP_CORS_HEADERS)) {
    if (!headers.has(key)) headers.set(key, value);
  }
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

function wantsStandaloneSse(req: Request): boolean {
  const accept = req.headers.get("accept") ?? "";
  return accept.includes("text/event-stream");
}

/**
 * Web-standard Streamable HTTP handler for Next.js / Vercel (and tests).
 * Same auth + server as the localhost Express `POST /mcp` in http.ts.
 */
export async function handleMcpFetchRequest(req: Request): Promise<Response> {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: MCP_CORS_HEADERS });
  }

  if (req.method === "GET" && !wantsStandaloneSse(req)) {
    return json(200, {
      ok: true,
      server: "postcard-platform-mcp",
      transport: "streamable-http",
      path: MCP_HTTP_PATH,
      auth: "Authorization: Bearer mcp_…",
    });
  }

  if (req.method !== "POST" && req.method !== "GET" && req.method !== "DELETE") {
    return new Response(null, {
      status: 405,
      headers: { Allow: "GET, POST, DELETE, OPTIONS", ...MCP_CORS_HEADERS },
    });
  }

  const token = extractMcpTokenFromHeaders(req.headers);
  let auth;
  try {
    auth = await resolveApiKey(token);
  } catch (err) {
    console.error("[mcp-http] auth failed:", err instanceof Error ? err.message : err);
    return unauthorizedMcpResponse();
  }

  const server = createPostcardMcpServer(async () => ({
    auth,
    caller: await createOrgCaller(auth),
  }));

  const transport = new WebStandardStreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
    enableJsonResponse: true,
  });

  await server.connect(transport);
  try {
    return withCors(await transport.handleRequest(req));
  } finally {
    void transport.close();
    void server.close();
  }
}
