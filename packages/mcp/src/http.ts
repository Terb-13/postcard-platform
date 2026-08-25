import { createReadStream } from "node:fs";
import { extname, join } from "node:path";
import express from "express";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { extractBearerToken, resolveApiKey } from "./auth.ts";
import { createOrgCaller } from "./caller.ts";
import { paths } from "./env.ts";
import { createPostcardMcpServer } from "./server.ts";

const MIME: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".md": "text/markdown; charset=utf-8",
};

function sendJsonRpcUnauthorized(res: express.Response) {
  res.status(401).set("WWW-Authenticate", 'Bearer realm="postcard-mcp"').json({
    jsonrpc: "2.0",
    error: { code: -32001, message: "Unauthorized — send Authorization: Bearer mcp_…" },
    id: null,
  });
}

export function createHttpApp() {
  const app = express();
  app.use(express.json({ limit: "2mb" }));

  app.get("/health", (_req, res) => {
    res.json({ ok: true, server: "postcard-platform-mcp" });
  });

  app.get(["/progress", "/progress/", "/progress/index.html"], (_req, res) => {
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    createReadStream(join(paths.packageRoot, "progress/index.html")).pipe(res);
  });

  app.get("/progress/:file", (req, res) => {
    const file = req.params.file;
    if (file.includes("..") || file.includes("/")) {
      res.status(400).end();
      return;
    }
    const full = join(paths.packageRoot, "progress", file);
    res.setHeader("Content-Type", MIME[extname(file)] ?? "text/plain; charset=utf-8");
    createReadStream(full).on("error", () => res.status(404).end()).pipe(res);
  });

  app.post("/mcp", async (req, res) => {
    const token = extractBearerToken(req.headers.authorization) ?? (typeof req.headers["x-mcp-api-key"] === "string"
      ? req.headers["x-mcp-api-key"]
      : null);

    let auth;
    try {
      auth = await resolveApiKey(token);
    } catch (err) {
      console.error("[mcp-http] auth failed:", err instanceof Error ? err.message : err);
      sendJsonRpcUnauthorized(res);
      return;
    }

    const server = createPostcardMcpServer(async () => ({
      auth,
      caller: await createOrgCaller(auth),
    }));

    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: undefined,
      enableJsonResponse: true,
    });

    res.on("close", () => {
      void transport.close();
      void server.close();
    });

    await server.connect(transport);
    await transport.handleRequest(req, res, req.body);
  });

  app.get("/mcp", (_req, res) => res.status(405).end());
  app.delete("/mcp", (_req, res) => res.status(405).end());

  return app;
}

export function listenHttp(port: number, host: string) {
  const app = createHttpApp();
  return app.listen(port, host, () => {
    console.error(`Postcard MCP HTTP on http://${host}:${port}/mcp`);
    console.error(`Progress page: http://${host}:${port}/progress`);
  });
}
