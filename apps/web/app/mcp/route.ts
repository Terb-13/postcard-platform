import { handleMcpFetchRequest } from "@postcard-platform/mcp/fetch-handler";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * Production Streamable HTTP MCP endpoint.
 * Auth: Authorization: Bearer mcp_… (McpApiKey). Never a query-string key.
 */
async function handler(req: Request): Promise<Response> {
  return handleMcpFetchRequest(req);
}

export { handler as DELETE, handler as GET, handler as OPTIONS, handler as POST };
